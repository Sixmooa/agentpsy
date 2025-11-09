package com.example.myapplication.data.model

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 认证状态数据模型单元测试
 * TDD模式：测试先行，确保认证状态管理的正确性
 */
class AuthStateTest {

    @Test
    fun `create AuthState NotAuthenticated should be initial state`() {
        // When
        val authState = AuthState.NotAuthenticated

        // Then
        assertFalse(authState.isAuthenticated)
        assertFalse(authState.isLoading)
        assertNull(authState.userInfo)
        assertNull(authState.errorMessage)
        assertTrue(authState is AuthState.NotAuthenticated)
    }

    @Test
    fun `create AuthState Authenticated should contain user info`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )

        // When
        val authState = AuthState.Authenticated(userInfo)

        // Then
        assertTrue(authState.isAuthenticated)
        assertFalse(authState.isLoading)
        assertEquals(userInfo, authState.userInfo)
        assertNull(authState.errorMessage)
        assertTrue(authState is AuthState.Authenticated)
    }

    @Test
    fun `create AuthState Loading should indicate loading state`() {
        // When
        val authState = AuthState.Loading

        // Then
        assertFalse(authState.isAuthenticated)
        assertTrue(authState.isLoading)
        assertNull(authState.userInfo)
        assertNull(authState.errorMessage)
        assertTrue(authState is AuthState.Loading)
    }

    @Test
    fun `create AuthState Error should contain error message`() {
        // Given
        val errorMessage = "微信登录失败：用户取消授权"

        // When
        val authState = AuthState.Error(errorMessage)

        // Then
        assertFalse(authState.isAuthenticated)
        assertFalse(authState.isLoading)
        assertNull(authState.userInfo)
        assertEquals(errorMessage, authState.errorMessage)
        assertTrue(authState is AuthState.Error)
    }

    @Test
    fun `AuthState NotAuthenticated should be singleton`() {
        // Given
        val notAuth1 = AuthState.NotAuthenticated
        val notAuth2 = AuthState.NotAuthenticated

        // When & Then
        assertEquals(notAuth1, notAuth2)
        assertEquals(notAuth1.hashCode(), notAuth2.hashCode())
    }

    @Test
    fun `AuthState Loading should be singleton`() {
        // Given
        val loading1 = AuthState.Loading
        val loading2 = AuthState.Loading

        // When & Then
        assertEquals(loading1, loading2)
        assertEquals(loading1.hashCode(), loading2.hashCode())
    }

    @Test
    fun `AuthState Authenticated equals should work correctly`() {
        // Given
        val userInfo1 = WeChatUserInfo(openid = "test_openid_12345")
        val userInfo2 = WeChatUserInfo(openid = "test_openid_12345")
        val userInfo3 = WeChatUserInfo(openid = "test_openid_67890")

        val authState1 = AuthState.Authenticated(userInfo1)
        val authState2 = AuthState.Authenticated(userInfo2)
        val authState3 = AuthState.Authenticated(userInfo3)

        // When & Then
        assertEquals(authState1, authState2)
        assertNotEquals(authState1, authState3)
        assertNotEquals(authState1, AuthState.NotAuthenticated)
    }

    @Test
    fun `AuthState Error equals should work correctly`() {
        // Given
        val errorMessage1 = "网络错误"
        val errorMessage2 = "网络错误"
        val errorMessage3 = "用户取消"

        val errorState1 = AuthState.Error(errorMessage1)
        val errorState2 = AuthState.Error(errorMessage2)
        val errorState3 = AuthState.Error(errorMessage3)

        // When & Then
        assertEquals(errorState1, errorState2)
        assertNotEquals(errorState1, errorState3)
        assertNotEquals(errorState1, AuthState.NotAuthenticated)
    }

    @Test
    fun `AuthState should handle when expressions correctly`() {
        // Given
        val notAuthState = AuthState.NotAuthenticated
        val authState = AuthState.Authenticated(WeChatUserInfo(openid = "test"))
        val loadingState = AuthState.Loading
        val errorState = AuthState.Error("测试错误")

        // When & Then
        val notAuthMessage = when (notAuthState) {
            is AuthState.NotAuthenticated -> "未登录"
            is AuthState.Authenticated -> "已登录"
            is AuthState.Loading -> "加载中"
            is AuthState.Error -> "错误"
        }
        assertEquals("未登录", notAuthMessage)

        val authMessage = when (authState) {
            is AuthState.NotAuthenticated -> "未登录"
            is AuthState.Authenticated -> "已登录"
            is AuthState.Loading -> "加载中"
            is AuthState.Error -> "错误"
        }
        assertEquals("已登录", authMessage)

        val loadingMessage = when (loadingState) {
            is AuthState.NotAuthenticated -> "未登录"
            is AuthState.Authenticated -> "已登录"
            is AuthState.Loading -> "加载中"
            is AuthState.Error -> "错误"
        }
        assertEquals("加载中", loadingMessage)

        val errorMessage = when (errorState) {
            is AuthState.NotAuthenticated -> "未登录"
            is AuthState.Authenticated -> "已登录"
            is AuthState.Loading -> "加载中"
            is AuthState.Error -> "错误"
        }
        assertEquals("错误", errorMessage)
    }

    @Test
    fun `AuthState toString should provide meaningful information`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val authState = AuthState.Authenticated(userInfo)
        val errorState = AuthState.Error("测试错误")

        // When
        val authString = authState.toString()
        val errorString = errorState.toString()

        // Then
        assertTrue("Authenticated toString should contain Authenticated", authString.contains("Authenticated"))
        assertTrue("Authenticated toString should contain user info", authString.contains("test_openid_12345"))

        assertTrue("Error toString should contain Error", errorString.contains("Error"))
        assertTrue("Error toString should contain error message", errorString.contains("测试错误"))
    }

    @Test
    fun `AuthState should handle empty error message`() {
        // Given
        val emptyErrorMessage = ""

        // When
        val errorState = AuthState.Error(emptyErrorMessage)

        // Then
        assertEquals(emptyErrorMessage, errorState.errorMessage)
        assertTrue(errorState is AuthState.Error)
        assertFalse(errorState.isAuthenticated)
    }

    @Test
    fun `AuthState should handle null error message`() {
        // Given
        val nullErrorMessage = null

        // When
        val errorState = AuthState.Error(null)

        // Then
        assertNull(errorState.errorMessage)
        assertTrue(errorState is AuthState.Error)
        assertFalse(errorState.isAuthenticated)
    }

    @Test
    fun `AuthState Authenticated should handle null user info`() {
        // Given
        val nullUserInfo = null

        // When & Then
        try {
            AuthState.Authenticated(null!!)
            fail("Expected IllegalArgumentException for null user info")
        } catch (e: IllegalArgumentException) {
            assertEquals("User info cannot be null in Authenticated state", e.message)
        }
    }

    @Test
    fun `AuthState copy should work correctly for Authenticated`() {
        // Given
        val originalUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "原昵称"
        )
        val originalState = AuthState.Authenticated(originalUserInfo)

        // When
        val newUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "新昵称"
        )
        val copiedState = originalState.copy(userInfo = newUserInfo)

        // Then
        assertEquals(newUserInfo, copiedState.userInfo)
        assertNotEquals(originalState.userInfo, copiedState.userInfo)
        assertTrue(copiedState.isAuthenticated)
        assertFalse(copiedState.isLoading)
    }

    @Test
    fun `AuthState copy should work correctly for Error`() {
        // Given
        val originalState = AuthState.Error("原错误信息")

        // When
        val copiedState = originalState.copy(errorMessage = "新错误信息")

        // Then
        assertEquals("新错误信息", copiedState.errorMessage)
        assertNotEquals(originalState.errorMessage, copiedState.errorMessage)
        assertFalse(copiedState.isAuthenticated)
        assertFalse(copiedState.isLoading)
    }
}