package com.example.myapplication.integration

import com.example.myapplication.data.model.*
import kotlinx.serialization.json.Json
import org.junit.Test
import org.junit.Assert.*

/**
 * 集成测试：验证完整的测试结果展示流程
 */
class TestResultIntegrationTest {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    @Test
    fun `测试完整的测试提交流程数据结构`() {
        // 模拟API返回的完整测试结果
        val fullTestResultJson = """
        {
            "success": true,
            "report": {
                "timestamp": "2024-01-01T12:00:00.000Z",
                "language": "zh",
                "mbtiType": "ENFP-A",
                "bigFiveScores": {
                    "openness": 85.2,
                    "conscientiousness": 45.8,
                    "extraversion": 78.5,
                    "agreeableness": 72.1,
                    "neuroticism": 25.3
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
                        "EI": 0.85,
                        "SN": 0.78,
                        "TF": 0.65,
                        "JP": 0.58
                    }
                },
                "mbtiTypeInfo": {
                    "id": 1,
                    "type_code": "ENFP",
                    "type_name_zh": "竞选者",
                    "type_name_en": "Campaigner",
                    "description_zh": "热情洋溢、富有想象力和创造力，能够激励他人的人。他们总是看到事物的积极面，充满好奇心和创造力。",
                    "description_en": "Enthusiastic, creative and sociable free spirits who can always find a reason to smile.",
                    "strengths": ["创造力强", "善于沟通", "适应性强", "乐观积极"],
                    "challenges": ["容易分心", "缺乏组织性", "过于理想化", "回避冲突"]
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
                    },
                    {
                        "id": 3,
                        "mbti_type": "ENFP",
                        "career_zh": "创意总监",
                        "career_en": "Creative Director"
                    },
                    {
                        "id": 4,
                        "mbti_type": "ENFP",
                        "career_zh": "公关专员",
                        "career_en": "Public Relations Specialist"
                    },
                    {
                        "id": 5,
                        "mbti_type": "ENFP",
                        "career_zh": "人力资源经理",
                        "career_en": "HR Manager"
                    }
                ],
                "progress": {
                    "completed": true,
                    "percentage": 100,
                    "answeredQuestions": 50,
                    "totalQuestions": 50
                },
                "statistics": {
                    "averageConfidence": 0.715,
                    "strongestDimension": "EI",
                    "bigFiveAverage": 61.38
                }
            },
            "saveResult": false
        }
        """.trimIndent()

        val response = json.decodeFromString<TestSubmissionResponse>(fullTestResultJson)

        // 验证基本结构
        assertTrue("提交应该成功", response.success)
        assertNotNull("报告不应该为空", response.report)
        assertFalse("结果未保存", response.saveResult)

        val report = response.report!!

        // 验证基本信息
        assertEquals("时间戳", "2024-01-01T12:00:00.000Z", report.timestamp)
        assertEquals("语言", "zh", report.language)
        assertEquals("MBTI类型", "ENFP-A", report.mbtiType)

        // 验证Big Five得分
        val bigFiveScores = report.bigFiveScores
        assertEquals("开放性得分", 85.2, bigFiveScores.openness, 0.01)
        assertEquals("尽责性得分", 45.8, bigFiveScores.conscientiousness, 0.01)
        assertEquals("外向性得分", 78.5, bigFiveScores.extraversion, 0.01)
        assertEquals("宜人性得分", 72.1, bigFiveScores.agreeableness, 0.01)
        assertEquals("神经质得分", 25.3, bigFiveScores.neuroticism, 0.01)

        // 验证Big Five工具方法
        assertEquals("开放性格式化得分", "85.2%", bigFiveScores.getFormattedScore("开放性"))
        assertEquals("平均分", 61.38, bigFiveScores.getAverageScore(), 0.01)

        val highest = bigFiveScores.getHighestDimension()
        assertEquals("最高分维度", "开放性", highest.first)
        assertEquals("最高分", 85.2, highest.second, 0.01)

        val lowest = bigFiveScores.getLowestDimension()
        assertEquals("最低分维度", "神经质", lowest.first)
        assertEquals("最低分", 25.3, lowest.second, 0.01)

        // 验证MBTI结果
        val mbtiResult = report.mbtiResult!!
        assertEquals("MBTI类型", "ENFP-A", mbtiResult.type)
        assertEquals("E维度", "E", mbtiResult.dimensions.EI)
        assertEquals("N维度", "N", mbtiResult.dimensions.SN)
        assertEquals("F维度", "F", mbtiResult.dimensions.TF)
        assertEquals("P维度", "P", mbtiResult.dimensions.JP)

        assertEquals("E维度置信度", 0.85, mbtiResult.confidence.EI, 0.01)
        assertEquals("N维度置信度", 0.78, mbtiResult.confidence.SN, 0.01)

        // 验证MBTI类型信息
        val mbtiTypeInfo = report.getMBTITypeInfo()
        assertEquals("类型中文名", "竞选者", mbtiTypeInfo.getTypeName("zh"))
        assertEquals("类型英文名", "Campaigner", mbtiTypeInfo.getTypeName("en"))

        val description = mbtiTypeInfo.getDescription("zh")
        assertTrue("描述应该包含关键词", description.contains("热情"))
        assertTrue("描述应该包含关键词", description.contains("创造力"))

        // 验证优势和挑战
        val strengths = mbtiTypeInfo.strengths
        assertNotNull("优势不应该为空", strengths)
        assertEquals("优势数量", 4, strengths?.size)
        assertTrue("应该包含创造力", strengths?.contains("创造力强") == true)

        val challenges = mbtiTypeInfo.challenges
        assertNotNull("挑战不应该为空", challenges)
        assertEquals("挑战数量", 4, challenges?.size)
        assertTrue("应该包含容易分心", challenges?.contains("容易分心") == true)

        // 验证职业建议
        val careerSuggestions = report.careerSuggestions
        assertEquals("职业建议数量", 5, careerSuggestions.size)

        val careers = careerSuggestions.map { it.getCareerName("zh") }
        assertTrue("应该包含市场营销经理", careers.contains("市场营销经理"))
        assertTrue("应该包含心理咨询师", careers.contains("心理咨询师"))
        assertTrue("应该包含创意总监", careers.contains("创意总监"))

        // 验证多语言支持
        val careersEn = careerSuggestions.map { it.getCareerName("en") }
        assertTrue("应该包含Marketing Manager", careersEn.contains("Marketing Manager"))
        assertTrue("应该包含Counselor", careersEn.contains("Counselor"))
    }

