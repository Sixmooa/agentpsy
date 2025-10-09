package com.example.myapplication.ui.question

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.TestProgressDataStore
import io.mockk.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*

/**
 * QuestionViewModel成功场景测试
 * 验证ViewModel在正常情况下的行为
 */
@ExperimentalCoroutinesApi
class QuestionViewModelSuccessTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    private val mockRepository = mockk<PersonalityTestRepository>()
    private val mockDataStore = mockk<TestProgressDataStore>()
    private lateinit var viewModel: QuestionViewModel

    // Mock数据
    private val mockAnswerOptions = listOf(
        AnswerOption(1, "非常同意", "Strongly Agree", 5),
        AnswerOption(2, "同意", "Agree", 4),
        AnswerOption(3, "中性", "Neutral", 3),
        AnswerOption(4, "不同意", "Disagree", 2),
        AnswerOption(5, "非常不同意", "Strongly Disagree", 1)
    )

    private val mockQuestions = listOf(
        Question(1, "我喜欢与人交往", "I like socializing", "extraversion", false, null),
        Question(2, "我注重细节", "I pay attention to details", "conscientiousness", false, null),
        Question(3, "我依靠逻辑思考", "I rely on logical thinking", "openness", false, null)
    )

    private val mockTestReport = TestReport(
        timestamp = "2024-01-01T12:00:00Z",
        language = "zh",
        mbtiType = "INTJ",
        bigFiveScores = BigFiveScores(
            openness = 4.2,
            conscientiousness = 3.8,
            extraversion = 2.5,
            agreeableness = 4.0,
            neuroticism = 2.1
        ),
        mbtiTypeInfo = MBTIType(
            id = 1,
            typeCode = "INTJ",
            typeNameZh = "建筑师",
            typeNameEn = "Architect",
            descriptionZh = "富有想象力和战略性的思想家",
            descriptionEn = "Imaginative and strategic thinkers",
            strengths = listOf("分析能力强", "独立思考"),
            challenges = listOf("过于完美主义", "难以表达情感")
        ),
        careerSuggestions = listOf(
            CareerSuggestion(
                id = 1,
                mbtiType = "INTJ",
                careerZh = "软件工程师",
                careerEn = "Software Engineer"
            ),
            CareerSuggestion(
                id = 2,
                mbtiType = "INTJ",
                careerZh = "数据分析师",
                careerEn = "Data Analyst"
            )
        )
    )

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        
        // 设置mock行为
        coEvery { mockRepository.getAnswerOptions(any()) } returns Result.success(mockAnswerOptions)
        coEvery { mockRepository.getRandomQuestions(count = any(), language = any()) } returns Result.success(mockQuestions)
        coEvery { mockRepository.submitTest(any(), any(), any()) } returns Result.success(mockTestReport)
        
        // Mock dataStore
        coEvery { mockDataStore.getTestProgress } returns kotlinx.coroutines.flow.flowOf("")
        coEvery { mockDataStore.saveTestProgress(any()) } just Runs
        coEvery { mockDataStore.clearTestProgress() } just Runs
        
        viewModel = QuestionViewModel(mockRepository, mockDataStore)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        clearAllMocks()
    }

    @Test
    fun `test successful initial data loading`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // Then: 验证状态
        val state = viewModel.uiState.value
        assertFalse("加载状态应为false", state.isLoading)
        assertEquals("答案选项应正确加载", mockAnswerOptions, state.answerOptions)
        assertEquals("当前题目应为第一题", mockQuestions[0], state.currentQuestion)
        assertEquals("题目索引应为0", 0, state.currentQuestionIndex)
        assertEquals("总题目数应为3", 3, state.totalQuestions)
        assertNull("错误信息应为空", state.error)
    }

    @Test
    fun `test successful question navigation`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // When: 选择答案并前进
        viewModel.selectAnswer(mockAnswerOptions[0])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Then: 验证导航到第二题
        assertEquals("应该是第二题", mockQuestions[1], viewModel.uiState.value.currentQuestion)
        assertEquals("题目索引应为1", 1, viewModel.uiState.value.currentQuestionIndex)

        // When: 再次前进
        viewModel.selectAnswer(mockAnswerOptions[1])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Then: 验证导航到第三题
        assertEquals("应该是第三题", mockQuestions[2], viewModel.uiState.value.currentQuestion)
        assertEquals("题目索引应为2", 2, viewModel.uiState.value.currentQuestionIndex)
    }

    @Test
    fun `test successful answer selection and submission`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // When: 选择答案
        viewModel.selectAnswer(mockAnswerOptions[0]) // 第一题选择第一个选项
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()
        
        viewModel.selectAnswer(mockAnswerOptions[2]) // 第二题选择第三个选项
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()
        
        viewModel.selectAnswer(mockAnswerOptions[4]) // 第三题选择第五个选项

        // Then: 验证答案存储
        val userAnswers = viewModel.getUserAnswers()
        assertEquals("应该有3个答案", 3, userAnswers.size)
        assertEquals("第一题答案应正确", 1, userAnswers[0].questionId)
        assertEquals("第一题分数应正确", 5, userAnswers[0].answerScore)

        // When: 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then: 验证提交结果
        assertFalse("加载状态应为false", viewModel.uiState.value.isLoading)
        assertNull("错误信息应为空", viewModel.uiState.value.error)
        assertEquals("测试报告应正确", mockTestReport, viewModel.uiState.value.testReport)
        assertTrue("测试应已完成", viewModel.uiState.value.testCompleted)

        // 验证repository调用
        coVerify { 
            mockRepository.submitTest(match { answers ->
                answers.size == 3 &&
                answers.any { it.questionId == 1 && it.answerScore == 5 } &&
                answers.any { it.questionId == 2 && it.answerScore == 3 } &&
                answers.any { it.questionId == 3 && it.answerScore == 1 }
            })
        }
    }

    @Test
    fun `test successful progress calculation`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // When: 回答第一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Then: 验证进度
        assertEquals("进度应为1/3", 1, viewModel.uiState.value.currentQuestionIndex)
        assertEquals("总题数应为3", 3, viewModel.uiState.value.totalQuestions)

        // When: 回答第二题
        viewModel.selectAnswer(mockAnswerOptions[1])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Then: 验证进度
        assertEquals("进度应为2/3", 2, viewModel.uiState.value.currentQuestionIndex)
    }

    @Test
    fun `test successful error clearing`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // When: 清除错误
        viewModel.clearError()

        // Then: 验证错误已清除
        assertNull("错误应为空", viewModel.uiState.value.error)
    }

    @Test
    fun `test successful current question retrieval`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // When: 获取当前题目
        val currentQuestion = viewModel.uiState.value.currentQuestion

        // Then: 验证当前题目
        assertEquals("当前题目应为第一题", mockQuestions[0], currentQuestion)
    }

    @Test
    fun `test successful answer validation`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // When: 选择答案
        viewModel.selectAnswer(mockAnswerOptions[0])

        // Then: 验证答案选择
        assertEquals("应该选择了第一个答案选项", mockAnswerOptions[0], viewModel.uiState.value.selectedAnswer)
        assertTrue("应该可以前进", viewModel.canGoNext())
    }

    @Test
    fun `test successful multiple data reloads`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // When: 重新加载数据
        viewModel.loadInitialData()
        testScope.advanceUntilIdle()

        // Then: 验证数据重新加载成功
        val state = viewModel.uiState.value
        assertFalse("加载状态应为false", state.isLoading)
        assertEquals("答案选项应正确", mockAnswerOptions, state.answerOptions)
        assertEquals("当前题目应为第一题", mockQuestions[0], state.currentQuestion)
    }

    @Test
    fun `test successful question order preservation`() = runTest {
        // Given: 等待初始化完成
        testScope.advanceUntilIdle()

        // Then: 验证题目顺序
        assertEquals("第一题ID应正确", 1, viewModel.uiState.value.currentQuestion?.id)

        // When: 前进到下一题
        viewModel.selectAnswer(mockAnswerOptions[0])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Then: 验证第二题
        assertEquals("第二题ID应正确", 2, viewModel.uiState.value.currentQuestion?.id)

        // When: 前进到最后一题
        viewModel.selectAnswer(mockAnswerOptions[1])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Then: 验证最后一题
        assertEquals("应该是最后一题", 3, viewModel.uiState.value.currentQuestion?.id)
    }

}