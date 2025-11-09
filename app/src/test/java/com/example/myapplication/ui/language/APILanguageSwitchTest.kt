package com.example.myapplication.ui.language

import com.example.myapplication.data.model.*
import com.example.myapplication.data.network.MockApiService
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * TDD单元测试：验证API层的语言切换功能
 * 测试MockApiService是否正确根据语言参数返回对应语言的文本
 */
class APILanguageSwitchTest {

    private lateinit var apiService: MockApiService

    @Before
    fun setUp() {
        apiService = MockApiService()
    }

    @Test
    fun getRandomQuestions_shouldReturnCorrectChineseQuestions_whenLanguageIsZh() = runBlocking {
        // When: 获取中文题目
        val response = apiService.getRandomQuestions(count = 1, language = "zh")

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val questions = response.body()?.data
        assertNotNull(questions)
        assertEquals(1, questions?.size)

        // And: 题目内容应该是中文
        val question = questions!![0]
        assertTrue(question.questionTextZh.isNotEmpty())
        assertTrue(question.questionTextEn.isNotEmpty())
    }

    @Test
    fun getRandomQuestions_shouldReturnCorrectEnglishQuestions_whenLanguageIsEn() = runBlocking {
        // When: 获取英文题目
        val response = apiService.getRandomQuestions(count = 1, language = "en")

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val questions = response.body()?.data
        assertNotNull(questions)
        assertEquals(1, questions?.size)

        // And: 题目内容应该包含英文版本
        val question = questions!![0]
        assertTrue(question.questionTextEn.isNotEmpty())
        assertTrue(question.questionTextZh.isNotEmpty())
    }

    @Test
    fun getRandomQuestions_shouldDefaultToChinese_whenLanguageNotSpecified() = runBlocking {
        // When: 不指定语言获取题目
        val response = apiService.getRandomQuestions(count = 1)

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val questions = response.body()?.data
        assertNotNull(questions)
        assertEquals(1, questions?.size)

        // And: 应该返回包含中英文的题目（因为MockApiService总是返回完整数据）
        val question = questions!![0]
        assertTrue(question.questionTextZh.isNotEmpty())
        assertTrue(question.questionTextEn.isNotEmpty())
    }

    @Test
    fun getAnswerOptions_shouldReturnCorrectChineseOptions_whenLanguageIsZh() = runBlocking {
        // When: 获取中文答案选项
        val response = apiService.getAnswerOptions(language = "zh")

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val options = response.body()?.data
        assertNotNull(options)
        assertEquals(5, options?.size) // MockApiService返回5个选项

        // And: 选项内容应该是中文
        val option = options!![0]
        assertEquals("完全不同意", option.optionTextZh)
        assertEquals("Strongly disagree", option.optionTextEn)
    }

    @Test
    fun getAnswerOptions_shouldReturnCorrectEnglishOptions_whenLanguageIsEn() = runBlocking {
        // When: 获取英文答案选项
        val response = apiService.getAnswerOptions(language = "en")

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val options = response.body()?.data
        assertNotNull(options)
        assertEquals(5, options?.size)

        // And: 选项内容应该包含英文版本
        val option = options!![0]
        assertEquals("Strongly disagree", option.optionTextEn)
        assertEquals("完全不同意", option.optionTextZh)
    }

    @Test
    fun getMBTITypeInfo_shouldReturnCorrectChineseInfo_whenLanguageIsZh() = runBlocking {
        // Given: ENFJ类型
        val typeCode = "ENFJ"

        // When: 获取中文MBTI类型信息
        val response = apiService.getMBTITypeInfo(typeCode, language = "zh")

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val mbtiType = response.body()?.data
        assertNotNull(mbtiType)
        assertEquals(typeCode, mbtiType?.typeCode)

        // And: 内容应该是中文
        assertEquals("主人公", mbtiType?.typeNameZh)
        assertEquals("Protagonist", mbtiType?.typeNameEn)
        assertTrue(mbtiType?.descriptionZh?.isNotEmpty() == true)
        assertTrue(mbtiType?.descriptionEn?.isNotEmpty() == true)
    }

