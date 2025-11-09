package com.example.myapplication.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import com.example.myapplication.data.model.*
import io.mockk.*
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow MutableStateFlow
import kotlinx.coroutines.test.runTest
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 微信认证Repository实现单元测试
 * 测试真实的Repository实现逻辑
 */
class WeChatAuthRepositoryImplTest {

    private lateinit var context: Context
    private lateinit var dataStore: DataStore<Preferences>
    private lateinit var preferences: Preferences
    private lateinit var repository: WeChatAuthRepository

    @Before
    fun setUp() {
        context = mockk(relaxed = true)
        dataStore = mockk()
        preferences = mockk()

        // Mock DataStore behavior
        every { dataStore.data } returns flowOf(preferences)
        coEvery { dataStore.edit(any()) } returns mockk()

        repository = WeChatAuthRepository(context, dataStore)
    }

    @Test
    fun `loginWithWeChat should return success and update state`() = runTest {
        // Given
        mockkObject(repository)
        every { repository["performMockWeChatLogin"]() } returns AuthResult.Success(
            WeChatUserInfo(openid = "test_openid", nickname = "测试用户"),
            "test_token"
        )
        coEvery { dataStore.edit(any()) } returns mockk {
            every { this[any<Preferences.Key<Boolean>>()] = any() } just Runs
            every { this[any<Preferences.Key<String>>()] = any() } just Runs
        }

        // When
        val result = repository.loginWithWeChat()
        val authState = repository.getCurrentAuthState()

        // Then
        assertTrue(result is AuthResult.Success)
        assertTrue(authState is AuthState.Authenticated)
        assertEquals("测试用户", (result as AuthResult.Success).userInfo.nickname)
        assertEquals("test_token", result.token)

        coVerify { dataStore.edit(any()) }
    }

    @Test
    fun `loginWithWeChat should handle exception and return error`() = runTest {
        // Given
        mockkObject(repository)
        every { repository["performMockWeChatLogin"]() } throws RuntimeException("网络错误")

        // When
        val result = repository.loginWithWeChat()
        val authState = repository.getCurrentAuthState()

        // Then
        assertTrue(result is AuthResult.Failure)
        assertTrue(authState is AuthState.Error)
        assertTrue((result as AuthResult.Failure).errorMessage!!.contains("登录失败"))

        verify { dataStore.data } // 只读取，不编辑
    }

    @Test
    fun `logout should clear data and update state to NotAuthenticated`() = runTest {
        // Given
        repository.updateAuthState(AuthState.Authenticated(
            WeChatUserInfo(openid = "test_openid", nickname = "测试用户")
        ))

        coEvery { dataStore.edit(any()) } returns mockk {
            every { this[any<Preferences.Key<Boolean>>()] = any() } just Runs
            every { this.remove(any<Preferences.Key<String>>()) } just Runs
        }

        // When
        repository.logout()
        val authState = repository.getCurrentAuthState()

        // Then
        assertTrue(authState is AuthState.NotAuthenticated)
        coVerify { dataStore.edit(any()) }
    }

    @Test
    fun `getCurrentUser should return user info when authenticated`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(openid = "test_openid", nickname = "测试用户")
        repository.updateAuthState(AuthState.Authenticated(userInfo))

        // When
        val result = repository.getCurrentUser()

