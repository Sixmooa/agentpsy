package com.example.myapplication.integration

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.TestProgressDataStore
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepositoryImpl
import com.example.myapplication.ui.question.QuestionViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import io.mockk.*
import retrofit2.Response
import okhttp3.ResponseBody.Companion.toResponseBody
import java.io.IOException

/**
 * 错误处理集成测试
 * TDD第四阶段：专门针对400错误和其他网络错误的端到端测试
 */
@ExperimentalCoroutinesApi
class ErrorHandlingIntegrationTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    private lateinit var mockApiService: MockApiService
    private lateinit var repository: PersonalityTestRepositoryImpl
    private lateinit var dataStore: TestProgressDataStore
    private lateinit var viewModel: QuestionViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)

        // 设置Mock DataStore
        dataStore = mockk()
        coEvery { dataStore.getTestProgress } returns flowOf("")
        coEvery { dataStore.saveTestProgress(any()) } returns Unit
        coEvery { dataStore.clearTestProgress() } returns Unit
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        clearAllMocks()
    }

    // ========== 400错误场景测试 ==========

    @Test
    fun `400错误场景完整流程应该显示友好错误消息`() = runTest {
        // Given - 创建会返回400错误的Mock API
        mockApiService = object : MockApiService() {
            override suspend fun submitTest(request: TestSubmissionRequest): Response<TestSubmissionResponse> {
                // 模拟400错误
                return Response.error(400, "Bad Request".toResponseBody())
            }
        }
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        // 等待初始化完成
        testScope.advanceUntilIdle()

        // When - 完成答题并提交
        completePartialTest(viewModel)

        // Then - 验证400错误处理
        val finalState = viewModel.uiState.value
        assertFalse("不应该处于加载状态", finalState.isLoading)
        assertNotNull("应该有错误消息", finalState.error)
        assertFalse("测试不应该完成", finalState.testCompleted)
        assertNull("不应该有测试报告", finalState.testReport)

        // 验证具体的400错误消息
        val errorMessage = finalState.error!!
        assertTrue("错误消息应该包含请求格式错误",
            errorMessage.contains("请求格式错误"))
        assertTrue("错误消息应该包含已回答题目数量",
            errorMessage.contains("已回答"))
        assertTrue("错误消息应该建议检查网络连接",
            errorMessage.contains("检查网络连接后重试"))
    }

    @Test
    fun `400错误后重新提交应该成功`() = runTest {
        // Given - 设置一个先失败后成功的API
        var attemptCount = 0
        mockApiService = object : MockApiService() {
            override suspend fun submitTest(request: TestSubmissionRequest): Response<TestSubmissionResponse> {
                return if (++attemptCount == 1) {
                    // 第一次提交返回400错误
                    Response.error(400, "Bad Request".toResponseBody())
                } else {
                    // 第二次提交成功
                    super.submitTest(request)
                }
            }
        }
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        testScope.advanceUntilIdle()

        // When - 第一次提交（应该失败）
        completePartialTest(viewModel)
        var errorState = viewModel.uiState.value
        assertNotNull("第一次提交应该失败", errorState.error)

        // 清除错误并重新提交
        viewModel.clearError()
        testScope.advanceUntilIdle()

        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证第二次提交成功
        val successState = viewModel.uiState.value
        assertNull("第二次提交不应该有错误", successState.error)
        assertTrue("第二次提交应该成功", successState.testCompleted)
        assertNotNull("应该有测试报告", successState.testReport)
    }

    // ========== 网络错误场景测试 ==========

    @Test
    fun `网络超时错误应该显示超时消息`() = runTest {
        // Given - 创建会超时的Mock API
        mockApiService = object : MockApiService() {
            override suspend fun submitTest(request: TestSubmissionRequest): Response<TestSubmissionResponse> {
                throw IOException("Network timeout")
            }
        }
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        testScope.advanceUntilIdle()

        // When - 提交测试
        completePartialTest(viewModel)

        // Then - 验证超时错误处理
        val finalState = viewModel.uiState.value
        assertNotNull("应该有错误消息", finalState.error)
        assertTrue("错误消息应该包含超时信息",
            finalState.error?.contains("超时") == true)
    }

    @Test
    fun `服务器500错误应该显示服务器错误消息`() = runTest {
        // Given - 创建会返回500错误的Mock API
        mockApiService = object : MockApiService() {
            override suspend fun submitTest(request: TestSubmissionRequest): Response<TestSubmissionResponse> {
                return Response.error(500, "Internal Server Error".toResponseBody())
            }
        }
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        testScope.advanceUntilIdle()

        // When - 提交测试
        completePartialTest(viewModel)

        // Then - 验证500错误处理
        val finalState = viewModel.uiState.value
        assertNotNull("应该有错误消息", finalState.error)
        assertTrue("错误消息应该包含服务器内部错误",
            finalState.error?.contains("服务器内部错误") == true)
    }

    @Test
    fun `认证错误应该显示重启应用提示`() = runTest {
        // Given - 创建会返回认证错误的Mock API
        mockApiService = object : MockApiService() {
            override suspend fun submitTest(request: TestSubmissionRequest): Response<TestSubmissionResponse> {
                return Response.error(401, "Unauthorized".toResponseBody())
            }
        }
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        testScope.advanceUntilIdle()

        // When - 提交测试
        completePartialTest(viewModel)

        // Then - 验证认证错误处理
        val finalState = viewModel.uiState.value
        assertNotNull("应该有错误消息", finalState.error)
        assertTrue("错误消息应该包含服务认证失败",
            finalState.error?.contains("服务认证失败") == true)
        assertTrue("错误消息应该建议重启应用",
            finalState.error?.contains("重新启动应用") == true)
    }

    // ========== 数据验证错误测试 ==========

    @Test
    fun `无效答案数据应该被过滤并显示警告`() = runTest {
        // Given - 使用正常API但手动添加无效答案
        mockApiService = MockApiService()
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        testScope.advanceUntilIdle()

        // 手动添加无效答案数据
        val userAnswersField = QuestionViewModel::class.java.getDeclaredField("_userAnswers")
        userAnswersField.isAccessible = true
        @Suppress("UNCHECKED_CAST")
        val userAnswers = userAnswersField.get(viewModel) as MutableList<SubmitAnswerRequest>

        // 添加混合的有效和无效答案
        userAnswers.addAll(listOf(
            SubmitAnswerRequest(1, 3),    // 有效
            SubmitAnswerRequest(0, 2),    // 无效ID
            SubmitAnswerRequest(2, 0),    // 无效分数
            SubmitAnswerRequest(3, 6),    // 无效分数
            SubmitAnswerRequest(4, 4)     // 有效
        ))

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证提交成功（无效答案被过滤）
        val finalState = viewModel.uiState.value
        assertFalse("不应该处于加载状态", finalState.isLoading)
        assertTrue("测试应该成功完成", finalState.testCompleted)
        assertNotNull("应该有测试报告", finalState.testReport)
        assertNull("不应该有错误", finalState.error)

        // 验证只有有效答案被提交
        val report = finalState.testReport!!
        assertNotNull("应该有时间戳", report.timestamp)
        assertTrue("MBTI类型应该有效", report.mbtiType.length >= 4)
    }

    @Test
    fun `全部答案无效应该显示特定错误消息`() = runTest {
        // Given - 使用正常API但只添加无效答案
        mockApiService = MockApiService()
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        testScope.advanceUntilIdle()

        // 手动添加只包含无效答案的数据
        val userAnswersField = QuestionViewModel::class.java.getDeclaredField("_userAnswers")
        userAnswersField.isAccessible = true
        @Suppress("UNCHECKED_CAST")
        val userAnswers = userAnswersField.get(viewModel) as MutableList<SubmitAnswerRequest>

        // 只添加无效答案
        userAnswers.addAll(listOf(
            SubmitAnswerRequest(0, 3),    // 无效ID
            SubmitAnswerRequest(-1, 2),   // 无效ID
        ))

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证特定错误消息
        val finalState = viewModel.uiState.value
        assertNotNull("应该有错误消息", finalState.error)
        assertTrue("错误消息应该提示没有有效答案",
            finalState.error?.contains("没有有效的答案数据") == true)
        assertFalse("测试不应该完成", finalState.testCompleted)
        assertNull("不应该有测试报告", finalState.testReport)
    }

    // ========== 数据加载错误测试 ==========

    @Test
    fun `题目加载失败应该显示错误状态`() = runTest {
        // Given - 创建加载失败的Mock API
        mockApiService = object : MockApiService() {
            override suspend fun getRandomQuestions(count: Int, language: String): Response<ApiResponse<List<Question>>> {
                throw IOException("Failed to load questions")
            }
        }
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        // When - 等待初始化完成
        testScope.advanceUntilIdle()

        // Then - 验证加载错误处理
        val state = viewModel.uiState.value
        assertFalse("不应该处于加载状态", state.isLoading)
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该包含加载题目失败信息",
            state.error?.contains("加载题目失败") == true)
    }

    @Test
    fun `答案选项加载失败应该显示错误状态`() = runTest {
        // Given - 创建答案选项加载失败的Mock API
        mockApiService = object : MockApiService() {
            override suspend fun getAnswerOptions(language: String): Response<ApiResponse<List<AnswerOption>>> {
                throw IOException("Failed to load options")
            }
        }
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        // When - 等待初始化完成
        testScope.advanceUntilIdle()

        // Then - 验证加载错误处理
        val state = viewModel.uiState.value
        assertFalse("不应该处于加载状态", state.isLoading)
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该包含加载答案选项失败信息",
            state.error?.contains("加载答案选项失败") == true)
    }

    // ========== 错误恢复测试 ==========

    @Test
    fun `错误后重试应该恢复正常流程`() = runTest {
        // Given - 设置先失败后成功的场景
        var loadAttempts = 0
        mockApiService = object : MockApiService() {
            override suspend fun getRandomQuestions(count: Int, language: String): Response<ApiResponse<List<Question>>> {
                return if (++loadAttempts == 1) {
                    throw IOException("First load failed")
                } else {
                    super.getRandomQuestions(count, language)
                }
            }
        }
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        // When - 第一次加载失败
        testScope.advanceUntilIdle()
        val errorState = viewModel.uiState.value
        assertNotNull("第一次加载应该失败", errorState.error)

        // 清除错误并重新加载
        viewModel.clearError()
        testScope.advanceUntilIdle()

        viewModel.loadInitialData()
        testScope.advanceUntilIdle()

        // Then - 验证第二次加载成功
        val successState = viewModel.uiState.value
        assertNull("第二次加载不应该有错误", successState.error)
        assertFalse("不应该处于加载状态", successState.isLoading)
        assertNotNull("应该有当前题目", successState.currentQuestion)
        assertTrue("应该有答案选项", successState.answerOptions.isNotEmpty())
    }

    // ========== 并发错误处理测试 ==========

    @Test
    fun `并发操作中的错误应该正确处理`() = runTest {
        // Given - 使用正常API
        mockApiService = MockApiService()
        repository = PersonalityTestRepositoryImpl(mockApiService)
        viewModel = QuestionViewModel(repository, dataStore, testScope)

        testScope.advanceUntilIdle()

        // When - 并发执行多个操作（包括可能出错的操作）
        val operations = listOf(
            async {
                // 正常答题
                val state = viewModel.uiState.value
                if (state.answerOptions.isNotEmpty()) {
                    viewModel.selectAnswer(state.answerOptions[2])
                }
            },
            async {
                // 尝试清除错误
                viewModel.clearError()
            },
            async {
                // 尝试无效操作
                viewModel.submitTest() // 没有答案会出错
            }
        )

        // 等待所有操作完成
        operations.awaitAll()
        testScope.advanceUntilIdle()

        // Then - 验证应用状态一致，不会崩溃
        val finalState = viewModel.uiState.value
        assertNotNull("应该有状态", finalState)
        // 具体状态取决于操作执行顺序，但应用不应该崩溃
    }

    // ========== 辅助方法 ==========

    private suspend fun completePartialTest(viewModel: QuestionViewModel) {
        // 等待初始化完成
        testScope.advanceUntilIdle()

        val state = viewModel.uiState.value
        if (state.answerOptions.isNotEmpty() && state.currentQuestion != null) {
            // 选择一个答案
            viewModel.selectAnswer(state.answerOptions[2])
            testScope.advanceUntilIdle()

            // 提交测试
            viewModel.submitTest()
            testScope.advanceUntilIdle()
        }
    }
}