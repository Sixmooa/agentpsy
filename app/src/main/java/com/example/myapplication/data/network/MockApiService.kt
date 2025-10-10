package com.example.myapplication.data.network

import com.example.myapplication.data.model.*
import kotlinx.coroutines.delay
import retrofit2.Response

/**
 * Mock API服务实现
 * 提供模拟数据用于开发和测试
 */
class MockApiService : ApiService {

    override suspend fun getRandomQuestions(count: Int, language: String): Response<ApiResponse<List<Question>>> {
        // 模拟网络延迟
        delay(500)
        
        val questions = listOf(
            Question(
                id = 1,
                questionTextZh = "在社交聚会中，你更倾向于：",
                questionTextEn = "At social gatherings, you tend to:",
                dimension = "extraversion"
            ),
            Question(
                id = 2, 
                questionTextZh = "当面对新信息时，你更关注：",
                questionTextEn = "When facing new information, you focus more on:",
                dimension = "openness"
            ),
            Question(
                id = 3,
                questionTextZh = "做决定时，你更依赖：",
                questionTextEn = "When making decisions, you rely more on:",
                dimension = "agreeableness"
            ),
            Question(
                id = 4,
                questionTextZh = "你更喜欢：",
                questionTextEn = "You prefer:",
                dimension = "conscientiousness"
            ),
            Question(
                id = 5,
                questionTextZh = "在工作中，你更倾向于：",
                questionTextEn = "At work, you tend to:",
                dimension = "neuroticism"
            )
        ).take(count)
        
        return Response.success(ApiResponse(
            success = true,
            data = questions,
            error = null
        ))
    }

    override suspend fun getAnswerOptions(language: String): Response<ApiResponse<List<AnswerOption>>> {
        // 模拟网络延迟
        delay(300)
        
        val options = listOf(
            AnswerOption(
                id = 1,
                optionTextZh = "完全不同意",
                optionTextEn = "Strongly disagree",
                score = 1
            ),
            AnswerOption(
                id = 2,
                optionTextZh = "不同意",
                optionTextEn = "Disagree",
                score = 2
            ),
            AnswerOption(
                id = 3,
                optionTextZh = "中立",
                optionTextEn = "Neutral",
                score = 3
            ),
            AnswerOption(
                id = 4,
                optionTextZh = "同意",
                optionTextEn = "Agree",
                score = 4
            ),
            AnswerOption(
                id = 5,
                optionTextZh = "完全同意",
                optionTextEn = "Strongly agree",
                score = 5
            )
        )
        
        return Response.success(ApiResponse(
            success = true,
            data = options,
            error = null
        ))
    }

    override suspend fun submitTest(request: TestSubmissionRequest): Response<TestSubmissionResponse> {
        // 模拟网络延迟
        delay(800)
        
        // 简单的MBTI计算逻辑
        val scores = mutableMapOf(
            "E" to 0, "I" to 0,
            "S" to 0, "N" to 0, 
            "T" to 0, "F" to 0,
            "J" to 0, "P" to 0
        )
        
        // 计算各维度得分
        request.answers.forEach { answer ->
            val dimension = when(answer.questionId) {
                1 -> "E"
                2 -> "I"
                3 -> "S"
                4 -> "N"
                5 -> "T"
                6 -> "F"
                7 -> "J"
                8 -> "P"
                else -> "E" // 默认值
            }
            scores[dimension] = scores[dimension]!! + answer.answerScore
        }
        
        // 确定MBTI类型
        val mbtiType = buildString {
            append(if (scores["E"]!! >= scores["I"]!!) "E" else "I")
            append(if (scores["S"]!! >= scores["N"]!!) "S" else "N")
            append(if (scores["T"]!! >= scores["F"]!!) "T" else "F")
            append(if (scores["J"]!! >= scores["P"]!!) "J" else "P")
        }
        
        // 创建MBTI类型信息
        val mbtiTypeInfo = MBTIType(
            id = 1,
            typeCode = mbtiType,
            typeNameZh = when(mbtiType) {
                "INTJ" -> "建筑师"
                "INTP" -> "逻辑学家"
                "ENTJ" -> "指挥官"
                "ENTP" -> "辩论家"
                "INFJ" -> "提倡者"
                "INFP" -> "调停者"
                "ENFJ" -> "主人公"
                "ENFP" -> "竞选者"
                "ISTJ" -> "物流师"
                "ISFJ" -> "守护者"
                "ESTJ" -> "总经理"
                "ESFJ" -> "执政官"
                "ISTP" -> "鉴赏家"
                "ISFP" -> "探险家"
                "ESTP" -> "企业家"
                "ESFP" -> "娱乐家"
                else -> "未知类型"
            },
            typeNameEn = when(mbtiType) {
                "INTJ" -> "Architect"
                "INTP" -> "Logician"
                "ENTJ" -> "Commander"
                "ENTP" -> "Debater"
                "INFJ" -> "Advocate"
                "INFP" -> "Mediator"
                "ENFJ" -> "Protagonist"
                "ENFP" -> "Campaigner"
                "ISTJ" -> "Logistician"
                "ISFJ" -> "Defender"
                "ESTJ" -> "Executive"
                "ESFJ" -> "Consul"
                "ISTP" -> "Virtuoso"
                "ISFP" -> "Adventurer"
                "ESTP" -> "Entrepreneur"
                "ESFP" -> "Entertainer"
                else -> "Unknown Type"
            },
            descriptionZh = "这是${mbtiType}类型的详细描述。每个人都有独特的性格特征。",
            descriptionEn = "This is a detailed description of the ${mbtiType} type. Everyone has unique personality traits.",
            strengths = listOf("分析能力强", "善于沟通", "有责任心"),
            challenges = listOf("有时过于完美主义", "可能忽略细节")
        )
        
        // 创建Big Five分数（转换为0-100百分比）
        val bigFiveScores = BigFiveScores(
            openness = 75.0,
            conscientiousness = 68.0,
            extraversion = 45.0,
            agreeableness = 72.0,
            neuroticism = 35.0
        )
        
        // 创建职业建议
        val careerSuggestions = listOf(
            CareerSuggestion(1, mbtiType, "软件工程师", "Software Engineer"),
            CareerSuggestion(2, mbtiType, "项目经理", "Project Manager"),
            CareerSuggestion(3, mbtiType, "咨询师", "Consultant")
        )
        
        val testReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = request.language,
            mbtiType = mbtiType,
            bigFiveScores = bigFiveScores,
            mbtiTypeInfo = mbtiTypeInfo,
            careerSuggestions = careerSuggestions
        )
        
