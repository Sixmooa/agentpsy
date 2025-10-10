package com.example.myapplication.data.network

import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit

/**
 * 网络模块
 * 配置Retrofit和OkHttp客户端，开发环境使用Mock API
 */
object NetworkModule {
    
    /**
     * 是否使用Mock API（开发环境）
     * 设置为true使用Mock API进行测试，设置为false使用真实Supabase API
     */
    private const val USE_MOCK_API = true
    
    /**
     * 是否使用本地API服务器（开发环境）
     */
    private const val USE_LOCAL_API = false
    
    /**
     * JSON序列化配置
     */
    private val json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        encodeDefaults = true
    }
    
    /**
     * HTTP日志拦截器
     */
    private val loggingInterceptor = HttpLoggingInterceptor().apply {
        level = HttpLoggingInterceptor.Level.BODY
    }
    
    /**
     * 认证拦截器
     */
    private val authInterceptor = okhttp3.Interceptor { chain ->
        val originalRequest = chain.request()
        val newRequest = if (USE_LOCAL_API) {
            // 本地API服务器不需要认证
            originalRequest.newBuilder()
                .addHeader("Content-Type", "application/json")
                .build()
        } else {
            // Supabase认证
            originalRequest.newBuilder()
                .addHeader("Authorization", "Bearer ${getSupabaseAnonKey()}")
                .addHeader("apikey", getSupabaseAnonKey())
                .addHeader("Content-Type", "application/json")
                .build()
        }
        chain.proceed(newRequest)
    }
    
    /**
     * OkHttp客户端
     */
    private val okHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .connectTimeout(30, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()
    
    /**
     * 获取API基础URL
     */
    private fun getBaseUrl(): String {
        return if (USE_LOCAL_API) {
            "http://10.0.2.2:3001/functions/v1/" // Android模拟器访问本地服务器的地址
        } else {
            "https://fmjcjcpfcosvukgkgliz.supabase.co/functions/v1/"
        }
    }
    
    /**
     * Retrofit实例
     */
    private val retrofit = Retrofit.Builder()
        .baseUrl(getBaseUrl())
        .client(okHttpClient)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
    
    /**
     * API服务实例
     * 开发环境使用Mock API，生产环境使用真实API
     */
    val apiService: ApiService = if (USE_MOCK_API) {
        MockApiService()
    } else {
        retrofit.create(ApiService::class.java)
    }
    
    /**
     * 获取Supabase匿名API密钥
     */
    private fun getSupabaseAnonKey(): String {
        return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI"
    }
}