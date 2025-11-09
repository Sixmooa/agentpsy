package com.example.myapplication.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.example.myapplication.data.model.AuthResult
import com.example.myapplication.data.model.AuthState
import com.example.myapplication.data.model.WeChatUserInfo
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * 微信认证Repository实现
 * 管理微信登录的用户认证状态和数据持久化
 */
class WeChatAuthRepository(
    private val context: Context,
    private val dataStore: DataStore<Preferences>
) : AuthRepository {

    companion object {
        private val USER_INFO_KEY = stringPreferencesKey("user_info")
        private val AUTH_TOKEN_KEY = stringPreferencesKey("auth_token")
        private val IS_LOGGED_IN_KEY = booleanPreferencesKey("is_logged_in")
    }

    // 认证状态流
    private val _authStateFlow = MutableStateFlow<AuthState>(AuthState.NotAuthenticated)
    val authStateFlow: StateFlow<AuthState> = _authStateFlow.asStateFlow()

    init {
        // 初始化时检查存储的登录状态
        // 注意：这里不能直接调用suspend函数，需要在Repository外部初始化
        // 或者使用其他方式来延迟初始化
    }

    /**
     * 初始化认证状态
     */
    suspend fun initializeAuthState() {
        try {
            val isLoggedIn = dataStore.data.map { it[IS_LOGGED_IN_KEY] ?: false }.first()
            if (isLoggedIn) {
                val userInfoJson = dataStore.data.map { it[USER_INFO_KEY] }.first()
                val token = dataStore.data.map { it[AUTH_TOKEN_KEY] }.first()

                if (!userInfoJson.isNullOrEmpty() && !token.isNullOrEmpty()) {
                    val userInfo = Json.decodeFromString<WeChatUserInfo>(userInfoJson)
                    _authStateFlow.value = AuthState.Authenticated(userInfo)
                } else {
                    // 数据不完整，清除认证状态
                    clearAuthData()
                }
            }
        } catch (e: Exception) {
            // 读取数据出错，清除认证状态
            clearAuthData()
        }
    }

    override suspend fun loginWithWeChat(): AuthResult {
        return try {
            // 更新状态为加载中
            _authStateFlow.value = AuthState.Loading

            // TODO: 这里应该调用微信SDK进行实际的登录操作
            // 目前为了TDD测试，使用模拟数据
            val result = performMockWeChatLogin()

            when (result) {
                is AuthResult.Success -> {
                    // 保存用户信息和令牌
                    saveUserData(result.userInfo, result.token)
                    _authStateFlow.value = AuthState.Authenticated(result.userInfo)
                }
                is AuthResult.Failure -> {
                    _authStateFlow.value = AuthState.Error(result.errorMessage)
                }
                is AuthResult.Loading -> {
                    // 保持加载状态
                }
            }

            result
        } catch (e: Exception) {
            val errorMessage = when {
                e.message?.contains("cancel", ignoreCase = true) == true ||
                e.message?.contains("取消", ignoreCase = true) == true -> {
                    "用户取消授权"
                }
                e.message?.contains("network", ignoreCase = true) == true ||
                e.message?.contains("网络", ignoreCase = true) == true -> {
                    "网络连接失败，请检查网络设置"
                }
                else -> {
                    "登录失败：${e.message ?: "未知错误"}"
                }
            }

            _authStateFlow.value = AuthState.Error(errorMessage)
            AuthResult.Failure(errorMessage)
        }
    }

    /**
     * 执行模拟微信登录（用于TDD测试）
     * TODO: 替换为真实的微信SDK调用
     */
    private suspend fun performMockWeChatLogin(): AuthResult {
        // 模拟网络延迟
        kotlinx.coroutines.delay(1000)

        // 模拟用户信息（实际应该从微信SDK获取）
        val mockUserInfo = WeChatUserInfo(
            openid = "mock_wx_openid_${System.currentTimeMillis()}",
            nickname = "微信测试用户",
            avatarUrl = "https://wx.qlogo.cn/avatar_mock.jpg",
            unionid = "mock_unionid_${System.currentTimeMillis()}",
            sex = 1,
            province = "广东",
            city = "深圳",
            country = "中国"
        )

        val mockToken = "mock_jwt_token_${System.currentTimeMillis()}"

        return AuthResult.Success(mockUserInfo, mockToken)
    }

    override suspend fun logout() {
        try {
            clearAuthData()
            _authStateFlow.value = AuthState.NotAuthenticated
        } catch (e: Exception) {
            // 即使清除数据失败，也要更新状态为未认证
            _authStateFlow.value = AuthState.NotAuthenticated
        }
    }

    override suspend fun getCurrentUser(): WeChatUserInfo? {
        return try {
            val currentUserState = _authStateFlow.value
            if (currentUserState is AuthState.Authenticated) {
                currentUserState.userInfo
            } else {
                // 从存储中读取
                val userInfoJson = dataStore.data.map { it[USER_INFO_KEY] }.first()
                if (!userInfoJson.isNullOrEmpty()) {
                    Json.decodeFromString<WeChatUserInfo>(userInfoJson)
                } else {
                    null
                }
            }
        } catch (e: Exception) {
            null
        }
    }

    override suspend fun isUserLoggedIn(): Boolean {
        return try {
            val currentState = _authStateFlow.value
            currentState is AuthState.Authenticated ||
            dataStore.data.map { it[IS_LOGGED_IN_KEY] ?: false }.first()
        } catch (e: Exception) {
            false
        }
    }

    override fun getAuthStateFlow(): Flow<AuthState> {
        return authStateFlow
    }

    override suspend fun refreshUserInfo(): WeChatUserInfo? {
        return try {
            // TODO: 这里应该调用微信API刷新用户信息
            // 目前返回当前存储的用户信息
            getCurrentUser()
        } catch (e: Exception) {
            null
        }
    }

    override suspend fun getStoredToken(): String? {
        return try {
            dataStore.data.map { it[AUTH_TOKEN_KEY] }.first()
        } catch (e: Exception) {
            null
        }
    }

    override suspend fun clearAuthData() {
        try {
            dataStore.edit { preferences ->
                preferences.remove(USER_INFO_KEY)
                preferences.remove(AUTH_TOKEN_KEY)
                preferences[IS_LOGGED_IN_KEY] = false
            }
        } catch (e: Exception) {
            // 忽略清除数据的错误
        }
    }

    /**
     * 保存用户数据到本地存储
     */
    private suspend fun saveUserData(userInfo: WeChatUserInfo, token: String) {
        try {
            dataStore.edit { preferences ->
                preferences[USER_INFO_KEY] = Json.encodeToString(userInfo)
                preferences[AUTH_TOKEN_KEY] = token
                preferences[IS_LOGGED_IN_KEY] = true
            }
        } catch (e: Exception) {
            // 保存数据失败，抛出异常
            throw RuntimeException("保存用户数据失败", e)
        }
    }

    /**
     * 检查当前认证状态
     */
    fun getCurrentAuthState(): AuthState {
        return _authStateFlow.value
    }

    /**
     * 手动更新认证状态（用于测试或特殊情况）
     */
    suspend fun updateAuthState(newState: AuthState) {
        _authStateFlow.value = newState

        // 如果是认证状态，同步更新存储
        when (newState) {
            is AuthState.Authenticated -> {
                saveUserData(newState.userInfo, "mock_token") // TODO: 使用真实token
            }
            else -> {
                clearAuthData()
            }
        }
    }

    /**
     * 验证存储的数据完整性
     */
    suspend fun validateStoredData(): Boolean {
        return try {
            val isLoggedIn = dataStore.data.map { it[IS_LOGGED_IN_KEY] ?: false }.first()
            val userInfoJson = dataStore.data.map { it[USER_INFO_KEY] }.first()
            val token = dataStore.data.map { it[AUTH_TOKEN_KEY] }.first()

            when {
                isLoggedIn && userInfoJson.isNullOrEmpty() -> false
                isLoggedIn && token.isNullOrEmpty() -> false
                !isLoggedIn && (!userInfoJson.isNullOrEmpty() || !token.isNullOrEmpty()) -> {
                    // 状态不一致，清除数据
                    clearAuthData()
                    false
                }
                else -> true
            }
        } catch (e: Exception) {
            false
        }
    }
}