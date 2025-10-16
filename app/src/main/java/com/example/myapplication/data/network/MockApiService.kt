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
            // 基于Big Five人格理论的正确题目格式
            Question(
                id = 1,
                questionTextZh = "我有很多想象力。",
                questionTextEn = "I have a vivid imagination.",
                dimension = "openness"
            ),
            Question(
                id = 2,
                questionTextZh = "我总是准时完成任务。",
                questionTextEn = "I always complete tasks on time.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 3,
                questionTextZh = "我在社交场合中感到自在。",
                questionTextEn = "I feel comfortable in social situations.",
                dimension = "extraversion"
            ),
            Question(
                id = 4,
                questionTextZh = "我信任别人。",
                questionTextEn = "I trust others.",
                dimension = "agreeableness"
            ),
            Question(
                id = 5,
                questionTextZh = "我经常感到焦虑。",
                questionTextEn = "I often feel anxious.",
                dimension = "neuroticism"
            ),
            Question(
                id = 6,
                questionTextZh = "我喜欢尝试新事物。",
                questionTextEn = "I like to try new things.",
                dimension = "openness"
            ),
            Question(
                id = 7,
                questionTextZh = "我做事有条理。",
                questionTextEn = "I do things in an organized manner.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 8,
                questionTextZh = "我喜欢成为关注的焦点。",
                questionTextEn = "I enjoy being the center of attention.",
                dimension = "extraversion"
            ),
            Question(
                id = 9,
                questionTextZh = "我愿意帮助他人。",
                questionTextEn = "I am willing to help others.",
                dimension = "agreeableness"
            ),
            Question(
                id = 10,
                questionTextZh = "我容易感到沮丧。",
                questionTextEn = "I am easily discouraged.",
                dimension = "neuroticism"
            ),
            Question(
                id = 11,
                questionTextZh = "我对艺术和美学有浓厚兴趣。",
                questionTextEn = "I have a strong interest in art and aesthetics.",
                dimension = "openness"
            ),
            Question(
                id = 12,
                questionTextZh = "我注重细节。",
                questionTextEn = "I pay attention to details.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 13,
                questionTextZh = "我有很多朋友。",
                questionTextEn = "I have many friends.",
                dimension = "extraversion"
            ),
            Question(
                id = 14,
                questionTextZh = "我容易与人相处。",
                questionTextEn = "I am easy to get along with.",
                dimension = "agreeableness"
            ),
            Question(
                id = 15,
                questionTextZh = "我经常感到紧张。",
                questionTextEn = "I often feel tense.",
                dimension = "neuroticism"
            ),
            Question(
                id = 16,
                questionTextZh = "我喜欢思考抽象的概念。",
                questionTextEn = "I enjoy thinking about abstract concepts.",
                dimension = "openness"
            ),
            Question(
                id = 17,
                questionTextZh = "我坚持完成自己开始的工作。",
                questionTextEn = "I persist in completing work I start.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 18,
                questionTextZh = "我喜欢参加聚会和活动。",
                questionTextEn = "I enjoy attending parties and events.",
                dimension = "extraversion"
            ),
            Question(
                id = 19,
                questionTextZh = "我很少与人发生争执。",
                questionTextEn = "I rarely argue with others.",
                dimension = "agreeableness"
            ),
            Question(
                id = 20,
                questionTextZh = "我担心很多事情。",
                questionTextEn = "I worry about many things.",
                dimension = "neuroticism"
            ),
            Question(
                id = 21,
                questionTextZh = "我经常有创造性的想法。",
                questionTextEn = "I often have creative ideas.",
                dimension = "openness"
            ),
            Question(
                id = 22,
                questionTextZh = "我制定计划并按计划执行。",
                questionTextEn = "I make plans and follow through with them.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 23,
                questionTextZh = "我很容易与陌生人交谈。",
                questionTextEn = "I find it easy to talk to strangers.",
                dimension = "extraversion"
            ),
            Question(
                id = 24,
                questionTextZh = "我对人宽容。",
                questionTextEn = "I am tolerant of others.",
                dimension = "agreeableness"
            ),
            Question(
                id = 25,
                questionTextZh = "我情绪波动较大。",
                questionTextEn = "My emotions fluctuate greatly.",
                dimension = "neuroticism"
            ),
            Question(
                id = 26,
                questionTextZh = "我喜欢探索不同的文化。",
                questionTextEn = "I like to explore different cultures.",
                dimension = "openness"
            ),
            Question(
                id = 27,
                questionTextZh = "我很少拖延。",
                questionTextEn = "I rarely procrastinate.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 28,
                questionTextZh = "我在团队中表现活跃。",
                questionTextEn = "I am active in team settings.",
                dimension = "extraversion"
            ),
            Question(
                id = 29,
                questionTextZh = "我体谅他人的感受。",
                questionTextEn = "I consider others' feelings.",
                dimension = "agreeableness"
            ),
            Question(
                id = 30,
                questionTextZh = "我容易感到压力。",
                questionTextEn = "I am easily stressed.",
                dimension = "neuroticism"
            ),
            Question(
                id = 31,
                questionTextZh = "我对哲学问题感兴趣。",
                questionTextEn = "I am interested in philosophical questions.",
                dimension = "openness"
            ),
            Question(
                id = 32,
                questionTextZh = "我总是做好充分准备。",
                questionTextEn = "I always prepare thoroughly.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 33,
                questionTextZh = "我喜欢表达自己的观点。",
                questionTextEn = "I enjoy expressing my opinions.",
                dimension = "extraversion"
            ),
            Question(
                id = 34,
                questionTextZh = "我愿意与他人合作。",
                questionTextEn = "I am willing to cooperate with others.",
                dimension = "agreeableness"
            ),
            Question(
                id = 35,
                questionTextZh = "我经常感到不安。",
                questionTextEn = "I often feel uneasy.",
                dimension = "neuroticism"
            ),
            Question(
                id = 36,
                questionTextZh = "我喜欢学习新技能。",
                questionTextEn = "I enjoy learning new skills.",
                dimension = "openness"
            ),
            Question(
                id = 37,
                questionTextZh = "我追求完美。",
                questionTextEn = "I pursue perfection.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 38,
                questionTextZh = "我充满活力。",
                questionTextEn = "I am full of energy.",
                dimension = "extraversion"
            ),
            Question(
                id = 39,
                questionTextZh = "我关心他人的福祉。",
                questionTextEn = "I care about others' well-being.",
                dimension = "agreeableness"
            ),
            Question(
                id = 40,
                questionTextZh = "我对批评敏感。",
                questionTextEn = "I am sensitive to criticism.",
                dimension = "neuroticism"
            ),
            Question(
                id = 41,
                questionTextZh = "我对未知事物充满好奇。",
                questionTextEn = "I am curious about unknown things.",
                dimension = "openness"
            ),
            Question(
                id = 42,
                questionTextZh = "我能够自我约束。",
                questionTextEn = "I am able to exercise self-control.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 43,
                questionTextZh = "我喜欢热闹的环境。",
                questionTextEn = "I enjoy lively environments.",
                dimension = "extraversion"
            ),
            Question(
                id = 44,
                questionTextZh = "我容易相信他人。",
                questionTextEn = "I find it easy to trust others.",
                dimension = "agreeableness"
            ),
            Question(
                id = 45,
                questionTextZh = "我容易感到愤怒。",
                questionTextEn = "I get angry easily.",
                dimension = "neuroticism"
            ),
            Question(
                id = 46,
                questionTextZh = "我喜欢挑战传统观念。",
                questionTextEn = "I like to challenge traditional ideas.",
                dimension = "openness"
            ),
            Question(
                id = 47,
                questionTextZh = "我有很强的目标导向。",
                questionTextEn = "I have strong goal orientation.",
                dimension = "conscientiousness"
            ),
            Question(
                id = 48,
                questionTextZh = "我善于激励他人。",
                questionTextEn = "I am good at motivating others.",
                dimension = "extraversion"
            ),
            Question(
                id = 49,
                questionTextZh = "我尽量避免冲突。",
                questionTextEn = "I try to avoid conflicts.",
                dimension = "agreeableness"
            ),
            Question(
                id = 50,
                questionTextZh = "我经常感到孤独。",
                questionTextEn = "I often feel lonely.",
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
        
        // 计算Big Five各维度得分
        val rawBigFiveScores = mutableMapOf(
            "openness" to 0,
            "conscientiousness" to 0,
            "extraversion" to 0,
            "agreeableness" to 0,
            "neuroticism" to 0
        )

        request.answers.forEach { answer ->
            val dimension = when(answer.questionId) {
                // Openness 问题
                1, 6, 11, 16, 21, 26, 31, 36, 41, 46 -> "openness"
                // Conscientiousness 问题
                2, 7, 12, 17, 22, 27, 32, 37, 42, 47 -> "conscientiousness"
                // Extraversion 问题
                3, 8, 13, 18, 23, 28, 33, 38, 43, 48 -> "extraversion"
                // Agreeableness 问题
                4, 9, 14, 19, 24, 29, 34, 39, 44, 49 -> "agreeableness"
                // Neuroticism 问题
                5, 10, 15, 20, 25, 30, 35, 40, 45, 50 -> "neuroticism"
                else -> "openness" // 默认值
            }
            rawBigFiveScores[dimension] = rawBigFiveScores.getOrDefault(dimension, 0) + answer.answerScore
        }

        // 基于Big Five得分推断MBTI类型
        val mbtiType = calculateMBTIFromBigFive(rawBigFiveScores)
        
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
            descriptionZh = getMBTIDescription(mbtiType, "zh"),
            descriptionEn = getMBTIDescription(mbtiType, "en"),
            strengths = getMBTIStrengths(mbtiType),
            challenges = getMBTIChallenges(mbtiType)
        )
        
        // 创建Big Five分数（基于实际用户答案计算）
        val bigFiveScores = calculateBigFiveScores(rawBigFiveScores)
        
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
            descriptionZh = getMBTIDescription(typeCode, "zh"),
            descriptionEn = getMBTIDescription(typeCode, "en"),
            strengths = getMBTIStrengths(typeCode),
            challenges = getMBTIChallenges(typeCode)
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

    /**
     * 获取MBTI类型的详细描述
     * 删除了通用的模板文本，提供了个性化的优美描述
     */
    private fun getMBTIDescription(mbtiType: String, language: String): String {
        return if (language == "zh") {
            when (mbtiType) {
                "INTJ" -> "作为建筑师(INTJ)类型，您是天生的战略家和独立思考者。您具有敏锐的洞察力，能够看到事物的整体模式和长远影响，追求完美且对自己和他人都有较高标准。"
                "INTP" -> "作为逻辑学家(INTP)类型，您是充满好奇心的理论家和创新思想家。您热爱探索复杂的概念和抽象的想法，具有出色的逻辑分析能力和创新精神。"
                "ENTJ" -> "作为指挥官(ENTJ)类型，您是天生的领导者和决策者。您具有强烈的组织能力和战略眼光，善于激励他人并推动团队实现宏伟目标。"
                "ENTP" -> "作为辩论家(ENTP)类型，您是充满活力的创新者和挑战者。您热爱智力辩论和探索新的可能性，具有出色的应变能力和创造性思维。"
                "INFJ" -> "作为提倡者(INFJ)类型，您是富有洞察力的理想主义者。您具有深刻的同理心和直觉能力，致力于帮助他人实现潜能并创造积极的社会影响。"
                "INFP" -> "作为调停者(INFP)类型，您是充满激情的理想主义者。您重视真实性和创造力，具有强烈的个人价值观和对他人的深刻理解。"
                "ENFJ" -> "作为主人公(ENFJ)类型，您是天生的导师和激励者。您具有非凡的情商和领导魅力，善于启发他人并创造和谐的环境。"
                "ENFP" -> "作为竞选者(ENFP)类型，您是充满热情的社交家和创意者。您热爱与人交流，具有出色的沟通能力和感染他人的热情。"
                "ISTJ" -> "作为物流师(ISTJ)类型，您是可靠的实践者和组织者。您重视传统和秩序，具有出色的责任感和执行能力，是值得信赖的团队成员。"
                "ISFJ" -> "作为守护者(ISFJ)类型，您是温暖的守护者和支持者。您具有强烈的责任感和同情心，总是默默地为他人提供支持和关怀。"
                "ESTJ" -> "作为总经理(ESTJ)类型，您是高效的管理者和组织者。您具有出色的领导能力和执行力，善于建立秩序并推动团队实现目标。"
                "ESFJ" -> "作为执政官(ESFJ)类型，您是热心的支持者和协调者。您重视和谐与合作，具有出色的社交能力和为他人着想的品质。"
                "ISTP" -> "作为鉴赏家(ISTP)类型，您是灵活的实践者和问题解决者。您具有出色的机械理解能力和应变能力，喜欢动手实践并解决实际问题。"
                "ISFP" -> "作为探险家(ISFP)类型，您是富有创造力的艺术家和观察者。您重视美感和真实性，具有敏锐的审美能力和对生活的深刻体验。"
                "ESTP" -> "作为企业家(ESTP)类型，您是充满活力的行动者和冒险家。您喜欢挑战和刺激，具有出色的适应能力和抓住机会的眼光。"
                "ESFP" -> "作为娱乐家(ESFP)类型，您是热情的表演者和社交家。您热爱生活，具有出色的感染力和为他人带来快乐的能力。"
                else -> "您拥有独特的人格特质，具有自己独特的优势和魅力。"
            }
        } else {
            when (mbtiType) {
                "INTJ" -> "As an Architect (INTJ), you are a natural strategist and independent thinker. You possess sharp insight and can see overall patterns and long-term implications, pursuing perfection with high standards for yourself and others."
                "INTP" -> "As a Logician (INTP), you are a curious theorist and innovative thinker. You love exploring complex concepts and abstract ideas, with excellent logical analysis skills and innovative spirit."
                "ENTJ" -> "As a Commander (ENTJ), you are a natural leader and decision-maker. You have strong organizational skills and strategic vision, adept at motivating others and driving teams toward ambitious goals."
                "ENTP" -> "As a Debater (ENTP), you are an energetic innovator and challenger. You love intellectual debate and exploring new possibilities, with excellent adaptability and creative thinking."
                "INFJ" -> "As an Advocate (INFJ), you are an insightful idealist. You have deep empathy and intuition, committed to helping others realize their potential and create positive social impact."
                "INFP" -> "As a Mediator (INFP), you are a passionate idealist. You value authenticity and creativity, with strong personal values and deep understanding of others."
                "ENFJ" -> "As a Protagonist (ENFJ), you are a natural mentor and motivator. You have extraordinary emotional intelligence and leadership charisma, adept at inspiring others and creating harmonious environments."
                "ENFP" -> "As a Campaigner (ENFP), you are an enthusiastic socialite and creative thinker. You love communicating with people, with excellent communication skills and passion for inspiring others."
                "ISTJ" -> "As a Logistician (ISTJ), you are a reliable practitioner and organizer. You value tradition and order, with excellent sense of responsibility and execution ability, making you a trustworthy team member."
                "ISFJ" -> "As a Defender (ISFJ), you are a warm protector and supporter. You have a strong sense of responsibility and compassion, always quietly providing support and care for others."
                "ESTJ" -> "As an Executive (ESTJ), you are an efficient manager and organizer. You have excellent leadership and execution skills, adept at establishing order and driving teams to achieve goals."
                "ESFJ" -> "As a Consul (ESFJ), you are an enthusiastic supporter and coordinator. You value harmony and cooperation, with excellent social skills and consideration for others."
                "ISTP" -> "As a Virtuoso (ISTP), you are a flexible practitioner and problem-solver. You have excellent mechanical understanding and adaptability, enjoying hands-on practice and solving practical problems."
                "ISFP" -> "As an Adventurer (ISFP), you are a creative artist and observer. You value beauty and authenticity, with keen aesthetic sense and profound experience of life."
                "ESTP" -> "As an Entrepreneur (ESTP), you are an energetic action-taker and adventurer. You love challenges and excitement, with excellent adaptability and ability to seize opportunities."
                "ESFP" -> "As an Entertainer (ESFP), you are an enthusiastic performer and socialite. You love life, with excellent infectious ability and talent for bringing joy to others."
                else -> "You possess unique personality traits with your own distinct strengths and charms."
            }
        }
    }

    /**
     * 获取MBTI类型的优势特质
     */
    private fun getMBTIStrengths(mbtiType: String): List<String> {
        return when (mbtiType) {
            "INTJ" -> listOf("战略思维敏锐", "独立自主能力强", "追求卓越完美", "具有长远眼光")
            "INTP" -> listOf("逻辑分析能力强", "创新思维活跃", "求知欲旺盛", "思维灵活开放")
            "ENTJ" -> listOf("领导能力出众", "决策果断有力", "组织协调高效", "目标导向明确")
            "ENTP" -> listOf("创新能力强", "辩论技巧高超", "适应能力灵活", "思维活跃敏捷")
            "INFJ" -> listOf("洞察力深刻", "同理心强烈", "理想主义坚定", "助人意愿真挚")
            "INFP" -> listOf("创造力丰富", "价值观坚定", "理解力深刻", "真诚友善")
            "ENFJ" -> listOf("领导魅力非凡", "沟通能力出色", "激励他人有效", "团队协作优秀")
            "ENFP" -> listOf("热情洋溢", "创意无限", "社交能力强", "乐观积极")
            "ISTJ" -> listOf("责任感强烈", "组织能力优秀", "注重细节", "可靠值得信赖")
            "ISFJ" -> listOf("关怀体贴", "支持他人", "责任感强", "细心周到")
            "ESTJ" -> listOf("管理能力强", "执行力出色", "组织有序", "目标明确")
            "ESFJ" -> listOf("社交能力强", "关心他人", "合作精神佳", "责任心强")
            "ISTP" -> listOf("实践能力强", "问题解决能力出色", "适应灵活", "冷静理性")
            "ISFP" -> listOf("艺术感受力强", "价值观坚定", "敏感细腻", "真诚友好")
            "ESTP" -> listOf("行动力强", "适应能力出色", "乐观开朗", "冒险精神")
            "ESFP" -> listOf("热情活泼", "社交能力出众", "娱乐精神强", "乐观积极")
            else -> listOf("个性独特", "具有潜力", "值得了解", "能力多样")
        }
    }

    /**
     * 获取MBTI类型的发展建议
     */
    private fun getMBTIChallenges(mbtiType: String): List<String> {
        return when (mbtiType) {
            "INTJ" -> listOf("学会更好地表达情感", "增强对他人的耐心", "改善社交技巧", "平衡理想与现实")
            "INTP" -> listOf("将想法付诸实践", "提高时间管理能力", "加强情感表达", "增强执行力")
            "ENTJ" -> listOf("学会倾听他人意见", "培养耐心和同理心", "关注团队感受", "避免过于强势")
            "ENTP" -> listOf("专注于完成项目", "提高对细节的关注", "建立长期规划", "增强持续性")
            "INFJ" -> listOf("学会设定界限", "避免过度理想化", "关注自身需求", "提高现实适应力")
            "INFP" -> listOf("提高实际执行能力", "学会处理冲突", "增强时间管理", "面对现实挑战")
            "ENFJ" -> listOf("关注自身需求", "学会拒绝不合理要求", "避免过度付出", "平衡工作与生活")
            "ENFP" -> listOf("提高专注力", "加强时间管理", "完成既定目标", "增强持续性")
            "ISTJ" -> listOf("尝试新的事物", "提高灵活性", "增强创造力", "改善应变能力")
            "ISFJ" -> listOf("学会表达自己的需求", "增强自信心", "关注自身发展", "提高决断力")
            "ESTJ" -> listOf("培养同理心", "学会倾听他人", "提高灵活性", "关注情感因素")
            "ESFJ" -> listOf("学会关注自己", "增强独立性", "处理冲突的能力", "平衡付出与回报")
            "ISTP" -> listOf("提高长期规划能力", "加强情感表达", "建立深层关系", "增强责任感")
            "ISFP" -> listOf("提高现实适应能力", "学会面对冲突", "增强自信心", "规划未来发展")
            "ESTP" -> listOf("培养长远思维", "提高责任感", "学会深度思考", "增强持续性")
            "ESFP" -> listOf("提高规划能力", "学会延迟满足", "增强深度思考", "关注长远目标")
            else -> listOf("继续自我探索", "发挥个人优势", "面对成长挑战", "实现全面发展")
        }
    }

    /**
     * 基于Big Five得分推断MBTI类型
     */
    private fun calculateMBTIFromBigFive(bigFiveScores: Map<String, Int>): String {
        val openness = bigFiveScores["openness"] ?: 0
        val conscientiousness = bigFiveScores["conscientiousness"] ?: 0
        val extraversion = bigFiveScores["extraversion"] ?: 0
        val agreeableness = bigFiveScores["agreeableness"] ?: 0
        val neuroticism = bigFiveScores["neuroticism"] ?: 0

        // 基于Big Five特征推断MBTI类型
        val eI = if (extraversion > 25) "E" else "I"
        val sN = if (openness > 25) "N" else "S"
        val tF = if (agreeableness < 25) "T" else "F"
        val jP = if (conscientiousness > 25) "J" else "P"

        return "$eI$sN$tF$jP"
    }

    /**
     * 计算Big Five分数
     * 将原始分数转换为0-100的百分比分数
     */
    private fun calculateBigFiveScores(scores: Map<String, Int>): BigFiveScores {
        // 每个维度的题目数量
        val questionsPerDimension = 10
        // 每个维度的最高分数（每题最高5分）
        val maxScorePerDimension = questionsPerDimension * 5

        return BigFiveScores(
            openness = (scores["openness"] ?: 0) * 100.0 / maxScorePerDimension,
            conscientiousness = (scores["conscientiousness"] ?: 0) * 100.0 / maxScorePerDimension,
            extraversion = (scores["extraversion"] ?: 0) * 100.0 / maxScorePerDimension,
            agreeableness = (scores["agreeableness"] ?: 0) * 100.0 / maxScorePerDimension,
            neuroticism = (scores["neuroticism"] ?: 0) * 100.0 / maxScorePerDimension
        )
    }
}