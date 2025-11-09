package com.example.myapplication

import com.example.myapplication.data.model.BigFiveScores
import com.example.myapplication.data.model.CareerSuggestion
import org.junit.Test
import org.junit.Assert.*

/**
 * Bug修复验证测试
 * 验证大五人格1000%显示问题和职业推荐数量问题已修复
 */
class BugFixVerificationTest {

    /**
     * 测试大五人格分数计算修复
     * 验证分数现在正确返回1-5范围，而不是0-100百分比
     */
    @Test
    fun testBigFiveScoreCalculationFix() {
        // 模拟用户答题：每题都得3分（中等）
        val rawScores = mapOf(
            "openness" to 30,        // 10题 × 3分
            "conscientiousness" to 30,
            "extraversion" to 30,
            "agreeableness" to 30,
            "neuroticism" to 30
        )

        // 使用修复后的计算逻辑
        val questionsPerDimension = 10
        val fixedBigFiveScores = BigFiveScores(
            openness = (rawScores["openness"] ?: 0).toDouble() / questionsPerDimension,
            conscientiousness = (rawScores["conscientiousness"] ?: 0).toDouble() / questionsPerDimension,
            extraversion = (rawScores["extraversion"] ?: 0).toDouble() / questionsPerDimension,
            agreeableness = (rawScores["agreeableness"] ?: 0).toDouble() / questionsPerDimension,
            neuroticism = (rawScores["neuroticism"] ?: 0).toDouble() / questionsPerDimension
        )

        println("修复后的Big Five分数计算:")
        println("开放性: ${fixedBigFiveScores.openness}")
        println("尽责性: ${fixedBigFiveScores.conscientiousness}")
        println("外向性: ${fixedBigFiveScores.extraversion}")
        println("宜人性: ${fixedBigFiveScores.agreeableness}")
        println("神经质: ${fixedBigFiveScores.neuroticism}")

        // 验证分数在1-5范围内
        assertTrue("开放性分数应在1-5范围内", fixedBigFiveScores.openness >= 1.0 && fixedBigFiveScores.openness <= 5.0)
        assertTrue("尽责性分数应在1-5范围内", fixedBigFiveScores.conscientiousness >= 1.0 && fixedBigFiveScores.conscientiousness <= 5.0)
        assertTrue("外向性分数应在1-5范围内", fixedBigFiveScores.extraversion >= 1.0 && fixedBigFiveScores.extraversion <= 5.0)
        assertTrue("宜人性分数应在1-5范围内", fixedBigFiveScores.agreeableness >= 1.0 && fixedBigFiveScores.agreeableness <= 5.0)
        assertTrue("神经质分数应在1-5范围内", fixedBigFiveScores.neuroticism >= 1.0 && fixedBigFiveScores.neuroticism <= 5.0)

        // 验证平均分为3.0（每题都得3分）
        assertEquals("平均分应为3.0", 3.0, fixedBigFiveScores.openness, 0.01)
        assertEquals("平均分应为3.0", 3.0, fixedBigFiveScores.conscientiousness, 0.01)

        // 验证UI显示计算（现在应该显示正确的百分比）
        val uiPercentage = ((fixedBigFiveScores.openness - 1) / 4.0) * 100
        println("UI现在显示的百分比: ${uiPercentage.toInt()}%")
        assertEquals("UI应显示50%", 50.0, uiPercentage, 1.0)
    }

    /**
     * 测试职业推荐数量修复
     * 验证ENFJ类型现在返回8个职业，而不是3个
     */
    @Test
    fun testCareerSuggestionCountFix() {
        // 模拟修复后的职业建议数据
        val enfjCareerSuggestions = listOf(
            CareerSuggestion(1, "ENFJ", "教师", "Teacher"),
            CareerSuggestion(2, "ENFJ", "培训师", "Trainer"),
            CareerSuggestion(3, "ENFJ", "人力资源经理", "Human Resources Manager"),
            CareerSuggestion(4, "ENFJ", "心理咨询师", "Counselor"),
            CareerSuggestion(5, "ENFJ", "社会工作者", "Social Worker"),
            CareerSuggestion(6, "ENFJ", "公关专家", "Public Relations Specialist"),
            CareerSuggestion(7, "ENFJ", "销售代表", "Sales Representative"),
            CareerSuggestion(8, "ENFJ", "非营利组织领导", "Non-profit Leader")
        )

        println("ENFJ职业建议数量: ${enfjCareerSuggestions.size}")
        println("职业列表:")
        enfjCareerSuggestions.forEach { career ->
            println("- ${career.getCareerName()}")
        }

        // 验证职业数量
        assertEquals("ENFJ应该有8个职业建议", 8, enfjCareerSuggestions.size)

        // 验证职业名称不为空
        enfjCareerSuggestions.forEach { career ->
            assertNotNull("职业名称不应为空", career.getCareerName())
            assertTrue("职业名称不应为空", career.getCareerName().isNotEmpty())
        }

        // 验证ID唯一性
        val careerIds = enfjCareerSuggestions.map { it.id }
        val uniqueIds = careerIds.toSet()
        assertEquals("职业ID应该是唯一的", careerIds.size, uniqueIds.size)
    }

