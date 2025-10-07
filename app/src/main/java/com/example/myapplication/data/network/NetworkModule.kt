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
 * 配置Retrofit和OkHttp客户端
 */
object NetworkModule {
    
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
     * Supabase认证拦截器
     */
    private val authInterceptor = okhttp3.Interceptor { chain ->
        val originalRequest = chain.request()
        val newRequest = originalRequest.newBuilder()
            .addHeader("Authorization", "Bearer ${getSupabaseAnonKey()}")
            .addHeader("apikey", getSupabaseAnonKey())
            .addHeader("Content-Type", "application/json")
            .build()
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
     * Retrofit实例
     */
    private val retrofit = Retrofit.Builder()
        .baseUrl("https://mock-api.example.com/")
        .client(okHttpClient)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
    
    /**
     * API服务实例
     */
    val apiService: ApiService = retrofit.create(ApiService::class.java)
    
    /**
     * 获取模拟API密钥
     */
    private fun getSupabaseAnonKey(): String {
        return "mock-api-key"
    }
}