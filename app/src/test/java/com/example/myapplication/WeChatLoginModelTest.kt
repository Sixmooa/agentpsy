package com.example.myapplication

import com.example.myapplication.data.model.*
import org.junit.Test
import org.junit.Assert.*

/**
 * 微信登录数据模型集成测试
 * 验证所有微信登录相关的数据模型协同工作
 */
class WeChatLoginModelTest {

    @Test
    fun `WeChatUserInfo creation should work correctly`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )

        // When & Then
        assertEquals("test_openid_12345", userInfo.openid)
        assertEquals("测试用户", userInfo.nickname)
        assertEquals("https://wx.qlogo.cn/avatar/test.jpg", userInfo.avatarUrl)
        assertEquals("测试用户", userInfo.getDisplayName())
        assertEquals("https://wx.qlogo.cn/avatar/test.jpg", userInfo.getAvatarUrlSafe())
    }

    @Test
    fun `AuthResult flow should work correctly`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val token = "test_jwt_token"

        // When - 创建成功结果
        val successResult = AuthResult.Success(userInfo, token)

        // Then - 验证成功状态
        assertTrue(successResult.isSuccess)
        assertFalse(successResult.isFailure)
        assertFalse(successResult.isLoading)
        assertEquals(userInfo, successResult.userInfo)
        assertEquals(token, successResult.token)
        assertNull(successResult.errorMessage)

        // When - 创建失败结果
        val failureResult = AuthResult.Failure("用户取消授权")

        // Then - 验证失败状态
        assertFalse(failureResult.isSuccess)
        assertTrue(failureResult.isFailure)
        assertFalse(failureResult.isLoading)
        assertNull(failureResult.userInfo)
        assertNull(failureResult.token)
        assertEquals("用户取消授权", failureResult.errorMessage)

        // When - 创建加载状态
        val loadingResult = AuthResult.Loading

        // Then - 验证加载状态
        assertFalse(loadingResult.isSuccess)
        assertFalse(loadingResult.isFailure)
        assertTrue(loadingResult.isLoading)
        assertNull(loadingResult.userInfo)
        assertNull(loadingResult.token)
        assertNull(loadingResult.errorMessage)
    }

    @Test
    fun `AuthState flow should work correctly`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )

        // When - 创建未认证状态
        val notAuthState = AuthState.NotAuthenticated

        // Then - 验证未认证状态
        assertFalse(notAuthState.isAuthenticated)
        assertFalse(notAuthState.isLoading)
        assertNull(notAuthState.userInfo)
        assertNull(notAuthState.errorMessage)
        assertEquals("未登录", notAuthState.getDescription())

        // When - 创建已认证状态
        val authState = AuthState.Authenticated(userInfo)

        // Then - 验证已认证状态
        assertTrue(authState.isAuthenticated)
        assertFalse(authState.isLoading)
        assertEquals(userInfo, authState.userInfo)
        assertNull(authState.errorMessage)
        assertTrue(authState.getDescription().contains("测试用户"))

        // When - 创建加载状态
        val loadingState = AuthState.Loading

        // Then - 验证加载状态
        assertFalse(loadingState.isAuthenticated)
        assertTrue(loadingState.isLoading)
        assertNull(loadingState.userInfo)
        assertNull(loadingState.errorMessage)
        assertEquals("正在登录...", loadingState.getDescription())

        // When - 创建错误状态
        val errorState = AuthState.Error("网络连接失败")

        // Then - 验证错误状态
        assertFalse(errorState.isAuthenticated)
        assertFalse(errorState.isLoading)
        assertNull(errorState.userInfo)
        assertEquals("网络连接失败", errorState.errorMessage)
        assertTrue(errorState.getDescription().contains("网络连接失败"))
    }

    @Test
    fun `AuthResult to AuthState conversion should work correctly`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )

        // When & Then - 成功结果转换为已认证状态
        val successResult = AuthResult.Success(userInfo, "test_token")
        val authStateFromSuccess = AuthState.fromAuthResult(successResult)
        assertTrue(authStateFromSuccess is AuthState.Authenticated)
        assertEquals(userInfo, (authStateFromSuccess as AuthState.Authenticated).userInfo)

        // When & Then - 失败结果转换为错误状态
        val failureResult = AuthResult.Failure("登录失败")
        val authStateFromFailure = AuthState.fromAuthResult(failureResult)
        assertTrue(authStateFromFailure is AuthState.Error)
        assertEquals("登录失败", (authStateFromFailure as AuthState.Error).errorMessage)

        // When & Then - 加载结果转换为加载状态
        val loadingResult = AuthResult.Loading
        val authStateFromLoading = AuthState.fromAuthResult(loadingResult)
        assertTrue(authStateFromLoading is AuthState.Loading)
    }

    @Test
    fun `WeChatUserInfo utility methods should work correctly`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg",
            sex = 1,
            province = "广东",
            city = "深圳",
            country = "中国"
        )

        // When & Then
        assertEquals("男", userInfo.getSexDescription())
        assertEquals("中国 广东 深圳", userInfo.getFullLocation())
        assertTrue(userInfo.hasLocationInfo())
        assertTrue(userInfo.getShortDescription().contains("测试用户"))
        assertTrue(userInfo.getShortDescription().contains("中国 广东 深圳"))

        // Given - 没有位置信息的用户
        val userInfoNoLocation = WeChatUserInfo(
            openid = "test_openid_67890",
            nickname = "简单用户"
        )

        // When & Then
        assertFalse(userInfoNoLocation.hasLocationInfo())
        assertEquals("", userInfoNoLocation.getFullLocation())
        assertEquals("简单用户", userInfoNoLocation.getShortDescription())
    }

    @Test
    fun `AuthResult and AuthState error handling should work correctly`() {
        // Given
        val networkError = AuthResult.Failure("网络连接超时")
        val userCancelError = AuthResult.Failure("用户取消授权")
        val unknownError = AuthResult.Failure(null)

        // When & Then
        assertTrue(networkError.isNetworkError())
        assertFalse(networkError.isUserCancelled())

        assertFalse(userCancelError.isNetworkError())
        assertTrue(userCancelError.isUserCancelled())

        assertFalse(unknownError.isNetworkError())
        assertFalse(unknownError.isUserCancelled())

        // AuthState error handling
        val authError = AuthState.Error("应用配置错误")
        assertTrue(authError.hasErrorMessage())
        assertEquals("应用配置错误", authError.getFormattedErrorMessage())
        assertTrue(authError.isRetryable())
    }

    @Test
    fun `complete login flow simulation should work correctly`() {
        // Given - 模拟完整的登录流程
        val userInfo = WeChatUserInfo(
            openid = "wx_test_openid_12345",
            nickname = "微信测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test123.jpg",
            sex = 2,
            province = "北京",
            city = "北京",
            country = "中国"
        )

        // Step 1: 初始状态为未认证
        var currentState = AuthState.NotAuthenticated
        assertFalse(currentState.isAuthenticated)

        // Step 2: 开始登录，进入加载状态
        currentState = AuthState.Loading
        assertTrue(currentState.isLoading)
        assertFalse(currentState.isAuthenticated)

        // Step 3: 登录成功，转换为已认证状态
        val authResult = AuthResult.Success(userInfo, "jwt_token_abcdef123456")
        currentState = AuthState.fromAuthResult(authResult)
        assertTrue(currentState.isAuthenticated)
        assertFalse(currentState.isLoading)

        // Step 4: 验证用户信息
        assertTrue(currentState is AuthState.Authenticated)
        val authenticatedState = currentState as AuthState.Authenticated
        assertEquals("微信测试用户", authenticatedState.getUserDisplayName())
        assertEquals("https://wx.qlogo.cn/avatar/test123.jpg", authenticatedState.getUserAvatarUrl())
        assertEquals("女", authenticatedState.userInfo.getSexDescription())
        assertTrue(authenticatedState.hasCompleteUserInfo())
    }
}