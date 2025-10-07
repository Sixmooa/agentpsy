package com.example.myapplication.data.repository

import com.example.myapplication.data.model.*

/**
 * 人格测试数据仓库接口
 * 定义数据访问的抽象方法
 */
interface PersonalityTestRepository {
    
    /**
     * 获取随机题目
     * @param count 题目数量
     * @param language 语言
     * @return 题目列表的结果
     */
    suspend fun getRandomQuestions(
        count: Int = 1,
        language: String = "zh"
    ): Result<List<Question>>
    
    /**
     * 获取答案选项
     * @param language 语言
     * @return 答案选项列表的结果
     */
    suspend fun getAnswerOptions(
        language: String = "zh"
    ): Result<List<AnswerOption>>
    
    /**
     * 提交测试答案
     * @param answers 用户答案列表
     * @param language 语言
     * @param saveResult 是否保存结果
     * @return 测试报告的结果
     */
    suspend fun submitTest(
        answers: List<SubmitAnswerRequest>,
        language: String = "zh",
        saveResult: Boolean = false
    ): Result<TestReport>
    
    /**
     * 获取MBTI类型信息
     * @param typeCode MBTI类型代码
     * @param language 语言
     * @return MBTI类型信息的结果
     */
    suspend fun getMBTITypeInfo(
        typeCode: String,
        language: String = "zh"
    ): Result<MBTIType>
    
    /**
     * 获取职业建议
     * @param mbtiType MBTI类型
     * @param language 语言
     * @return 职业建议列表的结果
     */
    suspend fun getCareerSuggestions(
        mbtiType: String,
        language: String = "zh"
    ): Result<List<CareerSuggestion>>
}