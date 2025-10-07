package com.example.myapplication.ui.question

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * 答题界面ViewModel
 * 管理答题状态和业务逻辑
 */
class QuestionViewModel(
    private val repository: PersonalityTestRepository
) : ViewModel() {
    
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
        loadInitialData()
    }
    
    /**
     * 加载初始数据
     */
    fun loadInitialData() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            try {
                // 并行加载答案选项和第一道题目
                val answerOptionsResult = repository.getAnswerOptions()
                val questionsResult = repository.getRandomQuestions(count = 1)
                
                answerOptionsResult.fold(
                    onSuccess = { options ->
                        _answerOptions.clear()
                        _answerOptions.addAll(options)
                    },
                    onFailure = { error ->
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = "加载答案选项失败: ${error.message}"
                        )
                        return@launch
                    }
                )
                
                questionsResult.fold(
                    onSuccess = { questions ->
                        if (questions.isNotEmpty()) {
                            _questions.clear()
                            _questions.addAll(questions)
                            updateCurrentQuestion()
                        } else {
                            _uiState.value = _uiState.value.copy(
                                isLoading = false,
                                error = "没有可用的题目"
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
                    error = "初始化失败: ${e.message}"
                )
            }
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
            answerScore = answerOption.score
        )
        
        // 更新或添加答案
        val existingIndex = _userAnswers.indexOfFirst { it.questionId == currentQuestion.id }
        if (existingIndex >= 0) {
            _userAnswers[existingIndex] = userAnswer
        } else {
            _userAnswers.add(userAnswer)
        }
        
        _uiState.value = currentState.copy(
            selectedAnswer = answerOption,
            canNavigateNext = true
        )
    }
    
    /**
     * 下一题
     */
    fun nextQuestion() {
        viewModelScope.launch {
            val currentState = _uiState.value
            val nextIndex = currentState.currentQuestionIndex + 1
            
            if (nextIndex < _questions.size) {
                // 显示已有题目
                _uiState.value = currentState.copy(
                    currentQuestionIndex = nextIndex,
                    selectedAnswer = null,
                    canNavigateNext = false
                )
                updateCurrentQuestion()
            } else {
                // 加载新题目
                _uiState.value = currentState.copy(isLoading = true)
                
                repository.getRandomQuestions(count = 1).fold(
                    onSuccess = { questions ->
                        if (questions.isNotEmpty()) {
                            _questions.addAll(questions)
                            _uiState.value = currentState.copy(
                                currentQuestionIndex = nextIndex,
                                selectedAnswer = null,
                                canNavigateNext = false,
                                isLoading = false
                            )
                            updateCurrentQuestion()
                        } else {
                            // 没有更多题目，提交测试
                            submitTest()
                        }
                    },
                    onFailure = { error ->
                        _uiState.value = currentState.copy(
                            isLoading = false,
                            error = "加载下一题失败: ${error.message}"
                        )
                    }
                )
            }
        }
    }
    
    /**
     * 上一题
     */
    fun previousQuestion() {
        val currentState = _uiState.value
        val previousIndex = currentState.currentQuestionIndex - 1
        
        if (previousIndex >= 0) {
            _uiState.value = currentState.copy(
                currentQuestionIndex = previousIndex,
                selectedAnswer = null,
                canNavigateNext = false
            )
            updateCurrentQuestion()
            
            // 恢复之前的答案
            val previousAnswer = _userAnswers.find { 
                it.questionId == _questions[previousIndex].id 
            }
            if (previousAnswer != null) {
                val answerOption = _answerOptions.find { 
                    it.score == previousAnswer.answerScore 
                }
                if (answerOption != null) {
                    selectAnswer(answerOption)
                }
            }
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
        
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            
            repository.submitTest(
                answers = _userAnswers,
                language = "zh",
                saveResult = false
            ).fold(
                onSuccess = { testReport ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        testCompleted = true,
                        testReport = testReport
                    )
                },
                onFailure = { error ->
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = "提交测试失败: ${error.message}"
                    )
                }
            )
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
            _uiState.value = currentState.copy(
                currentQuestion = currentQuestion,
                answerOptions = _answerOptions,
                canNavigatePrevious = currentIndex > 0,
                totalQuestions = _userAnswers.size + 1, // 已回答的题目数 + 当前题目
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
     * 清除错误
     */
    fun clearError() {
        _uiState.value = _uiState.value.copy(error = null)
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
    val error: String? = null
)