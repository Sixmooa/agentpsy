package com.example.myapplication.integration

import com.example.myapplication.data.network.ApiService
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepositoryImpl
import kotlinx.coroutines.runBlocking
import org.junit.Before
import org.junit.Test
import org.junit.Assert.*
import org.junit.Ignore
import retrofit2.Retrofit
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

@Ignore("Integration test requires running server")
class ApiIntegrationTest {

    private lateinit var apiService: ApiService
    private lateinit var repository: PersonalityTestRepositoryImpl

    @Before
    fun setup() {
        val logging = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }

        val client = OkHttpClient.Builder()
            .addInterceptor(logging)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

        val retrofit = Retrofit.Builder()
            .baseUrl("http://localhost:3000/")
            .client(client)
            .addConverterFactory(Json.asConverterFactory("application/json".toMediaType()))
            .build()

        apiService = retrofit.create(ApiService::class.java)
        repository = PersonalityTestRepositoryImpl(apiService)
    }

    @Test
    fun `test get random questions - Chinese`() {
        runBlocking {
            // When
            val result = repository.getRandomQuestions(count = 10, language = "zh")

            // Then
            assertTrue("获取中文题目应该成功", result.isSuccess)
            val questions = result.getOrNull()
            assertNotNull("题目列表不应为空", questions)
            assertEquals("应该返回50道题目", 50, questions?.size)
            
            questions?.forEach { question ->
                assertNotNull("题目ID不应为空", question.id)
                assertNotNull("题目中文文本不应为空", question.questionTextZh)
                assertNotNull("题目维度不应为空", question.dimension)
                assertTrue("题目中文文本不应为空字符串", question.questionTextZh.isNotBlank())
                assertTrue("题目维度不应为空字符串", question.dimension.isNotBlank())
            }
        }
    }

    @Test
    fun `test get random questions - English`() {
        runBlocking {
            // When
            val result = repository.getRandomQuestions(count = 10, language = "en")

            // Then
            assertTrue("获取英文题目应该成功", result.isSuccess)
            val questions = result.getOrNull()
            assertNotNull("题目列表不应为空", questions)
            assertEquals("应该返回50道题目", 50, questions?.size)
            
            questions?.forEach { question ->
                assertNotNull("题目ID不应为空", question.id)
                assertNotNull("题目英文文本不应为空", question.questionTextEn)
                assertNotNull("题目维度不应为空", question.dimension)
                assertTrue("题目英文文本不应为空字符串", question.questionTextEn.isNotBlank())
                assertTrue("题目维度不应为空字符串", question.dimension.isNotBlank())
            }
        }
    }

    @Test
    fun `test get answer options - Chinese`() {
        runBlocking {
            // When
            val result = repository.getAnswerOptions("zh")

            // Then
            assertTrue("获取中文答案选项应该成功", result.isSuccess)
            val options = result.getOrNull()
            assertNotNull("答案选项列表不应为空", options)
            assertTrue("应该有多个答案选项", options?.size ?: 0 > 0)
            
            options?.forEach { option ->
                assertNotNull("选项ID不应为空", option.id)
                assertNotNull("选项中文文本不应为空", option.optionTextZh)
                assertNotNull("选项分数不应为空", option.score)
                assertTrue("选项中文文本不应为空字符串", option.optionTextZh.isNotBlank())
                assertTrue("选项分数应在合理范围内", option.score in 1..5)
            }
        }
    }

    @Test
    fun `test get answer options - English`() {
        runBlocking {
            // When
            val result = repository.getAnswerOptions("en")

            // Then
            assertTrue("获取英文答案选项应该成功", result.isSuccess)
            val options = result.getOrNull()
            assertNotNull("答案选项列表不应为空", options)
            assertTrue("应该有多个答案选项", options?.size ?: 0 > 0)
            
            options?.forEach { option ->
                assertNotNull("选项ID不应为空", option.id)
                assertNotNull("选项英文文本不应为空", option.optionTextEn)
                assertNotNull("选项分数不应为空", option.score)
                assertTrue("选项英文文本不应为空字符串", option.optionTextEn.isNotBlank())
                assertTrue("选项分数应在合理范围内", option.score in 1..5)
            }
        }
    }

    @Test
    fun `test submit test with valid answers`() {
        runBlocking {
            // Given
            val answers = (1..50).map { questionId ->
                SubmitAnswerRequest(
                    questionId = questionId,
                    answerScore = (1..5).random()
                )
            }

            // When
            val result = repository.submitTest(answers, "zh", false)

            // Then
            assertTrue("提交测试应该成功", result.isSuccess)
            val testReport = result.getOrNull()
            assertNotNull("测试报告不应为空", testReport)
            
            testReport?.let { report ->
                assertNotNull("MBTI类型不应为空", report.mbtiType)
                assertTrue("MBTI类型应为4个字符", report.mbtiType.length == 4)
                assertNotNull("MBTI类型信息不应为空", report.mbtiTypeInfo)
                assertNotNull("MBTI类型信息描述不应为空", report.mbtiTypeInfo.descriptionZh)
                assertTrue("MBTI类型信息描述不应为空字符串", report.mbtiTypeInfo.descriptionZh.isNotBlank())
                assertNotNull("优势列表不应为空", report.mbtiTypeInfo.strengths)
                assertNotNull("挑战列表不应为空", report.mbtiTypeInfo.challenges)
                assertNotNull("职业建议列表不应为空", report.careerSuggestions)
            }
        }
    }

    @Test
    fun `test submit test with English language`() {
        runBlocking {
            // Given
            val answers = (1..50).map { questionId ->
                SubmitAnswerRequest(
                    questionId = questionId,
                    answerScore = (1..5).random()
                )
            }

            // When
            val result = repository.submitTest(answers, "en", false)

            // Then
            assertTrue("提交英文测试应该成功", result.isSuccess)
            val testReport = result.getOrNull()
            assertNotNull("测试报告不应为空", testReport)
            
            testReport?.let { report ->
                assertNotNull("MBTI类型不应为空", report.mbtiType)
                assertTrue("MBTI类型应为4个字符", report.mbtiType.length == 4)
                assertNotNull("MBTI类型信息不应为空", report.mbtiTypeInfo)
                assertNotNull("MBTI类型信息描述不应为空", report.mbtiTypeInfo.descriptionZh)
                assertTrue("MBTI类型信息描述不应为空字符串", report.mbtiTypeInfo.descriptionZh.isNotBlank())
            }
        }
    }

    @Test
    fun `test get MBTI type info`() {
        runBlocking {
            // Given
            val mbtiType = "ENFJ"

            // When
            val result = repository.getMBTITypeInfo(mbtiType, "zh")

            // Then
            assertTrue("获取MBTI类型信息应该成功", result.isSuccess)
            val typeInfo = result.getOrNull()
            assertNotNull("类型信息不应为空", typeInfo)
            
            typeInfo?.let { info ->
                assertEquals("MBTI类型应匹配", mbtiType, info.typeCode)
                assertNotNull("类型名称不应为空", info.typeNameZh)
                assertNotNull("描述不应为空", info.descriptionZh)
                assertTrue("类型名称不应为空字符串", info.typeNameZh.isNotBlank())
                assertTrue("描述不应为空字符串", info.descriptionZh.isNotBlank())
            }
        }
    }

    @Test
    fun `test get career suggestions`() {
        runBlocking {
            // Given
            val mbtiType = "ENFJ"

            // When
            val result = repository.getCareerSuggestions(mbtiType, "zh")

            // Then
            assertTrue("获取职业建议应该成功", result.isSuccess)
            val careers = result.getOrNull()
            assertNotNull("职业建议列表不应为空", careers)
            assertTrue("应该有职业建议", careers?.isNotEmpty() == true)
            
            careers?.forEach { career ->
                assertNotNull("职业中文名称不应为空", career.careerZh)
                assertNotNull("职业英文名称不应为空", career.careerEn)
                assertTrue("职业中文名称不应为空字符串", career.careerZh.isNotBlank())
                assertTrue("职业英文名称不应为空字符串", career.careerEn.isNotBlank())
            }
        }
    }

    @Test
    fun `test complete workflow - Chinese`() {
        runBlocking {
            // 1. 获取题目
            val questionsResult = repository.getRandomQuestions(count = 10, language = "zh")
            assertTrue("获取题目应该成功", questionsResult.isSuccess)
            val questions = questionsResult.getOrThrow()

            // 2. 获取答案选项
            val optionsResult = repository.getAnswerOptions(language = "zh")
            assertTrue("获取答案选项应该成功", optionsResult.isSuccess)
            val options = optionsResult.getOrThrow()

            // 3. 模拟用户答题
            val answers = questions.map { question ->
                SubmitAnswerRequest(
                    questionId = question.id,
                    answerScore = options.random().score
                )
            }

            // 4. 提交测试
            val submitResult = repository.submitTest(answers, "zh", false)
            assertTrue("提交测试应该成功", submitResult.isSuccess)
            val testReport = submitResult.getOrThrow()

            // 5. 获取详细的MBTI信息
            val mbtiInfoResult = repository.getMBTITypeInfo(testReport.mbtiType, "zh")
            assertTrue("获取MBTI信息应该成功", mbtiInfoResult.isSuccess)

            // 6. 获取职业建议
            val careerResult = repository.getCareerSuggestions(testReport.mbtiType, "zh")
            assertTrue("获取职业建议应该成功", careerResult.isSuccess)

            println("完整工作流测试成功:")
            println("- 题目数量: ${questions.size}")
            println("- 答案选项数量: ${options.size}")
            println("- MBTI类型: ${testReport.mbtiType}")
            println("- 职业建议数量: ${careerResult.getOrThrow().size}")
        }
    }

    @Test
    fun `test API response time performance`() {
        runBlocking {
            val startTime = System.currentTimeMillis()

            // 测试所有API接口的响应时间
            val questionsResult = repository.getRandomQuestions(count = 5, language = "zh")
            val questionsTime = System.currentTimeMillis()

            val optionsResult = repository.getAnswerOptions(language = "zh")
            val optionsTime = System.currentTimeMillis()

            val answers = (1..50).map { SubmitAnswerRequest(it, 3) }
            val submitResult = repository.submitTest(answers, "zh", false)
            val submitTime = System.currentTimeMillis()

            // 验证所有接口都成功
            assertTrue("获取题目应该成功", questionsResult.isSuccess)
            assertTrue("获取选项应该成功", optionsResult.isSuccess)
            assertTrue("提交测试应该成功", submitResult.isSuccess)

            // 验证响应时间合理（每个接口不超过5秒）
            assertTrue("获取题目响应时间应合理", (questionsTime - startTime) < 5000)
            assertTrue("获取选项响应时间应合理", (optionsTime - questionsTime) < 5000)
            assertTrue("提交测试响应时间应合理", (submitTime - optionsTime) < 5000)

            println("API性能测试结果:")
            println("- 获取题目耗时: ${questionsTime - startTime}ms")
            println("- 获取选项耗时: ${optionsTime - questionsTime}ms")
            println("- 提交测试耗时: ${submitTime - optionsTime}ms")
            println("- 总耗时: ${submitTime - startTime}ms")
        }
    }
}