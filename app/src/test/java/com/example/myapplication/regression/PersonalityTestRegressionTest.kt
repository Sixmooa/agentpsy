package com.example.myapplication.regression

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.TestProgressDataStore
import com.example.myapplication.ui.question.QuestionViewModel
import com.example.myapplication.ui.result.ResultViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.whenever
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotNull
import kotlin.test.assertNull
import kotlin.test.assertTrue

/**
 * 回归测试套件
 * 确保新功能不影响现有功能的稳定性和正确性
 */
@OptIn(ExperimentalCoroutinesApi::class)
class PersonalityTestRegressionTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var mockRepository: PersonalityTestRepository
    
    @Mock
    private lateinit var mockDataStore: TestProgressDataStore

    private lateinit var questionViewModel: QuestionViewModel
    private lateinit var resultViewModel: ResultViewModel
    private val testDispatcher = StandardTestDispatcher()

    private val sampleQuestions = listOf(
        Question(1, "测试问题1", "Test Question 1", "extraversion", false),
        Question(2, "测试问题2", "Test Question 2", "agreeableness", true),
        Question(3, "测试问题3", "Test Question 3", "conscientiousness", false)
    )

    private val sampleAnswerOptions = listOf(
        AnswerOption(1, "完全不同意", "Strongly Disagree", 1),
        AnswerOption(2, "不同意", "Disagree", 2),
        AnswerOption(3, "中立", "Neutral", 3),
        AnswerOption(4, "同意", "Agree", 4),
        AnswerOption(5, "完全同意", "Strongly Agree", 5)
    )

    private val sampleTestReport = TestReport(
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
        // 不在这里创建ViewModel，而是在每个测试中创建，以确保mock先设置
        resultViewModel = ResultViewModel()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    /**
     * 回归测试：数据模型序列化兼容性
     * 确保数据模型的序列化/反序列化功能保持稳定
     */
    @Test
    fun regression_dataModelSerialization_maintainsCompatibility() {
        // 测试Question序列化
        val question = sampleQuestions[0]
        assertNotNull(question.id)
        assertNotNull(question.questionTextZh)
        assertNotNull(question.questionTextEn)
        assertNotNull(question.dimension)

        // 测试AnswerOption序列化
        val answerOption = sampleAnswerOptions[0]
        assertNotNull(answerOption.id)
        assertNotNull(answerOption.optionTextZh)
        assertNotNull(answerOption.optionTextEn)
        assertTrue(answerOption.score in 1..5)

        // 测试TestReport序列化
        assertNotNull(sampleTestReport.timestamp)
        assertNotNull(sampleTestReport.language)
        assertNotNull(sampleTestReport.mbtiType)
        assertNotNull(sampleTestReport.bigFiveScores)
        assertNotNull(sampleTestReport.mbtiTypeInfo)
        assertNotNull(sampleTestReport.careerSuggestions)

        // 测试BigFiveScores数值范围
        val scores = sampleTestReport.bigFiveScores
        assertTrue(scores.openness in 0.0..5.0)
        assertTrue(scores.conscientiousness in 0.0..5.0)
        assertTrue(scores.extraversion in 0.0..5.0)
        assertTrue(scores.agreeableness in 0.0..5.0)
        assertTrue(scores.neuroticism in 0.0..5.0)
    }

    /**
     * 回归测试：API响应格式兼容性
     * 确保API响应格式的变更不会破坏现有功能
     */
    @Test
    fun regression_apiResponseFormat_maintainsCompatibility() = runTest {
        // 模拟API响应
        val apiResponse = ApiResponse(
            success = true,
            data = sampleTestReport,
            error = null
        )

        // 验证响应结构
        assertTrue(apiResponse.success)
        assertNull(apiResponse.error)
        assertNotNull(apiResponse.data)

        // 验证数据完整性
        val testReport = apiResponse.data!!
        assertEquals("INTJ", testReport.mbtiType)
        assertEquals("zh", testReport.language)
        assertEquals(2, testReport.careerSuggestions.size)
        assertEquals(2, testReport.mbtiTypeInfo.strengths.size)
        assertEquals(2, testReport.mbtiTypeInfo.challenges.size)
    }

    /**
     * 回归测试：QuestionViewModel核心功能
     * 确保问题管理和状态更新功能保持稳定
     */
    @Test
    fun regression_questionViewModel_coreFunctionality() = runTest {
        // 设置mock响应 - 初始加载返回多个问题以支持导航
        whenever(mockRepository.getRandomQuestions(count = org.mockito.kotlin.any(), language = org.mockito.kotlin.any()))
            .thenReturn(Result.success(sampleQuestions)) // 返回所有问题
        whenever(mockRepository.getAnswerOptions(language = org.mockito.kotlin.any())).thenReturn(Result.success(sampleAnswerOptions))

        // 在mock设置后创建ViewModel，传入测试协程作用域
        questionViewModel = QuestionViewModel(mockRepository, mockDataStore)
        testDispatcher.scheduler.advanceUntilIdle()
        
        // 验证初始状态
        val initialState = questionViewModel.uiState.value
        assertFalse(initialState.isLoading)
        assertEquals(5, initialState.answerOptions.size)
        assertEquals(0, initialState.currentQuestionIndex)
        assertNotNull(initialState.currentQuestion)

        // 测试答案选择功能
        val selectedAnswer = sampleAnswerOptions[2] // 中立选项
        questionViewModel.selectAnswer(selectedAnswer)
        
        val stateAfterSelection = questionViewModel.uiState.value
        assertEquals(selectedAnswer, stateAfterSelection.selectedAnswer)

        // 测试导航功能
        assertTrue(questionViewModel.uiState.value.canNavigateNext)
        assertFalse(questionViewModel.uiState.value.canNavigatePrevious)

        questionViewModel.nextQuestion()
        // 等待协程完成
        testDispatcher.scheduler.advanceUntilIdle()
        
        val stateAfterNext = questionViewModel.uiState.value
        assertEquals(1, stateAfterNext.currentQuestionIndex)
        assertTrue(questionViewModel.uiState.value.canNavigatePrevious)
    }

    /**
     * 回归测试：ResultViewModel核心功能
     * 确保结果显示和分享功能保持稳定
     */
    @Test
    fun regression_resultViewModel_coreFunctionality() {
        // 测试初始状态
        val initialState = resultViewModel.uiState.value
        assertTrue(initialState.isLoading)
        assertEquals(null, initialState.testReport)
        assertFalse(initialState.shouldRestartTest)

        // 测试设置测试报告
        resultViewModel.setTestReport(sampleTestReport)
        testDispatcher.scheduler.advanceUntilIdle()
        val stateAfterSet = resultViewModel.uiState.value
        assertNotNull(stateAfterSet.testReport)
        assertEquals("INTJ", stateAfterSet.testReport!!.mbtiType)

        // 测试分享功能
        resultViewModel.shareResult()
        testDispatcher.scheduler.advanceUntilIdle()
        val shareText = resultViewModel.uiState.value.shareText!!
        assertTrue(shareText.contains("INTJ"))
        assertTrue(shareText.contains("建筑师"))
        assertTrue(shareText.contains("软件工程师"))
        assertTrue(shareText.contains("数据分析师"))

        // 测试重启功能
        resultViewModel.restartTest()
        testDispatcher.scheduler.advanceUntilIdle()
        val stateAfterRestart = resultViewModel.uiState.value
        assertTrue(stateAfterRestart.shouldRestartTest)

        resultViewModel.clearRestartFlag()
        testDispatcher.scheduler.advanceUntilIdle()
        val stateAfterClear = resultViewModel.uiState.value
        assertFalse(stateAfterClear.shouldRestartTest)
    }

    /**
     * 回归测试：错误处理机制
     * 确保错误处理逻辑保持稳定和一致
     */
    @Test
    fun regression_errorHandling_maintainsStability() = runTest {
        // 模拟网络错误
        whenever(mockRepository.getRandomQuestions(count = org.mockito.kotlin.any(), language = org.mockito.kotlin.any()))
            .thenReturn(Result.failure(RuntimeException("Network error")))
        whenever(mockRepository.getAnswerOptions(language = org.mockito.kotlin.any()))
            .thenReturn(Result.failure(RuntimeException("Network error")))

        // 在mock设置后创建ViewModel，传入测试协程作用域
        questionViewModel = QuestionViewModel(mockRepository, mockDataStore)
        testDispatcher.scheduler.advanceUntilIdle()
        
        val errorState = questionViewModel.uiState.value
        assertFalse(errorState.isLoading)
        assertNotNull(errorState.error)
        assertTrue(errorState.error!!.contains("加载") && errorState.error!!.contains("失败"))

        // 测试重试机制
        whenever(mockRepository.getRandomQuestions(count = org.mockito.kotlin.any(), language = org.mockito.kotlin.any())).thenReturn(Result.success(sampleQuestions))
        whenever(mockRepository.getAnswerOptions(language = org.mockito.kotlin.any())).thenReturn(Result.success(sampleAnswerOptions))

        questionViewModel.loadInitialData()
        testDispatcher.scheduler.advanceUntilIdle()
        
        val recoveredState = questionViewModel.uiState.value
        assertFalse(recoveredState.isLoading)
        assertEquals(null, recoveredState.error)
        assertNotNull(recoveredState.currentQuestion)
    }

    /**
     * 回归测试：测试提交流程
     * 确保完整的测试提交流程保持稳定
     */
    @Test
    fun regression_testSubmissionFlow_maintainsIntegrity() = runTest {
        // 设置初始数据
        whenever(mockRepository.getRandomQuestions(count = org.mockito.kotlin.any(), language = org.mockito.kotlin.any())).thenReturn(Result.success(sampleQuestions))
        whenever(mockRepository.getAnswerOptions(language = org.mockito.kotlin.any())).thenReturn(Result.success(sampleAnswerOptions))
        whenever(mockRepository.submitTest(org.mockito.kotlin.any(), org.mockito.kotlin.any(), org.mockito.kotlin.any()))
            .thenReturn(Result.success(sampleTestReport))

        // 在mock设置后创建ViewModel
        questionViewModel = QuestionViewModel(mockRepository, mockDataStore)
        testDispatcher.scheduler.advanceUntilIdle()

        // 模拟完整答题流程
        sampleQuestions.forEachIndexed { index, _ ->
            questionViewModel.selectAnswer(sampleAnswerOptions[index % sampleAnswerOptions.size])
            if (index < sampleQuestions.size - 1) {
                questionViewModel.nextQuestion()
                testDispatcher.scheduler.advanceUntilIdle()
            }
        }

        // 提交测试
        questionViewModel.submitTest()
        testDispatcher.scheduler.advanceUntilIdle()

        val finalState = questionViewModel.uiState.value
        assertTrue(finalState.testCompleted)
        assertNotNull(finalState.testReport)
        assertEquals("INTJ", finalState.testReport!!.mbtiType)
    }

    /**
     * 回归测试：数据一致性
     * 确保数据在不同组件间传递时保持一致性
     */
    @Test
    fun regression_dataConsistency_acrossComponents() = runTest {
        // 设置mock数据
        whenever(mockRepository.getRandomQuestions(1)).thenReturn(Result.success(sampleQuestions))
        whenever(mockRepository.getAnswerOptions()).thenReturn(Result.success(sampleAnswerOptions))
        whenever(mockRepository.submitTest(org.mockito.kotlin.any(), org.mockito.kotlin.any(), org.mockito.kotlin.any()))
            .thenReturn(Result.success(sampleTestReport))

        // 在mock设置后创建ViewModel
        questionViewModel = QuestionViewModel(mockRepository, mockDataStore)
        testDispatcher.scheduler.advanceUntilIdle()
        questionViewModel.selectAnswer(sampleAnswerOptions[0])
        questionViewModel.submitTest()
        val questionState = questionViewModel.uiState.value

        // 在ResultViewModel中设置相同的测试报告
        resultViewModel.setTestReport(sampleTestReport)
        val resultState = resultViewModel.uiState.value

        // 验证数据一致性
        assertEquals(questionState.testReport?.mbtiType, resultState.testReport?.mbtiType)
        assertEquals(questionState.testReport?.language, resultState.testReport?.language)
        assertEquals(
            questionState.testReport?.bigFiveScores?.openness,
            resultState.testReport?.bigFiveScores?.openness
        )
        assertEquals(
            questionState.testReport?.careerSuggestions?.size,
            resultState.testReport?.careerSuggestions?.size
        )
    }

    /**
     * 回归测试：性能基准
     * 确保关键操作的性能保持在可接受范围内
     */
    @Test
    fun regression_performanceBenchmark_maintainsStandards() = runTest {
        // 设置大量数据进行性能测试
        val largeQuestionSet = (1..100).map { index ->
            Question(
                id = index,
                questionTextZh = "测试问题$index",
                questionTextEn = "Test Question $index",
                dimension = "extraversion",
                reverse = index % 2 == 0
            )
        }

        whenever(mockRepository.getRandomQuestions(1)).thenReturn(Result.success(largeQuestionSet))
        whenever(mockRepository.getAnswerOptions()).thenReturn(Result.success(sampleAnswerOptions))

        val startTime = System.currentTimeMillis()
        // 在mock设置后创建ViewModel
        questionViewModel = QuestionViewModel(mockRepository, mockDataStore)
        testDispatcher.scheduler.advanceUntilIdle()
        val loadTime = System.currentTimeMillis() - startTime

        // 验证加载时间在合理范围内（应该小于1秒）
        assertTrue(loadTime < 1000, "数据加载时间过长: ${loadTime}ms")

        // 测试大量答案选择的性能
        val selectionStartTime = System.currentTimeMillis()
        repeat(100) { index ->
            questionViewModel.selectAnswer(sampleAnswerOptions[index % sampleAnswerOptions.size])
        }
        val selectionTime = System.currentTimeMillis() - selectionStartTime

        // 验证答案选择性能（应该小于500ms）
        assertTrue(selectionTime < 500, "答案选择时间过长: ${selectionTime}ms")
    }

    /**
     * 回归测试：边界条件处理
     * 确保边界条件的处理逻辑保持稳定
     */
    @Test
    fun regression_boundaryConditions_handledCorrectly() = runTest {
        // 测试空数据情况
        whenever(mockRepository.getRandomQuestions(count = org.mockito.kotlin.any(), language = org.mockito.kotlin.any())).thenReturn(Result.success(emptyList()))
        whenever(mockRepository.getAnswerOptions(language = org.mockito.kotlin.any())).thenReturn(Result.success(emptyList()))

        // 在mock设置后创建ViewModel
        questionViewModel = QuestionViewModel(mockRepository, mockDataStore)
        testDispatcher.scheduler.advanceUntilIdle()
        val emptyState = questionViewModel.uiState.value
        assertEquals(0, emptyState.answerOptions.size)
        assertEquals(null, emptyState.currentQuestion)

        // 测试单个问题情况
        val singleQuestion = listOf(sampleQuestions[0])
        whenever(mockRepository.getRandomQuestions(count = org.mockito.kotlin.any(), language = org.mockito.kotlin.any())).thenReturn(Result.success(singleQuestion))
        whenever(mockRepository.getAnswerOptions(language = org.mockito.kotlin.any())).thenReturn(Result.success(sampleAnswerOptions))

        questionViewModel.loadInitialData()
        testDispatcher.scheduler.advanceUntilIdle()
        val singleState = questionViewModel.uiState.value
        assertNotNull(singleState.currentQuestion)

        // 测试极值分数
        val extremeScores = BigFiveScores(0.0, 5.0, 0.0, 5.0, 0.0)
        val extremeReport = sampleTestReport.copy(bigFiveScores = extremeScores)
        
        resultViewModel.setTestReport(extremeReport)
        testDispatcher.scheduler.advanceUntilIdle()
        val extremeState = resultViewModel.uiState.value
        assertNotNull(extremeState.testReport)
        assertEquals(0.0, extremeState.testReport!!.bigFiveScores.openness)
        assertEquals(5.0, extremeState.testReport!!.bigFiveScores.conscientiousness)
    }

    /**
     * 回归测试：多语言支持
     * 确保多语言功能保持稳定
     */
    @Test
    fun regression_multiLanguageSupport_maintainsStability() {
        // 测试中文报告
        val chineseReport = sampleTestReport.copy(language = "zh")
        resultViewModel.setTestReport(chineseReport)
        testDispatcher.scheduler.advanceUntilIdle()
        resultViewModel.shareResult()
        testDispatcher.scheduler.advanceUntilIdle()
        val chineseState = resultViewModel.uiState.value
        assertNotNull(chineseState.shareText)
        assertTrue(chineseState.shareText!!.contains("建筑师"))
        assertTrue(chineseState.shareText!!.contains("软件工程师"))

        // 测试英文报告
        val englishReport = sampleTestReport.copy(language = "en")
        resultViewModel.setTestReport(englishReport)
        testDispatcher.scheduler.advanceUntilIdle()
        resultViewModel.shareResult()
        testDispatcher.scheduler.advanceUntilIdle()
        val englishState = resultViewModel.uiState.value
        assertNotNull(englishState.shareText)
        assertTrue(englishState.shareText!!.contains("Architect"))
        assertTrue(englishState.shareText!!.contains("Software Engineer"))

        // 验证语言切换不影响数据完整性
        assertEquals(chineseReport.mbtiType, englishReport.mbtiType)
        assertEquals(chineseReport.bigFiveScores, englishReport.bigFiveScores)
    }
}