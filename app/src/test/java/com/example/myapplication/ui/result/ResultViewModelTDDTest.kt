package com.example.myapplication.ui.result

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.model.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*

/**
 * ResultViewModel TDD调试测试
 * 专门针对结果展示中的数据处理和错误处理进行测试
 */
@ExperimentalCoroutinesApi
class ResultViewModelTDDTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private lateinit var viewModel: ResultViewModel
    private val testDispatcher = StandardTestDispatcher()

    private val mockTestReport = TestReport(
        timestamp = "2024-01-01T12:00:00Z",
        language = "zh",
        mbtiType = "INTJ",
        bigFiveScores = BigFiveScores(
            openness = 75.0,
            conscientiousness = 82.5,
            extraversion = 45.0,
            agreeableness = 68.0,
            neuroticism = 32.0
        ),
        mbtiTypeInfo = MBTIType(
            id = 1,
            typeCode = "INTJ",
            typeNameZh = "建筑师",
            typeNameEn = "Architect",
            descriptionZh = "富有想象力和战略性的思想家，有着自己独特的观点",
            descriptionEn = "Imaginative and strategic thinkers, with a plan for everything",
            strengths = listOf("分析能力强", "独立思考", "战略规划", "创新思维"),
            challenges = listOf("过于完美主义", "难以表达情感", "不善于团队合作", "对他人要求过高")
        ),
        careerSuggestions = listOf(
            CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"),
            CareerSuggestion(2, "INTJ", "数据分析师", "Data Analyst"),
            CareerSuggestion(3, "INTJ", "产品经理", "Product Manager"),
            CareerSuggestion(4, "INTJ", "系统架构师", "System Architect")
        )
    )

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        viewModel = ResultViewModel()
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    // ========== 数据完整性测试 ==========

    @Test
    fun `设置完整的测试报告应该正确更新所有字段`() = runTest {
        // When - 设置完整的测试报告
        viewModel.setTestReport(mockTestReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证所有字段都正确设置
        val state = viewModel.uiState.value
        assertFalse("应该不处于加载状态", state.isLoading)
        assertNotNull("应该有测试报告", state.testReport)
        assertNull("不应该有错误", state.error)

        val report = state.testReport!!
        assertEquals("MBTI类型应该正确", "INTJ", report.mbtiType)
        assertEquals("时间戳应该正确", "2024-01-01T12:00:00Z", report.timestamp)
        assertEquals("语言应该正确", "zh", report.language)

        // 验证Big Five得分
        val bigFive = report.bigFiveScores
        assertEquals("开放性得分", 75.0, bigFive.openness, 0.01)
        assertEquals("尽责性得分", 82.5, bigFive.conscientiousness, 0.01)
        assertEquals("外向性得分", 45.0, bigFive.extraversion, 0.01)
        assertEquals("宜人性得分", 68.0, bigFive.agreeableness, 0.01)
        assertEquals("神经质得分", 32.0, bigFive.neuroticism, 0.01)

        // 验证MBTI类型信息
        val mbtiInfo = report.mbtiTypeInfo
        assertEquals("类型代码", "INTJ", mbtiInfo.typeCode)
        assertEquals("中文名称", "建筑师", mbtiInfo.typeNameZh)
        assertEquals("英文名称", "Architect", mbtiInfo.typeNameEn)
        assertEquals("中文描述", "富有想象力和战略性的思想家，有着自己独特的观点", mbtiInfo.descriptionZh)
        assertEquals("优势数量", 4, mbtiInfo.strengths?.size)
        assertEquals("挑战数量", 4, mbtiInfo.challenges?.size)

        // 验证职业建议
        assertEquals("职业建议数量", 4, report.careerSuggestions.size)
        assertEquals("第一个职业", "软件工程师", report.careerSuggestions[0].getCareerName("zh"))
        assertEquals("最后一个职业", "系统架构师", report.careerSuggestions[3].getCareerName("zh"))
    }

    @Test
    fun `处理空数据的测试报告应该正常工作`() = runTest {
        // Given - 准备包含空数据的测试报告
        val emptyReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "en",
            mbtiType = "UNKNOWN",
            bigFiveScores = BigFiveScores(0.0, 0.0, 0.0, 0.0, 0.0),
            mbtiTypeInfo = MBTIType(
                id = 0,
                typeCode = "",
                typeNameZh = "",
                typeNameEn = "",
                descriptionZh = "",
                descriptionEn = "",
                strengths = emptyList(),
                challenges = emptyList()
            ),
            careerSuggestions = emptyList()
        )

        // When - 设置空数据报告
        viewModel.setTestReport(emptyReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证空数据被正确处理
        val state = viewModel.uiState.value
        assertNotNull("应该有测试报告", state.testReport)
        val report = state.testReport!!

        assertEquals("MBTI类型应该是空字符串", "", report.mbtiTypeInfo.typeCode)
        assertEquals("中文名称应该为空", "", report.mbtiTypeInfo.typeNameZh)
        assertEquals("优势列表应该为空", 0, report.mbtiTypeInfo.strengths?.size)
        assertEquals("挑战列表应该为空", 0, report.mbtiTypeInfo.challenges?.size)
        assertEquals("职业建议列表应该为空", 0, report.careerSuggestions.size)
    }

    @Test
    fun `处理null字段的测试报告应该使用默认值`() = runTest {
        // Given - 准备包含null字段的测试报告
        val nullReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "zh",
            mbtiType = "ENFP",
            bigFiveScores = BigFiveScores(50.0, 60.0, 70.0, 80.0, 90.0),
            mbtiTypeInfo = MBTIType(
                id = 1,
                typeCode = "ENFP",
                typeNameZh = null,
                typeNameEn = null,
                descriptionZh = null,
                descriptionEn = null,
                strengths = null,
                challenges = null
            ),
            careerSuggestions = listOf(
                CareerSuggestion(1, "ENFP", null, null)
            )
        )

        // When - 设置包含null的报告
        viewModel.setTestReport(nullReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证null字段被正确处理
        val state = viewModel.uiState.value
        assertNotNull("应该有测试报告", state.testReport)
        val report = state.testReport!!

        // 验证getMBTITypeInfo方法能够处理null值并提供默认值
        val fallbackMBTI = report.getMBTITypeInfo()
        assertNotNull("应该有fallback MBTI信息", fallbackMBTI)
        assertEquals("fallback类型代码应该正确", "ENFP", fallbackMBTI.typeCode)
        assertEquals("fallback类型名称应该不为空", "ENFP", fallbackMBTI.getTypeName())

        // 验证职业建议的null处理
        val career = report.careerSuggestions[0]
        assertEquals("null职业应该返回fallback值", "未知职业", career.getCareerName("zh"))
    }

    // ========== 分数计算测试 ==========

    @Test
    fun `Big Five分数计算应该正确`() = runTest {
        // When - 设置测试报告
        viewModel.setTestReport(mockTestReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证分数计算工具方法
        val state = viewModel.uiState.value
        val bigFive = state.testReport!!.bigFiveScores

        // 测试格式化分数
        assertEquals("开放性格式化分数", "75.0%", bigFive.getFormattedScore("开放性"))
        assertEquals("尽责性格式化分数", "82.5%", bigFive.getFormattedScore("conscientiousness"))
        assertEquals("神经质格式化分数", "32.0%", bigFive.getFormattedScore("神经质"))

        // 测试平均分计算
        val expectedAverage = (75.0 + 82.5 + 45.0 + 68.0 + 32.0) / 5.0
        assertEquals("平均分计算", expectedAverage, bigFive.getAverageScore(), 0.01)

        // 测试最高分维度
        val highest = bigFive.getHighestDimension()
        assertEquals("最高分维度", "尽责性", highest.first)
        assertEquals("最高分值", 82.5, highest.second, 0.01)

        // 测试最低分维度
        val lowest = bigFive.getLowestDimension()
        assertEquals("最低分维度", "神经质", lowest.first)
        assertEquals("最低分值", 32.0, lowest.second, 0.01)

        // 测试未知维度处理
        assertEquals("未知维度处理", "0.0%", bigFive.getFormattedScore("未知维度"))
        assertEquals("未知维度分数", 0.0, bigFive.getScore("未知"), 0.01)
    }

    @Test
    fun `边界值分数应该正确处理`() = runTest {
        // Given - 准备边界值的测试报告
        val boundaryReport = mockTestReport.copy(
            bigFiveScores = BigFiveScores(0.0, 100.0, 50.0, 99.9, 0.1)
        )

        // When - 设置边界值报告
        viewModel.setTestReport(boundaryReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证边界值处理
        val state = viewModel.uiState.value
        val bigFive = state.testReport!!.bigFiveScores

        assertEquals("最低值0.0%", "0.0%", bigFive.getFormattedScore("开放性"))
        assertEquals("最高值100.0%", "100.0%", bigFive.getFormattedScore("尽责性"))
        assertEquals("中间值50.0%", "50.0%", bigFive.getFormattedScore("外向性"))
        assertEquals("接近最高值99.9%", "99.9%", bigFive.getFormattedScore("宜人性"))
        assertEquals("接近最低值0.1%", "0.1%", bigFive.getFormattedScore("神经质"))
    }

    // ========== 语言处理测试 ==========

    @Test
    fun `中文测试报告应该正确显示中文内容`() = runTest {
        // When - 设置中文测试报告
        viewModel.setTestReport(mockTestReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证中文内容显示
        val state = viewModel.uiState.value
        val report = state.testReport!!

        assertEquals("报告语言应该是中文", "zh", report.language)
        assertEquals("MBTI中文名称", "建筑师", report.mbtiTypeInfo.typeNameZh)
        assertEquals("MBTI中文描述", "富有想象力和战略性的思想家，有着自己独特的观点", report.mbtiTypeInfo.descriptionZh)

        // 验证中文优势内容
        val strengths = report.mbtiTypeInfo.strengths!!
        assertEquals("第一个优势", "分析能力强", strengths[0])
        assertEquals("最后一个优势", "创新思维", strengths[3])

        // 验证中文挑战内容
        val challenges = report.mbtiTypeInfo.challenges!!
        assertEquals("第一个挑战", "过于完美主义", challenges[0])
        assertEquals("最后一个挑战", "对他人要求过高", challenges[3])

        // 验证中文职业名称
        val careers = report.careerSuggestions
        assertEquals("第一个职业", "软件工程师", careers[0].getCareerName("zh"))
        assertEquals("最后一个职业", "系统架构师", careers[3].getCareerName("zh"))
    }

    @Test
    fun `英文测试报告应该正确显示英文内容`() = runTest {
        // Given - 准备英文测试报告
        val englishReport = mockTestReport.copy(language = "en")

        // When - 设置英文测试报告
        viewModel.setTestReport(englishReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证英文内容显示
        val state = viewModel.uiState.value
        val report = state.testReport!!

        assertEquals("报告语言应该是英文", "en", report.language)
        assertEquals("MBTI英文名称", "Architect", report.mbtiTypeInfo.typeNameEn)
        assertEquals("MBTI英文描述", "Imaginative and strategic thinkers, with a plan for everything", report.mbtiTypeInfo.descriptionEn)

        // 验证英文职业名称
        val careers = report.careerSuggestions
        assertEquals("第一个英文职业", "Software Engineer", careers[0].getCareerName("en"))
        assertEquals("最后一个英文职业", "System Architect", careers[3].getCareerName("en"))
    }

    // ========== 状态管理测试 ==========

    @Test
    fun `重新开始测试应该设置正确的标志位`() = runTest {
        // Given - 设置测试报告
        viewModel.setTestReport(mockTestReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // 验证初始状态
        var state = viewModel.uiState.value
        assertFalse("初始状态不应该重新开始", state.shouldRestartTest)
        assertNotNull("应该有测试报告", state.testReport)

        // When - 触发重新开始
        viewModel.restartTest()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证重新开始标志
        state = viewModel.uiState.value
        assertTrue("应该设置重新开始标志", state.shouldRestartTest)
        assertNotNull("测试报告应该仍然存在", state.testReport)
        assertEquals("MBTI类型应该保持不变", "INTJ", state.testReport!!.mbtiType)
    }

    @Test
    fun `清除重新开始标志应该恢复正常状态`() = runTest {
        // Given - 设置重新开始状态
        viewModel.setTestReport(mockTestReport)
        testDispatcher.scheduler.advanceUntilIdle()
        viewModel.restartTest()
        testDispatcher.scheduler.advanceUntilIdle()

        // 验证重新开始状态
        var state = viewModel.uiState.value
        assertTrue("应该有重新开始标志", state.shouldRestartTest)

        // When - 清除重新开始标志
        viewModel.clearRestartFlag()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then - 验证标志被清除
        state = viewModel.uiState.value
        assertFalse("重新开始标志应该被清除", state.shouldRestartTest)
        assertNotNull("测试报告应该仍然存在", state.testReport)
    }

    @Test
    fun `多次设置测试报告应该正确更新状态`() = runTest {
        // Given - 准备多个不同的测试报告
        val firstReport = mockTestReport.copy(mbtiType = "INTJ")
        val secondReport = mockTestReport.copy(
            mbtiType = "ENFP",
            mbtiTypeInfo = mockTestReport.mbtiTypeInfo.copy(
                typeCode = "ENFP",
                typeNameZh = "竞选者",
                typeNameEn = "Campaigner"
            )
        )

        // When - 依次设置不同的报告
        viewModel.setTestReport(firstReport)
        testDispatcher.scheduler.advanceUntilIdle()
        val firstState = viewModel.uiState.value

        viewModel.setTestReport(secondReport)
        testDispatcher.scheduler.advanceUntilIdle()
        val secondState = viewModel.uiState.value

        // Then - 验证状态正确更新
        assertEquals("第一个报告MBTI类型", "INTJ", firstState.testReport!!.mbtiType)
        assertEquals("第二个报告MBTI类型", "ENFP", secondState.testReport!!.mbtiType)
        assertEquals("第二个报告中文名称", "竞选者", secondState.testReport!!.mbtiTypeInfo.typeNameZh)
        assertEquals("第二个报告英文名称", "Campaigner", secondState.testReport!!.mbtiTypeInfo.typeNameEn)
    }

    // ========== 分享功能测试 ==========

    @Test
    fun `分享完整测试报告应该包含所有信息`() = runTest {
        // Given - 设置完整的测试报告
        viewModel.setTestReport(mockTestReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // When - 执行分享（注意：实际分享功能会调用Android系统，这里主要测试不抛出异常）
        try {
            viewModel.shareResult()
            testDispatcher.scheduler.advanceUntilIdle()

            // Then - 验证分享过程不会导致状态异常
            val state = viewModel.uiState.value
            assertNotNull("分享后测试报告应该仍然存在", state.testReport)
            assertEquals("MBTI类型应该保持不变", "INTJ", state.testReport!!.mbtiType)
        } catch (e: Exception) {
            fail("分享功能不应该抛出异常: ${e.message}")
        }
    }

    @Test
    fun `分享空数据报告应该优雅处理`() = runTest {
        // Given - 准备空数据的测试报告
        val emptyReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "zh",
            mbtiType = "",
            bigFiveScores = BigFiveScores(0.0, 0.0, 0.0, 0.0, 0.0),
            mbtiTypeInfo = MBTIType(
                id = 0,
                typeCode = "",
                typeNameZh = "",
                typeNameEn = "",
                descriptionZh = "",
                descriptionEn = "",
                strengths = emptyList(),
                challenges = emptyList()
            ),
            careerSuggestions = emptyList()
        )

        viewModel.setTestReport(emptyReport)
        testDispatcher.scheduler.advanceUntilIdle()

        // When - 分享空数据报告
        try {
            viewModel.shareResult()
            testDispatcher.scheduler.advanceUntilIdle()

            // Then - 验证不会出错
            val state = viewModel.uiState.value
            assertNotNull("分享后测试报告应该仍然存在", state.testReport)
        } catch (e: Exception) {
            fail("分享空数据报告不应该抛出异常: ${e.message}")
        }
    }

    @Test
    fun `没有测试报告时分享应该优雅处理`() = runTest {
        // Given - 没有设置测试报告
        val initialState = viewModel.uiState.value
        assertNull("初始状态应该没有测试报告", initialState.testReport)

        // When - 尝试分享
        try {
            viewModel.shareResult()
            testDispatcher.scheduler.advanceUntilIdle()

            // Then - 验证不会出错
            val state = viewModel.uiState.value
            assertNull("分享后仍然应该没有测试报告", state.testReport)
        } catch (e: Exception) {
            fail("没有测试报告时分享不应该抛出异常: ${e.message}")
        }
    }

    // ========== 完整流程测试 ==========

    @Test
    fun `完整的状态管理流程应该正常工作`() = runTest {
        // 1. 初始状态验证
        var state = viewModel.uiState.value
        assertTrue("初始状态应该是加载中", state.isLoading)
        assertNull("初始状态没有测试报告", state.testReport)
        assertNull("初始状态没有错误", state.error)
        assertFalse("初始状态不应该重新开始", state.shouldRestartTest)

        // 2. 设置测试报告
        viewModel.setTestReport(mockTestReport)
        testDispatcher.scheduler.advanceUntilIdle()
        state = viewModel.uiState.value
        assertFalse("设置报告后不应该加载", state.isLoading)
        assertNotNull("应该有测试报告", state.testReport)
        assertEquals("MBTI类型应该正确", "INTJ", state.testReport!!.mbtiType)

        // 3. 执行分享
        viewModel.shareResult()
        testDispatcher.scheduler.advanceUntilIdle()
        state = viewModel.uiState.value
        assertNotNull("分享后测试报告应该仍然存在", state.testReport)

        // 4. 触发重新开始
        viewModel.restartTest()
        testDispatcher.scheduler.advanceUntilIdle()
        state = viewModel.uiState.value
        assertTrue("应该设置重新开始标志", state.shouldRestartTest)
        assertNotNull("重新开始时测试报告应该仍然存在", state.testReport)

        // 5. 清除重新开始标志
        viewModel.clearRestartFlag()
        testDispatcher.scheduler.advanceUntilIdle()
        state = viewModel.uiState.value
        assertFalse("重新开始标志应该被清除", state.shouldRestartTest)
        assertNotNull("测试报告应该仍然存在", state.testReport)

        // 6. 再次分享
        viewModel.shareResult()
        testDispatcher.scheduler.advanceUntilIdle()
        state = viewModel.uiState.value
        assertNotNull("最终状态应该有测试报告", state.testReport)
        assertFalse("最终状态不应该重新开始", state.shouldRestartTest)
        assertNull("最终状态不应该有错误", state.error)
    }
}