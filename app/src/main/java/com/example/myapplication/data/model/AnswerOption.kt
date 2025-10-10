package com.example.myapplication.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * 答案选项数据模型
 * 对应数据库中的answer_options表
 */
@Serializable
data class AnswerOption(
    @SerialName("id")
    val id: Int? = null,

    @SerialName("option_text_zh")
    val optionTextZh: String? = null,

    @SerialName("option_text_en")
    val optionTextEn: String? = null,

    @SerialName("score")
    val score: Int? = null,

    // 支持API返回的额外字段
    @SerialName("value")
    val value: Int? = null,

    @SerialName("text")
    val text: String? = null
) {
    /**
     * 根据语言获取选项文本
     * @param language 语言代码 ("zh" 或 "en")
     * @return 对应语言的选项文本
     */
    fun getOptionText(language: String = "zh"): String {
        return when (language) {
            "en" -> optionTextEn ?: text ?: "未知选项"
            else -> optionTextZh ?: text ?: "未知选项"
        }
    }

    /**
     * 获取答案分数
     * 优先使用score，如果为null则使用value
     */
    fun getScore(): Int {
        return score ?: value ?: 0
    }
}