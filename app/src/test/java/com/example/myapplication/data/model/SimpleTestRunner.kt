package com.example.myapplication.data.model

import kotlinx.serialization.json.Json
import org.junit.Test
import org.junit.Assert.*

/**
 * 简单的测试运行器，用于验证核心数据模型
 */
class SimpleTestRunner {

    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    @Test
    fun `测试 BigFiveScores 基本功能`() {
        val scores = BigFiveScores(
            openness = 75.5,
            conscientiousness = 60.2,
            extraversion = 45.8,
            agreeableness = 80.1,
            neuroticism = 30.3
        )

        // 测试格式化得分
        assertEquals("开放性格式化得分", "75.5%", scores.getFormattedScore("开放性"))

        // 测试平均分
        val expectedAverage = (75.5 + 60.2 + 45.8 + 80.1 + 30.3) / 5.0
        assertEquals("平均分计算", expectedAverage, scores.getAverageScore(), 0.01)

        // 测试最高分维度
        val highest = scores.getHighestDimension()
        assertEquals("最高分维度应该是宜人性", "宜人性", highest.first)

        // 测试最低分维度
        val lowest = scores.getLowestDimension()
        assertEquals("最低分维度应该是神经质", "神经质", lowest.first)
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
        assertEquals("中文描述", "ENFP-A类型", mbtiType.descriptionZh)
    }

    @Test
    fun `测试 CareerSuggestion 多语言支持`() {
        val career = CareerSuggestion(
            id = 1,
            mbtiType = "ENFP",
            careerZh = "市场营销经理",
            careerEn = "Marketing Manager"
        )

        assertEquals("中文名称", "市场营销经理", career.getCareerName("zh"))
        assertEquals("英文名称", "Marketing Manager", career.getCareerName("en"))
    }

    @Test
    fun `测试简单的 JSON 解析`() {
        val simpleJson = """{"success": true, "data": {"openness": 75.0}}"""
        val response = json.decodeFromString<ApiResponse<Map<String, Double>>>(simpleJson)

        assertTrue("API响应应该成功", response.success)
        assertNotNull("数据不应该为空", response.data)
        assertEquals("开放性得分", 75.0, response.data!!["openness"])
    }
}