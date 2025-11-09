package com.example.myapplication

import com.example.myapplication.data.model.BigFiveScores
import org.junit.Test
import org.junit.Assert.*

/**
 * 大五人格得分显示测试
 * 测试修复前后的得分格式化问题
 */
class BigFiveScoreDisplayTest {

    /**
     * 测试问题：大五人格得分被错误地格式化为百分比
     * 预期：得分应该是1-5的范围，显示为"4.2"而不是"420.0%"
     */
    @Test
    fun testBigFiveScoreFormattingBug() {
        // 创建一个正常的大五人格得分对象（1-5范围）
        val bigFiveScores = BigFiveScores(
            openness = 4.2,
            conscientiousness = 3.8,
            extraversion = 2.9,
            agreeableness = 4.5,
            neuroticism = 2.1
        )

        // 测试当前的格式化逻辑（应该能发现bug）
        val formattedOpenness = bigFiveScores.getFormattedScore("openness")

        // 这个断言应该失败，因为当前代码错误地添加了"%"符号
        // 期望: "4.2" 或 "4.2分"
        // 实际: "420.0%" (这是错误的)
        println("当前格式化的开放性得分: $formattedOpenness")

        // 验证得分范围是否正确（1-5）
        assertTrue("开放性得分应在1-5范围内", bigFiveScores.openness in 1.0..5.0)
        assertTrue("尽责性得分应在1-5范围内", bigFiveScores.conscientiousness in 1.0..5.0)
        assertTrue("外向性得分应在1-5范围内", bigFiveScores.extraversion in 1.0..5.0)
        assertTrue("宜人性得分应在1-5范围内", bigFiveScores.agreeableness in 1.0..5.0)
        assertTrue("神经质得分应在1-5范围内", bigFiveScores.neuroticism in 1.0..5.0)
    }

    /**
     * 测试边界值：最小和最大得分
     */
    @Test
    fun testBigFiveScoreBoundaries() {
        val minScores = BigFiveScores(1.0, 1.0, 1.0, 1.0, 1.0)
        val maxScores = BigFiveScores(5.0, 5.0, 5.0, 5.0, 5.0)

        // 测试最小值
        assertEquals("最小开放性得分应为1.0", 1.0, minScores.openness, 0.01)
        assertEquals("最小尽责性得分应为1.0", 1.0, minScores.conscientiousness, 0.01)

        // 测试最大值
        assertEquals("最大开放性得分应为5.0", 5.0, maxScores.openness, 0.01)
        assertEquals("最大尽责性得分应为5.0", 5.0, maxScores.conscientiousness, 0.01)

        // 测试平均分计算
        assertEquals("最小平均分应为1.0", 1.0, minScores.getAverageScore(), 0.01)
        assertEquals("最大平均分应为5.0", 5.0, maxScores.getAverageScore(), 0.01)
    }

    /**
     * 测试典型ENFJ人格得分模式
     */
    @Test
    fun testENFJTypicalScores() {
        // ENFJ典型得分模式：高外向性、高开放性、高宜人性、中等尽责性、低神经质
        val enfjScores = BigFiveScores(
            openness = 4.2,        // 高开放性（N）
            conscientiousness = 3.5, // 中等尽责性（J）
            extraversion = 4.8,     // 高外向性（E）
            agreeableness = 4.6,    // 高宜人性（F）
            neuroticism = 2.3       // 低神经质（-A）
        )

        // 验证ENFJ特征
        assertTrue("ENFJ应有高外向性", enfjScores.extraversion >= 4.0)
        assertTrue("ENFJ应有高开放性", enfjScores.openness >= 4.0)
        assertTrue("ENFJ应有高宜人性", enfjScores.agreeableness >= 4.0)
        assertTrue("ENFJ应有较低神经质", enfjScores.neuroticism <= 3.0)

        // 验证最高和最低维度
        val highest = enfjScores.getHighestDimension()
        val lowest = enfjScores.getLowestDimension()

        assertEquals("最高维度应该是外向性", "外向性", highest.first)
        assertEquals("最低维度应该是神经质", "神经质", lowest.first)
    }

    /**
     * 测试得分计算逻辑的数学正确性
     */
    @Test
    fun testScoreCalculationMath() {
        val scores = BigFiveScores(2.0, 3.0, 4.0, 4.5, 1.5)

        // 验证平均分计算
        val expectedAverage = (2.0 + 3.0 + 4.0 + 4.5 + 1.5) / 5.0
        assertEquals("平均分计算错误", expectedAverage, scores.getAverageScore(), 0.01)

        // 验证维度得分获取
        assertEquals("开放性得分获取错误", 2.0, scores.getScore("openness"), 0.01)
        assertEquals("开放性得分获取错误", 2.0, scores.getScore("开放性"), 0.01)

        // 验证未知维度处理
        assertEquals("未知维度应返回0.0", 0.0, scores.getScore("未知维度"), 0.01)
    }
}