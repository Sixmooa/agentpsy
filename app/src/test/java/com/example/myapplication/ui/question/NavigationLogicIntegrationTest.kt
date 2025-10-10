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
 * 导航逻辑集成测试
 * 验证修复后的导航行为与用户期望一致
 */
@ExperimentalCoroutinesApi
class NavigationLogicIntegrationTest {

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
        Question(3, "问题3", "Question 3", "S", false, null)
    )

    private val mockAnswerOptions = listOf(
        AnswerOption(1, "选项1", "Option 1", 1),
        AnswerOption(2, "选项2", "Option 2", 2)
    )

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        setupMocks()
        viewModel = QuestionViewModel(repository, dataStore)
    }

    private fun setupMocks() {
        coEvery { repository.getAnswerOptions(any()) } returns Result.success(mockAnswerOptions)
        coEvery { repository.getRandomQuestions(count = any(), language = any()) } returns Result.success(mockQuestions)
        coEvery { dataStore.getTestProgress } returns kotlinx.coroutines.flow.flowOf("")
        coEvery { dataStore.saveTestProgress(any()) } returns Unit
        coEvery { dataStore.clearTestProgress() } returns Unit
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        clearAllMocks()
    }

    @Test
    fun `user journey complete test answers then submit`() = runTest {
        testScope.advanceUntilIdle()

        // 用户旅程：完成所有题目然后提交

        // 题目1：选择答案 -> 显示下一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        var state = viewModel.uiState.value
        assertTrue("题目1选择答案后应该显示下一题", state.canNavigateNext)
        assertEquals("应该在题目1", 0, state.currentQuestionIndex)

        // 前进到题目2
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 题目2：选择答案 -> 显示下一题
        viewModel.selectAnswer(mockAnswerOptions[1])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertTrue("题目2选择答案后应该显示下一题", state.canNavigateNext)
        assertEquals("应该在题目2", 1, state.currentQuestionIndex)

        // 前进到题目3（最后一题）
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在题目3", 2, state.currentQuestionIndex)
        assertFalse("题目3未回答时不应该能前进", state.canNavigateNext)

        // 题目3：选择答案 -> 由于所有题目都已完成，显示提交
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertFalse("所有题目完成后应该显示提交", state.canNavigateNext)
        assertEquals("仍在题目3", 2, state.currentQuestionIndex)

        // 验证用户答案数量正确
        val userAnswers = viewModel.getUserAnswers()
        assertEquals("应该有3个答案", 3, userAnswers.size)

        // 模拟提交测试
        val mockTestReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "zh",
            mbtiType = "INTJ",
            bigFiveScores = BigFiveScores(4.0, 3.0, 2.0, 4.0, 2.0),
            mbtiTypeInfo = MBTIType(1, "INTJ", "建筑师", "Architect", "描述", "Description", listOf("优势"), listOf("挑战")),
            careerSuggestions = listOf(CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"))
        )

        coEvery { repository.submitTest(any(), any(), any()) } returns Result.success(mockTestReport)

        // 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertTrue("测试应该已完成", state.testCompleted)
        assertNotNull("应该有测试报告", state.testReport)
        assertEquals("报告类型应该是INTJ", "INTJ", state.testReport!!.mbtiType)
    }

    @Test
    fun `user journey skip questions then come back`() = runTest {
        testScope.advanceUntilIdle()

        // 用户旅程：跳过一些题目，然后回来完成

        // 题目1：不回答直接尝试下一题（应该不允许）
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        var state = viewModel.uiState.value
        assertEquals("不应该前进，仍在题目1", 0, state.currentQuestionIndex)
        assertFalse("未回答题目不应该能前进", state.canNavigateNext)

        // 回答题目1
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertTrue("回答后应该能前进", state.canNavigateNext)

        // 前进到题目2
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 题目2：不回答，直接跳到题目3
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该在题目3", 2, state.currentQuestionIndex)
        assertFalse("题目3未回答不应该能前进", state.canNavigateNext)

        // 回到题目2
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertEquals("应该回到题目2", 1, state.currentQuestionIndex)
        assertFalse("题目2未回答不应该能前进", state.canNavigateNext)

        // 回答题目2
        viewModel.selectAnswer(mockAnswerOptions[1])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertTrue("题目2回答后应该能前进", state.canNavigateNext)

        // 前进到题目3
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // 题目3：回答（现在所有题目都已完成）
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertFalse("所有题目完成后应该显示提交", state.canNavigateNext)
    }

    @Test
    fun `button behavior consistency check`() = runTest {
        testScope.advanceUntilIdle()

        // 测试按钮行为的一致性

        // 初始状态：两个按钮都不能用
        var state = viewModel.uiState.value
        assertFalse("初始不能前进", state.canNavigateNext)
        assertFalse("初始不能后退", state.canNavigatePrevious)

        // 选择答案：可以用下一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertTrue("选择答案后可以用下一题", state.canNavigateNext)
        assertFalse("第一题不能后退", state.canNavigatePrevious)

        // 前进到下一题
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertFalse("新题目未回答不能前进", state.canNavigateNext)
        assertTrue("第二题可以后退", state.canNavigatePrevious)

        // 后退
        viewModel.previousQuestion()
        testScope.advanceUntilIdle()

        state = viewModel.uiState.value
        assertTrue("回到第一题应该可以前进（已回答）", state.canNavigateNext)
        assertFalse("第一题不能后退", state.canNavigatePrevious)
    }
}