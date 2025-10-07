package com.example.myapplication.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * 测试题目数据模型
 * 对应数据库中的questions表
 */
@Serializable
data class Question(
    @SerialName("id")
    val id: Int,
    
    @SerialName("question_text_zh")
    val questionTextZh: String,
    
    @SerialName("question_text_en")
    val questionTextEn: String,
    
    @SerialName("dimension")
    val dimension: String,
    
    @SerialName("reverse")
    val reverse: Boolean = false,
    
    @SerialName("created_at")
    val createdAt: String? = null
) {
    /**
     * 根据语言获取题目文本
     * @param language 语言代码 ("zh" 或 "en")
     * @return 对应语言的题目文本
     */
    fun getQuestionText(language: String = "zh"): String {
        return when (language) {
            "en" -> questionTextEn
            else -> questionTextZh
        }
    }
}