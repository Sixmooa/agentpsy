package com.example.myapplication.data.consistency

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 数据一致性测试
 * TDD驱动验证Supabase云端数据与本地static数据的一致性
 */
class DataConsistencyTest {

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
    fun `测试INTJ类型职业建议一致性`() {
        // Given: INTJ类型职业建议
        val localCareers = testDataProvider.getLocalCareersForType("INTJ")
        val supabaseCareers = testDataProvider.getSupabaseCareersForType("INTJ")

        // When: 分析差异
        val missingInLocal = supabaseCareers.filter { !localCareers.contains(it) }
        val missingInSupabase = localCareers.filter { !supabaseCareers.contains(it) }

        // Then: 记录差异（预期存在差异，这是已知的测试失败）
        println("🔍 INTJ类型职业建议差异分析:")
        println("   本地 (${localCareers.size}): ${localCareers.joinToString(", ")}")
        println("   云端 (${supabaseCareers.size}): ${supabaseCareers.joinToString(", ")}")

        if (missingInLocal.isNotEmpty()) {
            println("   ❌ 云端有但本地没有: ${missingInLocal.joinToString(", ")}")
        }
        if (missingInSupabase.isNotEmpty()) {
            println("   ❌ 本地有但云端没有: ${missingInSupabase.joinToString(", ")}")
        }

        // 这个测试故意失败，因为我们已知数据不一致
        // 在TDD中，这是"Red"阶段 - 让测试失败来暴露问题
        if (missingInLocal.isNotEmpty() || missingInSupabase.isNotEmpty()) {
            fail("INTJ类型职业建议存在差异，需要同步修复")
        }
    }

    @Test
    fun `测试INTP类型职业建议一致性`() {
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

        if (missingInLocal.isNotEmpty() || missingInSupabase.isNotEmpty()) {
            fail("INTP类型职业建议存在差异，需要同步修复")
        }
    }

    @Test
    fun `测试ENTJ类型职业建议一致性`() {
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

        if (missingInLocal.isNotEmpty() || missingInSupabase.isNotEmpty()) {
            fail("ENTJ类型职业建议存在差异，需要同步修复")
        }
    }

    @Test
    fun `测试所有MBTI类型职业建议差异统计`() {
        // Given: 所有MBTI类型
        val allTypes = testDataProvider.getLocalCareerTypes()
        val totalDifferences = mutableMapOf<String, Int>()

        // When: 统计每个类型的差异数量
        allTypes.forEach { type ->
            val localCareers = testDataProvider.getLocalCareersForType(type)
            val supabaseCareers = testDataProvider.getSupabaseCareersForType(type)

            val missingInLocal = supabaseCareers.filter { !localCareers.contains(it) }
            val missingInSupabase = localCareers.filter { !supabaseCareers.contains(it) }

            val totalDiff = missingInLocal.size + missingInSupabase.size
            totalDifferences[type] = totalDiff
        }

        // Then: 输出统计报告
        println("📊 所有MBTI类型职业建议差异统计:")
        val typesWithDifferences = totalDifferences.filter { it.value > 0 }
        val consistentTypes = totalDifferences.filter { it.value == 0 }

        println("   总MBTI类型数: ${allTypes.size}")
        println("   存在差异的类型: ${typesWithDifferences.size}")
        println("   完全一致的类型: ${consistentTypes.size}")

        if (typesWithDifferences.isNotEmpty()) {
            println("   差异详情:")
            typesWithDifferences.forEach { (type, diffCount) ->
                println("     ${type}: ${diffCount}个差异")
            }
        }

        // 在TDD的"Red"阶段，我们预期这个测试会失败
        // 因为已知数据存在不一致
        if (typesWithDifferences.isNotEmpty()) {
            fail("发现 ${typesWithDifferences.size} 个MBTI类型存在职业建议差异，需要修复")
        }
    }

    @Test
    fun `生成数据一致性JSON报告`() {
        // Given: 所有数据
        val report = buildJsonObject {
            put("timestamp", "2025-01-13T00:00:00Z")
            put("test_summary", "TDD驱动的数据一致性验证")

            // 贝尔宾角色一致性
            put("belbin_consistency", buildJsonObject {
                put("local_count", testDataProvider.getLocalBelbinRoles().size)
                put("supabase_count", testDataProvider.getSupabaseBelbinRoles().size)
                put("is_consistent", true)
            })

            // 职业建议一致性
            val allTypes = testDataProvider.getLocalCareerTypes()
            put("career_consistency", buildJsonObject {
                put("total_types", allTypes.size)

                val inconsistentTypes = mutableListOf<String>()
                val typeDetails = buildJsonArray {
                    allTypes.forEach { type ->
                        val localCareers = testDataProvider.getLocalCareersForType(type)
                        val supabaseCareers = testDataProvider.getSupabaseCareersForType(type)

                        val missingInLocal = supabaseCareers.filter { !localCareers.contains(it) }
                        val missingInSupabase = localCareers.filter { !supabaseCareers.contains(it) }

                        if (missingInLocal.isNotEmpty() || missingInSupabase.isNotEmpty()) {
                            inconsistentTypes.add(type)
                        }

                        add(buildJsonObject {
                            put("type", type)
                            put("local_count", localCareers.size)
                            put("supabase_count", supabaseCareers.size)
                            put("is_consistent", missingInLocal.isEmpty() && missingInSupabase.isEmpty())
                            putJsonArray("missing_in_local") {
                                missingInLocal.forEach { add(it) }
                            }
                            putJsonArray("missing_in_supabase") {
                                missingInSupabase.forEach { add(it) }
                            }
                        })
                    }
                }

                put("consistent_types", allTypes.size - inconsistentTypes.size)
                put("inconsistent_types", inconsistentTypes.size)
                put("type_details", typeDetails)
            })

            put("overall_assessment", buildJsonObject {
                put("belbin_consistent", true)
                put("career_consistent", false)
                put("data_sync_needed", true)
                put("priority", "HIGH")
            })
        }

        // Then: 验证报告生成
        assertNotNull("数据一致性报告应该生成", report)
        assertTrue("报告应该包含时间戳", report.containsKey("timestamp"))
        assertTrue("报告应该包含贝尔宾一致性数据", report.containsKey("belbin_consistency"))
        assertTrue("报告应该包含职业建议一致性数据", report.containsKey("career_consistency"))

        println("📄 数据一致性JSON报告生成完成")
        println("   报告结构验证通过")

        // 输出报告概要
        val belbinConsistent = report["belbin_consistency"]?.JsonObject?.get("is_consistent")?.toString() == "true"
        val careerConsistent = report["career_consistency"]?.JsonObject?.get("inconsistent_types")?.toString()?.toInt() == 0

        println("   贝尔宾角色一致性: ${if (belbinConsistent) "✅" else "❌"}")
        println("   职业建议一致性: ${if (careerConsistent) "✅" else "❌"}")
    }
}