package com.example.myapplication.data.model

import kotlinx.serialization.json.Json
import org.junit.Test
import org.junit.Assert.*

/**
 * 数据模型单元测试
 * 测试序列化、反序列化和业务逻辑
 */
class DataModelTest {

    private val json = Json { ignoreUnknownKeys = true }

    @Test
    fun `Question model serialization and deserialization`() {
        val question = Question(
            id = 1,
            questionTextZh = "你喜欢与人交往吗？",
            questionTextEn = "Do you like socializing with people?",
            dimension = "extraversion",
            reverse = false,
            createdAt = "2024-01-01T00:00:00Z"
        )

        // 测试序列化
        val jsonString = json.encodeToString(Question.serializer(), question)
        assertNotNull(jsonString)
        assertTrue(jsonString.contains("你喜欢与人交往吗？"))

        // 测试反序列化
        val deserializedQuestion = json.decodeFromString(Question.serializer(), jsonString)
        assertEquals(question, deserializedQuestion)
    }

    @Test
    fun `Question getQuestionText returns correct language`() {
        val question = Question(
            id = 1,
            questionTextZh = "中文问题",
            questionTextEn = "English Question",
            dimension = "extraversion",
            reverse = false
        )

        assertEquals("中文问题", question.getQuestionText("zh"))
        assertEquals("English Question", question.getQuestionText("en"))
        assertEquals("中文问题", question.getQuestionText()) // 默认中文
    }

    @Test
    fun `AnswerOption model serialization and getOptionText`() {
        val option = AnswerOption(
            id = 1,
            optionTextZh = "非常同意",
            optionTextEn = "Strongly Agree",
            score = 5
        )

        // 测试序列化
        val jsonString = json.encodeToString(AnswerOption.serializer(), option)
        val deserializedOption = json.decodeFromString(AnswerOption.serializer(), jsonString)
        assertEquals(option, deserializedOption)

        // 测试语言选择
        assertEquals("非常同意", option.getOptionText("zh"))
        assertEquals("Strongly Agree", option.getOptionText("en"))
    }

    @Test
    fun `MBTIType model helper functions`() {
        val mbtiType = MBTIType(
            id = 1,
            typeCode = "INTJ",
            typeNameZh = "建筑师",
            typeNameEn = "Architect",
            descriptionZh = "富有想象力和战略性的思想家",
            descriptionEn = "Imaginative and strategic thinkers",
            strengths = listOf("分析能力强", "独立思考"),
            challenges = listOf("过于完美主义", "难以表达情感")
        )

        // 测试类型名称获取
        assertEquals("建筑师", mbtiType.getTypeName("zh"))
        assertEquals("Architect", mbtiType.getTypeName("en"))
        assertEquals("建筑师", mbtiType.getTypeName()) // 默认中文

        // 测试描述获取
        assertEquals("富有想象力和战略性的思想家", mbtiType.getDescription("zh"))
        assertEquals("Imaginative and strategic thinkers", mbtiType.getDescription("en"))
    }

    @Test
    fun `CareerSuggestion getCareerName function`() {
        val career = CareerSuggestion(
            id = 1,
            mbtiType = "INTJ",
            careerZh = "软件工程师",
            careerEn = "Software Engineer"
        )

        assertEquals("软件工程师", career.getCareerName("zh"))
        assertEquals("Software Engineer", career.getCareerName("en"))
        assertEquals("软件工程师", career.getCareerName()) // 默认中文
    }

    @Test
    fun `BigFiveScores model serialization`() {
        val scores = BigFiveScores(
            openness = 4.2,
            conscientiousness = 3.8,
            extraversion = 2.5,
            agreeableness = 4.0,
            neuroticism = 2.1
        )

        val jsonString = json.encodeToString(BigFiveScores.serializer(), scores)
        val deserializedScores = json.decodeFromString(BigFiveScores.serializer(), jsonString)
        
        assertEquals(scores, deserializedScores)
        assertEquals(4.2, deserializedScores.openness, 0.01)
        assertEquals(3.8, deserializedScores.conscientiousness, 0.01)
    }

