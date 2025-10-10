package com.example.myapplication.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * 职业建议数据模型
 * 对应数据库中的career_suggestions表
 */
@Serializable
data class CareerSuggestion(
    @SerialName("id")
    val id: Int? = null,

    @SerialName("mbti_type")
    val mbtiType: String? = null,

    @SerialName("career_zh")
    val careerZh: String? = null,

    @SerialName("career_en")
    val careerEn: String? = null,

    // 支持API返回的可能替代字段
    @SerialName("career")
    val career: String? = null,

    @SerialName("title")
    val title: String? = null,

    @SerialName("name")
    val name: String? = null
) {
    /**
     * 根据语言获取职业名称
     * @param language 语言代码 ("zh" 或 "en")
     * @return 对应语言的职业名称
     */
    fun getCareerName(language: String = "zh"): String {
        return when (language) {
            "en" -> careerEn ?: career ?: title ?: name ?: "未知职业"
            else -> careerZh ?: career ?: title ?: name ?: "未知职业"
        }
    }
}