package com.example.myapplication.data.network

import com.example.myapplication.data.model.*
import retrofit2.Response
import retrofit2.http.*

/**
 * API服务接口
 * 定义与Supabase Edge Function的交互方法
 */
interface ApiService {
    
    /**
     * 获取随机题目
     * @param count 题目数量，默认为1
     * @param language 语言，默认为zh
     */
    @GET("personality-api/questions")
    suspend fun getRandomQuestions(
        @Query("count") count: Int = 1,
        @Query("language") language: String = "zh"
    ): Response<ApiResponse<List<Question>>>
    
    /**
     * 获取答案选项
     * @param language 语言，默认为zh
     */
    @GET("personality-api/answer-options")
    suspend fun getAnswerOptions(
        @Query("language") language: String = "zh"
    ): Response<ApiResponse<List<AnswerOption>>>
    
    /**
     * 提交测试答案
     * @param request 测试提交请求
     */
    @POST("personality-api/submit")
    suspend fun submitTest(
        @Body request: TestSubmissionRequest
    ): Response<TestSubmissionResponse>
    
    /**
     * 获取MBTI类型信息
     * @param typeCode MBTI类型代码
     * @param language 语言，默认为zh
     */
    @GET("personality-api/mbti-type/{typeCode}")
    suspend fun getMBTITypeInfo(
        @Path("typeCode") typeCode: String,
        @Query("language") language: String = "zh"
    ): Response<ApiResponse<MBTIType>>
    
    /**
     * 获取职业建议
     * @param mbtiType MBTI类型
     * @param language 语言，默认为zh
     */
    @GET("personality-api/career-suggestions")
    suspend fun getCareerSuggestions(
        @Query("mbti_type") mbtiType: String,
        @Query("language") language: String = "zh"
    ): Response<ApiResponse<List<CareerSuggestion>>>
}