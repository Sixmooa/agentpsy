package com.example.myapplication.ui.language

import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.ui.question.QuestionViewModel
import com.example.myapplication.ui.result.ResultViewModel
import io.mockk.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.Assert.*

/**
 * TDD单元测试：验证APP界面的语言切换功能
 * 测试ViewModel和UI层的语言切换逻辑
 */
@ExperimentalCoroutinesApi
class UILanguageSwitchTest {

    private lateinit var questionViewModel: QuestionViewModel
    private lateinit var resultViewModel: ResultViewModel
    private lateinit var mockRepository: PersonalityTestRepository

    private val testDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setUp() {
        Dispatchers.setMain(testDispatcher)

        mockRepository = mockk()
        questionViewModel = QuestionViewModel(mockRepository)
        resultViewModel = ResultViewModel(mockRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun questionViewModel_shouldDefaultToChineseLanguage() {
        // When: 创建QuestionViewModel
        val uiState = questionViewModel.uiState.value

        // Then: 默认语言应该是中文
        assertEquals("zh", uiState.currentLanguage)
    }

    @Test
    fun questionViewModel_shouldSwitchToEnglish_whenSwitchLanguageCalled() = runTest {
        // Given: 当前语言是中文
        assertEquals("zh", questionViewModel.uiState.value.currentLanguage)

        // When: 切换语言
        questionViewModel.switchLanguage()

        // Then: 语言应该切换到英文
        assertEquals("en", questionViewModel.uiState.value.currentLanguage)
    }

    @Test
    fun questionViewModel_shouldSwitchBackToChinese_whenSwitchLanguageCalledTwice() = runTest {
        // Given: 切换到英文
        questionViewModel.switchLanguage()
        assertEquals("en", questionViewModel.uiState.value.currentLanguage)

        // When: 再次切换语言
        questionViewModel.switchLanguage()

        // Then: 语言应该切换回中文
        assertEquals("zh", questionViewModel.uiState.value.currentLanguage)
    }

    @Test
    fun questionViewModel_shouldReloadDataWithNewLanguage_whenSwitchLanguageCalled() = runTest {
        // Given: Mock repository
        coEvery {
            mockRepository.getRandomQuestions(any(), "zh")
        } returns Result.success(createMockQuestions())
        coEvery {
            mockRepository.getAnswerOptions("zh")
        } returns Result.success(createMockAnswerOptions())

        // 初始化数据
        questionViewModel.loadInitialData()
        advanceUntilIdle()

        // When: 切换到英文
        coEvery {
            mockRepository.getRandomQuestions(any(), "en")
        } returns Result.success(createMockQuestions())
        coEvery {
            mockRepository.getAnswerOptions("en")
        } returns Result.success(createMockAnswerOptions())

        questionViewModel.switchLanguage()
        advanceUntilIdle()

        // Then: 应该用英文参数重新加载数据
        coVerify { mockRepository.getRandomQuestions(any(), "en") }
        coVerify { mockRepository.getAnswerOptions("en") }
        assertEquals("en", questionViewModel.uiState.value.currentLanguage)
    }

    @Test
    fun questionViewModel_shouldSubmitTestWithCurrentLanguage() = runTest {
        // Given: 设置语言为英文并选择答案
        questionViewModel.switchLanguage()
        advanceUntilIdle()

        // Mock数据
        val mockQuestion = createMockQuestion()
        val mockOptions = createMockAnswerOptions()
        coEvery { mockRepository.getRandomQuestions(any(), "en") } returns Result.success(listOf(mockQuestion))
        coEvery { mockRepository.getAnswerOptions("en") } returns Result.success(mockOptions)
        coEvery {
            mockRepository.submitTest(any(), "en", false)
        } returns Result.success(createMockTestReport("en"))

        questionViewModel.loadInitialData()
        advanceUntilIdle()

        // When: 选择答案并提交测试
        questionViewModel.selectAnswer(mockOptions[0])
        questionViewModel.submitTest()
        advanceUntilIdle()

        // Then: 应该用英文语言提交测试
        coVerify {
            mockRepository.submitTest(
                answers = any(),
                language = "en",
                saveResult = false
            )
        }
    }

    @Test
    fun questionViewModel_shouldSubmitTestWithChineseLanguage_whenLanguageIsZh() = runTest {
        // Given: Mock数据
        val mockQuestion = createMockQuestion()
        val mockOptions = createMockAnswerOptions()
        coEvery { mockRepository.getRandomQuestions(any(), "zh") } returns Result.success(listOf(mockQuestion))
        coEvery { mockRepository.getAnswerOptions("zh") } returns Result.success(mockOptions)
        coEvery {
            mockRepository.submitTest(any(), "zh", false)
        } returns Result.success(createMockTestReport("zh"))

        questionViewModel.loadInitialData()
        advanceUntilIdle()

        // When: 选择答案并提交测试
        questionViewModel.selectAnswer(mockOptions[0])
        questionViewModel.submitTest()
        advanceUntilIdle()

        // Then: 应该用中文语言提交测试
        coVerify {
            mockRepository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        }
    }

    @Test
    fun questionScreen_shouldDisplayCorrectQuestionText_withCurrentLanguage() {
        // This test would verify the UI displays correct text
        // In a real implementation, this would be a UI test using ComposeTestRule

        // Given: Question with current language
        val mockQuestion = createMockQuestion()
        val currentLanguage = "en"

        // When: Getting question text with current language
        val questionText = mockQuestion.getQuestionText(currentLanguage)

        // Then: Should return English text
        assertEquals("I have a vivid imagination.", questionText)
    }

    @Test
    fun questionScreen_shouldDisplayCorrectAnswerOptionText_withCurrentLanguage() {
        // Given: Answer option with current language
        val mockOption = createMockAnswerOptions()[0]
        val currentLanguage = "en"

        // When: Getting option text with current language
        val optionText = mockOption.getOptionText(currentLanguage)

        // Then: Should return English text
        assertEquals("Strongly disagree", optionText)
    }

    @Test
    fun resultViewModel_shouldHandleTestReportWithCorrectLanguage() = runTest {
        // Given: 测试报告包含语言信息
        val testReport = createMockTestReport("en")

        // When: 设置测试报告
        resultViewModel.setTestReport(testReport)
        advanceUntilIdle()

        // Then: 应该正确处理测试报告
        val uiState = resultViewModel.uiState.value
        assertNotNull(uiState.testReport)
        assertEquals("en", uiState.testReport?.language)
    }

    // Helper methods for creating mock data
    private fun createMockQuestions(): List<Question> {
        return listOf(
            Question(
                id = 1,
                questionTextZh = "我有很多想象力。",
                questionTextEn = "I have a vivid imagination.",
                dimension = "openness"
            )
        )
    }

    private fun createMockQuestion(): Question {
        return Question(
            id = 1,
            questionTextZh = "我有很多想象力。",
            questionTextEn = "I have a vivid imagination.",
            dimension = "openness"
        )
    }

    private fun createMockAnswerOptions(): List<AnswerOption> {
        return listOf(
            AnswerOption(
                id = 1,
                optionTextZh = "完全不同意",
                optionTextEn = "Strongly disagree",
                score = 1
            ),
            AnswerOption(
                id = 2,
                optionTextZh = "不同意",
                optionTextEn = "Disagree",
                score = 2
            )
        )
    }

    private fun createMockTestReport(language: String): TestReport {
        val mbtiType = MBTIType(
            id = 1,
            typeCode = "ENFJ",
            typeNameZh = "主人公",
            typeNameEn = "Protagonist",
            descriptionZh = "中文描述",
            descriptionEn = "English description"
        )

        val careerSuggestions = listOf(
            CareerSuggestion(
                id = 1,
                mbtiType = "ENFJ",
                careerZh = "教师",
                careerEn = "Teacher"
            )
        )

        return TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = language,
            mbtiType = "ENFJ",
            bigFiveScores = BigFiveScores(
                openness = 4.0,
                conscientiousness = 3.5,
                extraversion = 4.2,
                agreeableness = 3.8,
                neuroticism = 2.5
            ),
            mbtiTypeInfo = mbtiType,
            careerSuggestions = careerSuggestions
        )
    }
}