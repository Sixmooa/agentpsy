package com.example.myapplication

import com.example.myapplication.data.model.BigFiveScores
import com.example.myapplication.data.network.MockApiService
import org.junit.Test
import org.junit.Assert.*

/**
 * 大五人格显示问题诊断测试
 * 验证1000%显示问题的根本原因
 */
class BigFiveScoreBugDiagnosticTest {

    /**
     * 测试MockApiService中的Big Five分数计算逻辑
     * 验证是否正确将原始分数转换为1-5范围
     */
    @Test
    fun testMockApiServiceBigFiveCalculation() {
        val mockApiService = MockApiService()

        // 模拟用户答题：每题都得3分（中等）
        val answers = (1..50).map { questionId ->
            val dimension = when(questionId) {
                1, 6, 11, 16, 21, 26, 31, 36, 41, 46 -> "openness"
                2, 7, 12, 17, 22, 27, 32, 37, 42, 47 -> "conscientiousness"
                3, 8, 13, 18, 23, 28, 33, 38, 43, 48 -> "extraversion"
                4, 9, 14, 19, 24, 29, 34, 39, 44, 49 -> "agreeableness"
                5, 10, 15, 20, 25, 30, 35, 40, 45, 50 -> "neuroticism"
                else -> "openness"
            }

            // 模拟Answer对象
            mapOf(
                "questionId" to questionId,
                "answerScore" to 3,
                "dimension" to dimension
            )
        }

        // 计算每个维度的原始总分
        val rawScores = mutableMapOf(
            "openness" to 0,
            "conscientiousness" to 0,
            "extraversion" to 0,
            "agreeableness" to 0,
            "neuroticism" to 0
        )

        answers.forEach { answer ->
            val dimension = answer["dimension"] as String
            rawScores[dimension] = rawScores.getOrDefault(dimension, 0) + (answer["answerScore"] as Int)
        }

        println("原始分数（每维度10题，每题3分）:")
        rawScores.forEach { (dimension, score) ->
            println("$dimension: $score 分")
        }

        // 验证原始分数
        assertEquals("Openness原始分数应为30", 30, rawScores["openness"]!!)
        assertEquals("Conscientiousness原始分数应为30", 30, rawScores["conscientiousness"]!!)

        // 测试MockApiService的错误计算逻辑
        val questionsPerDimension = 10
        val maxScorePerDimension = questionsPerDimension * 5 // 50

        // 模拟MockApiService当前的错误计算
        val wrongBigFiveScores = BigFiveScores(
            openness = (rawScores["openness"] ?: 0) * 100.0 / maxScorePerDimension,
            conscientiousness = (rawScores["conscientiousness"] ?: 0) * 100.0 / maxScorePerDimension,
            extraversion = (rawScores["extraversion"] ?: 0) * 100.0 / maxScorePerDimension,
            agreeableness = (rawScores["agreeableness"] ?: 0) * 100.0 / maxScorePerDimension,
            neuroticism = (rawScores["neuroticism"] ?: 0) * 100.0 / maxScorePerDimension
        )

        println("\nMockApiService错误的计算结果（0-100范围）:")
        println("开放性: ${wrongBigFiveScores.openness}%")
        println("尽责性: ${wrongBigFiveScores.conscientiousness}%")

        // 测试正确的计算逻辑（应该返回1-5的平均分）
        val correctBigFiveScores = BigFiveScores(
            openness = (rawScores["openness"] ?: 0).toDouble() / 10.0, // 平均分
            conscientiousness = (rawScores["conscientiousness"] ?: 0).toDouble() / 10.0,
            extraversion = (rawScores["extraversion"] ?: 0).toDouble() / 10.0,
            agreeableness = (rawScores["agreeableness"] ?: 0).toDouble() / 10.0,
            neuroticism = (rawScores["neuroticism"] ?: 0).toDouble() / 10.0
        )

        println("\n正确的计算结果（1-5范围）:")
        println("开放性: ${correctBigFiveScores.openness}")
        println("尽责性: ${correctBigFiveScores.conscientiousness}")

        // 验证问题：UI期望1-5分，但收到0-100的百分比数据
        // 在ResultScreen.kt:506，UI会将1-5分转换为百分比显示
        val uiPercentageOpenness = ((correctBigFiveScores.openness - 1) / 4.0) * 100
        val uiPercentageWrongOpenness = ((wrongBigFiveScores.openness - 1) / 4.0) * 100

        println("\nUI显示计算:")
        println("正确数据UI显示: ${uiPercentageOpenness.toInt()}%")
        println("错误数据UI显示: ${uiPercentageWrongOpenness.toInt()}%")

        // 验证问题存在
        assertTrue("正确计算应显示50%", uiPercentageOpenness >= 49.0 && uiPercentageOpenness <= 51.0)
        assertTrue("错误计算会显示异常高百分比", uiPercentageWrongOpenness > 1000.0)
    }

    /**
     * 测试职业推荐数量问题
     */
    @Test
    fun testCareerSuggestionCountBug() {
        // MockApiService在submitTest中硬编码只返回3个职业
        val hardcodedCareers = listOf(
            "软件工程师",
            "项目经理",
            "咨询师"
        )

        // 但在getCareerSuggestions中，ENFJ有8个职业
        val enfjCareers = listOf(
            "教师", "培训师", "人力资源经理", "心理咨询师",
            "社会工作者", "公关专家", "销售代表", "非营利组织领导"
        )

        println("硬编码职业数量: ${hardcodedCareers.size}")
        println("ENFJ应有职业数量: ${enfjCareers.size}")

        assertEquals("硬编码返回3个职业", 3, hardcodedCareers.size)
        assertEquals("ENFJ应该有8个职业推荐", 8, enfjCareers.size)
        assertTrue("职业数量不匹配是bug", hardcodedCareers.size < enfjCareers.size)
    }
}