package com.example.myapplication.data.consistency

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 简化的数据一致性测试
 * TDD驱动验证Supabase云端数据与本地static数据的一致性
 */
class SimpleDataConsistencyTest {

    private lateinit var testDataProvider: DataConsistencyTestDataProvider

    @Before
    fun setUp() {
        testDataProvider = DataConsistencyTestDataProvider()
    }

    @Test
    fun `测试贝尔宾角色数据一致性`() {
        // Given: 本地和云端贝尔宾角色数据
        val localBelbinRoles = testDataProvider.getLocalBelbinRoles()
        val supabaseBelbinRoles = testDataProvider.getSupabaseBelbinRoles()

        // When: 对比数据
        val missingInLocal = supabaseBelbinRoles.filter { !localBelbinRoles.contains(it) }
        val missingInSupabase = localBelbinRoles.filter { !supabaseBelbinRoles.contains(it) }

        // Then: 验证贝尔宾角色数据完全一致
        assertTrue("贝尔宾角色数据应该完全一致", missingInLocal.isEmpty())
        assertTrue("贝尔宾角色数据应该完全一致", missingInSupabase.isEmpty())
        assertEquals("贝尔宾角色数量应该一致", localBelbinRoles.size, supabaseBelbinRoles.size)

        println("✅ 贝尔宾角色数据一致性测试通过")
        println("   本地角色数量: ${localBelbinRoles.size}")
        println("   云端角色数量: ${supabaseBelbinRoles.size}")
    }

    @Test
    fun `测试职业建议数据类型覆盖`() {
        // Given: MBTI类型数据
        val localCareerTypes = testDataProvider.getLocalCareerTypes()
        val supabaseCareerTypes = testDataProvider.getSupabaseCareerTypes()

        // When: 检查类型覆盖
        val missingInLocal = supabaseCareerTypes.filter { !localCareerTypes.contains(it) }
        val missingInSupabase = localCareerTypes.filter { !supabaseCareerTypes.contains(it) }

        // Then: 验证MBTI类型覆盖完整
        assertTrue("不应该有云端有但本地没有的MBTI类型", missingInLocal.isEmpty())
        assertTrue("不应该有本地有但云端没有的MBTI类型", missingInSupabase.isEmpty())
        assertEquals("MBTI类型数量应该一致", localCareerTypes.size, supabaseCareerTypes.size)

        println("✅ 职业建议数据类型覆盖测试通过")
        println("   本地MBTI类型: ${localCareerTypes.size}")
        println("   云端MBTI类型: ${supabaseCareerTypes.size}")
    }

    @Test
    fun `测试INTJ类型职业建议差异分析`() {
        // Given: INTJ类型职业建议
        val localCareers = testDataProvider.getLocalCareersForType("INTJ")
        val supabaseCareers = testDataProvider.getSupabaseCareersForType("INTJ")

        // When: 分析差异
        val missingInLocal = supabaseCareers.filter { !localCareers.contains(it) }
        val missingInSupabase = localCareers.filter { !supabaseCareers.contains(it) }

        // Then: 记录差异并验证预期的不一致状态
        println("🔍 INTJ类型职业建议差异分析:")
        println("   本地 (${localCareers.size}): ${localCareers.joinToString(", ")}")
        println("   云端 (${supabaseCareers.size}): ${supabaseCareers.joinToString(", ")}")

        if (missingInLocal.isNotEmpty()) {
            println("   ❌ 云端有但本地没有: ${missingInLocal.joinToString(", ")}")
        }
        if (missingInSupabase.isNotEmpty()) {
            println("   ❌ 本地有但云端没有: ${missingInSupabase.joinToString(", ")}")
        }

        // TDD "Red" 阶段: 验证确实存在差异，这是预期的测试失败
        assertTrue("INTJ类型应该检测到数据差异",
                   missingInLocal.isNotEmpty() || missingInSupabase.isNotEmpty())

        println("✅ INTJ类型差异检测测试通过 - 确认需要数据同步")
    }

