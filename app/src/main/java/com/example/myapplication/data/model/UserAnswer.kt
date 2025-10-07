package com.example.myapplication.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/**
 * 用户答案数据模型
 * 对应数据库中的user_answers表
 */
@Serializable
data class UserAnswer(
    @SerialName("id")
    val id: Int? = null,
    
    @SerialName("test_result_id")
    val testResultId: Int? = null,
    
    @SerialName("question_id")
    val questionId: Int,
    
    @SerialName("answer_score")
    val answerScore: Int,
    
    @SerialName("created_at")
    val createdAt: String? = null
)

/**
 * 用于提交测试的答案数据
 */
@Serializable
data class SubmitAnswerRequest(
    @SerialName("questionId")
    val questionId: Int,
    
    @SerialName("answerScore")
    val answerScore: Int
)