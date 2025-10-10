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
    val id: Int? = null,

    @SerialName("type_code")
    val typeCode: String? = null,

    @SerialName("type_name_zh")
    val typeNameZh: String? = null,

    @SerialName("type_name_en")
    val typeNameEn: String? = null,

    @SerialName("description_zh")
    val descriptionZh: String? = null,

    @SerialName("description_en")
    val descriptionEn: String? = null,

    @SerialName("strengths")
    val strengths: List<String>? = null,

    @SerialName("challenges")
    val challenges: List<String>? = null
) {

    /**
     * 创建一个基于MBTI结果的简化版本
     */
    companion object {
        fun fromMBTIResult(mbtiResult: MBTIResult): MBTIType {
            val typeCode = mbtiResult.type.replace("-A", "").replace("-T", "")
            return MBTIType(
                id = null,
                typeCode = typeCode,
                typeNameZh = mbtiResult.type,
                typeNameEn = mbtiResult.type,
                descriptionZh = "${mbtiResult.type}类型",
                descriptionEn = "${mbtiResult.type} Type",
                strengths = emptyList(),
                challenges = emptyList()
            )
        }
    }
    /**
     * 根据语言获取类型名称
     * @param language 语言代码 ("zh" 或 "en")
     * @return 对应语言的类型名称
     */
    fun getTypeName(language: String = "zh"): String {
        return when (language) {
            "en" -> typeNameEn ?: "未知类型"
            else -> typeNameZh ?: "未知类型"
        }
    }

    /**
     * 根据语言获取描述
     * @param language 语言代码 ("zh" 或 "en")
     * @return 对应语言的描述
     */
    fun getDescription(language: String = "zh"): String {
        return when (language) {
            "en" -> descriptionEn ?: "暂无描述"
            else -> descriptionZh ?: "暂无描述"
        }
    }
}