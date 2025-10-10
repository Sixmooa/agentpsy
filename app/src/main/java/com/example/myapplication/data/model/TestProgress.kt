package com.example.myapplication.data.model

import kotlinx.serialization.Serializable

/**
 * 测试进度数据模型
 * 用于保存和恢复完整的答题进度
 */
@Serializable
data class TestProgress(
    val questions: List<Question> = emptyList(),
    val answerOptions: List<AnswerOption> = emptyList(),
    val userAnswers: List<SubmitAnswerRequest> = emptyList(),
    val currentQuestionIndex: Int = 0,
    val currentLanguage: String = "zh"
)