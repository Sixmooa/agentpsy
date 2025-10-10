package com.example.myapplication.data.model

import kotlinx.serialization.json.Json
import org.junit.Test
import org.junit.Assert.*

/**
 * 单元测试：验证API数据解析和UI显示逻辑
 */
class TestDataParsingTest {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    @Test
    fun `测试 BigFiveScores 数据解析`() {
        // 模拟API返回的JSON数据
        val apiResponseJson = """
        {
            "success": true,
            "data": {
                "openness": 75.5,
                "conscientiousness": 60.2,
                "extraversion": 45.8,
                "agreeableness": 80.1,
                "neuroticism": 30.3
            }
        }
        """.trimIndent()

        val response = json.decodeFromString<ApiResponse<BigFiveScores>>(apiResponseJson)

        assertTrue("API响应应该成功", response.success)
        assertNotNull("数据不应该为空", response.data)

        val scores = response.data!!
        assertEquals("开放性得分应该正确", 75.5, scores.openness, 0.01)
        assertEquals("尽责性得分应该正确", 60.2, scores.conscientiousness, 0.01)
        assertEquals("外向性得分应该正确", 45.8, scores.extraversion, 0.01)
        assertEquals("宜人性得分应该正确", 80.1, scores.agreeableness, 0.01)
        assertEquals("神经质得分应该正确", 30.3, scores.neuroticism, 0.01)
    }

    @Test
    fun `测试 BigFiveScores 工具方法`() {
        val scores = BigFiveScores(
            openness = 75.5,
            conscientiousness = 60.2,
            extraversion = 45.8,
            agreeableness = 80.1,
            neuroticism = 30.3
        )

        // 测试格式化得分
        assertEquals("开放性格式化得分", "75.5%", scores.getFormattedScore("开放性"))
        assertEquals("openness格式化得分", "75.5%", scores.getFormattedScore("openness"))
        assertEquals("未知维度格式化得分", "0.0%", scores.getFormattedScore("未知"))

        // 测试获取得分
        assertEquals("开放性得分", 75.5, scores.getScore("开放性"), 0.01)
        assertEquals("conscientiousness得分", 60.2, scores.getScore("conscientiousness"), 0.01)

        // 测试平均分
        val expectedAverage = (75.5 + 60.2 + 45.8 + 80.1 + 30.3) / 5.0
        assertEquals("平均分计算", expectedAverage, scores.getAverageScore(), 0.01)

        // 测试最高分维度
        val highest = scores.getHighestDimension()
        assertEquals("最高分维度应该是宜人性", "宜人性", highest.first)
        assertEquals("最高分应该是80.1", 80.1, highest.second, 0.01)

        // 测试最低分维度
        val lowest = scores.getLowestDimension()
        assertEquals("最低分维度应该是神经质", "神经质", lowest.first)
        assertEquals("最低分应该是30.3", 30.3, lowest.second, 0.01)
    }

    @Test
    fun `测试 MBTIResult 数据解析`() {
        val mbtiResultJson = """
        {
            "type": "ENFP-A",
            "dimensions": {
                "EI": "E",
                "SN": "N",
                "TF": "F",
                "JP": "P"
            },
            "confidence": {
                "EI": 0.8,
                "SN": 0.6,
                "TF": 0.7,
                "JP": 0.5
            }
        }
        """.trimIndent()

        val mbtiResult = json.decodeFromString<MBTIResult>(mbtiResultJson)

        assertEquals("MBTI类型", "ENFP-A", mbtiResult.type)
        assertEquals("E维度", "E", mbtiResult.dimensions.EI)
        assertEquals("N维度", "N", mbtiResult.dimensions.SN)
        assertEquals("F维度", "F", mbtiResult.dimensions.TF)
        assertEquals("P维度", "P", mbtiResult.dimensions.JP)

        assertEquals("E维度置信度", 0.8, mbtiResult.confidence.EI, 0.01)
        assertEquals("N维度置信度", 0.6, mbtiResult.confidence.SN, 0.01)
    }

