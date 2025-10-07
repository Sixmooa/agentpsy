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
)