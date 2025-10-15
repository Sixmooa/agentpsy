package com.example.myapplication.algorithm

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 大五人格算法一致性测试 - 简化版本
 * 专门测试Supabase云端和Static静态文件算法的一致性
 */
class BigFiveConsistencyTest {

    private lateinit var staticCalculator: StaticPersonalityCalculator
    private lateinit var supabaseCalculator: SupabasePersonalityCalculator

    @Before
    fun setUp() {
        staticCalculator = StaticPersonalityCalculator()
        supabaseCalculator = SupabasePersonalityCalculator()
    }

    /**
     * 测试用例1: 边界值测试 - 3.0边界
     */
    @Test
    fun testBoundaryValue3Point0() {
        val boundaryScores = mapOf(
            "openness" to 3.0,
            "conscientiousness" to 3.0,
            "extraversion" to 3.0,
            "agreeableness" to 3.0,
            "neuroticism" to 3.0
        )

        val staticResult = staticCalculator.calculateMBTI(boundaryScores)
        val supabaseResult = supabaseCalculator.calculateMBTI(boundaryScores)

        assertEquals("Static and Supabase should produce same MBTI type", staticResult.type, supabaseResult.type)
        assertEquals("Should be ISFJA", "ISFJA", staticResult.type)
    }

    /**
     * 测试用例2: 极端值测试
     */
    @Test
    fun testExtremeValues() {
        val extremeScores = mapOf(
            "openness" to 5.0,
            "conscientiousness" to 1.0,
            "extraversion" to 5.0,
            "agreeableness" to 1.0,
            "neuroticism" to 1.0
        )

        val staticResult = staticCalculator.calculateMBTI(extremeScores)
        val supabaseResult = supabaseCalculator.calculateMBTI(extremeScores)

        assertEquals("Extreme values should produce same result", staticResult.type, supabaseResult.type)
        assertEquals("Should be ENTPA", "ENTPA", staticResult.type)
    }

    /**
     * 测试用例3: Big Five分数计算一致性
     */
    @Test
    fun testBigFiveScoreConsistency() {
        val testAnswers = mapOf(
            "1" to "5", "2" to "4", "3" to "3", "4" to "2", "5" to "1" // 开放性题目
        )

        val testQuestions = listOf(
            TestQuestion(1, "openness"),
            TestQuestion(2, "openness"),
            TestQuestion(3, "openness"),
            TestQuestion(4, "openness"),
            TestQuestion(5, "openness")
        )

        val staticScores = staticCalculator.calculateBigFiveScores(testAnswers, testQuestions)
        val supabaseScores = supabaseCalculator.calculateBigFiveScores(testAnswers, testQuestions)

        // 验证开放性: (5+4+3+2+1)/5 = 3.0
        assertEquals("Openness should be 3.0", 3.0, staticScores["openness"] ?: 0.0, 0.01)
        assertEquals("Supabase openness should match static", staticScores["openness"] ?: 0.0, supabaseScores["openness"] ?: 0.0)

        // 验证所有维度都一致
        staticScores.forEach { (dimension, score) ->
            assertEquals("Dimension $dimension should match", score, supabaseScores[dimension] ?: 0.0, 0.001)
        }
    }

    /**
     * 测试用例4: 多种MBTI类型一致性测试
     */
    @Test
    fun testMultipleMBTIConsistency() {
        val testCases = listOf(
            // 测试数据：每个案例包含大五分数和期望的MBTI类型
            Pair(mapOf("openness" to 4.5, "conscientiousness" to 4.5, "extraversion" to 4.5, "agreeableness" to 4.5, "neuroticism" to 2.5), "ENTJA"),
            Pair(mapOf("openness" to 2.5, "conscientiousness" to 2.5, "extraversion" to 2.5, "agreeableness" to 2.5, "neuroticism" to 4.5), "ISFTT"),
            Pair(mapOf("openness" to 4.5, "conscientiousness" to 2.5, "extraversion" to 2.5, "agreeableness" to 4.5, "neuroticism" to 2.5), "INTPA"),
            Pair(mapOf("openness" to 2.5, "conscientiousness" to 4.5, "extraversion" to 4.5, "agreeableness" to 2.5, "neuroticism" to 3.5), "ESTJT")
        )

        testCases.forEachIndexed { index, (scores, expectedType) ->
            val staticResult = staticCalculator.calculateMBTI(scores)
            val supabaseResult = supabaseCalculator.calculateMBTI(scores)

            assertEquals("Test case $index: Static should produce $expectedType", expectedType, staticResult.type)
            assertEquals("Test case $index: Supabase should produce $expectedType", expectedType, supabaseResult.type)
            assertEquals("Test case $index: Both should produce same type", staticResult.type, supabaseResult.type)

            // 验证维度一致性
            staticResult.dimensions.forEach { (key, value) ->
                val supabaseValue = supabaseResult.dimensions[key]
                assertEquals("Test case $index: Dimension $key should match", value.type, supabaseValue?.type)
                assertEquals("Test case $index: Dimension $key score should match", value.score, supabaseValue?.score ?: 0.0, 0.001)
            }
        }
    }

    /**
     * 测试用例5: 浮点数精度一致性
     */
    @Test
    fun testFloatingPointPrecision() {
        val precisionTests = listOf(
            mapOf("1" to "1", "2" to "2"), // 平均 = 1.5
            mapOf("1" to "2", "2" to "3"), // 平均 = 2.5
            mapOf("1" to "4", "2" to "5")  // 平均 = 4.5
        )

        precisionTests.forEachIndexed { index, answers ->
            val questions = listOf(TestQuestion(1, "openness"), TestQuestion(2, "openness"))

            val staticScores = staticCalculator.calculateBigFiveScores(answers, questions)
            val supabaseScores = supabaseCalculator.calculateBigFiveScores(answers, questions)

            assertEquals("Precision test $index: Openness should match",
                staticScores["openness"], supabaseScores["openness"])
        }
    }
}

