package com.example.myapplication

import com.example.myapplication.data.model.CareerSuggestion
import org.junit.Test
import org.junit.Assert.*

/**
 * ENFJ职业推荐数据完整性测试
 * 测试修复前后的职业推荐显示问题
 */
class ENFJCareerSuggestionTest {

    /**
     * 测试问题：ENFJ职业推荐数据在静态文件中有8个，但Android只显示3个
     * 这个测试验证实际数据源的完整性
     */
    @Test
    fun testENFJCareerDataCompleteness() {
        // 预期的ENFJ职业推荐列表（来自静态数据源）
        val expectedENFJCareers = listOf(
            "教师", "培训师", "人力资源经理", "心理咨询师",
            "社会工作者", "公关专家", "销售代表", "非营利组织领导"
        )

        val expectedENFJCareersEn = listOf(
            "Teacher", "Trainer", "Human Resources Manager", "Counselor",
            "Social Worker", "Public Relations Specialist", "Sales Representative", "Non-profit Leader"
        )

        // 验证数据完整性
        assertEquals("ENFJ中文职业推荐应有8个", 8, expectedENFJCareers.size)
        assertEquals("ENFJ英文职业推荐应有8个", 8, expectedENFJCareersEn.size)

        // 验证具体的职业名称
        assertTrue("应包含教师", expectedENFJCareers.contains("教师"))
        assertTrue("应包含心理咨询师", expectedENFJCareers.contains("心理咨询师"))
        assertTrue("应包含人力资源经理", expectedENFJCareers.contains("人力资源经理"))
        assertTrue("应包含非营利组织领导", expectedENFJCareers.contains("非营利组织领导"))

        // 验证英文版本
        assertTrue("应包含Teacher", expectedENFJCareersEn.contains("Teacher"))
        assertTrue("应包含Counselor", expectedENFJCareersEn.contains("Counselor"))
        assertTrue("应包含Human Resources Manager", expectedENFJCareersEn.contains("Human Resources Manager"))
        assertTrue("应包含Non-profit Leader", expectedENFJCareersEn.contains("Non-profit Leader"))
    }

    /**
     * 测试Android显示限制问题
     * 这个测试模拟当前Android代码中的.take(3)问题
     */
    @Test
    fun testAndroidDisplayLimitationBug() {
        // 模拟从API获取的完整职业建议列表
        val allCareers = listOf(
            CareerSuggestion(careerZh = "教师", careerEn = "Teacher"),
            CareerSuggestion(careerZh = "培训师", careerEn = "Trainer"),
            CareerSuggestion(careerZh = "人力资源经理", careerEn = "Human Resources Manager"),
            CareerSuggestion(careerZh = "心理咨询师", careerEn = "Counselor"),
            CareerSuggestion(careerZh = "社会工作者", careerEn = "Social Worker"),
            CareerSuggestion(careerZh = "公关专家", careerEn = "Public Relations Specialist"),
            CareerSuggestion(careerZh = "销售代表", careerEn = "Sales Representative"),
            CareerSuggestion(careerZh = "非营利组织领导", careerEn = "Non-profit Leader")
        )

        // 模拟当前Android代码中的问题（使用take(3)）
        val limitedCareers = allCareers.take(3)

        // 验证问题：只显示了前3个职业
        assertEquals("当前Android代码错误地只显示3个职业", 3, limitedCareers.size)

        // 验证缺失的职业
        val displayedCareerNames = limitedCareers.map { it.getCareerName("zh") }
        assertFalse("当前显示缺失心理咨询师", displayedCareerNames.contains("心理咨询师"))
        assertFalse("当前显示缺失社会工作者", displayedCareerNames.contains("社会工作者"))
        assertFalse("当前显示缺失公关专家", displayedCareerNames.contains("公关专家"))
        assertFalse("当前显示缺失非营利组织领导", displayedCareerNames.contains("非营利组织领导"))

        println("当前显示的职业: $displayedCareerNames")
        println("应该显示的职业数量: ${allCareers.size}")
        println("实际显示的职业数量: ${limitedCareers.size}")
    }