        val response = TestSubmissionResponse(
            success = true,
            report = testReport,
            saveResult = request.saveResult
        )
        
        return Response.success(response)
    }

    override suspend fun getMBTITypeInfo(typeCode: String, language: String): Response<ApiResponse<MBTIType>> {
        // 模拟网络延迟
        delay(400)
        
        val mbtiType = MBTIType(
            id = 1,
            typeCode = typeCode,
            typeNameZh = when(typeCode) {
                "INTJ" -> "建筑师"
                "INTP" -> "逻辑学家"
                "ENTJ" -> "指挥官"
                "ENTP" -> "辩论家"
                "INFJ" -> "提倡者"
                "INFP" -> "调停者"
                "ENFJ" -> "主人公"
                "ENFP" -> "竞选者"
                "ISTJ" -> "物流师"
                "ISFJ" -> "守护者"
                "ESTJ" -> "总经理"
                "ESFJ" -> "执政官"
                "ISTP" -> "鉴赏家"
                "ISFP" -> "探险家"
                "ESTP" -> "企业家"
                "ESFP" -> "娱乐家"
                else -> "未知类型"
            },
            typeNameEn = when(typeCode) {
                "INTJ" -> "Architect"
                "INTP" -> "Logician"
                "ENTJ" -> "Commander"
                "ENTP" -> "Debater"
                "INFJ" -> "Advocate"
                "INFP" -> "Mediator"
                "ENFJ" -> "Protagonist"
                "ENFP" -> "Campaigner"
                "ISTJ" -> "Logistician"
                "ISFJ" -> "Defender"
                "ESTJ" -> "Executive"
                "ESFJ" -> "Consul"
                "ISTP" -> "Virtuoso"
                "ISFP" -> "Adventurer"
                "ESTP" -> "Entrepreneur"
                "ESFP" -> "Entertainer"
                else -> "Unknown Type"
            },
            descriptionZh = "这是${typeCode}类型的详细描述。每个人都有独特的性格特征。",
            descriptionEn = "This is a detailed description of the ${typeCode} type. Everyone has unique personality traits.",
            strengths = listOf("优势1", "优势2", "优势3"),
            challenges = listOf("挑战1", "挑战2")
        )
        
        return Response.success(ApiResponse(
            success = true,
            data = mbtiType,
            error = null
        ))
    }

    override suspend fun getCareerSuggestions(mbtiType: String, language: String): Response<ApiResponse<List<CareerSuggestion>>> {
        // 模拟网络延迟
        delay(600)
        
        // 根据MBTI类型返回对应的职业建议
        val careerMap = mapOf(
            "INTJ" to listOf(
                CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"),
                CareerSuggestion(2, "INTJ", "数据分析师", "Data Analyst"),
                CareerSuggestion(3, "INTJ", "系统分析师", "Systems Analyst")
            ),
            "INTP" to listOf(
                CareerSuggestion(4, "INTP", "研究员", "Researcher"),
                CareerSuggestion(5, "INTP", "科学家", "Scientist"),
                CareerSuggestion(6, "INTP", "技术专家", "Technical Specialist")
            ),
            "ENTJ" to listOf(
                CareerSuggestion(7, "ENTJ", "企业高管", "Executive"),
                CareerSuggestion(8, "ENTJ", "项目经理", "Project Manager"),
                CareerSuggestion(9, "ENTJ", "管理顾问", "Management Consultant")
            ),
            "ENTP" to listOf(
                CareerSuggestion(10, "ENTP", "企业家", "Entrepreneur"),
                CareerSuggestion(11, "ENTP", "市场营销", "Marketing Specialist"),
                CareerSuggestion(12, "ENTP", "创新顾问", "Innovation Consultant")
            )
        )
        
        val suggestions = careerMap[mbtiType] ?: listOf(
            CareerSuggestion(13, mbtiType, "通用职业", "General Career"),
            CareerSuggestion(14, mbtiType, "咨询师", "Consultant"),
            CareerSuggestion(15, mbtiType, "分析师", "Analyst")
        )
        
        return Response.success(ApiResponse(
            success = true,
            data = suggestions,
            error = null
        ))
    }
}