package com.example.myapplication.data.model

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 认证结果数据模型单元测试
 * TDD模式：测试先行，确保认证结果的各种状态都能正确处理
 */
class AuthResultTest {

    @Test
    fun `create AuthResult Success should contain user info and token`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val token = "test_jwt_token_abcdef"

        // When
        val authResult = AuthResult.Success(userInfo, token)

        // Then
        assertEquals(userInfo, authResult.userInfo)
        assertEquals(token, authResult.token)
        assertTrue(authResult.isSuccess)
        assertFalse(authResult.isFailure)
    }

    @Test
    fun `create AuthResult Failure should contain error message`() {
        // Given
        val errorMessage = "用户取消授权"

        // When
        val authResult = AuthResult.Failure(errorMessage)

        // Then
        assertEquals(errorMessage, authResult.errorMessage)
        assertNull(authResult.userInfo)
        assertNull(authResult.token)
        assertFalse(authResult.isSuccess)
        assertTrue(authResult.isFailure)
    }

    @Test
    fun `create AuthResult Loading should indicate loading state`() {
        // When
        val authResult = AuthResult.Loading

        // Then
        assertNull(authResult.userInfo)
        assertNull(authResult.token)
        assertNull(authResult.errorMessage)
        assertFalse(authResult.isSuccess)
        assertFalse(authResult.isFailure)
        assertTrue(authResult.isLoading)
    }

    @Test
    fun `AuthResult Success should handle empty token`() {
        // Given
        val userInfo = WeChatUserInfo(openid = "test_openid_12345")
        val emptyToken = ""

        // When
        val authResult = AuthResult.Success(userInfo, emptyToken)

        // Then
        assertEquals(userInfo, authResult.userInfo)
        assertEquals(emptyToken, authResult.token)
        assertTrue(authResult.isSuccess)
    }

    @Test
    fun `AuthResult Failure should handle empty error message`() {
        // Given
        val emptyErrorMessage = ""

        // When
        val authResult = AuthResult.Failure(emptyErrorMessage)

        // Then
        assertEquals(emptyErrorMessage, authResult.errorMessage)
        assertTrue(authResult.isFailure)
    }

    @Test
    fun `AuthResult Failure should handle null error message`() {
        // Given
        val nullErrorMessage = null

        // When
        val authResult = AuthResult.Failure(null)

        // Then
        assertNull(authResult.errorMessage)
        assertTrue(authResult.isFailure)
    }

    @Test
    fun `AuthResult equals should work correctly for Success`() {
        // Given
        val userInfo = WeChatUserInfo(openid = "test_openid_12345")
        val token = "test_token"
        val result1 = AuthResult.Success(userInfo, token)
        val result2 = AuthResult.Success(userInfo, token)
        val result3 = AuthResult.Success(
            WeChatUserInfo(openid = "different_openid"),
            token
        )

        // When & Then
        assertEquals(result1, result2)
        assertNotEquals(result1, result3)
        assertNotEquals(result1, AuthResult.Loading)
    }

    @Test
    fun `AuthResult equals should work correctly for Failure`() {
        // Given
        val errorMessage = "网络错误"
        val result1 = AuthResult.Failure(errorMessage)
        val result2 = AuthResult.Failure(errorMessage)
        val result3 = AuthResult.Failure("其他错误")

        // When & Then
        assertEquals(result1, result2)
        assertNotEquals(result1, result3)
        assertNotEquals(result1, AuthResult.Loading)
    }

    @Test
    fun `AuthResult Loading should be singleton`() {
        // Given
        val loading1 = AuthResult.Loading
        val loading2 = AuthResult.Loading

        // When & Then
        assertEquals(loading1, loading2)
        assertEquals(loading1.hashCode(), loading2.hashCode())
    }

    @Test
    fun `AuthResult toString should provide meaningful information`() {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val successResult = AuthResult.Success(userInfo, "test_token")
        val failureResult = AuthResult.Failure("测试错误")
        val loadingResult = AuthResult.Loading

        // When
        val successString = successResult.toString()
        val failureString = failureResult.toString()
        val loadingString = loadingResult.toString()

        // Then
        assertTrue("Success toString should contain Success", successString.contains("Success"))
        assertTrue("Success toString should contain user info", successString.contains("test_openid_12345"))

        assertTrue("Failure toString should contain Failure", failureString.contains("Failure"))
        assertTrue("Failure toString should contain error message", failureString.contains("测试错误"))

        assertTrue("Loading toString should contain Loading", loadingString.contains("Loading"))
    }

    @Test
    fun `AuthResult should handle when with different types`() {
        // Given
        val userInfo = WeChatUserInfo(openid = "test_openid_12345")
        val successResult = AuthResult.Success(userInfo, "token")
        val failureResult = AuthResult.Failure("error")
        val loadingResult = AuthResult.Loading

        // When & Then - 测试when表达式兼容性
        val resultType = when (successResult) {
            is AuthResult.Success -> "Success"
            is AuthResult.Failure -> "Failure"
            is AuthResult.Loading -> "Loading"
        }
        assertEquals("Success", resultType)

        val failureType = when (failureResult) {
            is AuthResult.Success -> "Success"
            is AuthResult.Failure -> "Failure"
            is AuthResult.Loading -> "Loading"
        }
        assertEquals("Failure", failureType)

        val loadingType = when (loadingResult) {
            is AuthResult.Success -> "Success"
            is AuthResult.Failure -> "Failure"
            is AuthResult.Loading -> "Loading"
        }
        assertEquals("Loading", loadingType)
    }

    @Test
    fun `AuthResult Success copy should work correctly`() {
        // Given
        val originalUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "原昵称"
        )
        val originalToken = "original_token"
        val originalResult = AuthResult.Success(originalUserInfo, originalToken)

        // When
        val newUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "新昵称"
        )
        val copiedResult = originalResult.copy(userInfo = newUserInfo)

        // Then
        assertEquals(newUserInfo, copiedResult.userInfo)
        assertEquals(originalToken, copiedResult.token)
        assertNotEquals(originalResult.userInfo, copiedResult.userInfo)
        assertTrue(copiedResult.isSuccess)
    }
}