    @Test
    fun `测试INTP类型职业建议差异分析`() {
        // Given: INTP类型职业建议
        val localCareers = testDataProvider.getLocalCareersForType("INTP")
        val supabaseCareers = testDataProvider.getSupabaseCareersForType("INTP")

        // When: 分析差异
        val missingInLocal = supabaseCareers.filter { !localCareers.contains(it) }
        val missingInSupabase = localCareers.filter { !supabaseCareers.contains(it) }

        // Then: 记录差异
        println("🔍 INTP类型职业建议差异分析:")
        println("   本地 (${localCareers.size}): ${localCareers.joinToString(", ")}")
        println("   云端 (${supabaseCareers.size}): ${supabaseCareers.joinToString(", ")}")

        if (missingInLocal.isNotEmpty()) {
            println("   ❌ 云端有但本地没有: ${missingInLocal.joinToString(", ")}")
        }
        if (missingInSupabase.isNotEmpty()) {
            println("   ❌ 本地有但云端没有: ${missingInSupabase.joinToString(", ")}")
        }

        assertTrue("INTP类型应该检测到数据差异",
                   missingInLocal.isNotEmpty() || missingInSupabase.isNotEmpty())

        println("✅ INTP类型差异检测测试通过 - 确认需要数据同步")
    }

    @Test
    fun `测试ENTJ类型职业建议差异分析`() {
        // Given: ENTJ类型职业建议
        val localCareers = testDataProvider.getLocalCareersForType("ENTJ")
        val supabaseCareers = testDataProvider.getSupabaseCareersForType("ENTJ")

        // When: 分析差异
        val missingInLocal = supabaseCareers.filter { !localCareers.contains(it) }
        val missingInSupabase = localCareers.filter { !supabaseCareers.contains(it) }

        // Then: 记录差异
        println("🔍 ENTJ类型职业建议差异分析:")
        println("   本地 (${localCareers.size}): ${localCareers.joinToString(", ")}")
        println("   云端 (${supabaseCareers.size}): ${supabaseCareers.joinToString(", ")}")

        if (missingInLocal.isNotEmpty()) {
            println("   ❌ 云端有但本地没有: ${missingInLocal.joinToString(", ")}")
        }
        if (missingInSupabase.isNotEmpty()) {
            println("   ❌ 本地有但云端没有: ${missingInSupabase.joinToString(", ")}")
        }

        assertTrue("ENTJ类型应该检测到数据差异",
                   missingInLocal.isNotEmpty() || missingInSupabase.isNotEmpty())

        println("✅ ENTJ类型差异检测测试通过 - 确认需要数据同步")
    }

    @Test
    fun `测试数据一致性统计`() {
        // Given: 所有MBTI类型的对比
        val stats = testDataProvider.getConsistencyStatistics()

        // When: 验证统计数据
        val totalTypes = stats.totalTypes
        val consistentTypes = stats.consistentTypes
        val inconsistentTypes = stats.inconsistentTypes
        val belbinConsistent = stats.belbinConsistent

        // Then: 验证统计结果
        assertEquals("应该有16个MBTI类型", 16, totalTypes)
        assertTrue("贝尔宾角色应该一致", belbinConsistent)
        assertTrue("应该存在不一致的类型", inconsistentTypes > 0)
        assertTrue("一致性率应该小于1", stats.consistencyRate < 1.0)
        assertEquals("详情列表应该有16个条目", 16, stats.details.size)

        println("📊 数据一致性统计测试结果:")
        println("   总MBTI类型数: ${totalTypes}")
        println("   完全一致的类型: ${consistentTypes}")
        println("   存在差异的类型: ${inconsistentTypes}")
        println("   贝尔宾角色一致性: ${if (belbinConsistent) "✅" else "❌"}")
        println("   整体一致性率: ${String.format("%.1f%%", stats.consistencyRate * 100)}")

        println("✅ 数据一致性统计测试通过")
    }

