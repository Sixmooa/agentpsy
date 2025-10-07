package com.example.myapplication.data.repository

import com.example.myapplication.data.model.*
import com.example.myapplication.data.network.ApiService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import retrofit2.Response

/**
 * 人格测试数据仓库实现类
 * 实现具体的数据访问逻辑
 */
class PersonalityTestRepositoryImpl(
    private val apiService: ApiService
) : PersonalityTestRepository {
    
    override suspend fun getRandomQuestions(
        count: Int,
        language: String
    ): Result<List<Question>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getRandomQuestions(count, language)
            handleApiResponse(response) { it.data ?: emptyList() }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getAnswerOptions(
        language: String
    ): Result<List<AnswerOption>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getAnswerOptions(language)
            handleApiResponse(response) { it.data ?: emptyList() }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun submitTest(
        answers: List<SubmitAnswerRequest>,
        language: String,
        saveResult: Boolean
    ): Result<TestReport> = withContext(Dispatchers.IO) {
        try {
            val request = TestSubmissionRequest(
                answers = answers,
                language = language,
                saveResult = saveResult
            )
            val response = apiService.submitTest(request)
            
            if (response.isSuccessful) {
                val body = response.body()
                if (body?.success == true && body.report != null) {
                    Result.success(body.report)
                } else {
                    Result.failure(Exception("测试提交失败: ${body?.report}"))
                }
            } else {
                Result.failure(Exception("网络请求失败: ${response.code()} ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getMBTITypeInfo(
        typeCode: String,
        language: String
    ): Result<MBTIType> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getMBTITypeInfo(typeCode, language)
            handleApiResponse(response) { 
                it.data ?: throw Exception("MBTI类型信息为空")
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun getCareerSuggestions(
        mbtiType: String,
        language: String
    ): Result<List<CareerSuggestion>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getCareerSuggestions(mbtiType, language)
            handleApiResponse(response) { it.data ?: emptyList() }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * 处理API响应的通用方法
     */
    private fun <T, R> handleApiResponse(
        response: Response<ApiResponse<T>>,
        transform: (ApiResponse<T>) -> R
    ): Result<R> {
        return if (response.isSuccessful) {
            val body = response.body()
            if (body?.success == true) {
                try {
                    Result.success(transform(body))
                } catch (e: Exception) {
                    Result.failure(e)
                }
            } else {
                Result.failure(Exception("API错误: ${body?.error ?: "未知错误"}"))
            }
        } else {
            Result.failure(Exception("网络请求失败: ${response.code()} ${response.message()}"))
        }
    }
}