    @Test
    fun `TestReport model complete serialization`() {
        val mbtiType = MBTIType(
            id = 1,
            typeCode = "INTJ",
            typeNameZh = "建筑师",
            typeNameEn = "Architect",
            descriptionZh = "富有想象力和战略性的思想家",
            descriptionEn = "Imaginative and strategic thinkers",
            strengths = listOf("分析能力强"),
            challenges = listOf("过于完美主义")
        )

        val bigFiveScores = BigFiveScores(
            openness = 4.2,
            conscientiousness = 3.8,
            extraversion = 2.5,
            agreeableness = 4.0,
            neuroticism = 2.1
        )

        val careerSuggestions = listOf(
            CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"),
            CareerSuggestion(2, "INTJ", "数据分析师", "Data Analyst")
        )

        val testReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "zh",
            mbtiType = "INTJ",
            bigFiveScores = bigFiveScores,
            mbtiTypeInfo = mbtiType,
            careerSuggestions = careerSuggestions
        )

        // 测试完整的序列化和反序列化
        val jsonString = json.encodeToString(TestReport.serializer(), testReport)
        assertNotNull(jsonString)
        
        val deserializedReport = json.decodeFromString(TestReport.serializer(), jsonString)
        assertEquals(testReport.timestamp, deserializedReport.timestamp)
        assertEquals(testReport.mbtiType, deserializedReport.mbtiType)
        assertEquals(testReport.bigFiveScores, deserializedReport.bigFiveScores)
        assertEquals(testReport.careerSuggestions.size, deserializedReport.careerSuggestions.size)
    }

    @Test
    fun `UserAnswer and SubmitAnswerRequest models`() {
        val submitRequest = SubmitAnswerRequest(
            questionId = 1,
            answerScore = 4
        )

        val userAnswer = UserAnswer(
            id = 1,
            testResultId = 100,
            questionId = 1,
            answerScore = 4,
            createdAt = "2024-01-01T12:00:00Z"
        )

        // 测试序列化
        val submitJson = json.encodeToString(SubmitAnswerRequest.serializer(), submitRequest)
        val answerJson = json.encodeToString(UserAnswer.serializer(), userAnswer)

        assertNotNull(submitJson)
        assertNotNull(answerJson)

        // 测试反序列化
        val deserializedSubmit = json.decodeFromString(SubmitAnswerRequest.serializer(), submitJson)
        val deserializedAnswer = json.decodeFromString(UserAnswer.serializer(), answerJson)

        assertEquals(submitRequest, deserializedSubmit)
        assertEquals(userAnswer, deserializedAnswer)
    }

    @Test
    fun `ApiResponse generic model`() {
        val successResponse = ApiResponse(
            success = true,
            data = "test data",
            error = null
        )

        val errorResponse = ApiResponse<String>(
            success = false,
            data = null,
            error = "Something went wrong"
        )

        // 测试成功响应
        assertTrue(successResponse.success)
        assertEquals("test data", successResponse.data)
        assertNull(successResponse.error)

        // 测试错误响应
        assertFalse(errorResponse.success)
        assertNull(errorResponse.data)
        assertEquals("Something went wrong", errorResponse.error)
    }

    @Test
    fun `TestSubmissionRequest model`() {
        val answers = listOf(
            SubmitAnswerRequest(1, 4),
            SubmitAnswerRequest(2, 3),
            SubmitAnswerRequest(3, 5)
        )

        val request = TestSubmissionRequest(
            answers = answers,
            language = "zh",
            saveResult = true
        )

        val jsonString = json.encodeToString(TestSubmissionRequest.serializer(), request)
        val deserializedRequest = json.decodeFromString(TestSubmissionRequest.serializer(), jsonString)

        assertEquals(request.answers.size, deserializedRequest.answers.size)
        assertEquals(request.language, deserializedRequest.language)
        assertEquals(request.saveResult, deserializedRequest.saveResult)
    }
}