package com.example.myapplication.data.model

import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.SerializationException
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 数据模型验证测试
 * TDD第一阶段：验证所有数据模型的序列化、反序列化和业务逻辑
 */
class DataModelValidationTest {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
        encodeDefaults = true
    }

    @Before
    fun setUp() {
        println("=== 开始数据模型验证测试 ===")
    }

    @Test
    fun testAnswerOption_withValidData_shouldDeserializeSuccessfully() {
        val json = """
        {
            "id": 1,
            "option_text_zh": "完全不同意",
            "option_text_en": "Strongly Disagree",
            "score": 1
        }
        """.trimIndent()

        val answerOption = Json.decodeFromString<AnswerOption>(json)

        assertEquals(1, answerOption.id)
        assertEquals("完全不同意", answerOption.optionTextZh)
        assertEquals("Strongly Disagree", answerOption.optionTextEn)
        assertEquals(1, answerOption.score)
    }

    @Test
    fun testAnswerOption_withNullFields_shouldHandleGracefully() {
        val json = """
        {
            "id": null,
            "option_text_zh": null,
            "option_text_en": null,
            "score": null
        }
        """.trimIndent()

        try {
            val answerOption = Json.decodeFromString<AnswerOption>(json)
            fail("Expected deserialization to fail with null fields")
        } catch (e: Exception) {
            // 预期会失败，因为字段是必需的
            assertTrue(e.message?.contains("required") == true)
        }
    }

    @Test
    fun testCareerSuggestion_withValidData_shouldDeserializeSuccessfully() {
        val json = """
        {
            "id": 1,
            "mbti_type": "ENFJ",
            "career_zh": "人力资源经理",
            "career_en": "Human Resources Manager"
        }
        """.trimIndent()

        val careerSuggestion = Json.decodeFromString<CareerSuggestion>(json)

        assertEquals(1, careerSuggestion.id)
        assertEquals("ENFJ", careerSuggestion.mbtiType)
        assertEquals("人力资源经理", careerSuggestion.careerZh)
        assertEquals("Human Resources Manager", careerSuggestion.careerEn)
    }

    @Test
    fun testCareerSuggestion_withNullFields_shouldHandleGracefully() {
        val json = """
        {
            "id": null,
            "mbti_type": null,
            "career_zh": null,
            "career_en": null
        }
        """.trimIndent()

        try {
            val careerSuggestion = Json.decodeFromString<CareerSuggestion>(json)
            fail("Expected deserialization to fail with null fields")
        } catch (e: Exception) {
            // 预期会失败，因为字段是必需的
            assertTrue(e.message?.contains("required") == true)
        }
    }

    @Test
    fun testMBTIType_withValidData_shouldDeserializeSuccessfully() {
        val json = """
        {
            "id": 1,
            "type_code": "ENFJ",
            "type_name_zh": "主人公",
            "type_name_en": "Protagonist",
            "description_zh": "ENFJ类型描述",
            "description_en": "ENFJ type description",
            "strengths": ["领导力", "同理心"],
            "challenges": ["过度理想化", "忽略自我需求"]
        }
        """.trimIndent()

        val mbtiType = Json.decodeFromString<MBTIType>(json)

        assertEquals(1, mbtiType.id)
        assertEquals("ENFJ", mbtiType.typeCode)
        assertEquals("主人公", mbtiType.typeNameZh)
        assertEquals("Protagonist", mbtiType.typeNameEn)
        assertEquals("ENFJ类型描述", mbtiType.descriptionZh)
        assertEquals("ENFJ type description", mbtiType.descriptionEn)
        assertEquals(2, mbtiType.strengths?.size)
        assertEquals(2, mbtiType.challenges?.size)
    }

    @Test
    fun testMBTIType_withNullFields_shouldDeserializeSuccessfully() {
        val json = """
        {
            "id": null,
            "type_code": null,
            "type_name_zh": null,
            "type_name_en": null,
            "description_zh": null,
            "description_en": null,
            "strengths": null,
            "challenges": null
        }
        """.trimIndent()

        // 这个测试应该成功，因为我们已经修复了MBTIType模型
        val mbtiType = Json.decodeFromString<MBTIType>(json)

        assertNull(mbtiType.id)
        assertNull(mbtiType.typeCode)
        assertNull(mbtiType.typeNameZh)
        assertNull(mbtiType.typeNameEn)
        assertNull(mbtiType.descriptionZh)
        assertNull(mbtiType.descriptionEn)
        assertNull(mbtiType.strengths)
        assertNull(mbtiType.challenges)
    }

    @Test
    fun testTestReport_withNullMBTITypeInfo_shouldGetFallbackMBTIType() {
        val json = """
        {
            "timestamp": "2025-10-08T12:00:00Z",
            "language": "zh",
            "mbtiType": "ENFJ-A",
            "bigFiveScores": {
                "openness": 60.0,
                "conscientiousness": 60.0,
                "extraversion": 60.0,
                "agreeableness": 60.0,
                "neuroticism": 60.0
            },
            "mbtiResult": {
                "type": "ENFJ-A",
                "dimensions": {
                    "EI": "E",
                    "SN": "N",
                    "TF": "F",
                    "JP": "J"
                },
                "confidence": {
                    "EI": 0.8,
                    "SN": 0.6,
                    "TF": 0.7,
                    "JP": 0.9
                }
            },
            "mbtiTypeInfo": null,
            "careerSuggestions": []
        }
        """.trimIndent()

        val testReport = Json.decodeFromString<TestReport>(json)

        assertEquals("ENFJ-A", testReport.mbtiType)
        assertNotNull(testReport.bigFiveScores)
        assertNotNull(testReport.mbtiResult)
        assertNull(testReport.mbtiTypeInfo)

        // 测试getMBTITypeInfo方法
        val fallbackMBTIType = testReport.getMBTITypeInfo()
        assertNotNull(fallbackMBTIType)
        assertEquals("ENFJ", fallbackMBTIType.typeCode) // 去掉-A/-T后缀
        assertEquals("ENFJ-A", fallbackMBTIType.typeNameZh)
        assertEquals("ENFJ-A", fallbackMBTIType.typeNameEn)
    }

    @Test
    fun testTestReport_withBothNullMBTI_shouldStillWork() {
        val json = """
        {
            "timestamp": "2025-10-08T12:00:00Z",
            "language": "zh",
            "mbtiType": "ENFJ-A",
            "bigFiveScores": {
                "openness": 60.0,
                "conscientiousness": 60.0,
                "extraversion": 60.0,
                "agreeableness": 60.0,
                "neuroticism": 60.0
            },
            "mbtiResult": null,
            "mbtiTypeInfo": null,
            "careerSuggestions": []
        }
        """.trimIndent()

        val testReport = Json.decodeFromString<TestReport>(json)

        assertEquals("ENFJ-A", testReport.mbtiType)
        assertNull(testReport.mbtiResult)
        assertNull(testReport.mbtiTypeInfo)

        // 测试getMBTITypeInfo方法的最后fallback
        val fallbackMBTIType = testReport.getMBTITypeInfo()
        assertNotNull(fallbackMBTIType)
        assertNull(fallbackMBTIType.typeCode)
        assertEquals("未知类型", fallbackMBTIType.getTypeName())
    }

    // ========== BigFiveScores模型测试 ==========

    @Test
    fun `BigFiveScores完整测试`() {
        val scores = BigFiveScores(
            openness = 85.5,
            conscientiousness = 72.3,
            extraversion = 45.8,
            agreeableness = 78.9,
            neuroticism = 32.1
        )

        // 测试序列化
        val jsonString = json.encodeToString(scores)
        assertTrue("JSON应该包含所有维度", jsonString.contains("openness"))
        assertTrue("JSON应该包含分数", jsonString.contains("85.5"))

        // 测试反序列化
        val parsedScores = json.decodeFromString<BigFiveScores>(jsonString)
        assertEquals("开放性得分", 85.5, parsedScores.openness, 0.01)
        assertEquals("神经质得分", 32.1, parsedScores.neuroticism, 0.01)

        // 测试工具方法
        assertEquals("格式化得分", "85.5%", scores.getFormattedScore("开放性"))
        assertEquals("格式化得分", "32.1%", scores.getFormattedScore("neuroticism"))
        assertEquals("未知维度", "0.0%", scores.getFormattedScore("未知"))

        // 测试平均分
        val expectedAverage = (85.5 + 72.3 + 45.8 + 78.9 + 32.1) / 5.0
        assertEquals("平均分计算", expectedAverage, scores.getAverageScore(), 0.01)

        // 测试最高/最低分
        val highest = scores.getHighestDimension()
        assertEquals("最高分维度", "开放性", highest.first)
        assertEquals("最高分值", 85.5, highest.second, 0.01)

        val lowest = scores.getLowestDimension()
        assertEquals("最低分维度", "神经质", lowest.first)
        assertEquals("最低分值", 32.1, lowest.second, 0.01)
    }

    @Test
    fun `BigFiveScores边界测试`() {
        // 测试边界值
        val boundaryScores = BigFiveScores(0.0, 100.0, 50.0, 1.0, 99.9)

        assertEquals("最低边界", 0.0, boundaryScores.getScore("开放性"), 0.01)
        assertEquals("最高边界", 100.0, boundaryScores.getScore("尽责性"), 0.01)
        assertEquals("中等值", 50.0, boundaryScores.getScore("外向性"), 0.01)

        // 测试空安全
        assertEquals("未知维度安全处理", 0.0, boundaryScores.getScore(""), 0.01)
    }

    // ========== SubmitAnswerRequest和TestSubmissionRequest测试 ==========

    @Test
    fun `SubmitAnswerRequest模型测试`() {
        val answerRequest = SubmitAnswerRequest(
            questionId = 5,
            answerScore = 4
        )

        // 测试数据验证
        assertTrue("问题ID应该大于0", answerRequest.questionId > 0)
        assertTrue("答案分数应该在1-5范围内", answerRequest.answerScore in 1..5)

        // 测试序列化
        val jsonString = json.encodeToString(answerRequest)
        assertTrue("应该包含问题ID", jsonString.contains("\"questionId\":5"))
        assertTrue("应该包含答案分数", jsonString.contains("\"answerScore\":4"))

        // 测试反序列化
        val parsedRequest = json.decodeFromString<SubmitAnswerRequest>(jsonString)
        assertEquals("问题ID", 5, parsedRequest.questionId)
        assertEquals("答案分数", 4, parsedRequest.answerScore)
    }

    @Test
    fun `TestSubmissionRequest完整测试`() {
        val submissionRequest = TestSubmissionRequest(
            answers = listOf(
                SubmitAnswerRequest(1, 4),
                SubmitAnswerRequest(2, 3),
                SubmitAnswerRequest(3, 5)
            ),
            language = "zh",
            saveResult = false
        )

        // 测试序列化
        val jsonString = json.encodeToString(submissionRequest)
        println("提交请求JSON: $jsonString")

        assertTrue("应该包含answers数组", jsonString.contains("\"answers\""))
        assertTrue("应该包含语言", jsonString.contains("\"language\":\"zh\""))
        assertTrue("应该包含saveResult", jsonString.contains("\"saveResult\":false"))

        // 测试反序列化
        val parsedRequest = json.decodeFromString<TestSubmissionRequest>(jsonString)
        assertEquals("答案数量", 3, parsedRequest.answers.size)
        assertEquals("语言", "zh", parsedRequest.language)
        assertFalse("不应该保存结果", parsedRequest.saveResult)

        // 验证答案数据
        parsedRequest.answers.forEach { answer ->
            assertTrue("答案ID应该有效", answer.questionId > 0)
            assertTrue("答案分数应该在范围内", answer.answerScore in 1..5)
        }
    }

    // ========== TestSubmissionResponse模型测试 ==========

    @Test
    fun `TestSubmissionResponse成功响应测试`() {
        val testReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "zh",
            mbtiType = "ENFP",
            bigFiveScores = BigFiveScores(75.0, 68.0, 45.0, 72.0, 35.0),
            careerSuggestions = emptyList()
        )

        val submissionResponse = TestSubmissionResponse(
            success = true,
            report = testReport,
            saveResult = false
        )

        // 测试序列化
        val jsonString = json.encodeToString(submissionResponse)
        assertTrue("应该包含success字段", jsonString.contains("\"success\":true"))
        assertTrue("应该包含report字段", jsonString.contains("\"report\""))

        // 测试反序列化
        val parsedResponse = json.decodeFromString<TestSubmissionResponse>(jsonString)
        assertTrue("提交应该成功", parsedResponse.success)
        assertNotNull("报告不应该为空", parsedResponse.report)
        assertEquals("MBTI类型", "ENFP", parsedResponse.report?.mbtiType)
        assertFalse("不应该保存结果", parsedResponse.saveResult)
    }

    @Test
    fun `TestSubmissionResponse错误响应测试`() {
        val errorResponse = TestSubmissionResponse(
            success = false,
            report = null,
            saveResult = false
        )

        // 测试序列化
        val jsonString = json.encodeToString(errorResponse)
        assertTrue("应该包含success:false", jsonString.contains("\"success\":false"))

        // 测试反序列化
        val parsedResponse = json.decodeFromString<TestSubmissionResponse>(jsonString)
        assertFalse("错误响应success应该为false", parsedResponse.success)
        assertNull("错误响应report应该为null", parsedResponse.report)
    }

    // ========== Question模型测试 ==========

    @Test
    fun `Question模型序列化测试`() {
        val question = Question(
            id = 1,
            questionTextZh = "在社交聚会中，你更倾向于：",
            questionTextEn = "At social gatherings, you tend to:",
            dimension = "extraversion"
        )

        val jsonString = json.encodeToString(question)
        println("Question序列化结果: $jsonString")

        // 验证关键字段
        assertTrue("应该包含问题ID", jsonString.contains("\"id\":1"))
        assertTrue("应该包含中文问题", jsonString.contains("在社交聚会中"))
        assertTrue("应该包含英文问题", jsonString.contains("At social gatherings"))
        assertTrue("应该包含维度", jsonString.contains("extraversion"))

        // 反序列化验证
        val parsedQuestion = json.decodeFromString<Question>(jsonString)
        assertEquals("ID应该一致", question.id, parsedQuestion.id)
        assertEquals("中文问题应该一致", question.questionTextZh, parsedQuestion.questionTextZh)
        assertEquals("维度应该一致", question.dimension, parsedQuestion.dimension)
    }

    // ========== 数据一致性测试 ==========

    @Test
    fun `数据一致性完整链路测试`() {
        // 创建完整的测试数据链
        val answerRequests = listOf(
            SubmitAnswerRequest(1, 4),
            SubmitAnswerRequest(2, 3),
            SubmitAnswerRequest(3, 5)
        )

        val submissionRequest = TestSubmissionRequest(
            answers = answerRequests,
            language = "zh",
            saveResult = false
        )

        // 序列化-反序列化循环
        val jsonString = json.encodeToString(submissionRequest)
        val parsedRequest = json.decodeFromString<TestSubmissionRequest>(jsonString)

        // 验证数据一致性
        assertEquals("答案数量应该一致", answerRequests.size, parsedRequest.answers.size)
        assertEquals("语言应该一致", submissionRequest.language, parsedRequest.language)
        assertEquals("saveResult应该一致", submissionRequest.saveResult, parsedRequest.saveResult)

        // 验证每个答案的一致性
        answerRequests.zip(parsedRequest.answers).forEach { (original, parsed) ->
            assertEquals("答案ID应该一致", original.questionId, parsed.questionId)
            assertEquals("答案分数应该一致", original.answerScore, parsed.answerScore)
        }
    }

    // ========== 错误处理测试 ==========

    @Test
    fun `JSON解析错误处理测试`() {
        // 测试无效JSON
        val invalidJson = """{invalid json}"""

        try {
            json.decodeFromString<Question>(invalidJson)
            fail("应该抛出SerializationException")
        } catch (e: SerializationException) {
            assertTrue("应该是序列化异常", e.message?.contains("JSON") == true)
        }
    }

    @Test
    fun `答案数据验证测试`() {
        // 测试边界答案数据
        val validAnswers = listOf(
            SubmitAnswerRequest(1, 1),  // 最小值
            SubmitAnswerRequest(2, 5),  // 最大值
            SubmitAnswerRequest(3, 3)   // 中间值
        )

        validAnswers.forEach { answer ->
            assertTrue("有效答案ID应该大于0", answer.questionId > 0)
            assertTrue("有效答案分数应该在1-5范围内", answer.answerScore in 1..5)
        }

        // 测试无效答案数据
        val invalidAnswers = listOf(
            SubmitAnswerRequest(0, 3),   // 无效ID
            SubmitAnswerRequest(1, 0),   // 无效分数（太小）
            SubmitAnswerRequest(2, 6),   // 无效分数（太大）
            SubmitAnswerRequest(-1, 3)   // 负数ID
        )

        invalidAnswers.forEach { answer ->
            assertFalse("无效答案ID应该小于等于0", answer.questionId > 0)
            assertFalse("无效答案分数应该在1-5范围外", answer.answerScore in 1..5)
        }
    }
}