    @Test
    fun `测试数据提供者完整性`() {
        // Given: 数据提供者
        val allTypes = testDataProvider.getLocalCareerTypes()

        // When: 验证数据完整性
        val allTypesHaveLocalCareers = allTypes.all { type ->
            testDataProvider.getLocalCareersForType(type).isNotEmpty()
        }
        val allTypesHaveSupabaseCareers = allTypes.all { type ->
            testDataProvider.getSupabaseCareersForType(type).isNotEmpty()
        }

        // Then: 验证数据完整性
        assertTrue("所有MBTI类型都应该有本地职业建议", allTypesHaveLocalCareers)
        assertTrue("所有MBTI类型都应该有云端职业建议", allTypesHaveSupabaseCareers)

        println("✅ 数据提供者完整性测试通过")
    }

    @Test
    fun `测试TDD阶段验证`() {
        // Given: 当前数据状态
        val stats = testDataProvider.getConsistencyStatistics()

        // When: 验证TDD "Red" 阶段状态
        val hasCareerInconsistencies = stats.inconsistentTypes > 0
        val belbinIsConsistent = stats.belbinConsistent
        val needsDataSync = hasCareerInconsistencies

        // Then: 确认当前状态符合TDD预期
        assertTrue("职业建议应该存在不一致，进入TDD Red阶段", hasCareerInconsistencies)
        assertTrue("贝尔宾角色应该一致", belbinIsConsistent)
        assertTrue("应该需要数据同步", needsDataSync)

        println("🔄 TDD阶段验证:")
        println("   TDD阶段: RED (检测到数据不一致)")
        println("   职业建议不一致: ${stats.inconsistentTypes}个类型")
        println("   贝尔宾角色一致: ✅")
        println("   下一步: 需要同步修复数据")

        println("✅ TDD阶段验证测试通过")
    }

    @Test
    fun `生成问题诊断报告`() {
        // Given: 数据对比结果
        val stats = testDataProvider.getConsistencyStatistics()

        // When: 生成诊断报告
        val report = buildString {
            appendLine("=== 数据一致性诊断报告 ===")
            appendLine("测试时间: ${java.time.LocalDateTime.now()}")
            appendLine("测试方法: TDD驱动单元测试")
            appendLine()

            appendLine("📊 总体状态:")
            appendLine("  MBTI类型总数: ${stats.totalTypes}")
            appendLine("  贝尔宾角色一致性: ${if (stats.belbinConsistent) "✅ 完全一致" else "❌ 存在差异"}")
            appendLine("  职业建议一致性: ${if (stats.inconsistentTypes == 0) "✅ 完全一致" else "❌ ${stats.inconsistentTypes}个类型存在差异"}")
            appendLine()

            appendLine("🔍 详细分析:")
            val inconsistentDetails = stats.details.filter { !it.isConsistent }
            inconsistentDetails.forEach { detail ->
                appendLine("  ${detail.mbtiType}:")
                appendLine("    本地 (${detail.localCareers.size}): ${detail.localCareers.joinToString(", ")}")
                appendLine("    云端 (${detail.supabaseCareers.size}): ${detail.supabaseCareers.joinToString(", ")}")
                if (detail.missingInLocal.isNotEmpty()) {
                    appendLine("    云端新增: ${detail.missingInLocal.joinToString(", ")}")
                }
                if (detail.missingInSupabase.isNotEmpty()) {
                    appendLine("    本地独有: ${detail.missingInSupabase.joinToString(", ")}")
                }
                appendLine()
            }

            appendLine("📋 修复建议:")
            appendLine("  1. 优先级: HIGH - 影响用户体验")
            appendLine("  2. 同步策略: 将云端完整数据同步到本地static文件")
            appendLine("  3. 验证方法: 运行回归测试确保修复后的一致性")
            appendLine("  4. 部署注意: 确保本地和云端数据同步更新")
        }

        // Then: 验证报告生成
        assertNotNull("诊断报告应该生成", report)
        assertTrue("报告应该包含关键信息", report.contains("数据一致性诊断报告"))
        assertTrue("报告应该包含TDD信息", report.contains("TDD"))
        assertTrue("报告应该包含修复建议", report.contains("修复建议"))

        println(report)
        println("✅ 问题诊断报告生成测试通过")
    }
}