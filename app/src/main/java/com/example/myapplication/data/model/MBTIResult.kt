package com.example.myapplication.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * MBTI测试结果数据模型
 */
@Serializable
data class MBTIResult(
    @SerialName("type")
    val type: String,

    @SerialName("dimensions")
    val dimensions: Dimensions,

    @SerialName("confidence")
    val confidence: Confidence
)

@Serializable
data class Dimensions(
    @SerialName("EI")
    val EI: String,

    @SerialName("SN")
    val SN: String,

    @SerialName("TF")
    val TF: String,

    @SerialName("JP")
    val JP: String
)

@Serializable
data class Confidence(
    @SerialName("EI")
    val EI: Double,

    @SerialName("SN")
    val SN: Double,

    @SerialName("TF")
    val TF: Double,

    @SerialName("JP")
    val JP: Double
)