        // Then
        assertEquals(userInfo, result)
    }

    @Test
    fun `getCurrentUser should return null when not authenticated`() = runTest {
        // Given
        repository.updateAuthState(AuthState.NotAuthenticated)

        // When
        val result = repository.getCurrentUser()

        // Then
        assertNull(result)
    }

    @Test
    fun `isUserLoggedIn should return true when authenticated`() = runTest {
        // Given
        repository.updateAuthState(AuthState.Authenticated(
            WeChatUserInfo(openid = "test_openid", nickname = "测试用户")
        ))

        // When
        val result = repository.isUserLoggedIn()

        // Then
        assertTrue(result)
    }

    @Test
    fun `isUserLoggedIn should return false when not authenticated`() = runTest {
        // Given
        repository.updateAuthState(AuthState.NotAuthenticated)

        // When
        val result = repository.isUserLoggedIn()

        // Then
        assertFalse(result)
    }

    @Test
    fun `getAuthStateFlow should emit current auth state`() = runTest {
        // Given
        val expectedState = AuthState.Authenticated(
            WeChatUserInfo(openid = "test_openid", nickname = "测试用户")
        )
        repository.updateAuthState(expectedState)

        // When
        val authStateFlow = repository.getAuthStateFlow().first()

        // Then
        assertEquals(expectedState, authStateFlow)
    }

    @Test
    fun `refreshUserInfo should return current user info`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(openid = "test_openid", nickname = "测试用户")
        repository.updateAuthState(AuthState.Authenticated(userInfo))

        // When
        val result = repository.refreshUserInfo()

        // Then
        assertEquals(userInfo, result)
    }

    @Test
    fun `refreshUserInfo should return null when not authenticated`() = runTest {
        // Given
        repository.updateAuthState(AuthState.NotAuthenticated)

        // When
        val result = repository.refreshUserInfo()

        // Then
        assertNull(result)
    }

    @Test
    fun `getStoredToken should return token when authenticated`() = runTest {
        // Given
        val token = "test_token"
        coEvery { dataStore.edit(any()) } returns mockk {
            every { this[any<Preferences.Key<Boolean>>()] = any() } just Runs
            every { this[any<Preferences.Key<String>>()] = any() } just Runs
        }
        repository.updateAuthState(AuthState.Authenticated(
            WeChatUserInfo(openid = "test_openid", nickname = "测试用户")
        ))

        // Mock the dataStore to return the token
        val mockPreferences = mockk<Preferences>()
        every { dataStore.data } returns flowOf(mockPreferences)
        every { mockPreferences[any<Preferences.Key<String>>()] } returns token

        // When
        val result = repository.getStoredToken()

        // Then
        assertEquals(token, result)
    }

    @Test
    fun `getStoredToken should return null when not authenticated`() = runTest {
        // Given
        repository.updateAuthState(AuthState.NotAuthenticated)

        // When
        val result = repository.getStoredToken()

        // Then
        assertNull(result)
    }

    @Test
    fun `clearAuthData should remove all stored data`() = runTest {
        // Given
        coEvery { dataStore.edit(any()) } returns mockk {
            every { this.remove(any<Preferences.Key<String>>()) } just Runs
            every { this[any<Preferences.Key<Boolean>>()] = any() } just Runs
        }

        // When
        repository.clearAuthData()

        // Then
        coVerify { dataStore.edit(any()) }
    }

    @Test
    fun `updateAuthState should update state and save data`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(openid = "test_openid", nickname = "测试用户")
        coEvery { dataStore.edit(any()) } returns mockk {
            every { this[any<Preferences.Key<Boolean>>()] = any() } just Runs
            every { this[any<Preferences.Key<String>>()] = any() } just Runs
        }

        // When
        repository.updateAuthState(AuthState.Authenticated(userInfo))

        // Then
        val authState = repository.getCurrentAuthState()
        assertTrue(authState is AuthState.Authenticated)
        assertEquals(userInfo, (authState as AuthState.Authenticated).userInfo)
        coVerify { dataStore.edit(any()) }
    }

    @Test
    fun `validateStoredData should return true for consistent data`() = runTest {
        // Given - 模拟一致的存储数据
        val mockPreferences = mockk<Preferences>()
        every { dataStore.data } returns flowOf(mockPreferences)
        every { mockPreferences[any<Preferences.Key<Boolean>>()] } returns true
        every { mockPreferences[any<Preferences.Key<String>>()] } returns "some_data"

        // When
        val result = repository.validateStoredData()

        // Then
        assertTrue(result)
    }

    @Test
    fun `validateStoredData should return false for inconsistent data`() = runTest {
        // Given - 模拟不一致的存储数据（已登录但无用户数据）
        val mockPreferences = mockk<Preferences>()
        every { dataStore.data } returns flowOf(mockPreferences)
        every { mockPreferences[any<Preferences.Key<Boolean>>()] } returns true
        every { mockPreferences[any<Preferences.Key<String>>()] } returns null

        coEvery { dataStore.edit(any()) } returns mockk {
            every { this.remove(any<Preferences.Key<String>>()) } just Runs
            every { this[any<Preferences.Key<Boolean>>()] = any() } just Runs
        }

        // When
        val result = repository.validateStoredData()

        // Then
        assertFalse(result)
        coVerify { dataStore.edit(any()) } // 应该清除不一致的数据
    }

    @Test
    fun `complete login flow should work correctly`() = runTest {
        // Given
        mockkObject(repository)
        val userInfo = WeChatUserInfo(
            openid = "test_openid",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )
        val token = "test_jwt_token"

        every { repository["performMockWeChatLogin"]() } returns AuthResult.Success(userInfo, token)
        coEvery { dataStore.edit(any()) } returns mockk {
            every { this[any<Preferences.Key<Boolean>>()] = any() } just Runs
            every { this[any<Preferences.Key<String>>()] = any() } just Runs
        }

        // When - 执行登录
        val loginResult = repository.loginWithWeChat()

        // Then - 验证登录结果
        assertTrue(loginResult is AuthResult.Success)
        assertEquals(userInfo, (loginResult as AuthResult.Success).userInfo)
        assertEquals(token, loginResult.token)

        // When - 检查登录状态
        val isLoggedIn = repository.isUserLoggedIn()
        val currentUser = repository.getCurrentUser()
        val storedToken = repository.getStoredToken()

        // Then - 验证状态
        assertTrue(isLoggedIn)
        assertEquals(userInfo, currentUser)
        assertEquals(token, storedToken)

        // When - 执行登出
        coEvery { dataStore.edit(any()) } returns mockk {
            every { this.remove(any<Preferences.Key<String>>()) } just Runs
            every { this[any<Preferences.Key<Boolean>>()] = any() } just Runs
        }
        repository.logout()

        // Then - 验证登出状态
        assertFalse(repository.isUserLoggedIn())
        assertNull(repository.getCurrentUser())
        assertNull(repository.getStoredToken())
    }
}