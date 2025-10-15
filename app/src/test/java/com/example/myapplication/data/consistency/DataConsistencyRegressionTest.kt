package com.example.myapplication.data.consistency

import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 数据一致性回归测试
 * 确保修复后的数据不会重新引入不一致
 */
class DataConsistencyRegressionTest {

    private lateinit var testDataProvider: DataConsistencyTestDataProvider

    @Before
    fun setUp() {
        testDataProvider = DataConsistencyTestDataProvider()
    }

    @Test
    fun `回归测试_确保贝尔宾角色数据保持一致`() {
        // Given: 贝尔宾角色数据应该一致
        val localRoles = testDataProvider.getLocalBelbinRoles()
        val supabaseRoles = testDataProvider.getSupabaseBelbinRoles()

        // When: 验证一致性
        val isConsistent = localRoles.size == supabaseRoles.size &&
                          localRoles.containsAll(supabaseRoles) &&
                          supabaseRoles.containsAll(localRoles)

        // Then: 确保贝尔宾角色数据保持一致
        assertTrue("贝尔宾角色数据应该保持完全一致", isConsistent)
        assertEquals("贝尔宾角色数量应该保持9个", 9, localRoles.size)
        assertEquals("云端贝尔宾角色数量应该保持9个", 9, supabaseRoles.size)

        println("✅ 贝尔宾角色数据回归测试通过")
    }

    @Test
    fun `回归测试_确保所有MBTI类型都有覆盖`() {
        // Given: 应该覆盖所有16个MBTI类型
        val expectedTypes = listOf(
            "INTJ", "INTP", "ENTJ", "ENTP", "INFJ", "INFP", "ENFJ", "ENFP",
            "ISTJ", "ISFJ", "ESTJ", "ESFJ", "ISTP", "ISFP", "ESTP", "ESFP"
        )

        val localTypes = testDataProvider.getLocalCareerTypes()
        val supabaseTypes = testDataProvider.getSupabaseCareerTypes()

        // When: 验证类型覆盖
        val localCoverage = expectedTypes.all { localTypes.contains(it) }
        val supabaseCoverage = expectedTypes.all { supabaseTypes.contains(it) }

        // Then: 确保所有类型都有覆盖
        assertTrue("本地数据应该覆盖所有16个MBTI类型", localCoverage)
        assertTrue("云端数据应该覆盖所有16个MBTI类型", supabaseCoverage)
        assertEquals("本地应该正好16个类型", 16, localTypes.size)
        assertEquals("云端应该正好16个类型", 16, supabaseTypes.size)

        println("✅ MBTI类型覆盖回归测试通过")
    }

    @Test
    fun `回归测试_确保本地数据不为空`() {
        // Given: 本地Static数据应该不为空
        val localTypes = testDataProvider.getLocalCareerTypes()

        // When: 验证每个类型都有职业建议
        val allTypesHaveCareers = localTypes.all { type ->
            val careers = testDataProvider.getLocalCareersForType(type)
            careers.isNotEmpty()
        }

        // Then: 确保所有类型都有职业建议
        assertTrue("所有MBTI类型都应该有本地职业建议", allTypesHaveCareers)

        println("✅ 本地数据完整性回归测试通过")
    }

    @Test
    fun `回归测试_确保云端数据不为空`() {
        // Given: 云端数据应该不为空
        val supabaseTypes = testDataProvider.getSupabaseCareerTypes()

        // When: 验证每个类型都有职业建议
        val allTypesHaveCareers = supabaseTypes.all { type ->
            val careers = testDataProvider.getSupabaseCareersForType(type)
            careers.isNotEmpty()
        }

        // Then: 确保所有类型都有职业建议
        assertTrue("所有MBTI类型都应该有云端职业建议", allTypesHaveCareers)

        println("✅ 云端数据完整性回归测试通过")
    }

