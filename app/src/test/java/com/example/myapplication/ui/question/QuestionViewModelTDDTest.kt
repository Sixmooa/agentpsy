package com.example.myapplication.ui.question

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.model.*
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.TestProgressDataStore
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import io.mockk.*
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * QuestionViewModel TDD调试测试
 * 专门针对400错误问题进行全面测试
 */
@ExperimentalCoroutinesApi
class QuestionViewModelTDDTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val repository = mockk<PersonalityTestRepository>()
    private val dataStore = mockk<TestProgressDataStore>()

    private val testDispatcher = StandardTestDispatcher()
    private val testScope = TestScope(testDispatcher)
    private lateinit var viewModel: QuestionViewModel

    private val mockQuestions = listOf(
        Question(id = 1, questionTextZh = "问题1", questionTextEn = "Question1", dimension = "extraversion"),
        Question(id = 2, questionTextZh = "问题2", questionTextEn = "Question2", dimension = "openness"),
        Question(id = 3, questionTextZh = "问题3", questionTextEn = "Question3", dimension = "agreeableness")
    )

    private val mockAnswerOptions = listOf(
        AnswerOption(1, "完全不同意", "Strongly Disagree", 1),
        AnswerOption(2, "不同意", "Disagree", 2),
        AnswerOption(3, "中立", "Neutral", 3),
        AnswerOption(4, "同意", "Agree", 4),
        AnswerOption(5, "完全同意", "Strongly Agree", 5)
    )

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)

        // 设置默认Mock行为
        coEvery { repository.getAnswerOptions("zh") } returns Result.success(mockAnswerOptions)
        coEvery { repository.getAnswerOptions("en") } returns Result.success(mockAnswerOptions)
        coEvery { repository.getRandomQuestions(count = any(), language = "zh") } returns Result.success(mockQuestions)
        coEvery { repository.getRandomQuestions(count = any(), language = "en") } returns Result.success(mockQuestions)
        coEvery { dataStore.getTestProgress } returns flowOf("")
        coEvery { dataStore.saveTestProgress(any()) } returns Unit
        coEvery { dataStore.clearTestProgress() } returns Unit

        viewModel = QuestionViewModel(repository, dataStore)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
        clearAllMocks()
    }

    // ========== 数据完整性测试 ==========

    @Test
    fun `答案数据完整性验证应该过滤无效答案`() = runTest {
        // Given - 模拟一个成功提交的测试报告
        val validTestReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "zh",
            mbtiType = "ENFP",
            bigFiveScores = BigFiveScores(75.0, 68.0, 45.0, 72.0, 35.0),
            careerSuggestions = emptyList()
        )

        coEvery {
            repository.submitTest(
                answers = match { answers ->
                    // 验证只有有效答案被提交
                    answers.all { answer ->
                        answer.questionId > 0 && answer.answerScore in 1..5
                    }
                },
                language = "zh",
                saveResult = false
            )
        } returns Result.success(validTestReport)

        // 等待初始化完成
        testScope.advanceUntilIdle()

        // 模拟选择一些答案（通过反射直接操作内部状态）
        val userAnswersField = QuestionViewModel::class.java.getDeclaredField("_userAnswers")
        userAnswersField.isAccessible = true
        @Suppress("UNCHECKED_CAST")
        val userAnswers = userAnswersField.get(viewModel) as MutableList<SubmitAnswerRequest>

        // 添加包含无效数据的答案列表
        userAnswers.addAll(listOf(
            SubmitAnswerRequest(1, 4),    // 有效
            SubmitAnswerRequest(0, 3),    // 无效ID
            SubmitAnswerRequest(2, 0),    // 无效分数
            SubmitAnswerRequest(3, 6),    // 无效分数
            SubmitAnswerRequest(-1, 2),   // 无效ID
            SubmitAnswerRequest(4, 3)     // 有效
        ))

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证提交成功（无效答案被过滤）
        val state = viewModel.uiState.value
        assertTrue("测试应该成功完成", state.testCompleted)
        assertNotNull("应该有测试报告", state.testReport)
        assertNull("不应该有错误", state.error)
    }

    @Test
    fun `提交空答案列表应该显示错误消息`() = runTest {
        // When - 直接提交测试（没有答案）
        viewModel.submitTest()

        // Then - 验证错误消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示回答题目",
            state.error?.contains("请至少回答一道题目") == true)
        assertFalse("测试不应该完成", state.testCompleted)
        assertNull("不应该有测试报告", state.testReport)
    }

    @Test
    fun `全部答案无效应该显示错误消息`() = runTest {
        // Given - 模拟只有无效答案的情况
        val userAnswersField = QuestionViewModel::class.java.getDeclaredField("_userAnswers")
        userAnswersField.isAccessible = true
        @Suppress("UNCHECKED_CAST")
        val userAnswers = userAnswersField.get(viewModel) as MutableList<SubmitAnswerRequest>

        // 添加全部无效的答案
        userAnswers.addAll(listOf(
            SubmitAnswerRequest(0, 3),    // 无效ID
            SubmitAnswerRequest(-1, 2),   // 无效ID
        ))

        // When - 提交测试
        viewModel.submitTest()

        // Then - 验证错误消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示没有有效答案",
            state.error?.contains("没有有效的答案数据") == true)
    }

    // ========== 400错误处理测试 ==========

    @Test
    fun `400错误应该显示特定的友好错误消息`() = runTest {
        // Given - 模拟400错误
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.failure(Exception("HTTP 400 Bad Request"))

        // 等待初始化并选择答案
        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2]) // 选择中立答案

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证400错误特定消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该包含请求格式错误提示",
            state.error?.contains("请求格式错误") == true)
        assertTrue("错误消息应该包含已回答题目数量",
            state.error?.contains("已回答1道题") == true)
        assertTrue("错误消息应该建议检查网络连接",
            state.error?.contains("请检查网络连接后重试") == true)
    }

    @Test
    fun `JSON错误应该显示特定错误消息`() = runTest {
        // Given - 模拟JSON解析错误
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.failure(Exception("JSON parsing error"))

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证JSON错误特定消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示服务器数据格式错误",
            state.error?.contains("服务器返回数据格式错误") == true)
    }

    @Test
    fun `网络超时错误应该显示特定错误消息`() = runTest {
        // Given - 模拟超时错误
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.failure(Exception("Request timeout"))

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证超时错误特定消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示网络超时",
            state.error?.contains("网络超时") == true)
    }

    @Test
    fun `404错误应该显示服务不可用消息`() = runTest {
        // Given - 模拟404错误
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.failure(Exception("HTTP 404 Not Found"))

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证404错误特定消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示服务不可用",
            state.error?.contains("服务不可用") == true)
    }

    @Test
    fun `500错误应该显示服务器内部错误消息`() = runTest {
        // Given - 模拟500错误
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.failure(Exception("HTTP 500 Internal Server Error"))

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证500错误特定消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示服务器内部错误",
            state.error?.contains("服务器内部错误") == true)
    }

    @Test
    fun `认证错误应该显示重启应用提示`() = runTest {
        // Given - 模拟401/403错误
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.failure(Exception("HTTP 401 Unauthorized"))

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证认证错误特定消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示服务认证失败",
            state.error?.contains("服务认证失败") == true)
        assertTrue("错误消息应该建议重启应用",
            state.error?.contains("请重新启动应用") == true)
    }

    @Test
    fun `网络连接错误应该显示网络设置提示`() = runTest {
        // Given - 模拟网络连接错误
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.failure(Exception("Network connection failed"))

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证网络连接错误特定消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示网络连接失败",
            state.error?.contains("网络连接失败") == true)
        assertTrue("错误消息应该建议检查网络设置",
            state.error?.contains("请检查网络设置") == true)
    }

    @Test
    fun `通用错误应该显示详细错误信息`() = runTest {
        // Given - 模拟通用错误
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.failure(Exception("Some unknown error occurred"))

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证通用错误消息
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该包含提交失败信息",
            state.error?.contains("提交测试失败") == true)
        assertTrue("错误消息应该包含原始错误信息",
            state.error?.contains("Some unknown error occurred") == true)
    }

    // ========== 序列化异常处理测试 ==========

    @Test
    fun `序列化异常应该显示数据格式错误`() = runTest {
        // Given - 通过反射模拟序列化异常
        // 这里我们通过抛出一个包含"serialization"的异常来模拟
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } throws RuntimeException("serialization failed")

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证序列化异常处理
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示数据序列化错误",
            state.error?.contains("数据序列化错误") == true)
        assertTrue("错误消息应该建议重新完成测试",
            state.error?.contains("请重新完成测试") == true)
    }

    @Test
    fun `JSON异常应该显示数据格式错误`() = runTest {
        // Given - 模拟JSON相关异常
        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } throws RuntimeException("JSON parsing exception")

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证JSON异常处理
        val state = viewModel.uiState.value
        assertNotNull("应该有错误消息", state.error)
        assertTrue("错误消息应该提示数据格式错误",
            state.error?.contains("数据格式错误") == true)
    }

    // ========== 进度保存和恢复测试 ==========

    @Test
    fun `选择答案后应该自动保存进度`() = runTest {
        // Given - 等待初始化完成
        testScope.advanceUntilIdle()

        // When - 选择答案
        viewModel.selectAnswer(mockAnswerOptions[2])
        testScope.advanceUntilIdle()

        // Then - 验证进度保存被调用
        coVerify(atLeast = 1) { dataStore.saveTestProgress(any()) }
    }

    @Test
    fun `提交成功后应该清除保存的进度`() = runTest {
        // Given - 准备成功的测试报告
        val validTestReport = TestReport(
            timestamp = "2024-01-01T12:00:00Z",
            language = "zh",
            mbtiType = "ENFP",
            bigFiveScores = BigFiveScores(75.0, 68.0, 45.0, 72.0, 35.0),
            careerSuggestions = emptyList()
        )

        coEvery {
            repository.submitTest(
                answers = any(),
                language = "zh",
                saveResult = false
            )
        } returns Result.success(validTestReport)

        testScope.advanceUntilIdle()
        viewModel.selectAnswer(mockAnswerOptions[2])

        // When - 提交测试
        viewModel.submitTest()
        testScope.advanceUntilIdle()

        // Then - 验证进度被清除
        coVerify { dataStore.clearTestProgress() }
    }

    @Test
    fun `恢复保存的进度应该正确设置状态`() = runTest {
        // Given - 准备保存的进度数据
        val savedProgress = TestProgress(
            questions = mockQuestions,
            answerOptions = mockAnswerOptions,
            userAnswers = listOf(
                SubmitAnswerRequest(1, 3),
                SubmitAnswerRequest(2, 4)
            ),
            currentQuestionIndex = 1,
            currentLanguage = "en"
        )
        val progressJson = Json.encodeToString(savedProgress)

        coEvery { dataStore.getTestProgress } returns flowOf(progressJson)

        // When - 重新创建ViewModel
        val newViewModel = QuestionViewModel(repository, dataStore)
        testScope.advanceUntilIdle()

        // Then - 验证进度被正确恢复
        val state = newViewModel.uiState.value
        assertEquals("en", state.currentLanguage)
        assertEquals(1, state.currentQuestionIndex)
        assertEquals(mockQuestions[1], state.currentQuestion)
        assertEquals(2, newViewModel.getUserAnswers().size)
    }

    // ========== 状态管理测试 ==========

    @Test
    fun `clearError应该清除错误状态`() = runTest {
        // Given - 创建一个错误状态
        viewModel.submitTest() // 没有答案会产生错误
        assertNotNull(viewModel.uiState.value.error)

        // When - 清除错误
        viewModel.clearError()

        // Then - 验证错误被清除
        assertNull(viewModel.uiState.value.error)
    }

    @Test
    fun `语言切换应该重新加载所有数据`() = runTest {
        // Given - 等待初始加载完成
        testScope.advanceUntilIdle()
        assertEquals("zh", viewModel.uiState.value.currentLanguage)

        // When - 切换语言
        viewModel.switchLanguage()
        testScope.advanceUntilIdle()

        // Then - 验证语言切换和数据重新加载
        val state = viewModel.uiState.value
        assertEquals("en", state.currentLanguage)
        assertFalse(state.isLoading)
        assertNull(state.error)

        // 验证重新调用了数据加载
        coVerify(atLeast = 1) { repository.getAnswerOptions("en") }
        coVerify(atLeast = 1) { repository.getRandomQuestions(50, "en") }
    }

    // ========== 导航逻辑测试 ==========

    @Test
    fun `导航按钮状态应该根据答题情况正确更新`() = runTest {
        // Given - 等待初始化
        testScope.advanceUntilIdle()

        // 初始状态：第一题，没有答案
        var state = viewModel.uiState.value
        assertFalse("初始状态不能后退", state.canNavigatePrevious)
        assertFalse("没有答案不能前进", state.canNavigateNext)
        assertFalse("不是最后一题不显示提交按钮", state.shouldShowSubmitButton)
        assertFalse("没有答案按钮不可用", state.isPrimaryButtonEnabled)

        // When - 选择答案
        viewModel.selectAnswer(mockAnswerOptions[2])

        // Then - 验证按钮状态更新
        state = viewModel.uiState.value
        assertFalse("第一题仍不能后退", state.canNavigatePrevious)
        assertTrue("有答案可以前进", state.canNavigateNext)
        assertFalse("不是最后一题不显示提交按钮", state.shouldShowSubmitButton)
        assertTrue("有答案按钮可用", state.isPrimaryButtonEnabled)
    }

    @Test
    fun `最后一题应该显示提交按钮`() = runTest {
        // Given - 准备只有一道题的情况
        val singleQuestion = listOf(mockQuestions[0])
        coEvery { repository.getRandomQuestions(count = any(), language = "zh") } returns Result.success(singleQuestion)

        // 重新创建ViewModel
        viewModel = QuestionViewModel(repository, dataStore)
        testScope.advanceUntilIdle()

        // When - 选择答案
        viewModel.selectAnswer(mockAnswerOptions[2])

        // Then - 验证最后一题状态
        val state = viewModel.uiState.value
        assertTrue("最后一题应该显示提交按钮", state.shouldShowSubmitButton)
        assertTrue("有答案提交按钮应该可用", state.isPrimaryButtonEnabled)
    }
}