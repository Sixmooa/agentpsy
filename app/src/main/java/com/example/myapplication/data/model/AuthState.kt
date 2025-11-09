package com.example.myapplication.data.model

/**
 * 认证状态数据模型
 * 管理应用的用户认证状态，用于UI状态管理
 */
sealed class AuthState {
    abstract val userInfo: WeChatUserInfo?
    abstract val errorMessage: String?
    abstract fun getDescription(): String

    /**
     * 未认证状态
     * 用户未登录或已退出登录
     */
    object NotAuthenticated : AuthState() {
        override val userInfo: WeChatUserInfo? = null
        override val errorMessage: String? = null
        /**
         * 获取状态描述
         */
        override fun getDescription(): String {
            return "未登录"
        }

        /**
         * 获取登录提示
         */
        fun getLoginPrompt(): String {
            return "请登录以保存测试记录"
        }
    }

    /**
     * 已认证状态
     * 用户已成功登录
     * @param userInfo 已登录的用户信息
     */
    data class Authenticated(
        override val userInfo: WeChatUserInfo,
        override val errorMessage: String? = null
    ) : AuthState() {
        init {
            // 验证用户信息不能为空
            if (userInfo == null) {
                throw IllegalArgumentException("User info cannot be null in Authenticated state")
            }
        }

        /**
         * 获取用户显示名称
         */
        fun getUserDisplayName(): String {
            return userInfo.getDisplayName()
        }

        /**
         * 获取用户头像URL
         */
        fun getUserAvatarUrl(): String {
            return userInfo.getAvatarUrlSafe()
        }

        /**
         * 获取欢迎信息
         */
        fun getWelcomeMessage(): String {
            return "欢迎回来，${userInfo.getDisplayName()}！"
        }

        /**
         * 获取状态描述
         */
        override fun getDescription(): String {
            return "已登录: ${userInfo.getDisplayName()}"
        }

        /**
         * 检查用户是否有完整信息
         */
        fun hasCompleteUserInfo(): Boolean {
            return !userInfo.nickname.isNullOrBlank() &&
                   !userInfo.avatarUrl.isNullOrBlank()
        }
    }

    /**
     * 加载状态
     * 正在进行认证操作
     */
    object Loading : AuthState() {
        override val userInfo: WeChatUserInfo? = null
        override val errorMessage: String? = null
        /**
         * 获取状态描述
         */
        override fun getDescription(): String {
            return "正在登录..."
        }

        /**
         * 获取加载提示
         */
        fun getLoadingMessage(): String {
            return "请稍候，正在处理登录请求"
        }
    }

    /**
     * 错误状态
     * 认证操作失败
     * @param errorMessage 错误信息
     */
    data class Error(
        override val errorMessage: String?,
        override val userInfo: WeChatUserInfo? = null
    ) : AuthState() {
        /**
         * 检查是否有错误信息
         */
        fun hasErrorMessage(): Boolean {
            return !errorMessage.isNullOrBlank()
        }

        /**
         * 获取格式化的错误信息
         */
        fun getFormattedErrorMessage(): String {
            return errorMessage ?: "未知错误"
        }

        /**
         * 获取状态描述
         */
        override fun getDescription(): String {
            return "登录错误: ${getFormattedErrorMessage()}"
        }

        /**
         * 获取用户友好的错误提示
         */
        fun getUserFriendlyMessage(): String {
            return when {
                errorMessage?.contains("取消", ignoreCase = true) == true ||
                errorMessage?.contains("cancel", ignoreCase = true) == true -> {
                    "您已取消登录"
                }
                errorMessage?.contains("网络", ignoreCase = true) == true ||
                errorMessage?.contains("network", ignoreCase = true) == true -> {
                    "网络连接异常，请检查网络后重试"
                }
                errorMessage?.contains("应用", ignoreCase = true) == true ||
                errorMessage?.contains("app", ignoreCase = true) == true -> {
                    "应用配置错误，请联系开发者"
                }
                else -> {
                    "登录失败，请稍后重试"
                }
            }
        }

        /**
         * 检查是否为可重试的错误
         */
        fun isRetryable(): Boolean {
            return !isUserCancelled()
        }

        /**
         * 检查是否为用户取消
         */
        fun isUserCancelled(): Boolean {
            return errorMessage?.contains("取消", ignoreCase = true) == true ||
                   errorMessage?.contains("cancel", ignoreCase = true) == true
        }
    }

    /**
     * 检查是否已认证
     */
    val isAuthenticated: Boolean
        get() = this is Authenticated

    /**
     * 检查是否为加载状态
     */
    val isLoading: Boolean
        get() = this is Loading

    /**
     * 转换为AuthResult（用于认证操作）
     */
    fun toAuthResult(): AuthResult {
        return when (this) {
            is Authenticated -> AuthResult.success(userInfo, "mock_token") // TODO: 生成真实token
            is Error -> AuthResult.failure(errorMessage)
            is Loading -> AuthResult.loading()
            is NotAuthenticated -> AuthResult.failure("用户未登录")
        }
    }

    companion object {
        /**
         * 创建未认证状态
         */
        fun notAuthenticated(): AuthState {
            return NotAuthenticated
        }

        /**
         * 创建已认证状态
         */
        fun authenticated(userInfo: WeChatUserInfo): AuthState {
            return Authenticated(userInfo)
        }

        /**
         * 创建加载状态
         */
        fun loading(): AuthState {
            return Loading
        }

        /**
         * 创建错误状态
         */
        fun error(errorMessage: String?): AuthState {
            return Error(errorMessage)
        }

        /**
         * 从AuthResult创建AuthState
         */
        fun fromAuthResult(authResult: AuthResult): AuthState {
            return when (authResult) {
                is AuthResult.Success -> authenticated(authResult.userInfo)
                is AuthResult.Failure -> error(authResult.errorMessage)
                is AuthResult.Loading -> loading()
            }
        }
    }
}