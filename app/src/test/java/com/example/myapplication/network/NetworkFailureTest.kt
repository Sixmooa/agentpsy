package com.example.myapplication.network

import com.example.myapplication.data.repository.PersonalityTestRepositoryImpl
import com.example.myapplication.data.network.ApiService
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Test
import org.junit.Assert.*
import java.net.UnknownHostException
import java.net.ConnectException

/**
 * 网络失败场景测试
 * 测试各种网络错误情况下的应用行为
 */
class NetworkFailureTest {

    private val mockApiService = mockk<ApiService>()
    private val repository = PersonalityTestRepositoryImpl(mockApiService)

    @Test
    fun `test getAnswerOptions fails with UnknownHostException`() = runTest {
        // Given: API服务抛出UnknownHostException（模拟DNS解析失败）
        coEvery { mockApiService.getAnswerOptions() } throws UnknownHostException("mock-api.example.com")

        // When: 调用getAnswerOptions
        val result = repository.getAnswerOptions()

        // Then: 应该返回失败结果
        assertTrue("应该返回失败结果", result.isFailure)
        val exception = result.exceptionOrNull()
        assertTrue("异常应该是UnknownHostException", exception is UnknownHostException)
        assertEquals("异常消息应该包含域名", "mock-api.example.com", exception?.message)
    }

    @Test
    fun `test getRandomQuestions fails with ConnectException`() = runTest {
        // Given: API服务抛出ConnectException（模拟连接失败）
        coEvery { mockApiService.getRandomQuestions(any()) } throws ConnectException("Connection refused")

        // When: 调用getRandomQuestions
        val result = repository.getRandomQuestions(count = 1)

        // Then: 应该返回失败结果
        assertTrue("应该返回失败结果", result.isFailure)
        val exception = result.exceptionOrNull()
        assertTrue("异常应该是ConnectException", exception is ConnectException)
        assertEquals("异常消息应该是Connection refused", "Connection refused", exception?.message)
    }

    @Test
    fun `test multiple network failures in sequence`() = runTest {
        // Given: 多个API调用都失败
        coEvery { mockApiService.getAnswerOptions() } throws UnknownHostException("mock-api.example.com")
        coEvery { mockApiService.getRandomQuestions(any()) } throws ConnectException("Connection refused")

        // When: 依次调用两个API
        val answerOptionsResult = repository.getAnswerOptions()
        val questionsResult = repository.getRandomQuestions(count = 1)

        // Then: 两个调用都应该失败
        assertTrue("getAnswerOptions应该失败", answerOptionsResult.isFailure)
        assertTrue("getRandomQuestions应该失败", questionsResult.isFailure)
        
        // 验证具体的异常类型
        assertTrue("第一个异常应该是UnknownHostException", 
            answerOptionsResult.exceptionOrNull() is UnknownHostException)
        assertTrue("第二个异常应该是ConnectException", 
            questionsResult.exceptionOrNull() is ConnectException)
    }

    @Test
    fun `test network timeout simulation`() = runTest {
        // Given: API服务抛出超时异常
        val timeoutException = java.net.SocketTimeoutException("Read timed out")
        coEvery { mockApiService.getAnswerOptions() } throws timeoutException

        // When: 调用API
        val result = repository.getAnswerOptions()

        // Then: 应该返回失败结果
        assertTrue("应该返回失败结果", result.isFailure)
        val exception = result.exceptionOrNull()
        assertTrue("异常应该是SocketTimeoutException", exception is java.net.SocketTimeoutException)
        assertEquals("异常消息应该是Read timed out", "Read timed out", exception?.message)
    }
}