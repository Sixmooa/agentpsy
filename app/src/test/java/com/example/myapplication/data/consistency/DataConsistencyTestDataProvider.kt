package com.example.myapplication.data.consistency

/**
 * 数据一致性测试数据提供者
 * 提供本地和Supabase云端数据的测试样本
 */
class DataConsistencyTestDataProvider {

    /**
     * 获取本地Static数据中的贝尔宾角色
     */
    fun getLocalBelbinRoles(): List<String> {
        return listOf(
            "Plant",
            "Resource_Investigator",
            "Coordinator",
            "Shaper",
            "Monitor_Evaluator",
            "Teamworker",
            "Implementer",
            "Completer_Finisher",
            "Specialist"
        )
    }

    /**
     * 获取Supabase云端数据中的贝尔宾角色
     */
    fun getSupabaseBelbinRoles(): List<String> {
        return listOf(
            "Plant",
            "Resource_Investigator",
            "Coordinator",
            "Shaper",
            "Monitor_Evaluator",
            "Teamworker",
            "Implementer",
            "Completer_Finisher",
            "Specialist"
        )
    }

    /**
     * 获取本地Static数据中的MBTI类型列表
     */
    fun getLocalCareerTypes(): List<String> {
        return listOf(
            "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
            "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"
        )
    }

    /**
     * 获取Supabase云端数据中的MBTI类型列表
     */
    fun getSupabaseCareerTypes(): List<String> {
        return listOf(
            "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
            "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"
        )
    }

    /**
     * 获取本地Static数据中指定MBTI类型的职业建议
     */
    fun getLocalCareersForType(mbtiType: String): List<String> {
        return when (mbtiType) {
            "INTJ" -> listOf("科学家", "工程师", "战略顾问", "研究员", "系统分析师", "软件工程师")
            "INTP" -> listOf("研究员", "科学家", "哲学家", "软件工程师", "大学教授", "技术专家")
            "ENTJ" -> listOf("企业高管", "项目经理", "律师", "企业家", "管理顾问")
            "ENTP" -> listOf("企业家", "市场营销", "公关专家", "创新顾问", "咨询师")
            "INFJ" -> listOf("心理咨询师", "教师", "作家", "人力资源", "社会工作者")
            "INFP" -> listOf("作家", "心理咨询师", "艺术家", "社会工作者", "培训师")
            "ENFJ" -> listOf("教师", "培训师", "人力资源经理", "公关经理", "心理咨询师")
            "ENFP" -> listOf("记者", "演员", "创意总监", "市场营销", "培训师")
            "ISTJ" -> listOf("会计师", "审计师", "行政主管", "质量控制", "运营经理")
            "ISFJ" -> listOf("护士", "教师", "人力资源", "客户服务经理", "社会工作者")
            "ESTJ" -> listOf("管理者", "军官", "项目经理", "运营经理", "行政主管")
            "ESFJ" -> listOf("人力资源", "护士", "教师", "客户服务", "活动策划")
            "ISTP" -> listOf("技术专家", "工程师", "外科医生", "机械师", "程序员")
            "ISFP" -> listOf("设计师", "艺术家", "音乐家", "兽医", "心理咨询师")
            "ESTP" -> listOf("销售代表", "警察", "运动员", "企业家", "急救医生")
            "ESFP" -> listOf("演员", "活动策划", "销售代表", "教师", "社会工作者")
            else -> emptyList()
        }
    }

