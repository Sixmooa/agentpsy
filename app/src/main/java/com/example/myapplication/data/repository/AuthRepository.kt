package com.example.myapplication.data.repository

import com.example.myapplication.data.model.AuthResult
import com.example.myapplication.data.model.AuthState
import com.example.myapplication.data.model.WeChatUserInfo
import kotlinx.coroutines.flow.Flow

/**
 * 认证Repository接口
 * 定义用户认证相关的数据操作接口
 */
interface AuthRepository {

    /**
     * 使用微信登录
     * @return AuthResult 登录结果
     */
    suspend fun loginWithWeChat(): AuthResult

    /**
     * 用户登出
     */
    suspend fun logout()

    /**
     * 获取当前登录用户信息
     * @return WeChatUserInfo? 当前用户信息，如果未登录则返回null
     */
    suspend fun getCurrentUser(): WeChatUserInfo?

    /**
     * 检查用户是否已登录
     * @return Boolean 是否已登录
     */
    suspend fun isUserLoggedIn(): Boolean

    /**
     * 获取认证状态流
     * @return Flow<AuthState> 认证状态变化流
     */
    fun getAuthStateFlow(): Flow<AuthState>

    /**
     * 刷新用户信息
     * @return WeChatUserInfo? 更新后的用户信息，如果未登录则返回null
     */
    suspend fun refreshUserInfo(): WeChatUserInfo?

    /**
     * 获取存储的认证令牌
     * @return String? 存储的令牌，如果未登录则返回null
     */
    suspend fun getStoredToken(): String?

    /**
     * 清除所有认证数据
     */
    suspend fun clearAuthData()
}