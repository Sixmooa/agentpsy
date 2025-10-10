package com.example.myapplication.ui.question

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.TestProgressDataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import io.mockk.*

/**
 * QuestionViewModel 导航行为测试
 * 专门测试"下一题"和"提交测试"按钮的显示逻辑
 */
@ExperimentalCoroutinesApi
class QuestionNavigationBehaviorTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val repository = mockk<PersonalityTestRepository>()
    private val dataStore = mockk<TestProgressDataStore>()

    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    private lateinit var viewModel: QuestionViewModel

    private val mockQuestions = listOf(
        Question(1, "问题1", "Question 1", "E", false, null),
        Question(2, "问题2", "Question 2", "I", false, null),
        Question(3, "问题3", "Question 3", "S", false, null) // 最后一题
    )

    private val mockAnswerOptions = listOf(
        AnswerOption(1, "选项1", "Option 1", 1),
        AnswerOption(2, "选项2", "Option 2", 2)
    )

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        coEvery { repository.getAnswerOptions(any()) } returns Result.success(mockAnswerOptions)
        coEvery { repository.getRandomQuestions(count = any(), language = any()) } returns Result.success(mockQuestions)
        coEvery { dataStore.getTestProgress } returns kotlinx.coroutines.flow.flowOf("")
        coEvery { dataStore.saveTestProgress(any()) } returns Unit
        coEvery { dataStore.clearTestProgress() } returns Unit
        viewModel = QuestionViewModel(repository, dataStore)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        clearAllMocks()
    }

    @Test
    fun `first question initially shows no navigation options`() = runTest {
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertFalse("第一题初始状态下不应该能前进", state.canNavigateNext)
        assertFalse("第一题初始状态下不应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `first question with answer shows next button`() = runTest {
        testScope.advanceUntilIdle()

        // 选择答案
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertTrue("第一题选择答案后应该显示下一题按钮", state.canNavigateNext)
        assertFalse("第一题选择答案后不应该显示提交按钮", !state.canNavigateNext)
    }

    @Test
    fun `last question with answer should NOT immediately show submit button`() = runTest {
        testScope.advanceUntilIdle()

        // 导航到最后一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        viewModel.selectAnswer(mockAnswerOptions[0])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 验证当前在最后一题
        assertEquals("应该在最后一题", 2, viewModel.uiState.value.currentQuestionIndex)
        assertTrue("应该是最后一题", viewModel.isLastQuestion())

        // 选择最后一题的答案
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertTrue("最后一题选择答案后，由于所有题目都已完成，应该显示提交按钮", !state.canNavigateNext)
    }

    @Test
    fun `navigation behavior throughout test completion`() = runTest {
        testScope.advanceUntilIdle()

        // 题目1 - 选择答案后应该显示下一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        var state = viewModel.uiState.value
        assertTrue("题目1选择答案后应该显示下一题", state.canNavigateNext)

        // 进入题目2
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 题目2 - 选择答案后应该显示下一题
        state = viewModel.uiState.value
        assertEquals("应该在题目2", 1, state.currentQuestionIndex)
        assertFalse("题目2初始状态下不应该能前进", state.canNavigateNext)

        viewModel.selectAnswer(mockAnswerOptions[0])
        state = viewModel.uiState.value
        assertTrue("题目2选择答案后应该显示下一题", state.canNavigateNext)

        // 进入题目3（最后一题）
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 题目3 - 选择答案后，由于这是最后一题且所有题目都已完成，应该显示提交
        state = viewModel.uiState.value
        assertEquals("应该在题目3", 2, state.currentQuestionIndex)
        assertTrue("应该是最后一题", viewModel.isLastQuestion())
        assertFalse("最后一题初始状态下不应该能前进", state.canNavigateNext)

        viewModel.selectAnswer(mockAnswerOptions[0])
        state = viewModel.uiState.value
        assertTrue("最后一题选择答案后应该显示提交（canNavigateNext为false）", !state.canNavigateNext)
    }

    @Test
    fun `going back from last question should restore next button if answer exists`() = runTest {
        testScope.advanceUntilIdle()

        // 完成所有题目
        mockQuestions.forEachIndexed { index, _ ->
            viewModel.selectAnswer(mockAnswerOptions[0])
            if (index < mockQuestions.size - 1) {
                viewModel.nextQuestion()
                testScope.advanceUntilIdle()
            }
        }
        testScope.advanceUntilIdle()

        // 验证在最后一题且已选择答案（显示提交）
        assertEquals("应该在最后一题", 2, viewModel.uiState.value.currentQuestionIndex)
        assertFalse("最后一题应该显示提交", viewModel.uiState.value.canNavigateNext)

        // 返回上一题
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()

        // 验证在第二题且已选择答案（应该显示下一题）
        val state = viewModel.uiState.value
        assertEquals("应该在第二题", 1, state.currentQuestionIndex)
        assertTrue("第二题应该显示下一题", state.canNavigateNext)
    }

    @Test
    fun `test completion criteria - all questions must be answered`() = runTest {
        testScope.advanceUntilIdle()

        // 只回答前两题，跳过第三题
        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目1
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目2
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 在最后一题但不回答
        val state = viewModel.uiState.value
        assertEquals("应该在最后一题", 2, state.currentQuestionIndex)
        assertFalse("最后一题未回答时不应该能前进", state.canNavigateNext)

        // 此时应该不能提交测试，因为最后一题未回答
        // 但用户可以通过选择答案来提交

        // 选择最后一题答案
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        val finalState = viewModel.uiState.value
        assertFalse("所有题目完成后应该显示提交", finalState.canNavigateNext)
    }
}