    /**
     * 获取Supabase云端数据中指定MBTI类型的职业建议
     * 基于之前的数据分析结果
     */
    fun getSupabaseCareersForType(mbtiType: String): List<String> {
        return when (mbtiType) {
            "INTJ" -> listOf("建筑师", "工程师", "科学家", "研究员", "战略规划师", "系统分析师", "投资分析师", "管理顾问")
            "INTP" -> listOf("软件开发工程师", "研究科学家", "大学教授", "哲学家", "数学家", "理论物理学家", "技术作家", "系统架构师")
            "ENTJ" -> listOf("首席执行官", "企业家", "管理顾问", "投资银行家", "律师", "政治家", "销售经理", "项目经理")
            "ENTP" -> listOf("企业家", "营销经理", "公关专家", "记者", "发明家", "咨询顾问", "创意总监", "风险投资家")
            "INFJ" -> listOf("心理咨询师", "作家", "社会工作者", "人力资源专家", "教师", "非营利组织工作者", "艺术家", "编辑")
            "INFP" -> listOf("作家", "艺术家", "心理学家", "社会工作者", "音乐家", "图书管理员", "翻译", "非营利组织工作者")
            "ENFJ" -> listOf("教师", "培训师", "人力资源经理", "心理咨询师", "社会工作者", "公关专家", "销售代表", "非营利组织领导")
            "ENFP" -> listOf("记者", "公关专家", "心理学家", "销售代表", "演员", "艺术家", "社会工作者", "企业家")
            "ISTJ" -> listOf("会计师", "审计师", "银行家", "工程师", "医生", "律师", "管理员", "质量控制专家")
            "ISFJ" -> listOf("护士", "教师", "社会工作者", "图书管理员", "人力资源专员", "客户服务代表", "行政助理", "医疗技术员")
            "ESTJ" -> listOf("管理者", "销售经理", "银行家", "律师", "警察", "军官", "项目经理", "运营经理")
            "ESFJ" -> listOf("教师", "护士", "销售代表", "人力资源专员", "客户服务经理", "活动策划师", "社会工作者", "办公室经理")
            "ISTP" -> listOf("机械师", "工程师", "飞行员", "外科医生", "计算机程序员", "建筑师", "侦探", "运动员")
            "ISFP" -> listOf("艺术家", "音乐家", "摄影师", "设计师", "心理学家", "兽医", "按摩治疗师", "厨师")
            "ESTP" -> listOf("销售代表", "企业家", "警察", "消防员", "运动员", "演员", "房地产经纪人", "急救医疗技术员")
            "ESFP" -> listOf("演员", "音乐家", "销售代表", "活动策划师", "导游", "儿童护理工作者", "摄影师", "公关专家")
            else -> emptyList()
        }
    }

    /**
     * 获取本地与云端数据的详细对比
     */
    fun getDetailedComparison(mbtiType: String): CareerComparisonResult {
        val localCareers = getLocalCareersForType(mbtiType)
        val supabaseCareers = getSupabaseCareersForType(mbtiType)

        val missingInLocal = supabaseCareers.filter { !localCareers.contains(it) }
        val missingInSupabase = localCareers.filter { !supabaseCareers.contains(it) }

        return CareerComparisonResult(
            mbtiType = mbtiType,
            localCareers = localCareers,
            supabaseCareers = supabaseCareers,
            missingInLocal = missingInLocal,
            missingInSupabase = missingInSupabase,
            isConsistent = missingInLocal.isEmpty() && missingInSupabase.isEmpty()
        )
    }

    /**
     * 获取所有MBTI类型的对比结果
     */
    fun getAllTypeComparisons(): List<CareerComparisonResult> {
        return getLocalCareerTypes().map { type ->
            getDetailedComparison(type)
        }
    }

    /**
     * 获取数据一致性统计
     */
    fun getConsistencyStatistics(): ConsistencyStatistics {
        val allComparisons = getAllTypeComparisons()
        val consistentTypes = allComparisons.filter { it.isConsistent }
        val inconsistentTypes = allComparisons.filter { !it.isConsistent }

        return ConsistencyStatistics(
            totalTypes = allComparisons.size,
            consistentTypes = consistentTypes.size,
            inconsistentTypes = inconsistentTypes.size,
            consistencyRate = consistentTypes.size.toDouble() / allComparisons.size,
            belbinConsistent = getLocalBelbinRoles().size == getSupabaseBelbinRoles().size &&
                              getLocalBelbinRoles().containsAll(getSupabaseBelbinRoles()),
            details = allComparisons
        )
    }
}

/**
 * 职业建议对比结果
 */
data class CareerComparisonResult(
    val mbtiType: String,
    val localCareers: List<String>,
    val supabaseCareers: List<String>,
    val missingInLocal: List<String>,
    val missingInSupabase: List<String>,
    val isConsistent: Boolean
)

/**
 * 数据一致性统计
 */
data class ConsistencyStatistics(
    val totalTypes: Int,
    val consistentTypes: Int,
    val inconsistentTypes: Int,
    val consistencyRate: Double,
    val belbinConsistent: Boolean,
    val details: List<CareerComparisonResult>
)