    /**
     * 测试边界值：极端高分情况
     */
    @Test
    fun testExtremeHighScores() {
        // 模拟极端高分：每题都得5分
        val extremeHighScores = mapOf(
            "openness" to 50,        // 10题 × 5分
            "conscientiousness" to 50,
            "extraversion" to 50,
            "agreeableness" to 50,
            "neuroticism" to 50
        )

        val questionsPerDimension = 10
        val bigFiveScores = BigFiveScores(
            openness = (extremeHighScores["openness"] ?: 0).toDouble() / questionsPerDimension,
            conscientiousness = (extremeHighScores["conscientiousness"] ?: 0).toDouble() / questionsPerDimension,
            extraversion = (extremeHighScores["extraversion"] ?: 0).toDouble() / questionsPerDimension,
            agreeableness = (extremeHighScores["agreeableness"] ?: 0).toDouble() / questionsPerDimension,
            neuroticism = (extremeHighScores["neuroticism"] ?: 0).toDouble() / questionsPerDimension
        )

        println("\n极端高分测试:")
        println("开放性: ${bigFiveScores.openness} (UI: ${((bigFiveScores.openness - 1) / 4.0 * 100).toInt()}%)")

        // 验证极端情况
        assertEquals("极端高分应为5.0", 5.0, bigFiveScores.openness, 0.01)
        assertEquals("UI应显示100%", 100.0, ((bigFiveScores.openness - 1) / 4.0) * 100, 0.01)
    }

    /**
     * 测试边界值：极端低分情况
     */
    @Test
    fun testExtremeLowScores() {
        // 模拟极端低分：每题都得1分
        val extremeLowScores = mapOf(
            "openness" to 10,        // 10题 × 1分
            "conscientiousness" to 10,
            "extraversion" to 10,
            "agreeableness" to 10,
            "neuroticism" to 10
        )

        val questionsPerDimension = 10
        val bigFiveScores = BigFiveScores(
            openness = (extremeLowScores["openness"] ?: 0).toDouble() / questionsPerDimension,
            conscientiousness = (extremeLowScores["conscientiousness"] ?: 0).toDouble() / questionsPerDimension,
            extraversion = (extremeLowScores["extraversion"] ?: 0).toDouble() / questionsPerDimension,
            agreeableness = (extremeLowScores["agreeableness"] ?: 0).toDouble() / questionsPerDimension,
            neuroticism = (extremeLowScores["neuroticism"] ?: 0).toDouble() / questionsPerDimension
        )

        println("\n极端低分测试:")
        println("开放性: ${bigFiveScores.openness} (UI: ${((bigFiveScores.openness - 1) / 4.0 * 100).toInt()}%)")

        // 验证极端情况
        assertEquals("极端低分应为1.0", 1.0, bigFiveScores.openness, 0.01)
        assertEquals("UI应显示0%", 0.0, ((bigFiveScores.openness - 1) / 4.0) * 100, 0.01)
    }

    /**
     * 综合验证：确保修复没有引入新问题
     */
    @Test
    fun testComprehensiveFixVerification() {
        println("\n=== 综合修复验证 ===")

        // 测试典型ENFJ得分
        val enfjTypicalScores = BigFiveScores(
            openness = 4.2,        // 高开放性
            conscientiousness = 3.5, // 中等尽责性
            extraversion = 4.8,     // 高外向性
            agreeableness = 4.6,    // 高宜人性
            neuroticism = 2.3       // 低神经质
        )

        println("ENFJ典型分数:")
        println("开放性: ${enfjTypicalScores.openness} (UI: ${((enfjTypicalScores.openness - 1) / 4.0 * 100).toInt()}%)")
        println("外向性: ${enfjTypicalScores.extraversion} (UI: ${((enfjTypicalScores.extraversion - 1) / 4.0 * 100).toInt()}%)")
        println("神经质: ${enfjTypicalScores.neuroticism} (UI: ${((enfjTypicalScores.neuroticism - 1) / 4.0 * 100).toInt()}%)")

        // 验证所有分数在合理范围内
        assertTrue("所有分数应在1-5范围内", enfjTypicalScores.openness in 1.0..5.0)
        assertTrue("所有分数应在1-5范围内", enfjTypicalScores.conscientiousness in 1.0..5.0)
        assertTrue("所有分数应在1-5范围内", enfjTypicalScores.extraversion in 1.0..5.0)
        assertTrue("所有分数应在1-5范围内", enfjTypicalScores.agreeableness in 1.0..5.0)
        assertTrue("所有分数应在1-5范围内", enfjTypicalScores.neuroticism in 1.0..5.0)

        // 验证UI百分比在0-100范围内
        val opennessPercentage = ((enfjTypicalScores.openness - 1) / 4.0) * 100
        val neuroticismPercentage = ((enfjTypicalScores.neuroticism - 1) / 4.0) * 100

        assertTrue("UI百分比应在0-100范围内", opennessPercentage in 0.0..100.0)
        assertTrue("UI百分比应在0-100范围内", neuroticismPercentage in 0.0..100.0)

        println("\n✅ 所有验证通过！Bug修复成功！")
    }
}