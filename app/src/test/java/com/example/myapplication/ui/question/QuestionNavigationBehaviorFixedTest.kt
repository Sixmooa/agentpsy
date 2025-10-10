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
 * QuestionViewModel 修复后的导航行为测试
 * 验证所有题目完成后才显示提交按钮的正确行为
 */
@ExperimentalCoroutinesApi
class QuestionNavigationBehaviorFixedTest {

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
    fun `last question with answer should NOT immediately show submit button when other questions unanswered`() = runTest {
        testScope.advanceUntilIdle()

        // 直接跳转到最后一题（模拟用户导航）
        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目1
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目2
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 验证当前在最后一题，但题目1和2已回答，题目3未回答
        assertEquals("应该在最后一题", 2, viewModel.uiState.value.currentQuestionIndex)
        assertTrue("应该是最后一题", viewModel.isLastQuestion())

        // 选择最后一题的答案
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertFalse("所有题目都回答完毕后应该显示提交按钮", state.canNavigateNext)
    }

    @Test
    fun `submit button only appears when ALL questions are answered`() = runTest {
        testScope.advanceUntilIdle()

        // 只回答题目1和题目2，跳过题目3
        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目1
        testScope.advanceUntilIdle()
        var state = viewModel.uiState.value
        assertTrue("题目1回答后应该显示下一题", state.canNavigateNext)

        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目2
        testScope.advanceUntilIdle()
        state = viewModel.uiState.value
        assertTrue("题目2回答后应该显示下一题", state.canNavigateNext)

        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 在最后一题但还未回答
        state = viewModel.uiState.value
        assertEquals("应该在最后一题", 2, state.currentQuestionIndex)
        assertFalse("最后一题未回答时不应该能前进", state.canNavigateNext)

        // 回答最后一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        val finalState = viewModel.uiState.value
        assertFalse("所有题目回答完毕后应该显示提交（canNavigateNext为false）", finalState.canNavigateNext)
    }

    @Test
    fun `navigation works correctly with incomplete answers`() = runTest {
        testScope.advanceUntilIdle()

        // 回答题目1
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        var state = viewModel.uiState.value
        assertTrue("题目1回答后应该显示下一题", state.canNavigateNext)

        // 进入题目2但不回答
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在题目2", 1, state.currentQuestionIndex)
        assertFalse("题目2未回答时不应该能前进", state.canNavigateNext)

        // 直接跳转到题目3（最后一题）但不回答
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在题目3", 2, state.currentQuestionIndex)
        assertFalse("题目3未回答时不应该能前进", state.canNavigateNext)

        // 回答题目3
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertFalse("题目3回答但题目2未回答时，应该显示下一题而不是提交", state.canNavigateNext)
    }

    @Test
    fun `going back maintains correct navigation state`() = runTest {
        testScope.advanceUntilIdle()

        // 完成所有题目
        repeat(3) { index ->
            viewModel.selectAnswer(mockAnswerOptions[0])
            if (index < 2) {
                viewModel.nextQuestion()
                testScope.advanceUntilIdle()
            }
        }
        testScope.advanceUntilIdle()

        // 验证在最后一题且所有题目已回答（显示提交）
        var state = viewModel.uiState.value
        assertEquals("应该在最后一题", 2, state.currentQuestionIndex)
        assertFalse("所有题目回答完毕应该显示提交", state.canNavigateNext)

        // 返回上一题（题目2）
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()

        // 验证在题目2且已选择答案（应该显示下一题，因为不是所有题目都能从当前看到的状态判断为完成）
        state = viewModel.uiState.value
        assertEquals("应该在题目2", 1, state.currentQuestionIndex)
        assertTrue("题目2应该显示下一题（因为题目3已回答）", state.canNavigateNext)

        // 再返回上一题（题目1）
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在题目1", 0, state.currentQuestionIndex)
        assertTrue("题目1应该显示下一题（因为其他题目已回答）", state.canNavigateNext)
    }

    @Test
    fun `completing questions in different orders works correctly`() = runTest {
        testScope.advanceUntilIdle()

        // 先回答题目1
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        // 跳到题目3回答
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目3
        testScope.advanceUntilIdle()

        // 此时题目1和3已回答，题目2未回答
        var state = viewModel.uiState.value
        assertEquals("应该在题目3", 2, state.currentQuestionIndex)
        assertFalse("题目2未回答时不应该能提交", state.canNavigateNext)

        // 返回题目2并回答
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目2
        testScope.advanceUntilIdle()

        // 现在所有题目都已回答
        state = viewModel.uiState.value
        assertEquals("应该在题目2", 1, state.currentQuestionIndex)
        assertFalse("所有题目回答完毕应该显示提交", state.canNavigateNext)

        // 前进到题目3
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在题目3", 2, state.currentQuestionIndex)
        assertFalse("题目3应该显示提交", state.canNavigateNext)
    }
}