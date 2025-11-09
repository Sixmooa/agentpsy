package com.example.myapplication.data.model

/**
 * 认证结果数据模型
 * 封装微信登录操作的结果状态和数据
 */
sealed class AuthResult {
    abstract val userInfo: WeChatUserInfo?
    abstract val token: String?
    abstract val errorMessage: String?

    /**
     * 认证成功状态
     * @param userInfo 微信用户信息
     * @param token 认证令牌（可用于后续API调用）
     */
    data class Success(
        override val userInfo: WeChatUserInfo,
        override val token: String,
        override val errorMessage: String? = null
    ) : AuthResult() {
        /**
         * 检查是否有有效令牌
         */
        fun hasValidToken(): Boolean {
            return token.isNotBlank()
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
    }

    /**
     * 认证失败状态
     * @param errorMessage 错误信息
     */
    data class Failure(
        override val errorMessage: String?,
        override val userInfo: WeChatUserInfo? = null,
        override val token: String? = null
    ) : AuthResult() {
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
         * 检查是否为用户取消错误
         */
        fun isUserCancelled(): Boolean {
            return errorMessage?.contains("取消", ignoreCase = true) == true ||
                   errorMessage?.contains("cancel", ignoreCase = true) == true
        }

        /**
         * 检查是否为网络错误
         */
        fun isNetworkError(): Boolean {
            return errorMessage?.contains("网络", ignoreCase = true) == true ||
                   errorMessage?.contains("network", ignoreCase = true) == true ||
                   errorMessage?.contains("连接", ignoreCase = true) == true
        }
    }

    /**
     * 认证加载状态
     */
    object Loading : AuthResult() {
        override val userInfo: WeChatUserInfo? = null
        override val token: String? = null
        override val errorMessage: String? = null
        /**
         * 获取加载提示信息
         */
        fun getLoadingMessage(): String {
            return "正在登录微信..."
        }
    }

    /**
     * 检查是否为成功状态
     */
    val isSuccess: Boolean
        get() = this is Success

    /**
     * 检查是否为失败状态
     */
    val isFailure: Boolean
        get() = this is Failure

    /**
     * 检查是否为加载状态
     */
    val isLoading: Boolean
        get() = this is Loading

    /**
     * 将AuthResult转换为友好的状态描述
     */
    fun getStatusDescription(): String {
        return when (this) {
            is Success -> "登录成功"
            is Failure -> "登录失败: ${getFormattedErrorMessage()}"
            is Loading -> getLoadingMessage()
        }
    }

    companion object {
        /**
         * 创建成功的认证结果
         */
        fun success(userInfo: WeChatUserInfo, token: String): AuthResult {
            return Success(userInfo, token)
        }

        /**
         * 创建失败的认证结果
         */
        fun failure(errorMessage: String?): AuthResult {
            return Failure(errorMessage)
        }

        /**
         * 创建加载中的认证结果
         */
        fun loading(): AuthResult {
            return Loading
        }
    }
}