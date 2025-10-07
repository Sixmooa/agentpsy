package com.example.myapplication.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * API通用响应模型
 */
@Serializable
data class ApiResponse<T>(
    @SerialName("success")
    val success: Boolean,
    
    @SerialName("data")
    val data: T? = null,
    
    @SerialName("error")
    val error: String? = null
)

/**
 * 测试提交响应模型
 */
@Serializable
data class TestSubmissionResponse(
    @SerialName("success")
    val success: Boolean,
    
    @SerialName("report")
    val report: TestReport? = null,
    
    @SerialName("saveResult")
    val saveResult: Boolean = false
)

/**
 * 测试报告模型
 */
@Serializable
data class TestReport(
    @SerialName("timestamp")
    val timestamp: String,
    
    @SerialName("language")
    val language: String,
    
    @SerialName("mbtiType")
    val mbtiType: String,
    
    @SerialName("bigFiveScores")
    val bigFiveScores: BigFiveScores,
    
    @SerialName("mbtiTypeInfo")
    val mbtiTypeInfo: MBTIType,
    
    @SerialName("careerSuggestions")
    val careerSuggestions: List<CareerSuggestion>
)

/**
 * 测试提交请求模型
 */
@Serializable
data class TestSubmissionRequest(
    @SerialName("answers")
    val answers: List<SubmitAnswerRequest>,
    
    @SerialName("language")
    val language: String = "zh",
    
    @SerialName("saveResult")
    val saveResult: Boolean = false
)