    @Test
    fun `测试最小化数据结构处理`() {
        // 测试只有最基本数据的情况
        val minimalResultJson = """
        {
            "success": true,
            "report": {
                "timestamp": "2024-01-01T12:00:00.000Z",
                "language": "zh",
                "mbtiType": "ENFP",
                "bigFiveScores": {
                    "openness": 75.0,
                    "conscientiousness": 50.0,
                    "extraversion": 60.0,
                    "agreeableness": 55.0,
                    "neuroticism": 35.0
                },
                "careerSuggestions": []
            },
            "saveResult": false
        }
        """.trimIndent()

        val response = json.decodeFromString<TestSubmissionResponse>(minimalResultJson)
        assertTrue("提交应该成功", response.success)

        val report = response.report!!

        // 测试getMBTITypeInfo的fallback机制
        val mbtiTypeInfo = report.getMBTITypeInfo()
        assertEquals("fallback类型名称", "ENFP", mbtiTypeInfo.getTypeName())
        assertEquals("fallback描述", "ENFP类型", mbtiTypeInfo.getDescription())
        assertTrue("fallback优势为空", mbtiTypeInfo.strengths?.isEmpty() != false)
        assertTrue("fallback挑战为空", mbtiTypeInfo.challenges?.isEmpty() != false)

        // 测试空职业建议的处理
        assertEquals("职业建议应该为空", 0, report.careerSuggestions.size)
    }

