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
 * 按钮行为正确性测试
 * 验证修复后的按钮显示和可点击状态符合用户需求
 */
@ExperimentalCoroutinesApi
class ButtonBehaviorCorrectTest {

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
    fun `first question initial state - show next button disabled`() = runTest {
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals("应该在第一题", 0, state.currentQuestionIndex)
        assertFalse("不应该显示提交按钮", state.shouldShowSubmitButton)
        assertFalse("按钮应该不可点击", state.isPrimaryButtonEnabled)
        assertFalse("不应该能前进", state.canNavigateNext)
        assertFalse("不应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `first question with answer - show next button enabled`() = runTest {
        testScope.advanceUntilIdle()

        // 选择答案
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals("仍在第一题", 0, state.currentQuestionIndex)
        assertFalse("不应该显示提交按钮", state.shouldShowSubmitButton)
        assertTrue("按钮应该可点击", state.isPrimaryButtonEnabled)
        assertTrue("应该能前进", state.canNavigateNext)
        assertFalse("不应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `middle question initial state - show next button disabled`() = runTest {
        testScope.advanceUntilIdle()

        // 先回答第一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals("应该在第二题", 1, state.currentQuestionIndex)
        assertFalse("不应该显示提交按钮", state.shouldShowSubmitButton)
        assertFalse("按钮应该不可点击", state.isPrimaryButtonEnabled)
        assertFalse("不应该能前进", state.canNavigateNext)
        assertTrue("应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `middle question with answer - show next button enabled`() = runTest {
        testScope.advanceUntilIdle()

        // 回答第一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 回答第二题
        viewModel.selectAnswer(mockAnswerOptions[1])
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals("仍在第二题", 1, state.currentQuestionIndex)
        assertFalse("不应该显示提交按钮", state.shouldShowSubmitButton)
        assertTrue("按钮应该可点击", state.isPrimaryButtonEnabled)
        assertTrue("应该能前进", state.canNavigateNext)
        assertTrue("应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `last question initial state - show submit button disabled`() = runTest {
        testScope.advanceUntilIdle()

        // 完成前两题
        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目1
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        viewModel.selectAnswer(mockAnswerOptions[1]) // 题目2
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals("应该在最后一题", 2, state.currentQuestionIndex)
        assertTrue("应该显示提交按钮", state.shouldShowSubmitButton)
        assertFalse("按钮应该不可点击（因为最后一题未回答）", state.isPrimaryButtonEnabled)
        assertFalse("不应该能前进", state.canNavigateNext)
        assertTrue("应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `last question with incomplete answers - show submit button disabled`() = runTest {
        testScope.advanceUntilIdle()

        // 只回答第一题，跳到最后一题
        viewModel.selectAnswer(mockAnswerOptions[0]) // 题目1
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()
        viewModel.nextQuestion() // 跳到题目3
        testScope.advanceUntilIdle()

        // 回答最后一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        assertEquals("应该在最后一题", 2, state.currentQuestionIndex)
        assertTrue("应该显示提交按钮", state.shouldShowSubmitButton)
        assertFalse("按钮应该不可点击（因为题目2未回答）", state.isPrimaryButtonEnabled)
        assertFalse("不应该能前进", state.canNavigateNext)
        assertTrue("应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `last question with all answers - show submit button enabled`() = runTest {
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

        val state = viewModel.uiState.value
        assertEquals("应该在最后一题", 2, state.currentQuestionIndex)
        assertTrue("应该显示提交按钮", state.shouldShowSubmitButton)
        assertTrue("按钮应该可点击（所有题目已完成）", state.isPrimaryButtonEnabled)
        assertFalse("不应该能前进（使用提交）", state.canNavigateNext)
        assertTrue("应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `navigation back and forth maintains correct button states`() = runTest {
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

        // 在最后一题，应该显示提交按钮且可点击
        var state = viewModel.uiState.value
        assertTrue("最后一题应该显示提交", state.shouldShowSubmitButton)
        assertTrue("最后一题按钮应该可点击", state.isPrimaryButtonEnabled)

        // 返回第二题
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在第二题", 1, state.currentQuestionIndex)
        assertFalse("第二题不应该显示提交", state.shouldShowSubmitButton)
        assertTrue("第二题按钮应该可点击", state.isPrimaryButtonEnabled)

        // 返回第一题
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在第一题", 0, state.currentQuestionIndex)
        assertFalse("第一题不应该显示提交", state.shouldShowSubmitButton)
        assertTrue("第一题按钮应该可点击", state.isPrimaryButtonEnabled)
        assertFalse("第一题不应该能后退", state.canNavigatePrevious)
    }

    @Test
    fun `completing questions in any order works correctly`() = runTest {
        testScope.advanceUntilIdle()

        // 题目2和3回答，题目1未回答
        viewModel.nextQuestion() // 到题目2
        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        viewModel.nextQuestion() // 到题目3
        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        var state = viewModel.uiState.value
        assertEquals("应该在最后一题", 2, state.currentQuestionIndex)
        assertTrue("应该显示提交按钮", state.shouldShowSubmitButton)
        assertFalse("按钮应该不可点击（题目1未回答）", state.isPrimaryButtonEnabled)

        // 返回题目1并回答
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在第一题", 0, state.currentQuestionIndex)
        assertFalse("不应该显示提交按钮", state.shouldShowSubmitButton)
        assertTrue("按钮应该可点击", state.isPrimaryButtonEnabled)

        // 前进到最后一题
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在最后一题", 2, state.currentQuestionIndex)
        assertTrue("应该显示提交按钮", state.shouldShowSubmitButton)
        assertTrue("按钮应该可点击（所有题目已完成）", state.isPrimaryButtonEnabled)
    }

    @Test
    fun `button click behavior matches visual state`() = runTest {
        testScope.advanceUntilIdle()

        // 在第一题未回答时
        var state = viewModel.uiState.value
        assertFalse("按钮不可点击", state.isPrimaryButtonEnabled)
        assertFalse("不显示提交", state.shouldShowSubmitButton)

        // 选择答案后
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertTrue("按钮可点击", state.isPrimaryButtonEnabled)
        assertFalse("不显示提交", state.shouldShowSubmitButton)
        assertTrue("应该能前进", state.canNavigateNext)

        // 前进到下一题
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertFalse("按钮不可点击", state.isPrimaryButtonEnabled)
        assertFalse("不显示提交", state.shouldShowSubmitButton)
        assertFalse("不应该能前进", state.canNavigateNext)
    }
}