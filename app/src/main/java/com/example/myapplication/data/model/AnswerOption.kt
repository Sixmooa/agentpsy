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
    val id: Int,
    
    @SerialName("option_text_zh")
    val optionTextZh: String,
    
    @SerialName("option_text_en")
    val optionTextEn: String,
    
    @SerialName("score")
    val score: Int
) {
    /**
     * 根据语言获取选项文本
     * @param language 语言代码 ("zh" 或 "en")
     * @return 对应语言的选项文本
     */
    fun getOptionText(language: String = "zh"): String {
        return when (language) {
            "en" -> optionTextEn
            else -> optionTextZh
        }
    }
}