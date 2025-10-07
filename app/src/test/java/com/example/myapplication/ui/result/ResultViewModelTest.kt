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
 * ResultViewModel 单元测试
 * 测试结果展示、分享功能和状态管理
 */
@ExperimentalCoroutinesApi
class ResultViewModelTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private lateinit var viewModel: ResultViewModel
    private val testDispatcher = UnconfinedTestDispatcher()

    private val mockTestReport = TestReport(
        timestamp = "2024-01-01T12:00:00Z",
        language = "zh",
        mbtiType = "INTJ",
        bigFiveScores = BigFiveScores(
            openness = 4.2,
            conscientiousness = 3.8,
            extraversion = 2.5,
            agreeableness = 4.0,
            neuroticism = 2.1
        ),
        mbtiTypeInfo = MBTIType(
            id = 1,
            typeCode = "INTJ",
            typeNameZh = "建筑师",
            typeNameEn = "Architect",
            descriptionZh = "富有想象力和战略性的思想家，有着自己独特的观点",
            descriptionEn = "Imaginative and strategic thinkers, with a plan for everything",
            strengths = listOf("分析能力强", "独立思考", "战略规划"),
            challenges = listOf("过于完美主义", "难以表达情感", "不善于团队合作")
        ),
        careerSuggestions = listOf(
            CareerSuggestion(1, "INTJ", "软件工程师", "Software Engineer"),
            CareerSuggestion(2, "INTJ", "数据分析师", "Data Analyst"),
            CareerSuggestion(3, "INTJ", "产品经理", "Product Manager")
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

    @Test
    fun `initial state is correct`() {
        val initialState = viewModel.uiState.value
        
        assertFalse(initialState.isLoading)
        assertNull(initialState.testReport)
        assertNull(initialState.error)
        assertFalse(initialState.shouldRestartTest)
    }

    @Test
    fun `setTestReport updates state correctly`() {
        // Act
        viewModel.setTestReport(mockTestReport)

        // Assert
        val state = viewModel.uiState.value
        assertFalse(state.isLoading)
        assertNotNull(state.testReport)
        assertEquals(mockTestReport, state.testReport)
        assertEquals("INTJ", state.testReport!!.mbtiType)
        assertEquals("建筑师", state.testReport!!.mbtiTypeInfo.typeNameZh)
        assertNull(state.error)
    }

    @Test
    fun `restartTest sets restart flag`() {
        // Arrange
        viewModel.setTestReport(mockTestReport)

        // Act
        viewModel.restartTest()

        // Assert
        val state = viewModel.uiState.value
        assertTrue(state.shouldRestartTest)
        assertNotNull(state.testReport) // 报告应该仍然存在
    }

    @Test
    fun `clearRestartFlag clears restart flag`() {
        // Arrange
        viewModel.setTestReport(mockTestReport)
        viewModel.restartTest()

        // Act
        viewModel.clearRestartFlag()

        // Assert
        val state = viewModel.uiState.value
        assertFalse(state.shouldRestartTest)
    }

    @Test
    fun `shareResult works correctly`() {
        // Arrange
        viewModel.setTestReport(mockTestReport)

        // Act
        viewModel.shareResult()

        // Assert
        // 验证分享功能被调用，这里主要测试方法不会抛出异常
        val state = viewModel.uiState.value
        assertNotNull(state.testReport)
    }

    @Test
    fun `shareResult works with English report`() {
        // Arrange
        val englishTestReport = mockTestReport.copy(language = "en")
        viewModel.setTestReport(englishTestReport)

        // Act
        viewModel.shareResult()

        // Assert
        // 验证分享功能被调用，这里主要测试方法不会抛出异常
        val state = viewModel.uiState.value
        assertNotNull(state.testReport)
        assertEquals("en", state.testReport!!.language)
    }

    @Test
    fun `shareResult handles no test report gracefully`() {
        // Act
        viewModel.shareResult()

        // Assert
        // 验证在没有测试报告时分享功能不会崩溃
        val state = viewModel.uiState.value
        assertNull(state.testReport)
    }

    @Test
    fun `shareResult handles empty strengths and challenges`() {
        // Arrange
        val reportWithEmptyLists = mockTestReport.copy(
            mbtiTypeInfo = mockTestReport.mbtiTypeInfo.copy(
                strengths = emptyList(),
                challenges = emptyList()
            )
        )
        viewModel.setTestReport(reportWithEmptyLists)

        // Act
        viewModel.shareResult()

        // Assert
        // 验证即使优势和挑战为空，分享功能也能正常工作
        val state = viewModel.uiState.value
        assertNotNull(state.testReport)
        assertTrue(state.testReport!!.mbtiTypeInfo.strengths.isEmpty())
        assertTrue(state.testReport!!.mbtiTypeInfo.challenges.isEmpty())
    }

    @Test
    fun `shareResult handles empty career suggestions`() {
        // Arrange
        val reportWithEmptyCareers = mockTestReport.copy(
            careerSuggestions = emptyList()
        )
        viewModel.setTestReport(reportWithEmptyCareers)

        // Act
        viewModel.shareResult()

        // Assert
        // 验证即使职业建议为空，分享功能也能正常工作
        val state = viewModel.uiState.value
        assertNotNull(state.testReport)
        assertTrue(state.testReport!!.careerSuggestions.isEmpty())
    }

    @Test
    fun `multiple setTestReport calls update state correctly`() {
        // Arrange
        val firstReport = mockTestReport
        val secondReport = mockTestReport.copy(
            mbtiType = "ENFP",
            mbtiTypeInfo = mockTestReport.mbtiTypeInfo.copy(
                typeCode = "ENFP",
                typeNameZh = "竞选者"
            )
        )

        // Act
        viewModel.setTestReport(firstReport)
        val firstState = viewModel.uiState.value

        viewModel.setTestReport(secondReport)
        val secondState = viewModel.uiState.value

        // Assert
        assertEquals("INTJ", firstState.testReport!!.mbtiType)
        assertEquals("ENFP", secondState.testReport!!.mbtiType)
        assertEquals("竞选者", secondState.testReport!!.mbtiTypeInfo.typeNameZh)
    }

    @Test
    fun `state management flow works correctly`() {
        // 测试完整的状态管理流程
        
        // 1. 初始状态
        var state = viewModel.uiState.value
        assertFalse(state.shouldRestartTest)
        assertNull(state.testReport)

        // 2. 设置测试报告
        viewModel.setTestReport(mockTestReport)
        state = viewModel.uiState.value
        assertNotNull(state.testReport)
        assertFalse(state.shouldRestartTest)

        // 3. 触发重新开始
        viewModel.restartTest()
        state = viewModel.uiState.value
        assertTrue(state.shouldRestartTest)
        assertNotNull(state.testReport) // 报告仍然存在

        // 4. 清除重新开始标志
        viewModel.clearRestartFlag()
        state = viewModel.uiState.value
        assertFalse(state.shouldRestartTest)
        assertNotNull(state.testReport) // 报告仍然存在
    }
}