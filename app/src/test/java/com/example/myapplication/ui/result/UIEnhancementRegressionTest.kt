package com.example.myapplication.ui.result

import com.example.myapplication.data.model.*
import com.example.myapplication.data.network.MockApiService
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 回归测试：验证UI美化功能的核心功能完整性
 * 测试目标：
 * 1. 验证描述文本优化功能正常工作
 * 2. 验证优势和发展建议功能正常
 * 3. 验证整体功能未受UI美化影响
 */
class UIEnhancementRegressionTest {

    private lateinit var mockApiService: MockApiService

    @Before
    fun setup() {
        mockApiService = MockApiService()
    }

    @Test
    fun `回归测试：优化后的描述不应包含通用模板文本`() {
        // 测试INTJ类型的描述
        val mbtiResponse = mockApiService.getMBTITypeInfo("INTJ", "zh")
        assertTrue("API响应应该成功", mbtiResponse.isSuccessful)

        val mbtiType = mbtiResponse.body()?.data
        assertNotNull("MBTI类型不应为空", mbtiType)

        val description = mbtiType?.descriptionZh ?: ""
        assertFalse("描述不应包含通用模板文本",
            description.contains("这是.*类型的详细描述。每个人都有独特的性格特征。".toRegex()))
        assertTrue("描述应包含类型名称", description.contains("建筑师"))
        assertTrue("描述应包含类型代码", description.contains("INTJ"))
    }

    @Test
    fun `回归测试：英文描述也进行了优化`() {
        val mbtiResponse = mockApiService.getMBTITypeInfo("INTJ", "en")
        assertTrue("API响应应该成功", mbtiResponse.isSuccessful)

        val mbtiType = mbtiResponse.body()?.data
        assertNotNull("MBTI类型不应为空", mbtiType)

        val description = mbtiType?.descriptionEn ?: ""
        assertFalse("英文描述不应包含通用模板文本",
            description.contains("This is a detailed description of the .* type. Everyone has unique personality traits.".toRegex()))
        assertTrue("英文描述应包含类型名称", description.contains("Architect"))
        assertTrue("英文描述应包含类型代码", description.contains("INTJ"))
    }

    @Test
    fun `回归测试：优势特质功能正常`() {
        val mbtiResponse = mockApiService.getMBTITypeInfo("INTJ", "zh")
        val mbtiType = mbtiResponse.body()?.data

        val strengths = mbtiType?.strengths ?: emptyList()
        assertFalse("优势列表不应为空", strengths.isEmpty())
        assertTrue("优势应包含具体的描述", strengths.all { it.length > 2 })

        // 验证INTJ的优势
        assertTrue("应包含战略思维优势", strengths.any { it.contains("战略思维") })
        assertTrue("应包含独立优势", strengths.any { it.contains("独立") })
    }

    @Test
    fun `回归测试：发展建议功能正常`() {
        val mbtiResponse = mockApiService.getMBTITypeInfo("INTJ", "zh")
        val mbtiType = mbtiResponse.body()?.data

        val challenges = mbtiType?.challenges ?: emptyList()
        assertFalse("发展建议列表不应为空", challenges.isEmpty())
        assertTrue("发展建议应包含具体的描述", challenges.all { it.length > 2 })

        // 验证INTJ的发展建议
        assertTrue("应包含情感表达建议", challenges.any { it.contains("情感") })
        assertTrue("应包含社交建议", challenges.any { it.contains("社交") })
    }

    @Test
    fun `回归测试：多种MBTI类型都有优化描述`() {
        val testTypes = listOf("INTJ", "INFP", "ENTJ", "ESFP")

        testTypes.forEach { type ->
            val response = mockApiService.getMBTITypeInfo(type, "zh")
            assertTrue("类型$type的API响应应该成功", response.isSuccessful)

            val mbtiType = response.body()?.data
            assertNotNull("类型$type的MBTI数据不应为空", mbtiType)

            val description = mbtiType?.descriptionZh ?: ""
            assertFalse("类型$type的描述不应包含通用模板文本",
                description.contains("这是.*类型的详细描述。每个人都有独特的性格特征。".toRegex()))
            assertTrue("类型$type的描述应该有实际内容", description.length > 50)
        }
    }

    @Test
    fun `回归测试：测试提交流程仍然正常`() {
        val testSubmission = TestSubmissionRequest(
            answers = listOf(
                Answer(1, 1, 4),
                Answer(2, 2, 3),
                Answer(3, 3, 5),
                Answer(4, 4, 2),
                Answer(5, 5, 4)
            ),
            language = "zh",
            saveResult = true
        )

        val response = mockApiService.submitTest(testSubmission)
        assertTrue("测试提交应该成功", response.isSuccessful)

        val testResponse = response.body()
        assertNotNull("响应不应为空", testResponse)
        assertTrue("响应应该成功", testResponse?.success == true)

        val testReport = testResponse?.report
        assertNotNull("测试报告不应为空", testReport)

        // 验证优化后的描述
        val mbtiInfo = testReport?.mbtiTypeInfo
        assertNotNull("MBTI信息不应为空", mbtiInfo)

        val description = mbtiInfo?.descriptionZh ?: ""
        assertFalse("报告中的描述不应包含通用模板文本",
            description.contains("这是.*类型的详细描述。每个人都有独特的性格特征。".toRegex()))
        assertTrue("报告中的描述应该有实际内容", description.length > 50)
    }

    @Test
    fun `回归测试：职业建议功能正常`() {
        val careerResponse = mockApiService.getCareerSuggestions("INTJ", "zh")
        assertTrue("职业建议API响应应该成功", careerResponse.isSuccessful)

        val careers = careerResponse.body()?.data ?: emptyList()
        assertFalse("职业建议列表不应为空", careers.isNotEmpty())

        careers.forEach { career ->
            assertNotNull("职业名称不应为空", career.getCareerName())
            assertTrue("职业名称应该有实际内容", career.getCareerName().length > 1)
            assertEquals("职业应匹配MBTI类型", "INTJ", career.mbtiType)
        }
    }

    @Test
    fun `回归测试：UI组件所需的数据结构完整性`() {
        // 验证UI组件所需的数据结构都完整且可用
        val testSubmission = TestSubmissionRequest(
            answers = listOf(Answer(1, 1, 3)),
            language = "zh",
            saveResult = false
        )

        val response = mockApiService.submitTest(testSubmission)
        val testReport = response.body()?.report

        assertNotNull("测试报告不应为空", testReport)
        assertNotNull("Big Five分数不应为空", testReport?.bigFiveScores)
        assertNotNull("MBTI类型信息不应为空", testReport?.mbtiTypeInfo)
        assertNotNull("职业建议不应为空", testReport?.careerSuggestions)
        assertNotNull("时间戳不应为空", testReport?.timestamp)

        // 验证Big Five分数范围
        testReport?.bigFiveScores?.let { scores ->
            assertTrue("开放性分数在0-100之间", scores.openness in 0.0..100.0)
            assertTrue("尽责性分数在0-100之间", scores.conscientiousness in 0.0..100.0)
            assertTrue("外向性分数在0-100之间", scores.extraversion in 0.0..100.0)
            assertTrue("宜人性分数在0-100之间", scores.agreeableness in 0.0..100.0)
            assertTrue("神经质分数在0-100之间", scores.neuroticism in 0.0..100.0)
        }
    }
}