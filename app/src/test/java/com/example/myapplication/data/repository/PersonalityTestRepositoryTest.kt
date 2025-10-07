package com.example.myapplication.data.repository

import com.example.myapplication.data.network.ApiService
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepositoryImpl
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import org.junit.Assert.*
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.whenever
import retrofit2.Response

/**
 * PersonalityTestRepository 单元测试
 * 测试Repository层的数据处理逻辑和API调用
 */
class PersonalityTestRepositoryTest {

    @Mock
    private lateinit var apiService: ApiService

    private lateinit var repository: PersonalityTestRepository

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        repository = PersonalityTestRepositoryImpl(apiService)
    }

    @Test
    fun `getRandomQuestions returns success when API call succeeds`() = runTest {
        // Arrange
        val mockQuestions = listOf(
            Question(
                id = 1,
                questionTextZh = "测试问题1",
                questionTextEn = "Test Question 1",
                dimension = "extraversion",
                reverse = false
            ),
            Question(
                id = 2,
                questionTextZh = "测试问题2",
                questionTextEn = "Test Question 2",
                dimension = "openness",
                reverse = true
            )
        )
        val apiResponse = ApiResponse(
            success = true,
            data = mockQuestions,
            error = null
        )
        val response = Response.success(apiResponse)
        whenever(apiService.getRandomQuestions(10, "zh")).thenReturn(response)

        // Act
        val result = repository.getRandomQuestions(10, "zh")

        // Assert
        assertTrue(result.isSuccess)
        val questions = result.getOrNull()
        assertNotNull(questions)
        assertEquals(2, questions!!.size)
        assertEquals("测试问题1", questions[0].questionTextZh)
        assertEquals("测试问题2", questions[1].questionTextZh)
    }

    @Test
    fun `getRandomQuestions returns failure when API call fails`() = runTest {
        // Arrange
        val apiResponse = ApiResponse<List<Question>>(
            success = false,
            data = null,
            error = "Network error"
        )
        val response = Response.success(apiResponse)
        whenever(apiService.getRandomQuestions(10, "zh")).thenReturn(response)

        // Act
        val result = repository.getRandomQuestions(10, "zh")

        // Assert
        assertTrue(result.isFailure)
        val exception = result.exceptionOrNull()
        assertNotNull(exception)
        assertTrue(exception!!.message!!.contains("Network error"))
    }

    @Test
    fun `getRandomQuestions handles HTTP error response`() = runTest {
        // Arrange
        val errorResponse = Response.error<ApiResponse<List<Question>>>(
            404,
            okhttp3.ResponseBody.create(null, "Not Found")
        )
        whenever(apiService.getRandomQuestions(10, "zh")).thenReturn(errorResponse)

        // Act
        val result = repository.getRandomQuestions(10, "zh")

        // Assert
        assertTrue(result.isFailure)
        val exception = result.exceptionOrNull()
        assertNotNull(exception)
        assertTrue(exception!!.message!!.contains("HTTP 404"))
    }

    @Test
    fun `getAnswerOptions returns success with valid data`() = runTest {
        // Arrange
        val mockOptions = listOf(
            AnswerOption(1, "完全不同意", "Strongly Disagree", 1),
            AnswerOption(2, "不同意", "Disagree", 2),
            AnswerOption(3, "中立", "Neutral", 3),
            AnswerOption(4, "同意", "Agree", 4),
            AnswerOption(5, "完全同意", "Strongly Agree", 5)
        )
        val apiResponse = ApiResponse(
            success = true,
            data = mockOptions,
            error = null
        )
        val response = Response.success(apiResponse)
        whenever(apiService.getAnswerOptions("zh")).thenReturn(response)

        // Act
        val result = repository.getAnswerOptions("zh")

        // Assert
        assertTrue(result.isSuccess)
        val options = result.getOrNull()
        assertNotNull(options)
        assertEquals(5, options!!.size)
        assertEquals(1, options[0].score)
        assertEquals(5, options[4].score)
    }

    @Test
    fun `submitTest returns success with valid test report`() = runTest {
        // Arrange
        val submitRequest = TestSubmissionRequest(
            answers = listOf(
                SubmitAnswerRequest(1, 4),
                SubmitAnswerRequest(2, 3)
            ),
            language = "zh",
            saveResult = true
        )

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

        val submissionResponse = TestSubmissionResponse(
            success = true,
            report = mockTestReport,
            saveResult = false
        )

        val response = Response.success(submissionResponse)
        whenever(apiService.submitTest(submitRequest)).thenReturn(response)

        // Act
        val result = repository.submitTest(
            answers = submitRequest.answers,
            language = submitRequest.language,
            saveResult = submitRequest.saveResult
        )

        // Assert
        assertTrue(result.isSuccess)
        val testReport = result.getOrNull()
        assertNotNull(testReport)
        assertEquals("INTJ", testReport!!.mbtiType)
        assertEquals("zh", testReport.language)
        assertEquals(1, testReport.careerSuggestions.size)
    }

    @Test
    fun `getMBTITypeInfo returns success with valid type info`() = runTest {
        // Arrange
        val mockMBTIType = MBTIType(
            id = 1,
            typeCode = "ENFP",
            typeNameZh = "竞选者",
            typeNameEn = "Campaigner",
            descriptionZh = "热情洋溢、富有创造力的社交家",
            descriptionEn = "Enthusiastic, creative and sociable free spirits",
            strengths = listOf("富有创造力", "善于沟通"),
            challenges = listOf("容易分心", "难以专注细节")
        )

        val apiResponse = ApiResponse(
            success = true,
            data = mockMBTIType,
            error = null
        )
        val response = Response.success(apiResponse)
        whenever(apiService.getMBTITypeInfo("ENFP", "zh")).thenReturn(response)

        // Act
        val result = repository.getMBTITypeInfo("ENFP", "zh")

        // Assert
        assertTrue(result.isSuccess)
        val mbtiType = result.getOrNull()
        assertNotNull(mbtiType)
        assertEquals("ENFP", mbtiType!!.typeCode)
        assertEquals("竞选者", mbtiType.typeNameZh)
        assertEquals(2, mbtiType.strengths.size)
        assertEquals(2, mbtiType.challenges.size)
    }

    @Test
    fun `getCareerSuggestions returns success with valid suggestions`() = runTest {
        // Arrange
        val mockCareerSuggestions = listOf(
            CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"),
            CareerSuggestion(2, "INTJ", "数据分析师", "Data Analyst"),
            CareerSuggestion(3, "INTJ", "产品经理", "Product Manager")
        )

        val apiResponse = ApiResponse(
            success = true,
            data = mockCareerSuggestions,
            error = null
        )
        val response = Response.success(apiResponse)
        whenever(apiService.getCareerSuggestions("INTJ", "zh")).thenReturn(response)

        // Act
        val result = repository.getCareerSuggestions("INTJ", "zh")

        // Assert
        assertTrue(result.isSuccess)
        val suggestions = result.getOrNull()
        assertNotNull(suggestions)
        assertEquals(3, suggestions!!.size)
        assertEquals("软件工程师", suggestions[0].careerZh)
        assertEquals("数据分析师", suggestions[1].careerZh)
        assertEquals("产品经理", suggestions[2].careerZh)
    }

    @Test
    fun `repository handles network exceptions gracefully`() = runTest {
        // Arrange
        whenever(apiService.getRandomQuestions(10, "zh"))
            .thenThrow(RuntimeException("Network timeout"))

        // Act
        val result = repository.getRandomQuestions(10, "zh")

        // Assert
        assertTrue(result.isFailure)
        val exception = result.exceptionOrNull()
        assertNotNull(exception)
        assertTrue(exception!!.message!!.contains("Network timeout"))
    }

    @Test
    fun `repository handles null response body`() = runTest {
        // Arrange
        val response = Response.success<ApiResponse<List<Question>>>(null)
        whenever(apiService.getRandomQuestions(10, "zh")).thenReturn(response)

        // Act
        val result = repository.getRandomQuestions(10, "zh")

        // Assert
        assertTrue(result.isFailure)
        val exception = result.exceptionOrNull()
        assertNotNull(exception)
        assertTrue(exception!!.message!!.contains("Response body is null"))
    }

    @Test
    fun `repository handles empty data gracefully`() = runTest {
        // Arrange
        val apiResponse = ApiResponse(
            success = true,
            data = emptyList<Question>(),
            error = null
        )
        val response = Response.success(apiResponse)
        whenever(apiService.getRandomQuestions(10, "zh")).thenReturn(response)

        // Act
        val result = repository.getRandomQuestions(10, "zh")

        // Assert
        assertTrue(result.isSuccess)
        val questions = result.getOrNull()
        assertNotNull(questions)
        assertTrue(questions!!.isEmpty())
    }
}