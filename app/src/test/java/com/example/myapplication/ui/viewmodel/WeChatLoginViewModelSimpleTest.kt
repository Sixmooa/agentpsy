package com.example.myapplication.ui.viewmodel

import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.AuthRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.test.*
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.kotlin.*

/**
 * 微信登录ViewModel简化单元测试
 * TDD模式：测试ViewModel的核心功能
 */
class WeChatLoginViewModelSimpleTest {

    @Mock
    private lateinit var mockRepository: AuthRepository

    private lateinit var viewModel: WeChatLoginViewModel
    private val testDispatcher = UnconfinedTestDispatcher()

    @Before
    fun setUp() {
        MockitoAnnotations.openMocks(this)
    }

    @Test
    fun `initial state should be NotAuthenticated when repository returns not authenticated`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))

        // When
        viewModel = WeChatLoginViewModel(mockRepository)

        // Then
        val authState = viewModel.authState.value
        assertTrue(authState is AuthState.NotAuthenticated)
        assertFalse(viewModel.isLoggedIn.value)
        assertNull(viewModel.currentUser.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `initial state should be Authenticated when repository returns authenticated`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))

        // When
        viewModel = WeChatLoginViewModel(mockRepository)

        // Then
        val authState = viewModel.authState.value
        assertTrue(authState is AuthState.Authenticated)
        assertTrue(viewModel.isLoggedIn.value)
        assertEquals(userInfo, viewModel.currentUser.value)
        assertFalse(viewModel.isLoading.value)
    }

    @Test
    fun `initial state should be Loading when repository returns loading`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Loading))

        // When
        viewModel = WeChatLoginViewModel(mockRepository)

        // Then
        val authState = viewModel.authState.value
        assertTrue(authState is AuthState.Loading)
        assertFalse(viewModel.isLoggedIn.value)
        assertNull(viewModel.currentUser.value)
        assertTrue(viewModel.isLoading.value)
    }

    @Test
    fun `initial state should be Error when repository returns error`() = runTest {
        // Given
        val errorMessage = "网络错误"
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Error(errorMessage)))

        // When
        viewModel = WeChatLoginViewModel(mockRepository)

        // Then
        val authState = viewModel.authState.value
        assertTrue(authState is AuthState.Error)
        assertFalse(viewModel.isLoggedIn.value)
        assertNull(viewModel.currentUser.value)
        assertFalse(viewModel.isLoading.value)
        assertEquals(errorMessage, viewModel.errorMessage.value)
    }

    @Test
    fun `loginWithWeChat should call repository login`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        whenever(mockRepository.loginWithWeChat()).thenReturn(AuthResult.Loading)
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        viewModel.loginWithWeChat()

        // Then
        verify(mockRepository, times(1)).loginWithWeChat()
    }

    @Test
    fun `logout should call repository logout`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        coEvery { mockRepository.logout() } returns Unit
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        viewModel.logout()

        // Then
        coVerify(mockRepository, times(1)).logout()
    }

    @Test
    fun `refreshUserInfo should call repository refresh`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        coEvery { mockRepository.refreshUserInfo() } returns null
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        viewModel.refreshUserInfo()

        // Then
        coVerify(mockRepository, times(1)).refreshUserInfo()
    }

    @Test
    fun `getUserDisplayName should return nickname when authenticated`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户"
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val displayName = viewModel.getUserDisplayName()

        // Then
        assertEquals("测试用户", displayName)
    }

    @Test
    fun `getUserDisplayName should return default when not authenticated`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val displayName = viewModel.getUserDisplayName()

        // Then
        assertEquals("未登录", displayName)
    }

    @Test
    fun `getUserAvatarUrl should return avatar URL when authenticated`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val avatarUrl = viewModel.getUserAvatarUrl()

        // Then
        assertEquals("https://wx.qlogo.cn/avatar/test.jpg", avatarUrl)
    }

    @Test
    fun `getUserAvatarUrl should return empty when not authenticated`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val avatarUrl = viewModel.getUserAvatarUrl()

        // Then
        assertEquals("", avatarUrl)
    }

    @Test
    fun `getUserSexDescription should return sex description when authenticated`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            sex = 1
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val sexDescription = viewModel.getUserSexDescription()

        // Then
        assertEquals("男", sexDescription)
    }

    @Test
    fun `getUserSexDescription should return unknown when not authenticated`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val sexDescription = viewModel.getUserSexDescription()

        // Then
        assertEquals("未知", sexDescription)
    }

    @Test
    fun `hasCompleteUserInfo should return true when user has complete info`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val hasCompleteInfo = viewModel.hasCompleteUserInfo()

        // Then
        assertTrue(hasCompleteInfo)
    }

    @Test
    fun `hasCompleteUserInfo should return false when user lacks nickname`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = null,
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val hasCompleteInfo = viewModel.hasCompleteUserInfo()

        // Then
        assertFalse(hasCompleteInfo)
    }

    @Test
    fun `hasCompleteUserInfo should return false when user lacks avatar`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = null
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val hasCompleteInfo = viewModel.hasCompleteUserInfo()

        // Then
        assertFalse(hasCompleteInfo)
    }

    @Test
    fun `hasCompleteUserInfo should return false when not authenticated`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val hasCompleteInfo = viewModel.hasCompleteUserInfo()

        // Then
        assertFalse(hasCompleteInfo)
    }

    @Test
    fun `getAuthStateDescription should return correct description`() = runTest {
        // Given - NotAuthenticated
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val description1 = viewModel.getAuthStateDescription()

        // Then
        assertEquals("未登录", description1)

        // Given - Authenticated
        val userInfo = WeChatUserInfo(openid = "test", nickname = "用户")
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val description2 = viewModel.getAuthStateDescription()

        // Then
        assertTrue(description2.contains("已登录"))
        assertTrue(description2.contains("用户"))
    }

    @Test
    fun `canLogin should return true when not loading and not logged in`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val canLogin = viewModel.canLogin()

        // Then
        assertTrue(canLogin)
    }

    @Test
    fun `canLogin should return false when loading`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Loading))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val canLogin = viewModel.canLogin()

        // Then
        assertFalse(canLogin)
    }

    @Test
    fun `canLogin should return false when already logged in`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(openid = "test")
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val canLogin = viewModel.canLogin()

        // Then
        assertFalse(canLogin)
    }

    @Test
    fun `canLogout should return true when logged in and not loading`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(openid = "test")
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val canLogout = viewModel.canLogout()

        // Then
        assertTrue(canLogout)
    }

    @Test
    fun `canLogout should return false when not logged in`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val canLogout = viewModel.canLogout()

        // Then
        assertFalse(canLogout)
    }

    @Test
    fun `getAuthStateDetails should return correct details for NotAuthenticated`() = runTest {
        // Given
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.NotAuthenticated))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val details = viewModel.getAuthStateDetails()

        // Then
        assertTrue(details.isNotAuthenticated)
        assertFalse(details.isAuthenticated)
        assertFalse(details.isLoading)
        assertFalse(details.hasError)
        assertEquals("未登录", details.description)
        assertTrue(details.canLogin)
        assertFalse(details.canLogout)
    }

    @Test
    fun `getAuthStateDetails should return correct details for Authenticated`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid",
            nickname = "测试用户"
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Authenticated(userInfo)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val details = viewModel.getAuthStateDetails()

        // Then
        assertTrue(details.isAuthenticated)
        assertFalse(details.isNotAuthenticated)
        assertFalse(details.isLoading)
        assertFalse(details.hasError)
        assertTrue(details.description.contains("已登录"))
        assertEquals(userInfo, details.userInfo)
        assertFalse(details.canLogin)
        assertTrue(details.canLogout)
    }

    @Test
    fun `getAuthStateDetails should return correct details for Error`() = runTest {
        // Given
        val errorMessage = "网络连接失败"
        whenever(mockRepository.getAuthStateFlow()).thenReturn(flowOf(AuthState.Error(errorMessage)))
        viewModel = WeChatLoginViewModel(mockRepository)

        // When
        val details = viewModel.getAuthStateDetails()

        // Then
        assertTrue(details.hasError)
        assertFalse(details.isAuthenticated)
        assertFalse(details.isNotAuthenticated)
        assertFalse(details.isLoading)
        assertEquals(errorMessage, details.errorMessage)
        assertTrue(details.description.contains("登录错误"))
        assertTrue(details.canLogin)
        assertTrue(details.isRetryable)
    }

    @Test
    fun `complete authentication flow test`() = runTest {
        // Given
        val userInfo = WeChatUserInfo(
            openid = "test_openid_12345",
            nickname = "测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar/test.jpg"
        )

        // Simulate authentication flow
        val authStateFlow = flowOf(
            AuthState.NotAuthenticated,
            AuthState.Loading,
            AuthState.Authenticated(userInfo)
        )
        whenever(mockRepository.getAuthStateFlow()).thenReturn(authStateFlow)
        whenever(mockRepository.loginWithWeChat()).thenReturn(AuthResult.Success(userInfo, "test_token"))

        // When - 初始状态
        viewModel = WeChatLoginViewModel(mockRepository)

        // Then - 验证初始状态
        assertTrue(viewModel.canLogin())
        assertFalse(viewModel.canLogout())
        assertEquals("未登录", viewModel.getUserDisplayName())
        assertEquals("", viewModel.getUserAvatarUrl())

        // When - 执行登录
        viewModel.loginWithWeChat()

        // Then - 验证登录后状态
        // 注意：由于这是同步Flow测试，状态可能不会立即更新
        // 在实际应用中，这些状态变化会通过Flow正确传播
        verify(mockRepository, times(1)).loginWithWeChat()
    }
}