    @Test
    fun getMBTITypeInfo_shouldReturnCorrectEnglishInfo_whenLanguageIsEn() = runBlocking {
        // Given: ENFJ类型
        val typeCode = "ENFJ"

        // When: 获取英文MBTI类型信息
        val response = apiService.getMBTITypeInfo(typeCode, language = "en")

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val mbtiType = response.body()?.data
        assertNotNull(mbtiType)
        assertEquals(typeCode, mbtiType?.typeCode)

        // And: 内容应该包含英文版本
        assertEquals("Protagonist", mbtiType?.typeNameEn)
        assertEquals("主人公", mbtiType?.typeNameZh)
        assertTrue(mbtiType?.descriptionEn?.isNotEmpty() == true)
        assertTrue(mbtiType?.descriptionZh?.isNotEmpty() == true)
    }

    @Test
    fun getCareerSuggestions_shouldReturnCorrectChineseCareers_whenLanguageIsZh() = runBlocking {
        // Given: ENFJ类型
        val mbtiType = "ENFJ"

        // When: 获取中文职业建议
        val response = apiService.getCareerSuggestions(mbtiType, language = "zh")

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val careers = response.body()?.data
        assertNotNull(careers)
        assertTrue(careers?.isNotEmpty() == true)

        // And: 职业内容应该是中文
        val career = careers!![0]
        assertEquals("教师", career.careerZh)
        assertEquals("Teacher", career.careerEn)
        assertEquals(mbtiType, career.mbtiType)
    }

    @Test
    fun getCareerSuggestions_shouldReturnCorrectEnglishCareers_whenLanguageIsEn() = runBlocking {
        // Given: ENFJ类型
        val mbtiType = "ENFJ"

        // When: 获取英文职业建议
        val response = apiService.getCareerSuggestions(mbtiType, language = "en")

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val careers = response.body()?.data
        assertNotNull(careers)
        assertTrue(careers?.isNotEmpty() == true)

        // And: 职业内容应该包含英文版本
        val career = careers!![0]
        assertEquals("Teacher", career.careerEn)
        assertEquals("教师", career.careerZh)
        assertEquals(mbtiType, career.mbtiType)
    }

    @Test
    fun submitTest_shouldReturnCorrectLanguageResults_whenLanguageIsZh() = runBlocking {
        // Given: 中文测试提交请求
        val testRequest = TestSubmissionRequest(
            answers = listOf(
                SubmitAnswerRequest(questionId = 1, answerScore = 4),
                SubmitAnswerRequest(questionId = 2, answerScore = 3)
            ),
            language = "zh",
            saveResult = false
        )

        // When: 提交中文测试
        val response = apiService.submitTest(testRequest)

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val testReport = response.body()?.report
        assertNotNull(testReport)
        assertEquals("zh", testReport?.language)

        // And: 结果应该包含中英文内容
        assertNotNull(testReport?.mbtiTypeInfo?.typeNameZh)
        assertNotNull(testReport?.mbtiTypeInfo?.typeNameEn)
        assertTrue(testReport?.careerSuggestions?.isNotEmpty() == true)
    }

    @Test
    fun submitTest_shouldReturnCorrectLanguageResults_whenLanguageIsEn() = runBlocking {
        // Given: 英文测试提交请求
        val testRequest = TestSubmissionRequest(
            answers = listOf(
                SubmitAnswerRequest(questionId = 1, answerScore = 4),
                SubmitAnswerRequest(questionId = 2, answerScore = 3)
            ),
            language = "en",
            saveResult = false
        )

        // When: 提交英文测试
        val response = apiService.submitTest(testRequest)

        // Then: 响应应该成功
        assertTrue(response.isSuccessful)
        assertNotNull(response.body())

        val testReport = response.body()?.report
        assertNotNull(testReport)
        assertEquals("en", testReport?.language)

        // And: 结果应该包含中英文内容
        assertNotNull(testReport?.mbtiTypeInfo?.typeNameEn)
        assertNotNull(testReport?.mbtiTypeInfo?.typeNameZh)
        assertTrue(testReport?.careerSuggestions?.isNotEmpty() == true)
    }
}