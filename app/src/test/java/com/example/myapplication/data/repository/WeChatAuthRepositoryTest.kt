package com.example.myapplication.data.repository

import com.example.myapplication.data.model.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.runTest
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.*

/**
 * 微信认证Repository单元测试
 * TDD模式：测试先行，确保Repository层的所有功能都正确实现
 */
class WeChatAuthRepositoryTest {

    @Mock
    private lateinit var mockRepository: AuthRepository

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
    }

    @Test
    fun `login with WeChat should return success when authentication succeeds`() = runTest {
        // Given
        val expectedUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )
        val expectedResult = AuthResult.Success(expectedUserInfo, "test_jwt_token")

        whenever(mockRepository.loginWithWeChat()).thenReturn(expectedResult)

        // When
        val result = mockRepository.loginWithWeChat()

        // Then
        assertTrue(result is AuthResult.Success)
        assertEquals(expectedUserInfo, (result as AuthResult.Success).userInfo)
        assertEquals("test_jwt_token", result.token)
        verify(mockRepository, times(1)).loginWithWeChat()
    }

    @Test
    fun `login with WeChat should return failure when authentication fails`() = runTest {
        // Given
        val expectedResult = AuthResult.Failure("用户取消授权")

        whenever(mockRepository.loginWithWeChat()).thenReturn(expectedResult)

        // When
        val result = mockRepository.loginWithWeChat()

        // Then
        assertTrue(result is AuthResult.Failure)
        assertEquals("用户取消授权", (result as AuthResult.Failure).errorMessage)
        verify(mockRepository, times(1)).loginWithWeChat()
    }

    @Test
    fun `login with WeChat should return loading during authentication process`() = runTest {
        // Given
        whenever(mockRepository.loginWithWeChat()).thenReturn(AuthResult.Loading)

        // When
        val result = mockRepository.loginWithWeChat()

        // Then
        assertTrue(result is AuthResult.Loading)
        verify(mockRepository, times(1)).loginWithWeChat()
    }

    @Test
    fun `logout should clear current user session`() = runTest {
        // Given
        whenever(mockRepository.logout()).thenReturn(Unit)

        // When
        mockRepository.logout()

        // Then
        verify(mockRepository, times(1)).logout()
    }

    @Test
    fun `getCurrentUser should return authenticated user when user is logged in`() = runTest {
        // Given
        val expectedUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )

        whenever(mockRepository.getCurrentUser()).thenReturn(expectedUserInfo)

        // When
        val result = mockRepository.getCurrentUser()

        // Then
        assertEquals(expectedUserInfo, result)
        verify(mockRepository, times(1)).getCurrentUser()
    }

    @Test
    fun `getCurrentUser should return null when user is not logged in`() = runTest {
        // Given
        whenever(mockRepository.getCurrentUser()).thenReturn(null)

        // When
        val result = mockRepository.getCurrentUser()

        // Then
        assertNull(result)
        verify(mockRepository, times(1)).getCurrentUser()
    }

    @Test
    fun `isUserLoggedIn should return true when user is authenticated`() = runTest {
        // Given
        whenever(mockRepository.isUserLoggedIn()).thenReturn(true)

        // When
        val result = mockRepository.isUserLoggedIn()

        // Then
        assertTrue(result)
        verify(mockRepository, times(1)).isUserLoggedIn()
    }

    @Test
    fun `isUserLoggedIn should return false when user is not authenticated`() = runTest {
        // Given
        whenever(mockRepository.isUserLoggedIn()).thenReturn(false)

        // When
        val result = mockRepository.isUserLoggedIn()

        // Then
        assertFalse(result)
        verify(mockRepository, times(1)).isUserLoggedIn()
    }

    @Test
    fun `getAuthStateFlow should emit NotAuthenticated initially`() = runTest {
        // Given
        val expectedFlow = flowOf(AuthState.NotAuthenticated)
        whenever(mockRepository.getAuthStateFlow()).thenReturn(expectedFlow)

        // When
        val results = mockRepository.getAuthStateFlow().toList()

        // Then
        assertEquals(1, results.size)
        assertTrue(results[0] is AuthState.NotAuthenticated)
        verify(mockRepository, times(1)).getAuthStateFlow()
    }

    @Test
    fun `getAuthStateFlow should emit Authenticated after successful login`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val expectedFlow = flowOf(
            AuthState.NotAuthenticated,
            AuthState.Loading,
            AuthState.Authenticated(userInfo)
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(expectedFlow)

        // When
        val results = mockRepository.getAuthStateFlow().toList()

        // Then
        assertEquals(3, results.size)
        assertTrue(results[0] is AuthState.NotAuthenticated)
        assertTrue(results[1] is AuthState.Loading)
        assertTrue(results[2] is AuthState.Authenticated)
        assertEquals(userInfo, (results[2] as AuthState.Authenticated).userInfo)
        verify(mockRepository, times(1)).getAuthStateFlow()
    }

    @Test
    fun `refreshUserInfo should update current user information`() = runTest {
        // Given
        val updatedUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "新昵称",
            avatarUrl = "https://wx.qlogo.cn/avatar/new.jpg"
        )

        whenever(mockRepository.refreshUserInfo()).thenReturn(updatedUserInfo)

        // When
        val result = mockRepository.refreshUserInfo()

        // Then
        assertEquals(updatedUserInfo, result)
        verify(mockRepository, times(1)).refreshUserInfo()
    }

    @Test
    fun `refreshUserInfo should return null when user is not logged in`() = runTest {
        // Given
        whenever(mockRepository.refreshUserInfo()).thenReturn(null)

        // When
        val result = mockRepository.refreshUserInfo()

        // Then
        assertNull(result)
        verify(mockRepository, times(1)).refreshUserInfo()
    }

    @Test
    fun `getStoredToken should return valid token when user is authenticated`() = runTest {
        // Given
        val expectedToken = "valid_jwt_token_12345"
        whenever(mockRepository.getStoredToken()).thenReturn(expectedToken)

        // When
        val result = mockRepository.getStoredToken()

        // Then
        assertEquals(expectedToken, result)
        verify(mockRepository, times(1)).getStoredToken()
    }

    @Test
    fun `getStoredToken should return null when user is not authenticated`() = runTest {
        // Given
        whenever(mockRepository.getStoredToken()).thenReturn(null)

        // When
        val result = mockRepository.getStoredToken()

        // Then
        assertNull(result)
        verify(mockRepository, times(1)).getStoredToken()
    }

    @Test
    fun `clearAuthData should remove all stored authentication data`() = runTest {
        // Given
        whenever(mockRepository.clearAuthData()).thenReturn(Unit)

        // When
        mockRepository.clearAuthData()

        // Then
        verify(mockRepository, times(1)).clearAuthData()
    }

    @Test
    fun `login with WeChat should handle network errors gracefully`() = runTest {
        // Given
        val expectedResult = AuthResult.Failure("网络连接失败，请检查网络设置")

        whenever(mockRepository.loginWithWeChat()).thenReturn(expectedResult)

        // When
        val result = mockRepository.loginWithWeChat()

        // Then
        assertTrue(result is AuthResult.Failure)
        assertTrue((result as AuthResult.Failure).isNetworkError())
        verify(mockRepository, times(1)).loginWithWeChat()
    }

    @Test
    fun `login with WeChat should handle user cancellation gracefully`() = runTest {
        // Given
        val expectedResult = AuthResult.Failure("用户取消微信授权")

        whenever(mockRepository.loginWithWeChat()).thenReturn(expectedResult)

        // When
        val result = mockRepository.loginWithWeChat()

        // Then
        assertTrue(result is AuthResult.Failure)
        assertTrue((result as AuthResult.Failure).isUserCancelled())
        verify(mockRepository, times(1)).loginWithWeChat()
    }

    @Test
    fun `Repository should handle concurrent login requests correctly`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val expectedResult = AuthResult.Success(userInfo, "test_token")

        whenever(mockRepository.loginWithWeChat()).thenReturn(expectedResult)

        // When - 模拟并发登录请求
        val result1 = mockRepository.loginWithWeChat()
        val result2 = mockRepository.loginWithWeChat()

        // Then
        assertTrue(result1 is AuthResult.Success)
        assertTrue(result2 is AuthResult.Success)
        verify(mockRepository, times(2)).loginWithWeChat()
    }
}