    @Test
    fun `测试 TestReport 数据解析`() {
        val testReportJson = """
        {
            "timestamp": "2024-01-01T12:00:00.000Z",
            "language": "zh",
            "mbtiType": "ENFP-A",
            "bigFiveScores": {
                "openness": 75.5,
                "conscientiousness": 60.2,
                "extraversion": 45.8,
                "agreeableness": 80.1,
                "neuroticism": 30.3
            },
            "mbtiResult": {
                "type": "ENFP-A",
                "dimensions": {
                    "EI": "E",
                    "SN": "N",
                    "TF": "F",
                    "JP": "P"
                },
                "confidence": {
                    "EI": 0.8,
                    "SN": 0.6,
                    "TF": 0.7,
                    "JP": 0.5
                }
            },
            "mbtiTypeInfo": {
                "id": 1,
                "type_code": "ENFP",
                "type_name_zh": "竞选者",
                "type_name_en": "Campaigner",
                "description_zh": "热情洋溢、富有想象力和创造力的人",
                "description_en": "Enthusiastic, creative and sociable free spirits",
                "strengths": ["创造力强", "善于沟通"],
                "challenges": ["容易分心", "缺乏组织性"]
            },
            "careerSuggestions": [
                {
                    "id": 1,
                    "mbti_type": "ENFP",
                    "career_zh": "市场营销经理",
                    "career_en": "Marketing Manager"
                },
                {
                    "id": 2,
                    "mbti_type": "ENFP",
                    "career_zh": "心理咨询师",
                    "career_en": "Counselor"
                }
            ]
        }
        """.trimIndent()

        val testReport = json.decodeFromString<TestReport>(testReportJson)

        assertEquals("时间戳", "2024-01-01T12:00:00.000Z", testReport.timestamp)
        assertEquals("语言", "zh", testReport.language)
        assertEquals("MBTI类型", "ENFP-A", testReport.mbtiType)

        // 验证Big Five得分
        assertEquals("开放性得分", 75.5, testReport.bigFiveScores.openness, 0.01)

        // 验证MBTI结果
        assertEquals("MBTI结果类型", "ENFP-A", testReport.mbtiResult?.type)

        // 验证MBTI类型信息
        val mbtiTypeInfo = testReport.getMBTITypeInfo()
        assertEquals("类型中文名", "竞选者", mbtiTypeInfo.getTypeName("zh"))
        assertEquals("类型英文名", "Campaigner", mbtiTypeInfo.getTypeName("en"))
        assertEquals("中文描述", "热情洋溢、富有想象力和创造力的人", mbtiTypeInfo.getDescription("zh"))

        // 验证职业建议
        assertEquals("职业建议数量", 2, testReport.careerSuggestions.size)
        assertEquals("第一个职业", "市场营销经理", testReport.careerSuggestions[0].getCareerName("zh"))
        assertEquals("第二个职业", "心理咨询师", testReport.careerSuggestions[1].getCareerName("zh"))
    }

    @Test
    fun `测试 SubmitAnswerRequest 数据解析`() {
        val submitRequestJson = """
        {
            "answers": [
                {
                    "questionId": 1,
                    "answerScore": 4
                },
                {
                    "questionId": 2,
                    "answerScore": 3
                }
            ],
            "language": "zh",
            "saveResult": false
        }
        """.trimIndent()

        val submitRequest = json.decodeFromString<TestSubmissionRequest>(submitRequestJson)

        assertEquals("语言", "zh", submitRequest.language)
        assertFalse("不保存结果", submitRequest.saveResult)
        assertEquals("答案数量", 2, submitRequest.answers.size)
        assertEquals("第一题ID", 1, submitRequest.answers[0].questionId)
        assertEquals("第一题答案", 4, submitRequest.answers[0].answerScore)
    }

    @Test
    fun `测试 TestSubmissionResponse 数据解析`() {
        val submissionResponseJson = """
        {
            "success": true,
            "report": {
                "timestamp": "2024-01-01T12:00:00.000Z",
                "language": "zh",
                "mbtiType": "ENFP-A",
                "bigFiveScores": {
                    "openness": 75.5,
                    "conscientiousness": 60.2,
                    "extraversion": 45.8,
                    "agreeableness": 80.1,
                    "neuroticism": 30.3
                },
                "careerSuggestions": []
            },
            "saveResult": false
        }
        """.trimIndent()

        val response = json.decodeFromString<TestSubmissionResponse>(submissionResponseJson)

        assertTrue("提交应该成功", response.success)
        assertNotNull("报告不应该为空", response.report)
        assertFalse("结果未保存", response.saveResult)
        assertEquals("MBTI类型", "ENFP-A", response.report?.mbtiType)
    }

    @Test
    fun `测试 MBTIType fromMBTIResult 方法`() {
        val mbtiResult = MBTIResult(
            type = "ENFP-A",
            dimensions = Dimensions("E", "N", "F", "P"),
            confidence = Confidence(0.8, 0.6, 0.7, 0.5)
        )

        val mbtiType = MBTIType.fromMBTIResult(mbtiResult)

        assertEquals("类型代码", "ENFP", mbtiType.typeCode)
        assertEquals("中文名称", "ENFP-A", mbtiType.typeNameZh)
        assertEquals("英文名称", "ENFP-A", mbtiType.typeNameEn)
        assertEquals("中文描述", "ENFP-A类型", mbtiType.descriptionZh)
        assertEquals("英文描述", "ENFP-A Type", mbtiType.descriptionEn)
    }

    @Test
    fun `测试 CareerSuggestion 多语言支持`() {
        // 测试中文职业
        val careerZh = CareerSuggestion(
            id = 1,
            mbtiType = "ENFP",
            careerZh = "市场营销经理",
            careerEn = "Marketing Manager"
        )
        assertEquals("中文名称", "市场营销经理", careerZh.getCareerName("zh"))
        assertEquals("英文名称", "Marketing Manager", careerZh.getCareerName("en"))

        // 测试只有英文名称的职业
        val careerEn = CareerSuggestion(
            id = 2,
            mbtiType = "ENFP",
            careerEn = "Software Developer"
        )
        assertEquals("中文名称（回退到英文）", "Software Developer", careerEn.getCareerName("zh"))
        assertEquals("英文名称", "Software Developer", careerEn.getCareerName("en"))

        // 测试使用其他字段
        val careerAlt = CareerSuggestion(
            id = 3,
            mbtiType = "ENFP",
            title = "产品经理"
        )
        assertEquals("使用title字段", "产品经理", careerAlt.getCareerName("zh"))
    }
}