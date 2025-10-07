package com.example.myapplication.integration

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.network.ApiService
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.repository.PersonalityTestRepositoryImpl
import com.example.myapplication.ui.question.QuestionViewModel
import com.example.myapplication.ui.result.ResultViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.whenever
import retrofit2.Response

/**
 * 人格测试集成测试
 * 测试从API调用到UI状态更新的完整数据流
 */
@ExperimentalCoroutinesApi
class PersonalityTestIntegrationTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var apiService: ApiService

    private lateinit var repository: PersonalityTestRepository
    private lateinit var questionViewModel: QuestionViewModel
    private lateinit var resultViewModel: ResultViewModel
    private val testDispatcher = UnconfinedTestDispatcher()

    private val mockQuestions = listOf(
        Question(
            id = 1,
            questionTextZh = "你喜欢与人交往吗？",
            questionTextEn = "Do you like socializing?",
            dimension = "extraversion",
            reverse = false
        ),
        Question(
            id = 2,
            questionTextZh = "你喜欢独处吗？",
            questionTextEn = "Do you like being alone?",
            dimension = "extraversion",
            reverse = true
        )
    )

    private val mockAnswerOptions = listOf(
        AnswerOption(1, "完全不同意", "Strongly Disagree", 1),
        AnswerOption(2, "不同意", "Disagree", 2),
        AnswerOption(3, "中立", "Neutral", 3),
        AnswerOption(4, "同意", "Agree", 4),
        AnswerOption(5, "完全同意", "Strongly Agree", 5)
    )

    private val mockTestReport = TestReport(
        timestamp = "2024-01-01T12:00:00Z",
        language = "zh",
        mbtiType = "INTJ",
        bigFiveScores = BigFiveScores(4.2, 3.8, 2.5, 4.0, 2.1),
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
            CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"),
            CareerSuggestion(2, "INTJ", "数据分析师", "Data Analyst")
        )
    )

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        Dispatchers.setMain(testDispatcher)
        
        repository = PersonalityTestRepositoryImpl(apiService)
        questionViewModel = QuestionViewModel(repository)
        resultViewModel = ResultViewModel()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `complete test flow from API to UI state`() = runTest {
        // Arrange - 设置API响应
        setupSuccessfulApiResponses()

        // Act 1 - 加载初始数据
        questionViewModel.loadInitialData()

        // Assert 1 - 验证初始数据加载
        var questionState = questionViewModel.uiState.value
        assertFalse(questionState.isLoading)
        assertEquals(mockAnswerOptions, questionState.answerOptions)
        assertEquals(mockQuestions[0], questionState.currentQuestion)
        assertNull(questionState.error)

        // Act 2 - 回答第一个问题
        questionViewModel.selectAnswer(mockAnswerOptions[3]) // 选择"同意"

        // Assert 2 - 验证答案选择
        questionState = questionViewModel.uiState.value
        val userAnswers1 = questionViewModel.getUserAnswers()
        assertEquals(1, userAnswers1.size)
        assertEquals(1, userAnswers1[0].questionId)
        assertEquals(4, userAnswers1[0].answerScore)
        assertTrue(questionViewModel.canGoNext())

        // Act 3 - 进入下一题
        questionViewModel.nextQuestion()

        // Assert 3 - 验证题目切换
        questionState = questionViewModel.uiState.value
        assertEquals(1, questionState.currentQuestionIndex)
        assertEquals(mockQuestions[1], questionState.currentQuestion)

        // Act 4 - 回答第二个问题
        questionViewModel.selectAnswer(mockAnswerOptions[1]) // 选择"不同意"

        // Assert 4 - 验证第二个答案
        questionState = questionViewModel.uiState.value
        val userAnswers = questionViewModel.getUserAnswers()
        assertEquals(2, userAnswers.size)
        assertEquals(2, userAnswers[1].questionId)
        assertEquals(2, userAnswers[1].answerScore)

        // Act 5 - 提交测试
        questionViewModel.submitTest()

        // Assert 5 - 验证测试提交和完成
        questionState = questionViewModel.uiState.value
        assertFalse(questionState.isLoading)
        assertTrue(questionState.testCompleted)
        assertNotNull(questionState.testReport)
        assertEquals("INTJ", questionState.testReport!!.mbtiType)

        // Act 6 - 将结果传递给ResultViewModel
        resultViewModel.setTestReport(questionState.testReport!!)

        // Assert 6 - 验证结果页面状态
        val resultState = resultViewModel.uiState.value
        assertNotNull(resultState.testReport)
        assertEquals("INTJ", resultState.testReport!!.mbtiType)
        assertEquals("建筑师", resultState.testReport!!.mbtiTypeInfo.typeNameZh)
        assertEquals(2, resultState.testReport!!.careerSuggestions.size)
    }

    @Test
    fun `error handling throughout the flow`() = runTest {
        // Arrange - 设置API错误响应
        val errorResponse = ApiResponse<List<AnswerOption>>(
            success = false,
            data = null,
            error = "Network connection failed"
        )
        whenever(apiService.getAnswerOptions("zh")).thenReturn(Response.success(errorResponse))

        // Act - 尝试加载初始数据
        questionViewModel.loadInitialData()

        // Assert - 验证错误处理
        val questionState = questionViewModel.uiState.value
        assertFalse(questionState.isLoading)
        assertNotNull(questionState.error)
        assertTrue(questionState.error!!.contains("Network connection failed"))
        assertTrue(questionState.answerOptions.isEmpty())
    }

    @Test
    fun `navigation flow between questions`() = runTest {
        // Arrange
        setupSuccessfulApiResponses()
        questionViewModel.loadInitialData()

        // Act & Assert - 测试前进和后退导航
        
        // 初始状态
        var state = questionViewModel.uiState.value
        assertEquals(0, state.currentQuestionIndex)
        assertFalse(questionViewModel.canGoPrevious())
        assertFalse(questionViewModel.canGoNext()) // 没有答案时不能前进

        // 回答第一题
        questionViewModel.selectAnswer(mockAnswerOptions[2])
        assertTrue(questionViewModel.canGoNext())
        assertFalse(questionViewModel.canGoPrevious())

        // 前进到第二题
        questionViewModel.nextQuestion()
        state = questionViewModel.uiState.value
        assertEquals(1, state.currentQuestionIndex)
        assertTrue(questionViewModel.canGoPrevious())
        assertFalse(questionViewModel.canGoNext()) // 第二题还没回答

        // 回答第二题
        questionViewModel.selectAnswer(mockAnswerOptions[4])
        assertTrue(questionViewModel.canGoNext())
        assertTrue(questionViewModel.canGoPrevious())

        // 后退到第一题
        questionViewModel.previousQuestion()
        state = questionViewModel.uiState.value
        assertEquals(0, state.currentQuestionIndex)
        assertEquals(mockQuestions[0], state.currentQuestion)
        
        // 验证第一题的答案仍然被记住
        assertEquals(mockAnswerOptions[2], questionViewModel.getCurrentSelectedAnswer())
    }

    @Test
    fun `test submission with all questions answered`() = runTest {
        // Arrange
        setupSuccessfulApiResponses()
        questionViewModel.loadInitialData()

        // Act - 回答所有问题
        mockQuestions.forEachIndexed { index, _ ->
            questionViewModel.selectAnswer(mockAnswerOptions[index % mockAnswerOptions.size])
            if (index < mockQuestions.size - 1) {
                questionViewModel.nextQuestion()
            }
        }

        // 验证所有问题都已回答
        val userAnswers = questionViewModel.getUserAnswers()
        assertEquals(mockQuestions.size, userAnswers.size)
        assertTrue(questionViewModel.isLastQuestion())

        // 提交测试
        questionViewModel.submitTest()

        // Assert
        val stateAfterSubmit = questionViewModel.uiState.value
        assertTrue(stateAfterSubmit.testCompleted)
        assertNotNull(stateAfterSubmit.testReport)
        assertEquals("INTJ", stateAfterSubmit.testReport!!.mbtiType)
    }

    @Test
    fun `result sharing functionality`() = runTest {
        // Arrange
        resultViewModel.setTestReport(mockTestReport)

        // Act
        val shareText = resultViewModel.generateShareableText()

        // Assert
        assertNotNull(shareText)
        assertTrue(shareText!!.contains("INTJ - 建筑师"))
        assertTrue(shareText.contains("富有想象力和战略性的思想家"))
        assertTrue(shareText.contains("软件工程师"))
        assertTrue(shareText.contains("数据分析师"))
        assertTrue(shareText.contains("开放性: 4.2"))
        assertTrue(shareText.contains("尽责性: 3.8"))
    }

    @Test
    fun `restart test flow`() = runTest {
        // Arrange - 完成一次测试
        setupSuccessfulApiResponses()
        questionViewModel.loadInitialData()
        questionViewModel.selectAnswer(mockAnswerOptions[2])
        questionViewModel.nextQuestion()
        questionViewModel.selectAnswer(mockAnswerOptions[3])
        questionViewModel.submitTest()

        val completedState = questionViewModel.uiState.value
        assertTrue(completedState.testCompleted)

        // 将结果传递给ResultViewModel
        resultViewModel.setTestReport(completedState.testReport!!)

        // Act - 触发重新开始测试
        resultViewModel.restartTest()

        // Assert - 验证重新开始标志
        val resultState = resultViewModel.uiState.value
        assertTrue(resultState.shouldRestartTest)
        assertNotNull(resultState.testReport) // 报告仍然存在

        // 清除重新开始标志（模拟导航到新测试）
        resultViewModel.clearRestartFlag()
        val clearedState = resultViewModel.uiState.value
        assertFalse(clearedState.shouldRestartTest)
    }

    @Test
    fun `data consistency across ViewModels`() = runTest {
        // Arrange
        setupSuccessfulApiResponses()
        questionViewModel.loadInitialData()

        // 完成测试流程
        mockQuestions.forEachIndexed { index, _ ->
            questionViewModel.selectAnswer(mockAnswerOptions[index % mockAnswerOptions.size])
            if (index < mockQuestions.size - 1) {
                questionViewModel.nextQuestion()
            }
        }
        questionViewModel.submitTest()

        val questionState = questionViewModel.uiState.value
        val testReport = questionState.testReport!!

        // Act - 在ResultViewModel中设置相同的测试报告
        resultViewModel.setTestReport(testReport)

        // Assert - 验证数据一致性
        val resultState = resultViewModel.uiState.value
        assertEquals(testReport.mbtiType, resultState.testReport!!.mbtiType)
        assertEquals(testReport.language, resultState.testReport!!.language)
        assertEquals(testReport.timestamp, resultState.testReport!!.timestamp)
        assertEquals(testReport.bigFiveScores, resultState.testReport!!.bigFiveScores)
        assertEquals(testReport.mbtiTypeInfo.typeCode, resultState.testReport!!.mbtiTypeInfo.typeCode)
        assertEquals(testReport.careerSuggestions.size, resultState.testReport!!.careerSuggestions.size)
    }

    private fun setupSuccessfulApiResponses() {
        // 设置获取答案选项的成功响应
        val answerOptionsResponse = ApiResponse(
            success = true,
            data = mockAnswerOptions,
            error = null
        )
        runBlocking {
            whenever(apiService.getAnswerOptions("zh")).thenReturn(Response.success(answerOptionsResponse))

            // 设置获取问题的成功响应
            val questionsResponse = ApiResponse(
                success = true,
                data = mockQuestions,
                error = null
            )
            whenever(apiService.getRandomQuestions(10, "zh")).thenReturn(Response.success(questionsResponse))

            // 设置提交测试的成功响应
            val submissionResponse = TestSubmissionResponse(
                success = true,
                report = mockTestReport,
                saveResult = false
            )
            whenever(apiService.submitTest(org.mockito.kotlin.any<TestSubmissionRequest>())).thenReturn(Response.success(submissionResponse))
        }
    }
}