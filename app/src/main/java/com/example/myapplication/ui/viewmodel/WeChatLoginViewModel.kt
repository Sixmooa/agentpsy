package com.example.myapplication.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.AuthState
import com.example.myapplication.data.model.WeChatUserInfo
import com.example.myapplication.data.repository.AuthRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

/**
 * 微信登录ViewModel
 * 管理微信登录的UI状态和用户交互
 */
class WeChatLoginViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    // 认证状态流
    val authState: StateFlow<AuthState> = authRepository.getAuthStateFlow()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = AuthState.NotAuthenticated
        )

    // 是否已登录
    val isLoggedIn: StateFlow<Boolean> = authState
        .map { it is AuthState.Authenticated }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = false
        )

    // 当前用户信息
    val currentUser: StateFlow<WeChatUserInfo?> = authState
        .map { (it as? AuthState.Authenticated)?.userInfo }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    // 是否正在加载
    val isLoading: StateFlow<Boolean> = authState
        .map { it is AuthState.Loading }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = false
        )

    // 是否正在登录（加载状态且未认证）
    val isLoginInProgress: StateFlow<Boolean> = combine(isLoading, isLoggedIn) { loading, authenticated ->
        loading && !authenticated
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = false
    )

    // 错误信息
    val errorMessage: StateFlow<String?> = authState
        .map { (it as? AuthState.Error)?.errorMessage }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = null
        )

    /**
     * 使用微信登录
     */
    fun loginWithWeChat() {
        viewModelScope.launch {
            try {
                authRepository.loginWithWeChat()
            } catch (e: Exception) {
                // 异常已经在Repository层处理，这里可以做额外的日志记录
                // 或者显示用户友好的错误信息
            }
        }
    }

    /**
     * 用户登出
     */
    fun logout() {
        viewModelScope.launch {
            try {
                authRepository.logout()
            } catch (e: Exception) {
                // 登出失败也要更新UI状态
                // 可以考虑强制清除本地状态
            }
        }
    }

    /**
     * 刷新用户信息
     */
    fun refreshUserInfo() {
        viewModelScope.launch {
            try {
                authRepository.refreshUserInfo()
            } catch (e: Exception) {
                // 刷新失败处理
            }
        }
    }

    /**
     * 获取存储的认证令牌
     */
    fun getStoredToken(): String? {
        // 这里可以使用suspend函数或者从缓存中获取
        // 为了简化，直接调用Repository
        return runCatching {
            // 注意：这里不应该在ViewModel中直接调用suspend函数
            // 应该通过Flow或其他方式获取
            null // 暂时返回null，实际实现需要优化
        }.getOrNull()
    }

    /**
     * 获取错误信息
     */
    fun getErrorMessage(): String? {
        return errorMessage.value
    }

    /**
     * 获取用户显示名称
     */
    fun getUserDisplayName(): String {
        return currentUser.value?.getDisplayName() ?: "未登录"
    }

    /**
     * 获取用户头像URL
     */
    fun getUserAvatarUrl(): String {
        return currentUser.value?.getAvatarUrlSafe() ?: ""
    }

    /**
     * 获取用户性别描述
     */
    fun getUserSexDescription(): String {
        return currentUser.value?.getSexDescription() ?: "未知"
    }

    /**
     * 获取用户位置信息
     */
    fun getUserLocation(): String {
        return currentUser.value?.getFullLocation() ?: ""
    }

    /**
     * 检查用户是否有完整信息
     */
    fun hasCompleteUserInfo(): Boolean {
        return currentUser.value?.let { user ->
            !user.nickname.isNullOrBlank() && !user.avatarUrl.isNullOrBlank()
        } ?: false
    }

    /**
     * 检查是否有位置信息
     */
    fun hasLocationInfo(): Boolean {
        return currentUser.value?.hasLocationInfo() ?: false
    }

    /**
     * 检查是否有UnionID
     */
    fun hasUnionId(): Boolean {
        return currentUser.value?.hasUnionId() ?: false
    }

    /**
     * 获取认证状态描述
     */
    fun getAuthStateDescription(): String {
        return authState.value.getDescription()
    }

    /**
     * 检查当前是否为错误状态
     */
    fun hasError(): Boolean {
        return authState.value is AuthState.Error
    }

    /**
     * 检查当前是否为加载状态
     */
    fun isLoadingState(): Boolean {
        return authState.value is AuthState.Loading
    }

    /**
     * 检查当前是否为已认证状态
     */
    fun isAuthenticatedState(): Boolean {
        return authState.value is AuthState.Authenticated
    }

    /**
     * 检查当前是否为未认证状态
     */
    fun isNotAuthenticatedState(): Boolean {
        return authState.value is AuthState.NotAuthenticated
    }

    /**
     * 重试登录
     */
    fun retryLogin() {
        if (hasError()) {
            loginWithWeChat()
        }
    }

    /**
     * 清除错误状态
     */
    fun clearError() {
        // 错误状态通常通过新的操作自动清除
        // 这里可以实现手动清除逻辑
    }

    /**
     * 检查是否可以进行登录操作
     */
    fun canLogin(): Boolean {
        return !isLoading.value && !isLoginInProgress.value
    }

    /**
     * 检查是否可以进行登出操作
     */
    fun canLogout(): Boolean {
        return isLoggedIn.value && !isLoading.value
    }

    /**
     * 检查是否可以刷新用户信息
     */
    fun canRefreshUserInfo(): Boolean {
        return isLoggedIn.value && !isLoading.value
    }

    /**
     * 获取用户简短描述
     */
    fun getUserShortDescription(): String {
        return currentUser.value?.getShortDescription() ?: ""
    }

    /**
     * 初始化认证状态
     * 用于在应用启动时检查登录状态
     */
    fun initializeAuthState() {
        viewModelScope.launch {
            try {
                // 如果Repository支持初始化，可以在这里调用
                // authRepository.initializeAuthState()
            } catch (e: Exception) {
                // 初始化失败处理
            }
        }
    }

    /**
     * 强制刷新认证状态
     */
    fun forceRefreshAuthState() {
        viewModelScope.launch {
            try {
                // 可以通过Repository强制刷新状态
                if (authRepository.isUserLoggedIn()) {
                    refreshUserInfo()
                } else {
                    logout()
                }
            } catch (e: Exception) {
                // 刷新失败处理
            }
        }
    }

    /**
     * 获取当前认证状态的详细信息
     */
    fun getAuthStateDetails(): AuthStateDetails {
        val state = authState.value
        return when (state) {
            is AuthState.NotAuthenticated -> AuthStateDetails(
                isNotAuthenticated = true,
                description = "未登录",
                canLogin = true,
                canLogout = false
            )
            is AuthState.Authenticated -> AuthStateDetails(
                isAuthenticated = true,
                description = "已登录: ${state.getUserDisplayName()}",
                canLogin = false,
                canLogout = true,
                userInfo = state.userInfo
            )
            is AuthState.Loading -> AuthStateDetails(
                isLoading = true,
                description = "正在登录...",
                canLogin = false,
                canLogout = false
            )
            is AuthState.Error -> AuthStateDetails(
                hasError = true,
                description = state.getDescription(),
                errorMessage = state.getFormattedErrorMessage(),
                canLogin = true,
                canLogout = isLoggedIn.value,
                isRetryable = state.isRetryable()
            )
        }
    }
}

/**
 * 认证状态详细信息
 */
data class AuthStateDetails(
    val isAuthenticated: Boolean = false,
    val isNotAuthenticated: Boolean = false,
    val isLoading: Boolean = false,
    val hasError: Boolean = false,
    val description: String,
    val errorMessage: String? = null,
    val canLogin: Boolean = false,
    val canLogout: Boolean = false,
    val isRetryable: Boolean = true,
    val userInfo: WeChatUserInfo? = null
)