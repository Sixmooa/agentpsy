package com.example.myapplication.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * MBTI类型信息数据模型
 * 对应数据库中的mbti_types_info表
 */
@Serializable
data class MBTIType(
    @SerialName("id")
    val id: Int,
    
    @SerialName("type_code")
    val typeCode: String,
    
    @SerialName("type_name_zh")
    val typeNameZh: String,
    
    @SerialName("type_name_en")
    val typeNameEn: String,
    
    @SerialName("description_zh")
    val descriptionZh: String,
    
    @SerialName("description_en")
    val descriptionEn: String,
    
    @SerialName("strengths")
    val strengths: List<String>,
    
    @SerialName("challenges")
    val challenges: List<String>
) {
    /**
     * 根据语言获取类型名称
     * @param language 语言代码 ("zh" 或 "en")
     * @return 对应语言的类型名称
     */
    fun getTypeName(language: String = "zh"): String {
        return when (language) {
            "en" -> typeNameEn
            else -> typeNameZh
        }
    }
    
    /**
     * 根据语言获取描述
     * @param language 语言代码 ("zh" 或 "en")
     * @return 对应语言的描述
     */
    fun getDescription(language: String = "zh"): String {
        return when (language) {
            "en" -> descriptionEn
            else -> descriptionZh
        }
    }
}