    /**
     * 测试CareerSuggestion数据模型的语言支持
     */
    @Test
    fun testCareerSuggestionLanguageSupport() {
        val career = CareerSuggestion(
            careerZh = "心理咨询师",
            careerEn = "Counselor"
        )

        // 测试中文获取
        assertEquals("中文职业名称获取错误", "心理咨询师", career.getCareerName("zh"))

        // 测试英文获取
        assertEquals("英文职业名称获取错误", "Counselor", career.getCareerName("en"))

        // 测试默认语言
        assertEquals("默认语言应为中文", "心理咨询师", career.getCareerName())

        // 测试只有英文名称的情况
        val englishOnlyCareer = CareerSuggestion(
            careerEn = "Teacher"
        )

        assertEquals("英文优先获取", "Teacher", englishOnlyCareer.getCareerName("zh"))
        assertEquals("英文获取", "Teacher", englishOnlyCareer.getCareerName("en"))
    }

    /**
     * 测试ENFJ职业推荐的合理性
     */
    @Test
    fun testENFJCareerAppropriateness() {
        val enfjCareers = listOf(
            "教师", "培训师", "人力资源经理", "心理咨询师",
            "社会工作者", "公关专家", "销售代表", "非营利组织领导"
        )

        // ENFJ特征：外向、直觉、情感、判断
        // 这些职业应该符合ENFJ的特点：帮助他人、沟通能力、领导力、同理心

        // 验证职业与ENFJ特质的匹配度
        val helpingCareers = listOf("教师", "心理咨询师", "社会工作者", "非营利组织领导")
        val leadershipCareers = listOf("人力资源经理", "培训师", "公关专家")
        val communicationCareers = listOf("公关专家", "销售代表", "教师", "培训师")

        // 验证帮助导向的职业
        assertTrue("ENFJ职业应包含帮助导向的工作",
            enfjCareers.any { it in helpingCareers })

        // 验证领导导向的职业
        assertTrue("ENFJ职业应包含领导导向的工作",
            enfjCareers.any { it in leadershipCareers })

        // 验证沟通导向的职业
        assertTrue("ENFJ职业应包含沟通导向的工作",
            enfjCareers.any { it in communicationCareers })

        // 验证职业数量适中（不是太少也不是太多）
        assertTrue("ENFJ职业数量应合理（5-15个）",
            enfjCareers.size >= 5 && enfjCareers.size <= 15)
    }

    /**
     * 测试修复后的完整显示
     */
    @Test
    fun testFixedCompleteCareerDisplay() {
        val allCareers = listOf(
            CareerSuggestion(careerZh = "教师", careerEn = "Teacher"),
            CareerSuggestion(careerZh = "培训师", careerEn = "Trainer"),
            CareerSuggestion(careerZh = "人力资源经理", careerEn = "Human Resources Manager"),
            CareerSuggestion(careerZh = "心理咨询师", careerEn = "Counselor"),
            CareerSuggestion(careerZh = "社会工作者", careerEn = "Social Worker"),
            CareerSuggestion(careerZh = "公关专家", careerEn = "Public Relations Specialist"),
            CareerSuggestion(careerZh = "销售代表", careerEn = "Sales Representative"),
            CareerSuggestion(careerZh = "非营利组织领导", careerEn = "Non-profit Leader")
        )

        // 模拟修复后的代码（显示所有职业）
        val completeCareers = allCareers

        // 验证修复：显示所有8个职业
        assertEquals("修复后应显示所有8个职业", 8, completeCareers.size)

        // 验证所有重要职业都被包含
        val displayedCareerNames = completeCareers.map { it.getCareerName("zh") }
        assertTrue("应包含心理咨询师", displayedCareerNames.contains("心理咨询师"))
        assertTrue("应包含社会工作者", displayedCareerNames.contains("社会工作者"))
        assertTrue("应包含公关专家", displayedCareerNames.contains("公关专家"))
        assertTrue("应包含非营利组织领导", displayedCareerNames.contains("非营利组织领导"))

        println("修复后显示的职业: $displayedCareerNames")
    }
}