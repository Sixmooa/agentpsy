package com.example.myapplication.ui.question

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.TestProgressDataStore
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import java.net.UnknownHostException
import java.net.ConnectException

/**
 * QuestionViewModel网络失败场景测试
 * 测试ViewModel在各种网络错误情况下的状态管理
 */
@OptIn(ExperimentalCoroutinesApi::class)
class QuestionViewModelNetworkFailureTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    private val mockRepository = mockk<PersonalityTestRepository>()
    private val mockDataStore = mockk<TestProgressDataStore>()
    private lateinit var viewModel: QuestionViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        coEvery { mockDataStore.getTestProgress } returns kotlinx.coroutines.flow.flowOf("")
        coEvery { mockDataStore.saveTestProgress(any()) } returns Unit
        coEvery { mockDataStore.clearTestProgress() } returns Unit
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `test loadInitialData fails with network error - shows correct error message`() = runTest {
        // Given: Repository返回网络错误
        coEvery { mockRepository.getAnswerOptions(any()) } returns Result.failure(
            UnknownHostException("mock-api.example.com")
        )
        coEvery { mockRepository.getRandomQuestions(count = any(), language = any()) } returns Result.failure(
            ConnectException("Connection refused")
        )

        // When: 创建ViewModel（会自动调用loadInitialData）
        viewModel = QuestionViewModel(mockRepository, mockDataStore)
        testScope.advanceUntilIdle()

        // Then: UI状态应该显示错误
        val uiState = viewModel.uiState.value
        assertFalse("加载状态应该为false", uiState.isLoading)
        assertNotNull("应该有错误消息", uiState.error)
        assertTrue("错误消息应该包含'加载答案选项失败'", 
            uiState.error?.contains("加载答案选项失败") == true)
        assertTrue("错误消息应该包含具体的异常信息", 
            uiState.error?.contains("mock-api.example.com") == true)
    }

    @Test
    fun `test loadInitialData - answer options succeed but questions fail`() = runTest {
        // Given: 答案选项成功，但题目加载失败
        coEvery { mockRepository.getAnswerOptions(any()) } returns Result.success(emptyList())
        coEvery { mockRepository.getRandomQuestions(count = any(), language = any()) } returns Result.failure(
            ConnectException("Connection refused")
        )

        // When: 创建ViewModel
        viewModel = QuestionViewModel(mockRepository, mockDataStore)
        testScope.advanceUntilIdle()

        // Then: 应该显示题目加载失败的错误
        val uiState = viewModel.uiState.value
        assertFalse("加载状态应该为false", uiState.isLoading)
        assertNotNull("应该有错误消息", uiState.error)
        assertTrue("错误消息应该包含'加载题目失败'", 
            uiState.error?.contains("加载题目失败") == true)
    }

    @Test
    fun `test clearError functionality`() = runTest {
        // Given: ViewModel处于错误状态
        coEvery { mockRepository.getAnswerOptions(any()) } returns Result.failure(
            UnknownHostException("mock-api.example.com")
        )
        
        viewModel = QuestionViewModel(mockRepository, mockDataStore)
        testScope.advanceUntilIdle()
        
        // 确认有错误
        assertNotNull("应该有错误消息", viewModel.uiState.value.error)

        // When: 清除错误
        viewModel.clearError()

        // Then: 错误应该被清除
        assertNull("错误消息应该被清除", viewModel.uiState.value.error)
    }

    @Test
    fun `test network timeout error handling`() = runTest {
        // Given: Repository返回超时错误
        val timeoutException = java.net.SocketTimeoutException("Read timed out")
        coEvery { mockRepository.getAnswerOptions(any()) } returns Result.failure(timeoutException)
        coEvery { mockRepository.getRandomQuestions(count = any(), language = any()) } returns Result.failure(timeoutException)

        // When: 创建ViewModel
        viewModel = QuestionViewModel(mockRepository, mockDataStore)
        testScope.advanceUntilIdle()

        // Then: 应该显示超时错误
        val uiState = viewModel.uiState.value
        assertFalse("加载状态应该为false", uiState.isLoading)
        assertNotNull("应该有错误消息", uiState.error)
        assertTrue("错误消息应该包含超时信息", 
            uiState.error?.contains("Read timed out") == true)
    }

    @Test
    fun `test loading state during network request`() = runTest {
        // Given: Repository调用会挂起
        coEvery { mockRepository.getAnswerOptions(any()) } coAnswers {
            // 模拟网络延迟
            kotlinx.coroutines.delay(1000)
            Result.failure(UnknownHostException("mock-api.example.com"))
        }
        coEvery { mockRepository.getRandomQuestions(count = any(), language = any()) } coAnswers {
            kotlinx.coroutines.delay(1000)
            Result.failure(UnknownHostException("mock-api.example.com"))
        }

        // When: 创建ViewModel（不会自动加载）
        viewModel = QuestionViewModel(mockRepository, mockDataStore)
        
        // 等待初始加载完成
        testScope.advanceUntilIdle()
        
        // 手动触发加载来测试loading状态
        viewModel.loadInitialData()
        
        // 给协程一个调度周期来设置loading状态
        testDispatcher.scheduler.runCurrent()
        
        // Then: 应该进入加载状态
        assertTrue("调用loadInitialData后应该是加载中", viewModel.uiState.value.isLoading)
        
        // 推进一点时间，但不完全完成
        testDispatcher.scheduler.advanceTimeBy(500)
        assertTrue("中间状态应该仍是加载中", viewModel.uiState.value.isLoading)
        
        // 等待请求完成
        testScope.advanceUntilIdle()
        
        // 最终状态应该不是加载中
        assertFalse("最终状态应该不是加载中", viewModel.uiState.value.isLoading)
    }
}