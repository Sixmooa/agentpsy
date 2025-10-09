package com.example.myapplication.debug

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.model.AnswerOption
import com.example.myapplication.data.model.Question
import com.example.myapplication.data.network.MockApiService
import com.example.myapplication.data.repository.PersonalityTestRepositoryImpl
import com.example.myapplication.ui.question.QuestionViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.async
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import retrofit2.Response
import com.example.myapplication.data.network.ApiService
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.model.*

@ExperimentalCoroutinesApi
class DebugTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun testMockApiServiceDirectly() = runTest {
        val mockApiService = MockApiService()
        
        // 直接测试MockApiService
        val response = mockApiService.getAnswerOptions()
        
        assertTrue("Response should be successful", response.isSuccessful)
        assertNotNull("Response body should not be null", response.body())
        
        val body = response.body()!!
        assertTrue("API response should be successful", body.success)
        assertNotNull("Data should not be null", body.data)
        assertTrue("Should have answer options", body.data!!.isNotEmpty())
        
        println("MockApiService test passed: ${body.data!!.size} options")
    }
    
    @Test
    fun testRepositoryDirectly() = runTest {
        val mockApiService = MockApiService()
        val repository = PersonalityTestRepositoryImpl(mockApiService)
        
        // 测试Repository
        val result = repository.getAnswerOptions()
        
        assertTrue("Repository result should be successful", result.isSuccess)
        
        val options = result.getOrNull()
        assertNotNull("Options should not be null", options)
        assertTrue("Should have answer options", options!!.isNotEmpty())
        
        println("Repository test passed: ${options.size} options")
    }
    
    @Test
    fun testQuestionViewModelDirectly() = runTest {
        val mockApiService = MockApiService()
        val repository = TestPersonalityTestRepository(mockApiService)
        
        // 先测试repository的getRandomQuestions方法
        val questionsResult = repository.getRandomQuestions(count = 1)
        println("Repository getRandomQuestions result: ${questionsResult.isSuccess}")
        questionsResult.fold(
            onSuccess = { questions -> println("  Questions count: ${questions.size}") },
            onFailure = { error -> println("  Error: ${error.message}") }
        )
        
        val viewModel = QuestionViewModel(repository, null, this)
        
        // 等待初始数据加载完成
        advanceUntilIdle()
        
        val state = viewModel.uiState.value
        
        println("ViewModel state:")
        println("  isLoading: ${state.isLoading}")
        println("  answerOptions.size: ${state.answerOptions.size}")
        println("  currentQuestion: ${state.currentQuestion}")
        println("  error: ${state.error}")
        
        assertFalse("Should not be loading", state.isLoading)
        assertTrue("Should have answer options", state.answerOptions.isNotEmpty())
        assertNotNull("Should have current question", state.currentQuestion)
        assertNull("Should not have error", state.error)
    }
    
    @Test
    fun testLoadInitialDataDirectly() = runTest {
        // 设置测试调度器
        val testDispatcher = StandardTestDispatcher(testScheduler)
        Dispatchers.setMain(testDispatcher)
        
        try {
            val repository = PersonalityTestRepositoryImpl(MockApiService())
            
            // 先测试repository方法
            println("Testing repository methods:")
            val answerOptionsResult = repository.getAnswerOptions()
            val questionsResult = repository.getRandomQuestions(1)
            
            println("  answerOptions success: ${answerOptionsResult.isSuccess}")
            println("  questions success: ${questionsResult.isSuccess}")
            
            if (answerOptionsResult.isSuccess) {
                println("  answerOptions count: ${answerOptionsResult.getOrNull()?.size}")
            }
            if (questionsResult.isSuccess) {
                println("  questions count: ${questionsResult.getOrNull()?.size}")
            }
            
            // 直接测试loadInitialData的逻辑，不依赖viewModelScope
            println("\nTesting loadInitialData logic directly:")
            
            // 模拟loadInitialData的逻辑
            val answerOptions = mutableListOf<AnswerOption>()
            val questions = mutableListOf<Question>()
            
            val answerOptionsDeferred = async { repository.getAnswerOptions() }
            val questionsDeferred = async { repository.getRandomQuestions(count = 1) }
            
            val answerOptionsResult2 = answerOptionsDeferred.await()
            val questionsResult2 = questionsDeferred.await()
            
            println("  Direct async answerOptions success: ${answerOptionsResult2.isSuccess}")
            println("  Direct async questions success: ${questionsResult2.isSuccess}")
            
            var hasError = false
            var errorMessage = ""
            
            // 处理答案选项结果
            answerOptionsResult2.fold(
                onSuccess = { options: List<AnswerOption> ->
                    answerOptions.clear()
                    answerOptions.addAll(options)
                    println("  Added ${options.size} answer options")
                },
                onFailure = { error: Throwable ->
                    hasError = true
                    errorMessage = "加载答案选项失败: ${error.message}"
                    println("  Error loading answer options: ${error.message}")
                }
            )
            
            // 处理题目结果
            questionsResult2.fold(
                onSuccess = { questionList: List<Question> ->
                    if (questionList.isNotEmpty()) {
                        questions.clear()
                        questions.addAll(questionList)
                        println("  Added ${questionList.size} questions")
                    } else {
                        hasError = true
                        errorMessage = "没有可用的题目"
                        println("  No questions available")
                    }
                },
                onFailure = { error: Throwable ->
                    hasError = true
                    errorMessage = "加载题目失败: ${error.message}"
                    println("  Error loading questions: ${error.message}")
                }
            )
            
            println("Final state:")
            println("  hasError: $hasError")
            println("  errorMessage: $errorMessage")
            println("  answerOptions.size: ${answerOptions.size}")
            println("  questions.size: ${questions.size}")
            
            // 验证直接逻辑是否正常
            assertFalse("Should not have error", hasError)
            assertTrue("Should have answer options", answerOptions.size > 0)
            assertTrue("Should have questions", questions.size > 0)
            
        } finally {
            Dispatchers.resetMain()
        }
    }
    
    @Test
    fun testQuestionViewModelWithProperDispatcher() = runTest {
        val testDispatcher = StandardTestDispatcher(testScheduler)
        Dispatchers.setMain(testDispatcher)
        
        try {
            val repository = TestPersonalityTestRepository(MockApiService())
            
            println("Creating ViewModel with injected test scope...")
            val viewModel = QuestionViewModel(repository, null, this)
            
            println("Initial state after creation:")
            println("  isLoading: ${viewModel.uiState.value.isLoading}")
            println("  answerOptions.size: ${viewModel.uiState.value.answerOptions.size}")
            println("  currentQuestion: ${viewModel.uiState.value.currentQuestion}")
            println("  error: ${viewModel.uiState.value.error}")
            
            // 等待init中的loadInitialData完成
            println("Advancing until idle to complete init...")
            advanceUntilIdle()
            
            println("State after init completion:")
            println("  isLoading: ${viewModel.uiState.value.isLoading}")
            println("  answerOptions.size: ${viewModel.uiState.value.answerOptions.size}")
            println("  currentQuestion: ${viewModel.uiState.value.currentQuestion}")
            println("  error: ${viewModel.uiState.value.error}")
            
            // 手动调用loadInitialData
            println("Manually calling loadInitialData...")
            viewModel.loadInitialData()
            
            println("Advancing until idle to complete manual loadInitialData...")
            advanceUntilIdle()
            
            println("Final state after manual loadInitialData:")
            println("  isLoading: ${viewModel.uiState.value.isLoading}")
            println("  answerOptions.size: ${viewModel.uiState.value.answerOptions.size}")
            println("  currentQuestion: ${viewModel.uiState.value.currentQuestion}")
            println("  error: ${viewModel.uiState.value.error}")
            
            // 断言
            assertFalse("isLoading should be false", viewModel.uiState.value.isLoading)
            assertTrue("Should have answer options", viewModel.uiState.value.answerOptions.isNotEmpty())
            assertNotNull("Should have current question", viewModel.uiState.value.currentQuestion)
            
        } finally {
            Dispatchers.resetMain()
        }
    }
    
    @Test
    fun testSimpleCoroutineExecution() = runTest {
        println("Testing simple coroutine execution...")
        
        var executed = false
        launch {
            println("Inside coroutine")
            executed = true
        }
        
        advanceUntilIdle()
        println("After advanceUntilIdle, executed: $executed")
        assertTrue("Coroutine should have executed", executed)
    }

    @Test
    fun testLoadInitialDataStepByStep() = runTest {
        println("Testing loadInitialData step by step...")
        
        val mockApiService = MockApiService()
        val testRepository = PersonalityTestRepositoryImpl(mockApiService)
        val viewModel = QuestionViewModel(testRepository, null, this)
        
        println("Initial state:")
        println("  isLoading: ${viewModel.uiState.value.isLoading}")
        
        // 手动执行 loadInitialData 的逻辑
        launch {
            println("Starting manual loadInitialData logic...")
            
            // 设置 loading 状态
            println("Setting isLoading = true")
            
            try {
                // 并行加载答案选项和第一道题目
                println("Creating async tasks...")
                val answerOptionsDeferred = async { 
                    println("Executing getAnswerOptions...")
                    testRepository.getAnswerOptions() 
                }
                val questionsDeferred = async { 
                    println("Executing getRandomQuestions...")
                    testRepository.getRandomQuestions(count = 1) 
                }
                
                println("Awaiting results...")
                val answerOptionsResult = answerOptionsDeferred.await()
                val questionsResult = questionsDeferred.await()
                
                println("Results received:")
                println("  answerOptionsResult: $answerOptionsResult")
                println("  questionsResult: $questionsResult")
                
            } catch (e: Exception) {
                println("Exception in manual loadInitialData: ${e.message}")
            }
        }
        
        advanceUntilIdle()
        println("Manual test completed")
    }

    @Test
    fun testViewModelStateAfterInit() = runTest {
        println("Testing ViewModel state after init...")
        
        val mockApiService = MockApiService()
        val testRepository = TestPersonalityTestRepository(mockApiService)
        val viewModel = QuestionViewModel(testRepository, null, this)
        
        println("State immediately after creation:")
        val initialState = viewModel.uiState.value
        println("  isLoading: ${initialState.isLoading}")
        println("  currentQuestion: ${initialState.currentQuestion}")
        println("  answerOptions.size: ${initialState.answerOptions.size}")
        println("  currentQuestionIndex: ${initialState.currentQuestionIndex}")
        
        // 等待init中的loadInitialData完成
        advanceUntilIdle()
        
        println("State after advanceUntilIdle:")
        val finalState = viewModel.uiState.value
        println("  isLoading: ${finalState.isLoading}")
        println("  currentQuestion: ${finalState.currentQuestion}")
        println("  answerOptions.size: ${finalState.answerOptions.size}")
        println("  currentQuestionIndex: ${finalState.currentQuestionIndex}")
        println("  totalQuestions: ${finalState.totalQuestions}")
        println("  error: ${finalState.error}")
        
        // 手动调用loadInitialData再次测试
        println("Manually calling loadInitialData...")
        viewModel.loadInitialData()
        advanceUntilIdle()
        
        println("State after manual loadInitialData:")
        val manualState = viewModel.uiState.value
        println("  isLoading: ${manualState.isLoading}")
        println("  currentQuestion: ${manualState.currentQuestion}")
        println("  answerOptions.size: ${manualState.answerOptions.size}")
        println("  currentQuestionIndex: ${manualState.currentQuestionIndex}")
        println("  totalQuestions: ${manualState.totalQuestions}")
        println("  error: ${manualState.error}")
        
        // 验证状态
        assertFalse("isLoading should be false after data loading", manualState.isLoading)
        assertTrue("answerOptions should not be empty", manualState.answerOptions.isNotEmpty())
        assertNotNull("currentQuestion should not be null", manualState.currentQuestion)
    }

    // 测试专用的Repository实现，不使用Dispatchers.IO
    class TestPersonalityTestRepository(
        private val apiService: ApiService
    ) : PersonalityTestRepository {
        
        override suspend fun getRandomQuestions(
            count: Int,
            language: String
        ): Result<List<Question>> {
            return try {
                val response = apiService.getRandomQuestions(count, language)
                handleApiResponse(response) { it.data ?: emptyList() }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
        
        override suspend fun getAnswerOptions(
            language: String
        ): Result<List<AnswerOption>> {
            return try {
                val response = apiService.getAnswerOptions(language)
                handleApiResponse(response) { it.data ?: emptyList() }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
        
        override suspend fun submitTest(
            answers: List<SubmitAnswerRequest>,
            language: String,
            saveResult: Boolean
        ): Result<TestReport> {
            return try {
                val request = TestSubmissionRequest(
                    answers = answers,
                    language = language,
                    saveResult = saveResult
                )
                val response = apiService.submitTest(request)
                
                if (response.isSuccessful) {
                    val body = response.body()
                    if (body?.success == true && body.report != null) {
                        Result.success(body.report)
                    } else {
                        Result.failure(Exception("测试提交失败: ${body?.report}"))
                    }
                } else {
                    Result.failure(Exception("网络请求失败: ${response.code()} ${response.message()}"))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
        
        override suspend fun getMBTITypeInfo(
            typeCode: String,
            language: String
        ): Result<MBTIType> {
            return try {
                val response = apiService.getMBTITypeInfo(typeCode, language)
                handleApiResponse(response) { it.data!! }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
        
        override suspend fun getCareerSuggestions(
            mbtiType: String,
            language: String
        ): Result<List<CareerSuggestion>> {
            return try {
                val response = apiService.getCareerSuggestions(mbtiType, language)
                handleApiResponse(response) { it.data ?: emptyList() }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }
        
        private fun <T, R> handleApiResponse(
            response: Response<ApiResponse<T>>,
            transform: (ApiResponse<T>) -> R
        ): Result<R> {
            return if (response.isSuccessful) {
                val body = response.body()
                if (body != null) {
                    if (body.success) {
                        Result.success(transform(body))
                    } else {
                        Result.failure(Exception(body.error ?: "Unknown API error"))
                    }
                } else {
                    Result.failure(Exception("Response body is null"))
                }
            } else {
                Result.failure(Exception("HTTP ${response.code()}: ${response.message()}"))
            }
        }
    }

    @Test
    fun testCoroutineExecutionInViewModel() = runTest {
        println("Testing coroutine execution in ViewModel...")
        
        val mockApiService = MockApiService()
        val testRepository = TestPersonalityTestRepository(mockApiService)
        
        println("Test scope: $this")
        println("Test scope context: ${this.coroutineContext}")
        
        val viewModel = QuestionViewModel(testRepository, null, this)
        
        println("Initial state: isLoading = ${viewModel.uiState.value.isLoading}")
        
        // 测试直接在测试作用域中执行类似的逻辑
        launch {
            println("DEBUG: Testing similar logic in test scope...")
            
            try {
                println("DEBUG: Creating async tasks...")
                val answerOptionsDeferred = async { 
                    println("DEBUG: Inside answerOptions async")
                    testRepository.getAnswerOptions("en") 
                }
                val questionsDeferred = async { 
                    println("DEBUG: Inside questions async")
                    testRepository.getRandomQuestions(count = 1, language = "en") 
                }
                
                println("DEBUG: Awaiting results...")
                val answerOptionsResult = answerOptionsDeferred.await()
                val questionsResult = questionsDeferred.await()
                
                println("DEBUG: Got results - answerOptions: ${answerOptionsResult.isSuccess}, questions: ${questionsResult.isSuccess}")
                
            } catch (e: Exception) {
                println("DEBUG: Exception: ${e.message}")
            }
        }
        
        println("Before advanceUntilIdle")
        advanceUntilIdle()
        println("After advanceUntilIdle")
        
        println("ViewModel state: isLoading = ${viewModel.uiState.value.isLoading}")
        println("ViewModel state: answerOptions.size = ${viewModel.uiState.value.answerOptions.size}")
        println("ViewModel state: currentQuestion = ${viewModel.uiState.value.currentQuestion}")
    }
}