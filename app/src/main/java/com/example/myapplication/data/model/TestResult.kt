package com.example.myapplication.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * 测试结果数据模型
 * 对应数据库中的test_results表
 */
@Serializable
data class TestResult(
    @SerialName("id")
    val id: Int? = null,
    
    @SerialName("user_id")
    val userId: String? = null,
    
    @SerialName("mbti_type")
    val mbtiType: String,
    
    @SerialName("openness_score")
    val opennessScore: Double,
    
    @SerialName("conscientiousness_score")
    val conscientiousnessScore: Double,
    
    @SerialName("extraversion_score")
    val extraversionScore: Double,
    
    @SerialName("agreeableness_score")
    val agreeablenessScore: Double,
    
    @SerialName("neuroticism_score")
    val neuroticismScore: Double,
    
    @SerialName("created_at")
    val createdAt: String? = null
)

/**
 * Big Five人格维度分数
 */
@Serializable
data class BigFiveScores(
    @SerialName("openness")
    val openness: Double,

    @SerialName("conscientiousness")
    val conscientiousness: Double,

    @SerialName("extraversion")
    val extraversion: Double,

    @SerialName("agreeableness")
    val agreeableness: Double,

    @SerialName("neuroticism")
    val neuroticism: Double
) {
    /**
     * 获取格式化的得分文本
     * @param dimension 维度名称
     * @return 格式化的得分字符串 (例如: "4.2分")
     */
    fun getFormattedScore(dimension: String): String {
        val score = when (dimension.lowercase()) {
            "openness", "开放性" -> openness
            "conscientiousness", "尽责性" -> conscientiousness
            "extraversion", "外向性" -> extraversion
            "agreeableness", "宜人性" -> agreeableness
            "neuroticism", "神经质" -> neuroticism
            else -> 0.0
        }
        return String.format("%.1f分", score)
    }

    /**
     * 获取维度得分 (0-100范围)
     * @param dimension 维度名称
     * @return 得分值
     */
    fun getScore(dimension: String): Double {
        return when (dimension.lowercase()) {
            "openness", "开放性" -> openness
            "conscientiousness", "尽责性" -> conscientiousness
            "extraversion", "外向性" -> extraversion
            "agreeableness", "宜人性" -> agreeableness
            "neuroticism", "神经质" -> neuroticism
            else -> 0.0
        }
    }

    /**
     * 获取所有维度的平均分
     */
    fun getAverageScore(): Double {
        return (openness + conscientiousness + extraversion + agreeableness + neuroticism) / 5.0
    }

    /**
     * 获取最高分的维度
     * @return Pair<维度名称, 得分>
     */
    fun getHighestDimension(): Pair<String, Double> {
        val scoreList = listOf(
            "开放性" to openness,
            "尽责性" to conscientiousness,
            "外向性" to extraversion,
            "宜人性" to agreeableness,
            "神经质" to neuroticism
        )
        return scoreList.maxByOrNull { it.second } ?: Pair("未知", 0.0)
    }

    /**
     * 获取最低分的维度
     * @return Pair<维度名称, 得分>
     */
    fun getLowestDimension(): Pair<String, Double> {
        val scoreList = listOf(
            "开放性" to openness,
            "尽责性" to conscientiousness,
            "外向性" to extraversion,
            "宜人性" to agreeableness,
            "神经质" to neuroticism
        )
        return scoreList.minByOrNull { it.second } ?: Pair("未知", 0.0)
    }

    companion object {
        /**
         * 创建一个示例对象，用于测试
         */
        fun createSample(): BigFiveScores {
            return BigFiveScores(
                openness = 75.0,
                conscientiousness = 60.0,
                extraversion = 45.0,
                agreeableness = 80.0,
                neuroticism = 30.0
            )
        }
    }
}