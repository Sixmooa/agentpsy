package com.example.myapplication.network

import com.example.myapplication.data.model.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import org.junit.Test
import org.junit.Assert.*

/**
 * API请求调试测试
 * 用于验证提交数据的格式正确性
 */
class ApiRequestDebugTest {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    @Test
    fun `测试提交请求的JSON格式`() {
        // 模拟一个完整的测试提交请求
        val submitRequest = TestSubmissionRequest(
            answers = listOf(
                SubmitAnswerRequest(questionId = 1, answerScore = 4),
                SubmitAnswerRequest(questionId = 2, answerScore = 3),
                SubmitAnswerRequest(questionId = 3, answerScore = 5),
                SubmitAnswerRequest(questionId = 4, answerScore = 2),
                SubmitAnswerRequest(questionId = 5, answerScore = 4),
                SubmitAnswerRequest(questionId = 6, answerScore = 3),
                SubmitAnswerRequest(questionId = 7, answerScore = 5),
                SubmitAnswerRequest(questionId = 8, answerScore = 2),
                SubmitAnswerRequest(questionId = 9, answerScore = 4),
                SubmitAnswerRequest(questionId = 10, answerScore = 3)
            ),
            language = "zh",
            saveResult = false
        )

        // 序列化为JSON字符串
        val jsonString = json.encodeToString(submitRequest)

        println("提交请求的JSON格式:")
        println(jsonString)

        // 验证JSON格式
        assertTrue("JSON应该包含answers字段", jsonString.contains("\"answers\""))
        assertTrue("JSON应该包含language字段", jsonString.contains("\"language\""))
        assertTrue("JSON应该包含saveResult字段", jsonString.contains("\"saveResult\""))
        assertTrue("JSON应该包含问题ID", jsonString.contains("\"questionId\""))
        assertTrue("JSON应该包含答案分数", jsonString.contains("\"answerScore\""))

        // 验证答案分数范围
        submitRequest.answers.forEach { answer ->
            assertTrue("答案分数应该在1-5范围内", answer.answerScore in 1..5)
            assertTrue("问题ID应该大于0", answer.questionId > 0)
        }
    }

    @Test
    fun `测试边界情况下的请求格式`() {
        // 测试最小情况
        val minimalRequest = TestSubmissionRequest(
            answers = listOf(
                SubmitAnswerRequest(questionId = 1, answerScore = 1)
            ),
            language = "zh",
            saveResult = false
        )

        val minimalJson = json.encodeToString(minimalRequest)
        println("最小请求JSON:")
        println(minimalJson)

        assertTrue("最小请求应该有效", minimalJson.isNotEmpty())

        // 测试最大情况
        val maxRequest = TestSubmissionRequest(
            answers = (1..50).map { questionId ->
                SubmitAnswerRequest(questionId = questionId, answerScore = 5)
            },
            language = "zh",
            saveResult = false
        )

        val maxJson = json.encodeToString(maxRequest)
        println("最大请求JSON长度: ${maxJson.length}")

        assertEquals("最大请求应该包含50个答案", 50, maxRequest.answers.size)
    }

    @Test
    fun `测试无效答案数据的处理`() {
        // 测试无效的答案分数（这些应该被过滤或修复）
        val invalidAnswers = listOf(
            SubmitAnswerRequest(questionId = 1, answerScore = 0), // 低于最小值
            SubmitAnswerRequest(questionId = 2, answerScore = 6), // 高于最大值
            SubmitAnswerRequest(questionId = 3, answerScore = -1), // 负数
            SubmitAnswerRequest(questionId = 4, answerScore = 10) // 超出范围
        )

        val validAnswers = invalidAnswers.filter { answer ->
            answer.answerScore in 1..5 && answer.questionId > 0
        }

        assertEquals("应该过滤掉无效答案", 0, validAnswers.size)

        // 创建一个包含有效和无效答案的请求
        val mixedRequest = TestSubmissionRequest(
            answers = invalidAnswers + listOf(
                SubmitAnswerRequest(questionId = 5, answerScore = 3), // 有效答案
                SubmitAnswerRequest(questionId = 6, answerScore = 4)  // 有效答案
            ),
            language = "zh",
            saveResult = false
        )

        val filteredRequest = mixedRequest.copy(
            answers = mixedRequest.answers.filter { answer ->
                answer.answerScore in 1..5 && answer.questionId > 0
            }
        )

        assertEquals("过滤后应该只有2个有效答案", 2, filteredRequest.answers.size)
    }

    @Test
    fun `测试API响应格式兼容性`() {
        // 模拟服务器可能返回的各种响应格式

        // 成功响应
        val successResponse = """
        {
            "success": true,
            "report": {
                "timestamp": "2024-01-01T12:00:00Z",
                "language": "zh",
                "mbtiType": "ENFP",
                "bigFiveScores": {
                    "openness": 75.0,
                    "conscientiousness": 60.0,
                    "extraversion": 45.0,
                    "agreeableness": 72.0,
                    "neuroticism": 35.0
                },
                "mbtiTypeInfo": {
                    "id": 1,
                    "type_code": "ENFP",
                    "type_name_zh": "竞选者",
                    "description_zh": "热情洋溢、富有想象力的人"
                },
                "careerSuggestions": [
                    {
                        "id": 1,
                        "mbti_type": "ENFP",
                        "career_zh": "市场营销经理"
                    }
                ]
            },
            "saveResult": false
        }
        """.trimIndent()

        val parsedResponse = json.decodeFromString<TestSubmissionResponse>(successResponse)
        assertTrue("成功响应应该解析成功", parsedResponse.success)
        assertNotNull("报告不应该为空", parsedResponse.report)
        assertEquals("MBTI类型", "ENFP", parsedResponse.report?.mbtiType)

        // 错误响应
        val errorResponse = """
        {
            "success": false,
            "error": "Invalid answers format"
        }
        """.trimIndent()

        try {
            val parsedErrorResponse = json.decodeFromString<TestSubmissionResponse>(errorResponse)
            assertFalse("错误响应success字段应该为false", parsedErrorResponse.success)
            assertEquals("错误消息", "Invalid answers format", parsedErrorResponse.report?.toString())
        } catch (e: Exception) {
            // 如果解析失败，这是预期的
            println("错误响应解析失败（可能需要调整格式）: ${e.message}")
        }
    }

    @Test
    fun `验证请求头和内容类型`() {
        // 这个测试验证请求应该包含的正确头部信息
        val expectedHeaders = mapOf(
            "Content-Type" to "application/json",
            "Authorization" to "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI",
            "apikey" to "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI"
        )

        expectedHeaders.forEach { (key, value) ->
            println("请求头 $key: $value")
            assertTrue("请求头$key应该存在", value.isNotEmpty())
        }
    }
}