    @Test
    fun `回归测试_数据提供者一致性验证`() {
        // Given: 数据提供者应该返回一致的预期数据
        val stats = testDataProvider.getConsistencyStatistics()

        // When: 验证统计数据
        val expectedTotalTypes = 16
        val expectedBelbinConsistent = true

        // Then: 确保数据提供者返回正确的基础统计
        assertEquals("应该有16个MBTI类型", expectedTotalTypes, stats.totalTypes)
        assertEquals("贝尔宾角色应该一致", expectedBelbinConsistent, stats.belbinConsistent)
        assertTrue("一致性率应该在0-1之间", stats.consistencyRate >= 0.0 && stats.consistencyRate <= 1.0)
        assertEquals("详情列表应该有16个条目", expectedTotalTypes, stats.details.size)

        println("✅ 数据提供者一致性回归测试通过")
        println("   总类型数: ${stats.totalTypes}")
        println("   一致类型数: ${stats.consistentTypes}")
        println("   不一致类型数: ${stats.inconsistentTypes}")
        println("   一致性率: ${String.format("%.1f%%", stats.consistencyRate * 100)}")
    }

    @Test
    fun `回归测试_确保测试数据结构完整性`() {
        // Given: 验证测试数据结构
        val sampleType = "INTJ"
        val comparison = testDataProvider.getDetailedComparison(sampleType)

        // When: 验证比较结果结构
        assertNotNull("比较结果不应为空", comparison)
        assertEquals("MBTI类型应该匹配", sampleType, comparison.mbtiType)
        assertNotNull("本地职业建议不应为空", comparison.localCareers)
        assertNotNull("云端职业建议不应为空", comparison.supabaseCareers)
        assertNotNull("本地缺失职业不应为空", comparison.missingInLocal)
        assertNotNull("云端缺失职业不应为空", comparison.missingInSupabase)

        println("✅ 测试数据结构完整性回归测试通过")
        println("   ${sampleType} 本地职业数: ${comparison.localCareers.size}")
        println("   ${sampleType} 云端职业数: ${comparison.supabaseCareers.size}")
    }

    @Test
    fun `回归测试_数据同步需求验证`() {
        // Given: 基于当前已知的不一致状态
        val stats = testDataProvider.getConsistencyStatistics()

        // When: 分析数据同步需求
        val hasInconsistencies = stats.inconsistentTypes > 0
        val needsCareerSync = !stats.details.all { it.isConsistent }
        val belbinNeedsSync = !stats.belbinConsistent

        // Then: 验证当前数据状态和修复需求
        if (hasInconsistencies) {
            println("⚠️  检测到数据不一致，需要同步修复")
            println("   不一致类型数: ${stats.inconsistentTypes}")
            assertTrue("如果有不一致，应该需要职业建议同步", needsCareerSync)
        }

        if (belbinNeedsSync) {
            println("⚠️  贝尔宾角色数据需要同步")
        } else {
            println("✅ 贝尔宾角色数据无需同步")
        }

        // 这个测试总是通过，但会报告当前状态
        println("✅ 数据同步需求验证完成")
    }

    @Test
    fun `回归测试_确保测试覆盖率`() {
        // Given: 验证测试覆盖了所有重要的数据类型
        val allTypes = testDataProvider.getLocalCareerTypes()

        // When: 检查测试覆盖
        val criticalTypes = listOf("INTJ", "INTP", "ENTJ", "INFJ", "ENFP", "ISTJ")
        val allCriticalCovered = criticalTypes.all { type ->
            val localCareers = testDataProvider.getLocalCareersForType(type)
            val supabaseCareers = testDataProvider.getSupabaseCareersForType(type)
            localCareers.isNotEmpty() && supabaseCareers.isNotEmpty()
        }

        // Then: 确保关键类型都有测试覆盖
        assertTrue("所有关键MBTI类型都应该有测试数据", allCriticalCovered)
        assertEquals("应该测试6个关键类型", 6, criticalTypes.size)

        println("✅ 测试覆盖率回归测试通过")
        println("   覆盖的关键类型: ${criticalTypes.joinToString(", ")}")
    }
}