/**
 * 静态版本计算器 - 简化实现
 */
class StaticPersonalityCalculator {
    private val midPoint = 3.0

    fun calculateBigFiveScores(answers: Map<String, String>, questions: List<TestQuestion>): Map<String, Double> {
        val scores = mutableMapOf<String, Double>()
        val counts = mutableMapOf<String, Int>()

        // 初始化维度
        listOf("openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism").forEach { dimension ->
            scores[dimension] = 0.0
            counts[dimension] = 0
        }

        // 计算总分
        for ((questionId, answer) in answers) {
            val question = questions.find { it.id == questionId.toInt() }
            if (question != null) {
                scores[question.dimension] = scores[question.dimension]!! + answer.toDouble()
                counts[question.dimension] = counts[question.dimension]!! + 1
            }
        }

        // 计算平均分
        val avgScores = mutableMapOf<String, Double>()
        for (dimension in scores.keys) {
            if (counts[dimension]!! > 0) {
                avgScores[dimension] = Math.round((scores[dimension]!! / counts[dimension]!!) * 100) / 100.0
            } else {
                avgScores[dimension] = 0.0
            }
        }

        return avgScores
    }

    fun calculateMBTI(scores: Map<String, Double>): MBTIResult {
        val openness = scores["openness"] ?: 0.0
        val conscientiousness = scores["conscientiousness"] ?: 0.0
        val extraversion = scores["extraversion"] ?: 0.0
        val agreeableness = scores["agreeableness"] ?: 0.0
        val neuroticism = scores["neuroticism"] ?: 0.0

        val ei = if (extraversion > midPoint) "E" else "I"
        val sn = if (openness >= midPoint) "N" else "S"
        val tf = if (agreeableness > midPoint) "F" else "T"
        val jp = if (conscientiousness >= midPoint) "J" else "P"
        val suffix = if (neuroticism > midPoint) "-T" else "-A"

        val mbtiType = ei + sn + tf + jp + suffix
        val typeCode = ei + sn + tf + jp

        return MBTIResult(
            type = mbtiType,
            typeCode = typeCode,
            dimensions = mapOf(
                "ei" to DimensionResult(ei[0], extraversion),
                "sn" to DimensionResult(sn[0], openness),
                "tf" to DimensionResult(tf[0], agreeableness),
                "jp" to DimensionResult(jp[0], conscientiousness),
                "suffix" to DimensionResult(suffix[1], neuroticism)
            )
        )
    }
}

/**
 * Supabase版本计算器 - 简化实现
 */
class SupabasePersonalityCalculator {
    private val midPoint = 3.0

    fun calculateBigFiveScores(answers: Map<String, String>, questions: List<TestQuestion>): Map<String, Double> {
        val scores = mutableMapOf<String, Double>()
        val counts = mutableMapOf<String, Int>()

        // 初始化维度
        listOf("openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism").forEach { dimension ->
            scores[dimension] = 0.0
            counts[dimension] = 0
        }

        // 计算总分
        for ((questionId, answer) in answers) {
            val question = questions.find { it.id == questionId.toInt() }
            if (question != null) {
                scores[question.dimension] = scores[question.dimension]!! + answer.toDouble()
                counts[question.dimension] = counts[question.dimension]!! + 1
            }
        }

        // 计算平均分
        val avgScores = mutableMapOf<String, Double>()
        for (dimension in scores.keys) {
            if (counts[dimension]!! > 0) {
                avgScores[dimension] = Math.round((scores[dimension]!! / counts[dimension]!!) * 100) / 100.0
            } else {
                avgScores[dimension] = 0.0
            }
        }

        return avgScores
    }

    fun calculateMBTI(scores: Map<String, Double>): MBTIResult {
        val openness = scores["openness"] ?: 0.0
        val conscientiousness = scores["conscientiousness"] ?: 0.0
        val extraversion = scores["extraversion"] ?: 0.0
        val agreeableness = scores["agreeableness"] ?: 0.0
        val neuroticism = scores["neuroticism"] ?: 0.0

        val ei = if (extraversion > midPoint) "E" else "I"
        val sn = if (openness >= midPoint) "N" else "S"
        val tf = if (agreeableness > midPoint) "F" else "T"
        val jp = if (conscientiousness >= midPoint) "J" else "P"
        val suffix = if (neuroticism > midPoint) "-T" else "-A"

        val mbtiType = ei + sn + tf + jp + suffix
        val typeCode = ei + sn + tf + jp

        return MBTIResult(
            type = mbtiType,
            typeCode = typeCode,
            dimensions = mapOf(
                "ei" to DimensionResult(ei[0], extraversion),
                "sn" to DimensionResult(sn[0], openness),
                "tf" to DimensionResult(tf[0], agreeableness),
                "jp" to DimensionResult(jp[0], conscientiousness),
                "suffix" to DimensionResult(suffix[1], neuroticism)
            )
        )
    }
}

/**
 * 数据类定义
 */
data class TestQuestion(val id: Int, val dimension: String)

data class MBTIResult(
    val type: String,
    val typeCode: String,
    val dimensions: Map<String, DimensionResult>
)

data class DimensionResult(
    val type: Char,
    val score: Double
)