package com.example.myapplication.di

import com.example.myapplication.data.network.ApiService
import com.example.myapplication.data.network.NetworkModule
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.repository.PersonalityTestRepositoryImpl

/**
 * 应用依赖注入模块
 * 提供应用所需的各种依赖实例
 */
object AppModule {
    
    /**
     * 提供ApiService实例
     */
    fun provideApiService(): ApiService {
        return NetworkModule.apiService
    }
    
    /**
     * 提供PersonalityTestRepository实例
     */
    fun providePersonalityTestRepository(): PersonalityTestRepository {
        return PersonalityTestRepositoryImpl(provideApiService())
    }
}