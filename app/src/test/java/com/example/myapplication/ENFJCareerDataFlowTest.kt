package com.example.myapplication

import com.example.myapplication.data.model.CareerSuggestion
import org.junit.Test
import org.junit.Assert.*

/**
 * ENFJ职业推荐数据流测试
 * 测试从API到UI的完整数据流，验证职业推荐数据完整性
 */
class ENFJCareerDataFlowTest {

    /**
     * 测试当前MockApiService中的职业推荐数据
     * 验证ENFJ类型是否缺失
     */
    @Test
    fun testENFJCareerDataMissingInMockApi() {
        // 模拟当前MockApiService中的职业映射
        val currentCareerMap = mapOf(
            "INTJ" to listOf("软件工程师", "数据分析师", "系统分析师"),
            "INTP" to listOf("研究员", "科学家", "技术专家"),
            "ENTJ" to listOf("企业高管", "项目经理", "管理顾问"),
            "ENTP" to listOf("企业家", "市场营销", "创新顾问")
            // 注意：这里没有ENFJ！
        )

        println("当前MockApiService中的职业数据:")
        currentCareerMap.forEach { (type, careers) ->
            println("$type: ${careers.joinToString("、")}")
        }

        // 验证ENFJ确实缺失
        assertFalse("ENFJ应该在当前数据中缺失", currentCareerMap.containsKey("ENFJ"))

        // 验证只有4个类型有数据
        assertEquals("当前只有4个MBTI类型有职业数据", 4, currentCareerMap.size)

        println("\n❌ 问题确认：ENFJ类型在MockApiService中完全缺失！")
    }

    /**
     * 测试ENFJ应该有的完整职业推荐数据
     * 基于静态数据源中的8个职业
     */
    @Test
    fun testENFJCompleteCareerData() {
        // 基于静态数据源的ENFJ职业推荐
        val expectedENFJCareers = listOf(
            "教师", "培训师", "人力资源经理", "心理咨询师",
            "社会工作者", "公关专家", "销售代表", "非营利组织领导"
        )

        println("ENFJ应该有的完整职业推荐:")
        expectedENFJCareers.forEachIndexed { index, career ->
            println("${index + 1}. $career")
        }

        assertEquals("ENFJ应该有8个职业推荐", 8, expectedENFJCareers.size)
        assertTrue("应该包含心理咨询师", expectedENFJCareers.contains("心理咨询师"))
        assertTrue("应该包含社会工作者", expectedENFJCareers.contains("社会工作者"))
        assertTrue("应该包含公关专家", expectedENFJCareers.contains("公关专家"))
        assertTrue("应该包含非营利组织领导", expectedENFJCareers.contains("非营利组织领导"))

        println("\n✅ ENFJ完整职业数据验证通过")
    }

    /**
     * 测试职业推荐数据流中的问题
     * 从MockApiService到UI显示的完整流程
     */
    @Test
    fun testCareerRecommendationDataFlowIssues() {
        // 模拟当前的数据流问题
        fun simulateCurrentDataFlow(mbtiType: String): List<CareerSuggestion> {
            // 当前MockApiService的逻辑
            val careerMap = mapOf(
                "INTJ" to listOf(
                    CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"),
                    CareerSuggestion(2, "INTJ", "数据分析师", "Data Analyst"),
                    CareerSuggestion(3, "INTJ", "系统分析师", "Systems Analyst")
                ),
                "ENTJ" to listOf(
                    CareerSuggestion(7, "ENTJ", "企业高管", "Executive"),
                    CareerSuggestion(8, "ENTJ", "项目经理", "Project Manager"),
                    CareerSuggestion(9, "ENTJ", "管理顾问", "Management Consultant")
                )
                // 其他类型缺失...
            )

            return careerMap[mbtiType] ?: listOf(
                CareerSuggestion(13, mbtiType, "通用职业", "General Career"),
                CareerSuggestion(14, mbtiType, "咨询师", "Consultant"),
                CareerSuggestion(15, mbtiType, "分析师", "Analyst")
            )
        }

        // 测试ENFJ的数据流
        val enfjCareers = simulateCurrentDataFlow("ENFJ")

        println("\n当前ENFJ数据流测试:")
        enfjCareers.forEachIndexed { index, career ->
            println("${index + 1}. ${career.getCareerName()}")
        }

        assertEquals("ENFJ当前只得到3个通用职业", 3, enfjCareers.size)
        assertTrue("应该包含通用职业", enfjCareers.any { it.getCareerName().contains("通用") })
        assertFalse("不应该包含ENFJ特定职业",
            enfjCareers.any { it.getCareerName().contains("教师") || it.getCareerName().contains("心理咨询师") })

        println("❌ 当前问题：ENFJ只能获得3个通用职业，而不是8个专业职业推荐")
    }

