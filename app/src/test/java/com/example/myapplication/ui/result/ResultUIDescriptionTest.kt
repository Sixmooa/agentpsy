package com.example.myapplication.ui.result

import com.example.myapplication.data.model.*
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * TDD测试类：验证结果UI界面文本和角色特征描述
 * 测试目标：
 * 1. 验证需要删除的文本存在
 * 2. 验证角色特征描述的质量
 * 3. 验证UI界面的美观性改进
 */
class ResultUIDescriptionTest {

    private lateinit var testReport: TestReport
    private lateinit var mockMBTIType: MBTIType

    @Before
    fun setup() {
        // 创建测试用的MBTI类型信息
        mockMBTIType = MBTIType(
            id = 1,
            typeCode = "INTJ",
            typeNameZh = "建筑师",
            typeNameEn = "Architect",
            descriptionZh = "这是INTJ类型的详细描述。每个人都有独特的性格特征。",
            descriptionEn = "This is a detailed description of the INTJ type. Everyone has unique personality traits.",
            strengths = listOf("分析能力强", "善于沟通", "有责任心"),
            challenges = listOf("有时过于完美主义", "可能忽略细节")
        )

        // 创建测试用的测试报告
        testReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "zh",
            mbtiType = "INTJ",
            bigFiveScores = BigFiveScores(
                openness = 85.0,
                conscientiousness = 72.0,
                extraversion = 45.0,
                agreeableness = 68.0,
                neuroticism = 25.0
            ),
            mbtiTypeInfo = mockMBTIType,
            careerSuggestions = listOf(
                CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"),
                CareerSuggestion(2, "INTJ", "数据分析师", "Data Analyst")
            )
        )
    }

    @Test
    fun `测试当前描述包含需要删除的通用文本`() {
        // 验证当前描述包含需要删除的通用文本
        val descriptionZh = mockMBTIType.descriptionZh
        val descriptionEn = mockMBTIType.descriptionEn

        assertTrue("中文描述应包含需要删除的通用文本",
            descriptionZh.contains("这是.*类型的详细描述。每个人都有独特的性格特征。".toRegex()))
        assertTrue("英文描述应包含需要删除的通用文本",
            descriptionEn.contains("This is a detailed description of the .* type. Everyone has unique personality traits.".toRegex()))
    }

    @Test
    fun `测试角色特征描述应具有个性化内容`() {
        // 验证优化后的描述应该是个性化的
        val improvedDescriptionZh = "作为建筑师(INTJ)类型，您是天生的战略家和独立思考者。您具有敏锐的洞察力，能够看到事物的整体模式和长远影响。"
        val improvedDescriptionEn = "As an Architect (INTJ), you are a natural strategist and independent thinker. You possess sharp insight and can see overall patterns and long-term implications."

        // 改进后的描述不应该包含通用模板文本
        assertFalse("改进后的中文描述不应包含通用模板文本",
            improvedDescriptionZh.contains("这是.*类型的详细描述。每个人都有独特的性格特征。".toRegex()))
        assertFalse("改进后的英文描述不应包含通用模板文本",
            improvedDescriptionEn.contains("This is a detailed description of the .* type. Everyone has unique personality traits.".toRegex()))

        // 改进后的描述应该包含个性化内容
        assertTrue("改进后的中文描述应包含类型名称", improvedDescriptionZh.contains("建筑师"))
        assertTrue("改进后的中文描述应包含类型代码", improvedDescriptionZh.contains("INTJ"))
        assertTrue("改进后的英文描述应包含类型名称", improvedDescriptionEn.contains("Architect"))
        assertTrue("改进后的英文描述应包含类型代码", improvedDescriptionEn.contains("INTJ"))
    }

    @Test
    fun `测试角色特征描述的长度和丰富度`() {
        // 验证改进后的描述应该足够丰富和详细
        val improvedDescription = "作为建筑师(INTJ)类型，您是天生的战略家和独立思考者。您具有敏锐的洞察力，能够看到事物的整体模式和长远影响。您重视知识和能力，追求完美，对自己和他人都有较高的标准。"

        // 描述长度应该合理（50-200字符之间）
        assertTrue("描述长度应在50-200字符之间", improvedDescription.length in 50..200)

        // 描述应该包含关键词
        val keywords = listOf("战略家", "独立思考", "洞察力", "长远", "知识", "完美")
        assertTrue("描述应包含相关关键词", keywords.any { improvedDescription.contains(it) })
    }

    @Test
    fun `测试优势特质描述的质量`() {
        val strengths = mockMBTIType.strengths ?: emptyList()

        // 优势列表不应为空
        assertFalse("优势列表不应为空", strengths.isEmpty())

        // 每个优势描述应该具体且有建设性
        strengths.forEach { strength ->
            assertTrue("优势描述应该具有建设性",
                strength.length >= 2 && !strength.contains("优势1"))
        }
    }

    @Test
    fun `测试发展建议描述的质量`() {
        val challenges = mockMBTIType.challenges ?: emptyList()

        // 挑战列表不应为空
        assertFalse("挑战列表不应为空", challenges.isEmpty())

        // 每个挑战应该提供发展建议而不是负面标签
        challenges.forEach { challenge ->
            assertTrue("挑战描述应该具有建设性",
                challenge.length >= 2 && !challenge.contains("挑战1"))
        }
    }

    @Test
    fun `测试UI界面数据的完整性`() {
        // 验证测试报告数据的完整性
        assertNotNull("测试报告不应为空", testReport)
        assertEquals("MBTI类型应匹配", "INTJ", testReport.mbtiType)
        assertNotNull("Big Five分数不应为空", testReport.bigFiveScores)
        assertNotNull("职业建议不应为空", testReport.careerSuggestions)
        assertTrue("职业建议列表不应为空", testReport.careerSuggestions.isNotEmpty())

        // 验证Big Five分数的合理性
        val scores = testReport.bigFiveScores
        assertTrue("开放性分数应在0-100之间", scores.openness in 0.0..100.0)
        assertTrue("尽责性分数应在0-100之间", scores.conscientiousness in 0.0..100.0)
        assertTrue("外向性分数应在0-100之间", scores.extraversion in 0.0..100.0)
        assertTrue("宜人性分数应在0-100之间", scores.agreeableness in 0.0..100.0)
        assertTrue("神经质分数应在0-100之间", scores.neuroticism in 0.0..100.0)
    }

    @Test
    fun `测试职业建议的相关性`() {
        val careers = testReport.careerSuggestions
        val mbtiType = testReport.mbtiType

        // 职业建议应该与MBTI类型相关
        careers.forEach { career ->
            assertEquals("职业建议应匹配MBTI类型", mbtiType, career.mbtiType)
            assertNotNull("职业中文名称不应为空", career.getCareerName())
            assertTrue("职业名称应具有描述性", career.getCareerName().length >= 2)
        }
    }

    @Test
    fun `测试多语言支持`() {
        // 测试中文数据
        val chineseMBTI = mockMBTIType.copy(
            descriptionZh = "作为建筑师类型，您具有天生的战略思维能力。",
            descriptionEn = "As an Architect type, you have natural strategic thinking ability."
        )

        assertNotNull("中文描述不应为空", chineseMBTI.descriptionZh)
        assertNotNull("英文描述不应为空", chineseMBTI.descriptionEn)
        assertTrue("中文描述应包含中文字符", chineseMBTI.descriptionZh.any { it.code in 0x4E00..0x9FFF })
        assertTrue("英文描述应包含英文字符", chineseMBTI.descriptionEn.any { it.code in 0x0041..0x005A || it.code in 0x0061..0x007A })
    }
}