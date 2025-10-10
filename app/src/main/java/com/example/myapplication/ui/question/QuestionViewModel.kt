package com.example.myapplication.ui.question

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.TestProgressDataStore
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString

/**
 * 答题界面ViewModel
 * 管理答题状态和业务逻辑，支持数据持久化
 */
class QuestionViewModel(
    private val repository: PersonalityTestRepository,
    private val dataStore: TestProgressDataStore? = null,
    private val coroutineScope: CoroutineScope? = null
) : ViewModel() {
    
    // 使用注入的协程作用域或默认的viewModelScope
    private val scope: CoroutineScope = coroutineScope ?: viewModelScope
    
    // UI状态
    private val _uiState = MutableStateFlow(QuestionUiState())
    val uiState: StateFlow<QuestionUiState> = _uiState.asStateFlow()
    
    // 题目列表
    private val _questions = mutableListOf<Question>()
    
    // 答案选项
    private val _answerOptions = mutableListOf<AnswerOption>()
    
    // 用户答案
    private val _userAnswers = mutableListOf<SubmitAnswerRequest>()
    
    init {
        // 首先尝试恢复保存的进度，如果没有则加载新数据
        restoreProgressOrLoadNew()
    }
    
    /**
     * 加载初始数据
     */
    fun loadInitialData() {
        scope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            loadDataWithLanguage(_uiState.value.currentLanguage)
        }
    }
    
    /**
     * 选择答案
     */
    fun selectAnswer(answerOption: AnswerOption) {
        val currentState = _uiState.value
        val currentQuestion = currentState.currentQuestion ?: return
        
        // 保存用户答案
        val userAnswer = SubmitAnswerRequest(
            questionId = currentQuestion.id,
            answerScore = answerOption.getScore()
        )
        
        // 更新或添加答案
        val existingIndex = _userAnswers.indexOfFirst { it.questionId == currentQuestion.id }
        if (existingIndex >= 0) {
            _userAnswers[existingIndex] = userAnswer
        } else {
            _userAnswers.add(userAnswer)
        }
        
        // 保存进度到持久化存储
        saveProgress()

        _uiState.value = currentState.copy(
            selectedAnswer = answerOption
        )

        // 更新导航状态
        updateCurrentQuestion()
    }
    
    /**
     * 下一题
     */
    fun nextQuestion() {
        val currentState = _uiState.value
        
        // 检查是否可以前进到下一题
        if (!currentState.canNavigateNext) {
            return
        }
        
        val nextIndex = currentState.currentQuestionIndex + 1
        
        if (nextIndex < _questions.size) {
            // 显示下一题
            _uiState.value = currentState.copy(
                currentQuestionIndex = nextIndex,
                selectedAnswer = null,
                canNavigateNext = false
            )
            updateCurrentQuestion()
            
            // 保存进度
            saveProgress()
            
            // 检查下一题是否已有答案
            checkAndRestoreAnswer()
        } else {
            // 已完成所有题目，提交测试
            submitTest()
        }
    }
    
    /**
     * 上一题
     */
    fun previousQuestion() {
        val currentState = _uiState.value
        
        // 检查是否可以返回上一题
        if (!currentState.canNavigatePrevious) {
            return
        }
        
        val previousIndex = currentState.currentQuestionIndex - 1
        
        if (previousIndex >= 0) {
            _uiState.value = currentState.copy(
                currentQuestionIndex = previousIndex,
                selectedAnswer = null,
                canNavigateNext = false
            )
            updateCurrentQuestion()
            
            // 保存进度
            saveProgress()
            
            // 检查上一题是否已有答案
            checkAndRestoreAnswer()
        }
    }
    
    /**
     * 提交测试
     */
    fun submitTest() {
        if (_userAnswers.isEmpty()) {
            _uiState.value = _uiState.value.copy(error = "请至少回答一道题目")
            return
        }
        
        scope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            
            try {
                val currentLanguage = _uiState.value.currentLanguage

                // 验证答案数据完整性
                val validAnswers = _userAnswers.filter { answer ->
                    answer.answerScore in 1..5 && answer.questionId > 0
                }

                if (validAnswers.isEmpty()) {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "没有有效的答案数据，请重新完成测试"
                    )
                    return@launch
                }

                if (validAnswers.size != _userAnswers.size) {
                    // 记录数据问题但继续提交有效答案
                    println("警告：过滤了${_userAnswers.size - validAnswers.size}个无效答案")
                }

                repository.submitTest(
                    answers = validAnswers,
                    language = currentLanguage,
                    saveResult = false
                ).fold(
                    onSuccess = { testReport ->
                        // 提交成功，清除保存的进度
                        clearProgress()

                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            testCompleted = true,
                            testReport = testReport,
                            error = null
                        )
                    },
                    onFailure = { error ->
                        val errorMessage = when {
                            error.message?.contains("400") == true -> {
                                "请求格式错误，可能是答案数据不完整。已回答${_userAnswers.size}道题，请检查网络连接后重试。"
                            }
                            error.message?.contains("JSON") == true -> "服务器返回数据格式错误，请稍后重试"
                            error.message?.contains("timeout") == true -> "网络超时，请检查网络连接后重试"
                            error.message?.contains("404") == true -> "服务不可用，请稍后重试"
                            error.message?.contains("500") == true -> "服务器内部错误，请稍后重试"
                            error.message?.contains("401") == true || error.message?.contains("403") == true -> {
                                "服务认证失败，请重新启动应用"
                            }
                            error.message?.contains("network") == true || error.message?.contains("UnknownHost") == true -> {
                                "网络连接失败，请检查网络设置"
                            }
                            else -> "提交测试失败: ${error.message ?: "未知错误"}"
                        }

                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = errorMessage
                        )
                    }
                )
            } catch (e: Exception) {
                val exceptionMessage = when {
                    e.message?.contains("serialization") == true -> "数据序列化错误，请重新完成测试"
                    e.message?.contains("JSON") == true -> "数据格式错误，请重新完成测试"
                    else -> "提交过程中发生异常: ${e.message ?: "未知异常"}"
                }

                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = exceptionMessage
                )
            }
        }
    }
    
    /**
     * 更新当前题目
     */
    private fun updateCurrentQuestion() {
        val currentState = _uiState.value
        val currentIndex = currentState.currentQuestionIndex
        
        if (currentIndex < _questions.size) {
            val currentQuestion = _questions[currentIndex]

            // 检查当前题目是否已有答案
            val hasAnswer = _userAnswers.any { it.questionId == currentQuestion.id }

            // 检查是否所有题目都已回答
            val allQuestionsAnswered = areAllQuestionsAnswered()

            // 检查是否为最后一题
            val isLastQuestion = currentIndex == _questions.size - 1

            // 导航逻辑：只有当前题目有答案且不是所有题目都完成时才能前进
            val canGoNext = hasAnswer && !allQuestionsAnswered

            // 按钮显示逻辑：
            // 1. 是否显示"提交测试"按钮：在最后一题时显示
            val shouldShowSubmit = isLastQuestion

            // 2. 按钮是否可点击：
            //    - 非最后一题：需要当前题目已回答
            //    - 最后一题：需要所有题目都已回答
            val isButtonEnabled = if (isLastQuestion) {
                allQuestionsAnswered
            } else {
                hasAnswer
            }

            _uiState.value = currentState.copy(
                currentQuestion = currentQuestion,
                answerOptions = _answerOptions,
                canNavigatePrevious = currentIndex > 0,
                canNavigateNext = canGoNext,
                totalQuestions = _questions.size, // 题目总数
                shouldShowSubmitButton = shouldShowSubmit,
                isPrimaryButtonEnabled = isButtonEnabled,
                isLoading = false,
                error = null
            )
        }
    }
    
    /**
     * 获取当前选中的答案
     */
    fun getCurrentSelectedAnswer(): AnswerOption? {
        return _uiState.value.selectedAnswer
    }
    
    /**
     * 获取用户答案列表
     */
    fun getUserAnswers(): List<SubmitAnswerRequest> {
        return _userAnswers.toList()
    }
    
    /**
     * 判断是否为最后一题
     */
    fun isLastQuestion(): Boolean {
        val currentState = _uiState.value
        return currentState.currentQuestionIndex == _questions.size - 1
    }
    
    /**
     * 判断是否可以前进到下一题
     */
    fun canGoNext(): Boolean {
        return _uiState.value.canNavigateNext
    }
    
    /**
     * 判断是否可以后退到上一题
     */
    fun canGoPrevious(): Boolean {
        return _uiState.value.canNavigatePrevious
    }

    /**
     * 判断所有题目是否都已回答
     */
    private fun areAllQuestionsAnswered(): Boolean {
        if (_questions.isEmpty()) return false

        // 检查每道题是否都有对应的答案
        return _questions.all { question ->
            _userAnswers.any { it.questionId == question.id }
        }
    }
    
    /**
     * 清除错误信息
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
    }
    
    /**
     * 切换语言
     */
    fun switchLanguage() {
        val currentState = _uiState.value
        val newLanguage = if (currentState.currentLanguage == "zh") "en" else "zh"
        
        // 更新UI状态
        _uiState.value = currentState.copy(
            currentLanguage = newLanguage,
            isLoading = true
        )
        
        // 重新加载数据
        scope.launch {
            // 清空当前数据
            _questions.clear()
            _answerOptions.clear()
            _userAnswers.clear()
            
            // 重新加载数据
            loadDataWithLanguage(newLanguage)
        }
    }
    
    /**
     * 使用指定语言加载数据
     */
    private suspend fun loadDataWithLanguage(language: String) {
        try {
            // 并行加载答案选项和题目
            val answerOptionsDeferred = scope.async {
                repository.getAnswerOptions(language)
            }
            val questionsDeferred = scope.async {
                repository.getRandomQuestions(count = 50, language = language)
            }
            
            // 等待答案选项加载完成
            answerOptionsDeferred.await().fold(
                onSuccess = { options ->
                    _answerOptions.clear()
                    _answerOptions.addAll(options)
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "加载答案选项失败: ${error.message}"
                    )
                    return
                }
            )
            
            // 等待题目加载完成
            questionsDeferred.await().fold(
                onSuccess = { questions ->
                    if (questions.isNotEmpty()) {
                        _questions.clear()
                        _questions.addAll(questions)
                        
                        // 重置到第一题
                        _uiState.value = _uiState.value.copy(
                            currentQuestionIndex = 0,
                            selectedAnswer = null,
                            canNavigateNext = false,
                            canNavigatePrevious = false,
                            isLoading = false,
                            error = null
                        )
                        updateCurrentQuestion()
                    } else {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = "没有找到题目"
                        )
                    }
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "加载题目失败: ${error.message}"
                    )
                }
            )
        } catch (e: Exception) {
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                error = "加载数据时发生错误: ${e.message}"
            )
        }
    }
    
    /**
     * 恢复保存的进度或加载新数据
     */
    private fun restoreProgressOrLoadNew() {
        scope.launch {
            if (dataStore != null) {
                try {
                    val savedProgress = dataStore.getTestProgress.first()
                    if (savedProgress.isNotEmpty()) {
                        restoreProgress(savedProgress)
                        return@launch
                    }
                } catch (e: Exception) {
                    // 恢复失败，继续加载新数据
                }
            }
            // 没有保存的进度或恢复失败，加载新数据
            loadInitialData()
        }
    }
    
    /**
     * 恢复保存的进度
     */
    private suspend fun restoreProgress(progressJson: String) {
        try {
            val progress = Json.decodeFromString<TestProgress>(progressJson)
            
            // 恢复题目数据
            _questions.clear()
            _questions.addAll(progress.questions)
            
            // 恢复答案选项
            _answerOptions.clear()
            _answerOptions.addAll(progress.answerOptions)
            
            // 恢复用户答案
            _userAnswers.clear()
            _userAnswers.addAll(progress.userAnswers)
            
            // 恢复UI状态
            _uiState.value = _uiState.value.copy(
                currentQuestionIndex = progress.currentQuestionIndex,
                currentLanguage = progress.currentLanguage,
                isLoading = false
            )
            
            updateCurrentQuestion()
            
            // 恢复当前题目的已选答案
            checkAndRestoreAnswer()
        } catch (e: Exception) {
            // 恢复失败，加载新数据
            loadInitialData()
        }
    }
    
    /**
     * 保存当前进度
     */
    private fun saveProgress() {
        if (dataStore == null) return
        
        scope.launch {
            try {
                val progress = TestProgress(
                    questions = _questions,
                    answerOptions = _answerOptions,
                    userAnswers = _userAnswers,
                    currentQuestionIndex = _uiState.value.currentQuestionIndex,
                    currentLanguage = _uiState.value.currentLanguage
                )
                
                val progressJson = Json.encodeToString(progress)
                dataStore.saveTestProgress(progressJson)
            } catch (e: Exception) {
                // 保存失败，不影响正常流程
            }
        }
    }
    
    /**
      * 清除保存的进度
      */
     fun clearProgress() {
         if (dataStore == null) return
         
         scope.launch {
             try {
                 dataStore.clearTestProgress()
             } catch (e: Exception) {
                 // 清除失败，不影响正常流程
             }
         }
     }
     
     /**
      * 检查并恢复当前题目的已选答案
      */
     private fun checkAndRestoreAnswer() {
         val currentState = _uiState.value
         val currentIndex = currentState.currentQuestionIndex
         
         if (currentIndex < _questions.size) {
             val currentQuestion = _questions[currentIndex]
             val savedAnswer = _userAnswers.find { it.questionId == currentQuestion.id }
             
             if (savedAnswer != null) {
                 val answerOption = _answerOptions.find { it.getScore() == savedAnswer.answerScore }
                 if (answerOption != null) {
                     _uiState.value = currentState.copy(
                         selectedAnswer = answerOption
                     )
                     // 更新导航状态
                     updateCurrentQuestion()
                 }
             }
         }
     }
}

/**
 * 答题界面UI状态
 */
data class QuestionUiState(
    val isLoading: Boolean = false,
    val currentQuestion: Question? = null,
    val answerOptions: List<AnswerOption> = emptyList(),
    val selectedAnswer: AnswerOption? = null,
    val currentQuestionIndex: Int = 0,
    val totalQuestions: Int = 0,
    val canNavigatePrevious: Boolean = false,
    val canNavigateNext: Boolean = false,
    val testCompleted: Boolean = false,
    val testReport: TestReport? = null,
    val error: String? = null,
    val currentLanguage: String = "zh", // 默认中文，"zh"为中文，"en"为英文
    // 新增字段：主按钮（右侧按钮）是否应该显示为"提交测试"
    val shouldShowSubmitButton: Boolean = false,
    // 新增字段：主按钮（右侧按钮）是否应该可点击
    val isPrimaryButtonEnabled: Boolean = false
)