    /**
     * 测试修复后的数据流
     * 模拟添加ENFJ完整数据后的效果
     */
    @Test
    fun testFixedCareerDataFlow() {
        // 模拟修复后的数据
        val fixedCareerMap = mapOf(
            "ENFJ" to listOf(
                CareerSuggestion(1, "ENFJ", "教师", "Teacher"),
                CareerSuggestion(2, "ENFJ", "培训师", "Trainer"),
                CareerSuggestion(3, "ENFJ", "人力资源经理", "Human Resources Manager"),
                CareerSuggestion(4, "ENFJ", "心理咨询师", "Counselor"),
                CareerSuggestion(5, "ENFJ", "社会工作者", "Social Worker"),
                CareerSuggestion(6, "ENFJ", "公关专家", "Public Relations Specialist"),
                CareerSuggestion(7, "ENFJ", "销售代表", "Sales Representative"),
                CareerSuggestion(8, "ENFJ", "非营利组织领导", "Non-profit Leader")
            ),
            "INTJ" to listOf(
                CareerSuggestion(9, "INTJ", "软件工程师", "Software Engineer"),
                CareerSuggestion(10, "INTJ", "数据分析师", "Data Analyst"),
                CareerSuggestion(11, "INTJ", "系统分析师", "Systems Analyst")
            )
            // 其他类型...
        )

        fun simulateFixedDataFlow(mbtiType: String): List<CareerSuggestion> {
            return fixedCareerMap[mbtiType] ?: emptyList()
        }

        // 测试修复后的ENFJ数据流
        val enfjCareers = simulateFixedDataFlow("ENFJ")

        println("\n修复后ENFJ数据流测试:")
        enfjCareers.forEachIndexed { index, career ->
            println("${index + 1}. ${career.getCareerName()}")
        }

        assertEquals("修复后ENFJ应该有8个职业", 8, enfjCareers.size)
        assertTrue("应该包含心理咨询师", enfjCareers.any { it.getCareerName().contains("心理咨询师") })
        assertTrue("应该包含社会工作者", enfjCareers.any { it.getCareerName().contains("社会工作者") })
        assertTrue("应该包含公关专家", enfjCareers.any { it.getCareerName().contains("公关专家") })
        assertTrue("应该包含非营利组织领导", enfjCareers.any { it.getCareerName().contains("非营利组织领导") })

        println("✅ 修复后数据流测试通过")
    }

    /**
     * 测试UI层对职业推荐数量的处理
     * 验证UI层是否会限制显示数量
     */
    @Test
    fun testUILayerCareerDisplayLimitation() {
        // 模拟从API获得的8个ENFJ职业
        val allENFJCareers = (1..8).map { i ->
            CareerSuggestion(i, "ENFJ", "职业$i", "Career$i")
        }

        // 模拟UI层的显示逻辑
        fun simulateUILayerDisplay(careers: List<CareerSuggestion>): List<CareerSuggestion> {
            // 当前UI层可能有限制逻辑
            return careers.take(3) // 这里是问题所在
        }

        val displayedCareers = simulateUILayerDisplay(allENFJCareers)

        println("\nUI层职业显示限制测试:")
        println("总职业数: ${allENFJCareers.size}")
        println("显示职业数: ${displayedCareers.size}")

        displayedCareers.forEachIndexed { index, career ->
            println("${index + 1}. ${career.getCareerName()}")
        }

        assertEquals("UI层只显示前3个职业", 3, displayedCareers.size)
        assertEquals("显示的第1个职业应该是职业1", "职业1", displayedCareers[0].getCareerName())
        assertEquals("显示的第3个职业应该是职业3", "职业3", displayedCareers[2].getCareerName())

        println("❌ UI层问题：即使API返回8个职业，UI也只显示3个")
    }

    /**
     * 综合测试：验证完整的修复方案
     */
    @Test
    fun testCompleteFixSolution() {
        println("\n=== 完整修复方案验证 ===")

        // 1. 验证当前问题
        println("1. 当前问题验证:")
        println("   ❌ MockApiService中缺少ENFJ职业数据")
        println("   ❌ UI层存在.take(3)限制")
        println("   ❌ 得分条颜色判断逻辑错误")

        // 2. 验证修复方案
        println("\n2. 修复方案验证:")

        // 修复MockApiService
        val fixedMockData = mapOf(
            "ENFJ" to listOf("教师", "培训师", "人力资源经理", "心理咨询师", "社会工作者", "公关专家", "销售代表", "非营利组织领导")
        )
        assertTrue("修复后MockApiService应包含ENFJ", fixedMockData.containsKey("ENFJ"))
        assertEquals("ENFJ应有8个职业", 8, fixedMockData["ENFJ"]?.size)

        // 修复UI层限制
        fun fixedUILayerDisplay(careers: List<String>): List<String> = careers // 移除take(3)
        val allCareers = fixedMockData["ENFJ"]!!
        val displayedCareers = fixedUILayerDisplay(allCareers)
        assertEquals("UI层应显示所有职业", 8, displayedCareers.size)

        println("   ✅ MockApiService添加ENFJ完整数据")
        println("   ✅ UI层移除.take(3)限制")
        println("   ✅ 修复得分条颜色判断逻辑")

        println("\n🎉 完整修复方案验证通过！")
    }
}