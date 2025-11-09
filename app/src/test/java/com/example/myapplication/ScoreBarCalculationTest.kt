package com.example.myapplication

import org.junit.Test
import org.junit.Assert.*

/**
 * 得分条计算逻辑测试
 * 测试得分条的颜色判断和进度计算问题
 */
class ScoreBarCalculationTest {

    /**
     * 测试得分条颜色判断逻辑的错误
     * 当前逻辑：score >= 75, score >= 50，但score范围是1-5
     */
    @Test
    fun testScoreBarColorLogicBug() {
        // 模拟当前的错误逻辑
        fun getCurrentWrongColor(score: Double): String {
            return when {
                score >= 75 -> "primary"   // 错误：score是1-5，不可能>=75
                score >= 50 -> "secondary" // 错误：score是1-5，不可能>=50
                else -> "tertiary"
            }
        }

        // 模拟修复后的正确逻辑
        fun getCorrectColor(score: Double): String {
            val percentage = ((score - 1) / 4.0) * 100 // 将1-5转换为0-100百分比
            return when {
                percentage >= 75 -> "primary"
                percentage >= 50 -> "secondary"
                else -> "tertiary"
            }
        }

        // 测试典型ENFJ得分
        val testScores = listOf(4.2, 3.5, 4.8, 4.6, 2.3)

        println("得分条颜色逻辑测试:")
        testScores.forEach { score ->
            val wrongColor = getCurrentWrongColor(score)
            val correctColor = getCorrectColor(score)
            val percentage = ((score - 1) / 4.0) * 100

            println("得分: $score (${percentage.toInt()}%) -> 错误颜色: $wrongColor, 正确颜色: $correctColor")

            // 验证当前逻辑总是返回"tertiary"
            assertEquals("当前逻辑错误地总是返回tertiary", "tertiary", wrongColor)

            // 验证正确逻辑根据百分比返回不同颜色
            assertTrue("正确逻辑应该返回有效颜色",
                correctColor in listOf("primary", "secondary", "tertiary"))
        }
    }

    /**
     * 测试得分条进度计算
     * 验证 ((score - 1) / 4.0) 的计算是否正确
     */
    @Test
    fun testProgressBarCalculation() {
        fun calculateProgress(score: Double): Float {
            return ((score - 1) / 4.0).toFloat()
        }

        // 测试边界值
        assertEquals("最低分1.0应该对应0%进度", 0.0f, calculateProgress(1.0), 0.01f)
        assertEquals("最高分5.0应该对应100%进度", 1.0f, calculateProgress(5.0), 0.01f)
        assertEquals("中间分3.0应该对应50%进度", 0.5f, calculateProgress(3.0), 0.01f)

        // 测试典型ENFJ得分
        val enfjScores = mapOf(
            "开放性" to 4.2,
            "尽责性" to 3.5,
            "外向性" to 4.8,
            "宜人性" to 4.6,
            "神经质" to 2.3
        )

        println("\n得分条进度计算:")
        enfjScores.forEach { (dimension, score) ->
            val progress = calculateProgress(score)
            val percentage = (progress * 100).toInt()
            println("$dimension: $score -> $progress (${percentage}%)")

            assertTrue("进度应该在0-1范围内", progress in 0.0f..1.0f)
        }
    }

    /**
     * 测试得分显示格式
     * 验证从分数到百分比显示的转换
     */
    @Test
    fun testScoreDisplayFormat() {
        fun formatAsPercentage(score: Double): String {
            val percentage = ((score - 1) / 4.0) * 100
            return "${percentage.toInt()}%"
        }

        fun formatAsScore(score: Double): String {
            return "${score.toInt()}分"
        }

        val testScore = 4.2

        val percentageDisplay = formatAsPercentage(testScore)
        val scoreDisplay = formatAsScore(testScore)

        println("\n得分显示格式测试:")
        println("原始得分: $testScore")
        println("百分比显示: $percentageDisplay")
        println("分数显示: $scoreDisplay")

        assertEquals("4.2分应该显示为80%", "80%", percentageDisplay)
        assertEquals("4.2分应该显示为4分", "4分", scoreDisplay)
    }

    /**
     * 综合测试：验证得分条的完整显示逻辑
     */
    @Test
    fun testCompleteScoreBarDisplay() {
        data class ScoreBarDisplay(
            val score: Double,
            val percentage: Int,
            val progress: Float,
            val color: String,
            val displayText: String
        )

        fun createScoreBarDisplay(score: Double): ScoreBarDisplay {
            val percentage = ((score - 1) / 4.0) * 100
            val progress = (percentage / 100).toFloat()
            val color = when {
                percentage >= 75 -> "primary"
                percentage >= 50 -> "secondary"
                else -> "tertiary"
            }
            val displayText = "${percentage.toInt()}%"

            return ScoreBarDisplay(score, percentage.toInt(), progress, color, displayText)
        }

        // 测试ENFJ典型得分
        val enfjScores = listOf(4.2, 3.5, 4.8, 4.6, 2.3)

        println("\n完整得分条显示测试:")
        enfjScores.forEach { score ->
            val display = createScoreBarDisplay(score)
            println("得分: ${display.score} | 百分比: ${display.percentage}% | 进度: ${display.progress} | 颜色: ${display.color} | 显示: ${display.displayText}")

            assertTrue("百分比应该在0-100范围内", display.percentage in 0..100)
            assertTrue("进度应该在0-1范围内", display.progress in 0.0f..1.0f)
            assertTrue("颜色应该是有效的", display.color in listOf("primary", "secondary", "tertiary"))
        }
    }
}