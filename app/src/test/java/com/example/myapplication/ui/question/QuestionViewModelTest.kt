package com.example.myapplication.ui.question

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.whenever
import org.mockito.kotlin.any
import org.mockito.kotlin.eq

/**
 * QuestionViewModel 单元测试
 * 测试状态管理、用户交互和业务逻辑
 */
@ExperimentalCoroutinesApi
class QuestionViewModelTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var repository: PersonalityTestRepository

    private lateinit var viewModel: QuestionViewModel
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
        ),
        Question(
            id = 3,
            questionTextZh = "你富有想象力吗？",
            questionTextEn = "Are you imaginative?",
            dimension = "openness",
            reverse = false
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
        MockitoAnnotations.openMocks(this)
        Dispatchers.setMain(testDispatcher)
        viewModel = QuestionViewModel(repository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state is correct`() {
        val initialState = viewModel.uiState.value
        
        assertFalse(initialState.isLoading)

        assertTrue(initialState.answerOptions.isEmpty())
        assertEquals(0, initialState.currentQuestionIndex)
        assertNull(initialState.currentQuestion)
        assertNull(initialState.error)
        assertFalse(initialState.testCompleted)
        assertNull(initialState.testReport)
    }

    @Test
    fun `loadInitialData success updates state correctly`() = runTest {
        // Arrange
        whenever(repository.getAnswerOptions("zh")).thenReturn(Result.success(mockAnswerOptions))
        whenever(repository.getRandomQuestions(10, "zh")).thenReturn(Result.success(mockQuestions))

        // Act
        viewModel.loadInitialData()

        // Assert
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertEquals(mockAnswerOptions, state.answerOptions)

        assertEquals(mockQuestions[0], state.currentQuestion)
        assertEquals(0, state.currentQuestionIndex)
        assertNull(state.error)
    }

    @Test
    fun `loadInitialData failure shows error message`() = runTest {
        // Arrange
        whenever(repository.getAnswerOptions("zh")).thenReturn(Result.failure(Exception("Network error")))

        // Act
        viewModel.loadInitialData()

        // Assert
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertNotNull(state.error)
        assertTrue(state.error!!.contains("Network error"))
    }



    @Test
    fun `nextQuestion advances to next question`() = runTest {
        // Arrange
        whenever(repository.getAnswerOptions("zh")).thenReturn(Result.success(mockAnswerOptions))
        whenever(repository.getRandomQuestions(10, "zh")).thenReturn(Result.success(mockQuestions))
        viewModel.loadInitialData()
        viewModel.selectAnswer(mockAnswerOptions[3])

        // Act
        viewModel.nextQuestion()

        // Assert
        val state = viewModel.uiState.value
        assertEquals(1, state.currentQuestionIndex)
        assertEquals(mockQuestions[1], state.currentQuestion)
    }

    @Test
    fun `nextQuestion does not advance without answer`() = runTest {
        // Arrange
        whenever(repository.getAnswerOptions("zh")).thenReturn(Result.success(mockAnswerOptions))
        whenever(repository.getRandomQuestions(10, "zh")).thenReturn(Result.success(mockQuestions))
        viewModel.loadInitialData()

        // Act
        viewModel.nextQuestion()

        // Assert
        val state = viewModel.uiState.value
        assertEquals(0, state.currentQuestionIndex)
        assertEquals(mockQuestions[0], state.currentQuestion)
    }

    @Test
    fun `previousQuestion goes back to previous question`() = runTest {
        // Arrange
        whenever(repository.getAnswerOptions("zh")).thenReturn(Result.success(mockAnswerOptions))
        whenever(repository.getRandomQuestions(10, "zh")).thenReturn(Result.success(mockQuestions))
        viewModel.loadInitialData()
        viewModel.selectAnswer(mockAnswerOptions[3])
        viewModel.nextQuestion()

        // Act
        viewModel.previousQuestion()

        // Assert
        val state = viewModel.uiState.value
        assertEquals(0, state.currentQuestionIndex)
        assertEquals(mockQuestions[0], state.currentQuestion)
    }

    @Test
    fun `previousQuestion does not go below zero`() = runTest {
        // Arrange
        whenever(repository.getAnswerOptions("zh")).thenReturn(Result.success(mockAnswerOptions))
        whenever(repository.getRandomQuestions(10, "zh")).thenReturn(Result.success(mockQuestions))
        viewModel.loadInitialData()

        // Act
        viewModel.previousQuestion()

        // Assert
        val state = viewModel.uiState.value
        assertEquals(0, state.currentQuestionIndex)
    }

    @Test
    fun `submitTest success completes test with report`() = runTest {
        // Arrange
        whenever(repository.getAnswerOptions("zh")).thenReturn(Result.success(mockAnswerOptions))
        whenever(repository.getRandomQuestions(10, "zh")).thenReturn(Result.success(mockQuestions))
        
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

        whenever(repository.submitTest(
            answers = any(),
            language = eq("zh"),
            saveResult = eq(false)
        )).thenReturn(Result.success(mockTestReport))

        viewModel.loadInitialData()
        
        // 回答所有问题
        mockQuestions.forEachIndexed { index, _ ->
            viewModel.selectAnswer(mockAnswerOptions[index % mockAnswerOptions.size])
            if (index < mockQuestions.size - 1) {
                viewModel.nextQuestion()
            }
        }

        // Act
        viewModel.submitTest()

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
        // Arrange
        whenever(repository.getAnswerOptions("zh")).thenReturn(Result.success(mockAnswerOptions))
        whenever(repository.getRandomQuestions(10, "zh")).thenReturn(Result.success(mockQuestions))
        
        whenever(repository.submitTest(
            answers = any(),
            language = eq("zh"),
            saveResult = eq(false)
        )).thenReturn(Result.failure(Exception("Submit failed")))

        viewModel.loadInitialData()
        
        // 回答所有问题
        mockQuestions.forEachIndexed { index, _ ->
            viewModel.selectAnswer(mockAnswerOptions[index % mockAnswerOptions.size])
            if (index < mockQuestions.size - 1) {
                viewModel.nextQuestion()
            }
        }

        // Act
        viewModel.submitTest()

        // Assert
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertFalse(state.testCompleted)
        assertNull(state.testReport)
        assertNotNull(state.error)
        assertTrue(state.error!!.contains("Submit failed"))
    }

}