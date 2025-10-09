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
 * QuestionViewModel 单元测试
 * 测试状态管理、用户交互和业务逻辑
 */
@ExperimentalCoroutinesApi
class QuestionViewModelTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val repository = mockk<PersonalityTestRepository>()
    private val dataStore = mockk<TestProgressDataStore>()

    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    private lateinit var viewModel: QuestionViewModel

    private val mockQuestions = listOf(
        Question(
            id = 1,
            questionTextZh = "你喜欢与人交往吗？",
            questionTextEn = "Do you like socializing?",
            dimension = "extraversion",
            reverse = false,
            createdAt = null
        ),
        Question(
            id = 2,
            questionTextZh = "你喜欢独处吗？",
            questionTextEn = "Do you like being alone?",
            dimension = "extraversion",
            reverse = true,
            createdAt = null
        ),
        Question(
            id = 3,
            questionTextZh = "你富有想象力吗？",
            questionTextEn = "Are you imaginative?",
            dimension = "openness",
            reverse = false,
            createdAt = null
        )
    )

    private val mockAnswerOptions = listOf(
        AnswerOption(1, "完全不同意", "Strongly Disagree", 1),
        AnswerOption(2, "不同意", "Disagree", 2),
        AnswerOption(3, "中立", "Neutral", 3),
        AnswerOption(4, "同意", "Agree", 4),
        AnswerOption(5, "完全同意", "Strongly Agree", 5)
    )

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        // Setup default mocks before creating ViewModel
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
    fun `initial state is correct`() = runTest {
        // Wait for initial data loading to complete
        testScope.advanceUntilIdle()
        
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertEquals(mockAnswerOptions, state.answerOptions)
        assertEquals(0, state.currentQuestionIndex)
        assertEquals(mockQuestions[0], state.currentQuestion)
        assertNull(state.error)
        assertFalse(state.testCompleted)
        assertNull(state.testReport)
    }

    @Test
    fun `loadInitialData success updates state correctly`() = runTest {
        // Wait for initial loading to complete
        testScope.advanceUntilIdle()
        
        // Act - reload data
        viewModel.loadInitialData()
        testScope.advanceUntilIdle()

        // Assert
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertEquals(mockAnswerOptions, state.answerOptions)
        assertEquals(mockQuestions[0], state.currentQuestion)
        assertEquals(0, state.currentQuestionIndex)
    }

    @Test
    fun `loadInitialData failure shows error message`() = runTest {
        // Given: 模拟失败的响应
        coEvery { repository.getAnswerOptions(any()) } returns Result.failure(Exception("Network error"))
        coEvery { repository.getRandomQuestions(count = any(), language = any()) } returns Result.failure(Exception("Network error"))
        
        // When: 重新创建ViewModel触发初始化
        viewModel = QuestionViewModel(repository, dataStore)
        testScope.advanceUntilIdle()
        
        // Then: 验证错误状态
        val state = viewModel.uiState.value
        assertFalse("加载状态应为false", state.isLoading)
        assertNotNull("应该有错误信息", state.error)
        assertTrue("错误信息应包含Network error", state.error!!.contains("Network error"))
    }



    @Test
    fun `nextQuestion advances to next question`() = runTest {
        // Wait for initial loading
        testScope.advanceUntilIdle()
        
        // Arrange - select an answer first
        viewModel.selectAnswer(mockAnswerOptions[3])

        // Act
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Assert
        val state = viewModel.uiState.value
        assertEquals(1, state.currentQuestionIndex)
        assertEquals(mockQuestions[1], state.currentQuestion)
    }

    @Test
    fun `nextQuestion does not advance without answer`() = runTest {
        // Wait for initial loading
        testScope.advanceUntilIdle()

        // Act - try to advance without selecting answer
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Assert
        val state = viewModel.uiState.value
        assertEquals(0, state.currentQuestionIndex)
        assertEquals(mockQuestions[0], state.currentQuestion)
    }

    @Test
    fun `previousQuestion goes back to previous question`() = runTest {
        // Wait for initial loading
        testScope.advanceUntilIdle()
        
        // Arrange - go to next question first
        viewModel.selectAnswer(mockAnswerOptions[3])
        viewModel.nextQuestion()
        testScope.advanceUntilIdle()

        // Act
        viewModel.previousQuestion()

        // Assert
        val state = viewModel.uiState.value
        assertEquals(0, state.currentQuestionIndex)
        assertEquals(mockQuestions[0], state.currentQuestion)
    }

    @Test
    fun `previousQuestion does not go below zero`() = runTest {
        // Wait for initial loading
        testScope.advanceUntilIdle()

        // Act - try to go back from first question
        viewModel.previousQuestion()

        // Assert
        val state = viewModel.uiState.value
        assertEquals(0, state.currentQuestionIndex)
    }

    @Test
    fun `submitTest success completes test with report`() = runTest {
        // Wait for initial loading
        testScope.advanceUntilIdle()
        
        val mockTestReport = TestReport(
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
                strengths = listOf("分析能力强"),
                challenges = listOf("过于完美主义")
            ),
            careerSuggestions = listOf(
                CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer")
            )
        )

        coEvery { repository.submitTest(
            answers = any(),
            language = "zh",
            saveResult = false
        ) } returns Result.success(mockTestReport)
        
        // 回答所有问题
        mockQuestions.forEachIndexed { index, _ ->
            viewModel.selectAnswer(mockAnswerOptions[index % mockAnswerOptions.size])
            if (index < mockQuestions.size - 1) {
                viewModel.nextQuestion()
                testScope.advanceUntilIdle()
            }
        }

        // Act
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Assert
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertTrue(state.testCompleted)
        assertNotNull(state.testReport)
        assertEquals("INTJ", state.testReport!!.mbtiType)
        assertNull(state.error)
    }

    @Test
    fun `submitTest failure shows error message`() = runTest {
        // Wait for initial loading
        testScope.advanceUntilIdle()
        
        coEvery { repository.submitTest(
            answers = any(),
            language = "zh",
            saveResult = false
        ) } returns Result.failure(Exception("Submit failed"))
        
        // 回答所有问题
        mockQuestions.forEachIndexed { index, _ ->
            viewModel.selectAnswer(mockAnswerOptions[index % mockAnswerOptions.size])
            if (index < mockQuestions.size - 1) {
                viewModel.nextQuestion()
                testScope.advanceUntilIdle()
            }
        }

        // Act
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Assert
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertFalse(state.testCompleted)
        assertNull(state.testReport)
        assertNotNull(state.error)
        assertTrue(state.error!!.contains("Submit failed"))
    }

}