    @Test
    fun `测试测试提交请求格式`() {
        val submitRequest = TestSubmissionRequest(
            answers = listOf(
                SubmitAnswerRequest(1, 4),
                SubmitAnswerRequest(2, 3),
                SubmitAnswerRequest(3, 5),
                SubmitAnswerRequest(4, 2),
                SubmitAnswerRequest(5, 4)
            ),
            language = "zh",
            saveResult = false
        )

        // 序列化为JSON
        val jsonStr = json.encodeToString(TestSubmissionRequest.serializer(), submitRequest)

        // 反序列化验证
        val parsed = json.decodeFromString<TestSubmissionRequest>(jsonStr)

        assertEquals("语言应该保持", "zh", parsed.language)
        assertFalse("不应该保存结果", parsed.saveResult)
        assertEquals("答案数量", 5, parsed.answers.size)
        assertEquals("第一题ID", 1, parsed.answers[0].questionId)
        assertEquals("第一题答案", 4, parsed.answers[0].answerScore)
    }

    @Test
    fun `测试边界情况和异常处理`() {
        // 测试边界得分
        val boundaryScores = BigFiveScores(
            openness = 0.0,
            conscientiousness = 100.0,
            extraversion = 50.0,
            agreeableness = 1.0,
            neuroticism = 99.9
        )

        assertEquals("最低分", 0.0, boundaryScores.getScore("开放性"), 0.01)
        assertEquals("最高分", 100.0, boundaryScores.getScore("尽责性"), 0.01)
        assertEquals("中等分", 50.0, boundaryScores.getScore("外向性"), 0.01)

        // 测试工具方法的鲁棒性
        assertEquals("未知维度得分", 0.0, boundaryScores.getScore("未知维度"), 0.01)
        assertEquals("未知维度格式化", "0.0%", boundaryScores.getFormattedScore("未知"))

        // 测试最高最低分的边界情况
        val highest = boundaryScores.getHighestDimension()
        assertEquals("最高分应该是尽责性", "尽责性", highest.first)
        assertEquals("最高分应该是100.0", 100.0, highest.second, 0.01)

        val lowest = boundaryScores.getLowestDimension()
        assertEquals("最低分应该是开放性", "开放性", lowest.first)
        assertEquals("最低分应该是0.0", 0.0, lowest.second, 0.01)
    }

    @Test
    fun `测试MBTI类型信息的完整性`() {
        // 创建完整的MBTI类型信息
        val completeMBTIType = MBTIType(
            id = 1,
            typeCode = "ENFP",
            typeNameZh = "竞选者",
            typeNameEn = "Campaigner",
            descriptionZh = "热情洋溢、富有想象力和创造力的人",
            descriptionEn = "Enthusiastic, creative and sociable free spirits",
            strengths = listOf("创造力强", "善于沟通", "适应性强", "乐观积极"),
            challenges = listOf("容易分心", "缺乏组织性", "过于理想化")
        )

        // 测试中文环境
        assertEquals("中文类型名称", "竞选者", completeMBTIType.getTypeName("zh"))
        assertEquals("中文描述", "热情洋溢、富有想象力和创造力的人", completeMBTIType.getDescription("zh"))

        // 测试英文环境
        assertEquals("英文类型名称", "Campaigner", completeMBTIType.getTypeName("en"))
        assertEquals("英文描述", "Enthusiastic, creative and sociable free spirits", completeMBTIType.getDescription("en"))

        // 测试默认语言（中文）
        assertEquals("默认类型名称", "竞选者", completeMBTIType.getTypeName())
        assertEquals("默认描述", "热情洋溢、富有想象力和创造力的人", completeMBTIType.getDescription())

        // 测试不存在的语言（应该回退到中文）
        assertEquals("不存在的语言应该回退到中文", "竞选者", completeMBTIType.getTypeName("fr"))
        assertEquals("不存在的语言应该回退到中文", "热情洋溢、富有想象力和创造力的人", completeMBTIType.getDescription("fr"))
    }
}