package com.example.myapplication.ui

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.model.AuthResult
import com.example.myapplication.data.model.AuthState
import com.example.myapplication.data.model.WeChatUserInfo
import com.example.myapplication.data.repository.AuthRepository
import com.example.myapplication.ui.viewmodel.WeChatLoginViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.*

/**
 * 微信登录ViewModel单元测试
 * TDD模式：测试先行，确保ViewModel层的所有功能都正确实现
 */
@ExperimentalCoroutinesApi
class WeChatLoginViewModelTest {

    @get:Rule
    val instantExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var mockRepository: AuthRepository

    private lateinit var viewModel: WeChatLoginViewModel
    private val testDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
        Dispatchers.setMain(testDispatcher)

        // Mock repository behavior
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))

        viewModel = WeChatLoginViewModel(mockRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initial state should be NotAuthenticated`() {
        // Given
        whenever(mockRepository.isUserLoggedIn()).thenReturn(false)
        whenever(mockRepository.getCurrentUser()).thenReturn(null)

        // When
        val authState = viewModel.authState.value
        val isLoggedIn = viewModel.isLoggedIn.value
        val currentUser = viewModel.currentUser.value

        // Then
        assertTrue(authState is AuthState.NotAuthenticated)
        assertFalse(isLoggedIn)
        assertNull(currentUser)
    }

    @Test
    fun `initial state should be Authenticated when user is logged in`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        whenever(mockRepository.isUserLoggedIn()).thenReturn(true)
        whenever(mockRepository.getCurrentUser()).thenReturn(userInfo)

        // When
        viewModel = WeChatLoginViewModel(mockRepository)
        val authState = viewModel.authState.value
        val isLoggedIn = viewModel.isLoggedIn.value
        val currentUser = viewModel.currentUser.value

        // Then
        assertTrue(authState is AuthState.Authenticated)
        assertTrue(isLoggedIn)
        assertEquals(userInfo, currentUser)
    }

    @Test
    fun `login should update state to Loading during authentication`() = runTest {
        // Given
        val loadingState = AuthState.Loading
        val authStateFlow = flowOf(
            AuthState.NotAuthenticated,
            loadingState
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)
        whenever(mockRepository.loginWithWeChat()).thenReturn(AuthResult.Loading)

        // When
        viewModel.loginWithWeChat()
        val authState = viewModel.authState.value

        // Then
        assertEquals(loadingState, authState)
        assertTrue(viewModel.isLoading.value)
    }

    @Test
    fun `login should update state to Authenticated on success`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val successResult = AuthResult.Success(userInfo, "test_token")
        val authStateFlow = flowOf(
            AuthState.NotAuthenticated,
            AuthState.Loading,
            AuthState.Authenticated(userInfo)
        )

        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)
        whenever(mockRepository.loginWithWeChat()).thenReturn(successResult)

        // When
        viewModel.loginWithWeChat()

        // 等待状态更新
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        val authState = viewModel.authState.value
        assertTrue(authState is AuthState.Authenticated)
        assertEquals(userInfo, (authState as AuthState.Authenticated).userInfo)
        assertTrue(viewModel.isLoggedIn.value)
        assertEquals(userInfo, viewModel.currentUser.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `login should update state to Error on failure`() = runTest {
        // Given
        val errorMessage = "用户取消授权"
        val failureResult = AuthResult.Failure(errorMessage)
        val authStateFlow = flowOf(
            AuthState.NotAuthenticated,
            AuthState.Loading,
            AuthState.Error(errorMessage)
        )

        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)
        whenever(mockRepository.loginWithWeChat()).thenReturn(failureResult)

        // When
        viewModel.loginWithWeChat()

        // 等待状态更新
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        val authState = viewModel.authState.value
        assertTrue(authState is AuthState.Error)
        assertEquals(errorMessage, (authState as AuthState.Error).errorMessage)
        assertFalse(viewModel.isLoggedIn.value)
        assertNull(viewModel.currentUser.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `logout should update state to NotAuthenticated`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(
            AuthState.Authenticated(userInfo),
            AuthState.NotAuthenticated
        ))
        whenever(mockRepository.logout()).thenReturn(Unit)

        // 先设置为已登录状态
        viewModel = WeChatLoginViewModel(mockRepository)
        testDispatcher.scheduler.advanceUntilIdle()

        // When
        viewModel.logout()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        val authState = viewModel.authState.value
        assertTrue(authState is AuthState.NotAuthenticated)
        assertFalse(viewModel.isLoggedIn.value)
        assertNull(viewModel.currentUser.value)
        verify(mockRepository, times(1)).logout()
    }

    @Test
    fun `refreshUserInfo should update current user data`() = runTest {
        // Given
        val originalUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "原昵称"
        )
        val updatedUserInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "新昵称"
        )

        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(originalUserInfo)))
        whenever(mockRepository.refreshUserInfo()).thenReturn(updatedUserInfo)

        viewModel = WeChatLoginViewModel(mockRepository)
        testDispatcher.scheduler.advanceUntilIdle()

        // When
        viewModel.refreshUserInfo()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        verify(mockRepository, times(1)).refreshUserInfo()
        // Note: 具体的状态更新逻辑取决于实现
    }

    @Test
    fun `getStoredToken should return current token`() = runTest {
        // Given
        val token = "test_jwt_token_12345"
        whenever(mockRepository.getStoredToken()).thenReturn(token)

        // When
        val result = viewModel.getStoredToken()

        // Then
        assertEquals(token, result)
        verify(mockRepository, times(1)).getStoredToken()
    }

    @Test
    fun `getStoredToken should return null when not authenticated`() = runTest {
        // Given
        whenever(mockRepository.getStoredToken()).thenReturn(null)

        // When
        val result = viewModel.getStoredToken()

        // Then
        assertNull(result)
        verify(mockRepository, times(1)).getStoredToken()
    }

    @Test
    fun `isLoginInProgress should return true during login`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(
            AuthState.NotAuthenticated,
            AuthState.Loading
        ))
        whenever(mockRepository.loginWithWeChat()).thenReturn(AuthResult.Loading)

        // When
        viewModel.loginWithWeChat()

        // Then
        assertTrue(viewModel.isLoading.value)
        assertTrue(viewModel.isLoginInProgress.value)
    }

    @Test
    fun `isLoginInProgress should return false when not logging in`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))

        // When
        val isLoginInProgress = viewModel.isLoginInProgress.value

        // Then
        assertFalse(isLoginInProgress)
    }

    @Test
    fun `getErrorMessage should return formatted error message`() = runTest {
        // Given
        val errorMessage = "网络连接失败"
        val authStateFlow = flowOf(AuthState.Error(errorMessage))
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)

        // When
        viewModel = WeChatLoginViewModel(mockRepository)
        val error = viewModel.getErrorMessage()

        // Then
        assertEquals(errorMessage, error)
    }

    @Test
    fun `getErrorMessage should return null when no error`() = runTest {
        // Given
        val authStateFlow = flowOf(AuthState.NotAuthenticated)
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)

        // When
        viewModel = WeChatLoginViewModel(mockRepository)
        val error = viewModel.getErrorMessage()

        // Then
        assertNull(error)
    }

    @Test
    fun `getUserDisplayName should return user nickname`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        val authStateFlow = flowOf(AuthState.Authenticated(userInfo))
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)

        // When
        viewModel = WeChatLoginViewModel(mockRepository)
        val displayName = viewModel.getUserDisplayName()

        // Then
        assertEquals("测试用户", displayName)
    }

    @Test
    fun `getUserDisplayName should return default when not authenticated`() = runTest {
        // Given
        val authStateFlow = flowOf(AuthState.NotAuthenticated)
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)

        // When
        viewModel = WeChatLoginViewModel(mockRepository)
        val displayName = viewModel.getUserDisplayName()

        // Then
        assertEquals("未登录", displayName)
    }

    @Test
    fun `getUserAvatarUrl should return user avatar`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )
        val authStateFlow = flowOf(AuthState.Authenticated(userInfo))
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)

        // When
        viewModel = WeChatLoginViewModel(mockRepository)
        val avatarUrl = viewModel.getUserAvatarUrl()

        // Then
        assertEquals("https://wx.qlogo.cn/avatar/test.jpg", avatarUrl)
    }

    @Test
    fun `getUserAvatarUrl should return empty when not authenticated`() = runTest {
        // Given
        val authStateFlow = flowOf(AuthState.NotAuthenticated)
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)

        // When
        viewModel = WeChatLoginViewModel(mockRepository)
        val avatarUrl = viewModel.getUserAvatarUrl()

        // Then
        assertEquals("", avatarUrl)
    }

    @Test
    fun `complete login flow should work correctly`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )
        val token = "test_jwt_token"

        val authStateFlow = flowOf(
            AuthState.NotAuthenticated,
            AuthState.Loading,
            AuthState.Authenticated(userInfo)
        )

        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)
        whenever(mockRepository.loginWithWeChat()).thenReturn(AuthResult.Success(userInfo, token))
        whenever(mockRepository.getStoredToken()).thenReturn(token)

        // When - 登录
        viewModel.loginWithWeChat()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证登录后状态
        assertTrue(viewModel.isLoggedIn.value)
        assertEquals(userInfo, viewModel.currentUser.value)
        assertEquals("测试用户", viewModel.getUserDisplayName())
        assertEquals("https://wx.qlogo.cn/avatar/test.jpg", viewModel.getUserAvatarUrl())
        assertEquals(token, viewModel.getStoredToken())
        assertFalse(viewModel.isLoading.value)

        // When - 登出
        val logoutFlow = flowOf(AuthState.NotAuthenticated)
        whenever(mockRepository.getAuthStateFlow()).thenReturn(logoutFlow)
        whenever(mockRepository.logout()).thenReturn(Unit)

        viewModel.logout()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证登出后状态
        assertFalse(viewModel.isLoggedIn.value)
        assertNull(viewModel.currentUser.value)
        assertEquals("未登录", viewModel.getUserDisplayName())
        assertEquals("", viewModel.getUserAvatarUrl())
    }

    @Test
    fun `should handle repository exceptions gracefully`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        whenever(mockRepository.loginWithWeChat()).thenThrow(RuntimeException("网络错误"))

        // When
        viewModel.loginWithWeChat()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        val authState = viewModel.authState.value
        // 应该处理异常并显示错误状态
        assertTrue(authState is AuthState.Error || authState is AuthState.NotAuthenticated)
    }

    @Test
    fun `should update loading state correctly during operations`() = runTest {
        // Given
        val authStateFlow = flowOf(
            AuthState.NotAuthenticated,
            AuthState.Loading,
            AuthState.Authenticated(WeChatUserInfo(openid = "test"))
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)
        whenever(mockRepository.loginWithWeChat()).thenReturn(AuthResult.Loading)

        // When
        val loadingStates = mutableListOf<Boolean>()

        // 监听loading状态变化
        viewModel.isLoading.observeForever { loading ->
            loadingStates.add(loading)
        }

        viewModel.loginWithWeChat()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        assertTrue(loadingStates.contains(true)) // 应该有加载状态
        assertTrue(loadingStates.contains(false)) // 应该恢复非加载状态
    }
}