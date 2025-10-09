package com.example.myapplication.integration

import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.data.network.MockApiService
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.data.repository.PersonalityTestRepositoryImpl
import com.example.myapplication.ui.question.QuestionViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import org.junit.Ignore
import com.example.myapplication.data.network.ApiService
import com.example.myapplication.data.model.*
import retrofit2.Response

/**
 * 性格测试集成测试
 * 验证从数据层到UI层的完整流程
 */
@ExperimentalCoroutinesApi
@Ignore("Integration test - may require specific setup")
class PersonalityTestIntegrationTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var repository: PersonalityTestRepository
    private lateinit var viewModel: QuestionViewModel

    // 测试专用的Repository实现，避免协程调度问题
    private class TestPersonalityTestRepository : PersonalityTestRepository {
        private val apiService = MockApiService()
        
        override suspend fun getRandomQuestions(count: Int, language: String): Result<List<Question>> {
            val response = apiService.getRandomQuestions(count, language)
            return if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception("Failed to get questions"))
            }
        }
        
        override suspend fun getAnswerOptions(language: String): Result<List<AnswerOption>> {
            val response = apiService.getAnswerOptions(language)
            return if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data!!)
            } else {
                Result.failure(Exception("Failed to get answer options"))
            }
        }
        
        override suspend fun submitTest(answers: List<SubmitAnswerRequest>, language: String, saveResult: Boolean): Result<TestReport> {
            val request = TestSubmissionRequest(answers, language, saveResult)
            val response = apiService.submitTest(request)
            return if (response.isSuccessful && response.body()?.success == true) {
                val report = response.body()!!.report
                if (report != null) {
                    Result.success(report)
                } else {
                    Result.failure(Exception("Test report is null"))
                }
            } else {
                Result.failure(Exception("Failed to submit test"))
            }
        }
        
        override suspend fun getMBTITypeInfo(typeCode: String, language: String): Result<MBTIType> {
            val response = apiService.getMBTITypeInfo(typeCode, language)
            return if (response.isSuccessful && response.body()?.success == true) {
                val apiResponse = response.body()!!
                Result.success(apiResponse.data!!)
            } else {
                Result.failure(Exception("Failed to get MBTI type info"))
            }
        }
        
        override suspend fun getCareerSuggestions(mbtiType: String, language: String): Result<List<CareerSuggestion>> {
            val response = apiService.getCareerSuggestions(mbtiType, language)
            return if (response.isSuccessful && response.body()?.success == true) {
                val apiResponse = response.body()!!
                Result.success(apiResponse.data!!)
            } else {
                Result.failure(Exception("Failed to get career suggestions"))
            }
        }
    }

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        
        // 使用测试专用的Repository
        repository = TestPersonalityTestRepository()
        // ViewModel将在每个测试中创建，以确保测试调度器已准备好
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `test complete personality test flow`() = runTest {
        // 在测试中创建ViewModel
        viewModel = QuestionViewModel(repository)
        
        // Step 1: 等待初始数据加载完成
        // MockApiService有延迟：getRandomQuestions(500ms) + getAnswerOptions(300ms)
        testDispatcher.scheduler.advanceTimeBy(1000) // 等待足够的时间
        testDispatcher.scheduler.runCurrent()

        // 验证初始数据加载成功
        val initialState = viewModel.uiState.value
        assertFalse("加载状态应为false", initialState.isLoading)
        assertNull("错误信息应为空", initialState.error)
        assertTrue("答案选项应已加载", initialState.answerOptions.isNotEmpty())
        assertNotNull("当前题目应已加载", initialState.currentQuestion)
        assertEquals("当前题目索引应为0", 0, initialState.currentQuestionIndex)

        // Step 2: 获取题目和选项数量
        val answerOptions = initialState.answerOptions
        val currentQuestion = initialState.currentQuestion!!
        
        assertTrue("应该有答案选项", answerOptions.isNotEmpty())

        // Step 3: 回答当前题目
        val selectedOption = answerOptions[0] // 选择第一个选项
        viewModel.selectAnswer(selectedOption)
        
        // 验证答案已选择
        val afterAnswerState = viewModel.uiState.value
        assertEquals("答案应已选择", selectedOption, afterAnswerState.selectedAnswer)
        assertTrue("选择答案后应该可以导航", afterAnswerState.canNavigateNext)

        // Step 4: 导航到下一题（这会触发新题目加载）
        viewModel.nextQuestion()
        // 等待新题目加载（getRandomQuestions有500ms延迟）
        testDispatcher.scheduler.advanceTimeBy(600)
        testDispatcher.scheduler.runCurrent()

        // 验证导航成功
        val nextQuestionState = viewModel.uiState.value
        assertFalse("加载状态应为false", nextQuestionState.isLoading)
        assertEquals("题目索引应增加", 1, nextQuestionState.currentQuestionIndex)
        assertNotNull("应该有新的当前题目", nextQuestionState.currentQuestion)

        // Step 5: 回答更多题目以达到提交条件
        repeat(8) { // 回答足够多的题目
            val state = viewModel.uiState.value
            if (state.currentQuestion != null && state.answerOptions.isNotEmpty()) {
                val option = state.answerOptions[0]
                viewModel.selectAnswer(option)
                viewModel.nextQuestion()
                // 等待每次新题目加载
                testDispatcher.scheduler.advanceTimeBy(600)
                testDispatcher.scheduler.runCurrent()
            }
        }

        // Step 6: 提交测试
        viewModel.submitTest()
        // 等待提交完成（submitTest有800ms延迟，getMBTITypeInfo有400ms，getCareerSuggestions有600ms）
        testDispatcher.scheduler.advanceTimeBy(2000)
        testDispatcher.scheduler.runCurrent()

        // 验证提交结果
        val finalState = viewModel.uiState.value
        assertFalse("提交后加载状态应为false", finalState.isLoading)
        assertTrue("测试应已完成", finalState.testCompleted)
        assertNotNull("应该有测试报告", finalState.testReport)

        // Step 7: 验证测试报告内容
        val report = finalState.testReport!!
        assertEquals("MBTI类型应为4个字符", 4, report.mbtiType.length)
        assertTrue("MBTI类型应包含有效字符", 
            report.mbtiType.all { it in "EISTNJFP" })
        assertNotNull("大五人格得分不应为空", report.bigFiveScores)
        assertNotNull("MBTI类型信息不应为空", report.mbtiTypeInfo)
        assertTrue("职业建议不应为空", report.careerSuggestions.isNotEmpty())
        assertNotNull("时间戳不应为空", report.timestamp)
    }

    @Test
    fun `test question navigation flow`() = runTest {
        // 在测试中创建ViewModel
        viewModel = QuestionViewModel(repository)
        
        // Given: 等待初始数据加载完成
        testDispatcher.scheduler.advanceTimeBy(1000)
        testDispatcher.scheduler.runCurrent()

        // 验证初始状态
        val initialState = viewModel.uiState.value
        assertEquals("当前题目索引应为0", 0, initialState.currentQuestionIndex)
        assertNotNull("应该有当前题目", initialState.currentQuestion)
        
        // 选择答案并导航到下一题
        if (initialState.answerOptions.isNotEmpty()) {
            viewModel.selectAnswer(initialState.answerOptions[0])
            assertTrue("选择答案后应该可以导航", viewModel.uiState.value.canNavigateNext)
            
            // 导航到下一题
            viewModel.nextQuestion()
            // 等待新题目加载
            testDispatcher.scheduler.advanceTimeBy(600)
            testDispatcher.scheduler.runCurrent()
            
            val nextState = viewModel.uiState.value
            assertEquals("应该导航到下一题", 1, nextState.currentQuestionIndex)
            assertNotNull("应该有新的当前题目", nextState.currentQuestion)
        }
        
        // 测试后退导航
        if (viewModel.uiState.value.canNavigatePrevious) {
            viewModel.previousQuestion()
            val previousState = viewModel.uiState.value
            assertEquals("应该回到上一题", 0, previousState.currentQuestionIndex)
        }
    }

    @Test
    fun `test answer persistence and modification`() = runTest {
        // 在测试中创建ViewModel
        viewModel = QuestionViewModel(repository)
        
        // Given: 等待初始数据加载完成
        testDispatcher.scheduler.advanceTimeBy(1000)
        testDispatcher.scheduler.runCurrent()

        val initialState = viewModel.uiState.value
        val answerOptions = initialState.answerOptions
        
        assertTrue("应该有答案选项", answerOptions.isNotEmpty())
        assertNotNull("应该有当前题目", initialState.currentQuestion)
        
        // Test answer selection and modification
        val firstOption = answerOptions[0]
        val secondOption = answerOptions[1]

        // Select first answer
        viewModel.selectAnswer(firstOption)
        val afterFirstSelection = viewModel.uiState.value
        assertEquals("第一个答案应已选择", firstOption, afterFirstSelection.selectedAnswer)
        assertTrue("选择答案后应该可以导航", afterFirstSelection.canNavigateNext)

        // Modify answer
        viewModel.selectAnswer(secondOption)
        val afterSecondSelection = viewModel.uiState.value
        assertEquals("答案应已修改", secondOption, afterSecondSelection.selectedAnswer)
        assertTrue("修改答案后仍应该可以导航", afterSecondSelection.canNavigateNext)
    }

    @Test
    fun `test answer selection flow`() = runTest {
        // 在测试中创建ViewModel
        viewModel = QuestionViewModel(repository)
        
        // Given: 等待初始数据加载完成
        testDispatcher.scheduler.advanceTimeBy(1000)
        testDispatcher.scheduler.runCurrent()

        val initialState = viewModel.uiState.value
        val answerOptions = initialState.answerOptions
        
        assertTrue("应该有答案选项", answerOptions.isNotEmpty())
        assertNotNull("应该有当前题目", initialState.currentQuestion)
        
        // Test answer selection
        val selectedOption = answerOptions[0]
        viewModel.selectAnswer(selectedOption)
        
        val afterSelection = viewModel.uiState.value
        assertEquals("答案应已选择", selectedOption, afterSelection.selectedAnswer)
        assertTrue("选择答案后应该可以导航", afterSelection.canNavigateNext)
        
        // Test navigation after answer selection
        viewModel.nextQuestion()
        // 等待新题目加载
        testDispatcher.scheduler.advanceTimeBy(600)
        testDispatcher.scheduler.runCurrent()
        
        val afterNavigation = viewModel.uiState.value
        assertEquals("应该导航到下一题", 1, afterNavigation.currentQuestionIndex)
        assertNull("新题目的答案应为空", afterNavigation.selectedAnswer)
        assertFalse("未选择答案时不应该可以导航", afterNavigation.canNavigateNext)
    }

    @Test
    fun `test error clearing functionality`() = runTest {
        // 在测试中创建ViewModel
        viewModel = QuestionViewModel(repository)
        
        // Given: 等待初始数据加载完成
        testDispatcher.scheduler.advanceTimeBy(1000)
        testDispatcher.scheduler.runCurrent()

        // When: 清除任何可能的错误
        viewModel.clearError()
        testDispatcher.scheduler.runCurrent()

        // Then: 应该没有错误状态
        val state = viewModel.uiState.value
        assertNull("清除错误后不应该有错误信息", state.error)
        assertNotNull("应该有当前题目", state.currentQuestion)
        assertTrue("应该有答案选项", state.answerOptions.isNotEmpty())
    }

    @Test
    fun `test data consistency across operations`() = runTest {
        // 在测试中创建ViewModel
        viewModel = QuestionViewModel(repository)
        
        // Given: 等待初始数据加载完成
        testDispatcher.scheduler.advanceTimeBy(1000)
        testDispatcher.scheduler.runCurrent()

        val initialState = viewModel.uiState.value
        val initialOptions = initialState.answerOptions.toList()
        
        assertTrue("应该有答案选项", initialOptions.isNotEmpty())
        assertNotNull("应该有当前题目", initialState.currentQuestion)

        // Perform various operations
        viewModel.selectAnswer(initialOptions[0])
        val afterSelection = viewModel.uiState.value
        assertEquals("答案应已选择", initialOptions[0], afterSelection.selectedAnswer)
        
        viewModel.nextQuestion()
        // 等待新题目加载
        testDispatcher.scheduler.advanceTimeBy(600)
        testDispatcher.scheduler.runCurrent()
        
        val afterNavigation = viewModel.uiState.value
        assertEquals("应该导航到下一题", 1, afterNavigation.currentQuestionIndex)
        
        viewModel.previousQuestion()
        testDispatcher.scheduler.runCurrent()
        
        val afterBack = viewModel.uiState.value
        assertEquals("应该回到第一题", 0, afterBack.currentQuestionIndex)
        
        // Verify data consistency
        assertEquals("选项数据应保持一致", initialOptions, afterBack.answerOptions)
    }

    @Test
    fun `test multiple test sessions`() = runTest {
        // Test multiple complete test sessions
        repeat(2) { sessionIndex ->
            // Reset for new session
            viewModel = QuestionViewModel(repository)
            
            // 等待初始数据加载完成
            testDispatcher.scheduler.advanceTimeBy(1000)
            testDispatcher.scheduler.runCurrent()

            val initialState = viewModel.uiState.value
            val answerOptions = initialState.answerOptions
            
            assertTrue("应该有答案选项", answerOptions.isNotEmpty())
            assertNotNull("应该有当前题目", initialState.currentQuestion)

            // Answer enough questions to complete test
            repeat(10) { questionIndex ->
                val state = viewModel.uiState.value
                if (state.currentQuestion != null && state.answerOptions.isNotEmpty()) {
                    val selectedOption = state.answerOptions[questionIndex % state.answerOptions.size]
                    viewModel.selectAnswer(selectedOption)
                    if (questionIndex < 9) { // Don't navigate after last question
                        viewModel.nextQuestion()
                        // 等待新题目加载
                        testDispatcher.scheduler.advanceTimeBy(600)
                        testDispatcher.scheduler.runCurrent()
                    }
                }
            }

            // Submit test
            viewModel.submitTest()
            // 等待提交完成
            testDispatcher.scheduler.advanceTimeBy(2000)
            testDispatcher.scheduler.runCurrent()

            // Verify session completion
            val finalState = viewModel.uiState.value
            assertTrue("第${sessionIndex + 1}次测试应已完成", finalState.testCompleted)
            assertNotNull("第${sessionIndex + 1}次测试应有报告", finalState.testReport)
        }
    }

    @Test
    fun `test multiple test sessions isolation`() = runTest {
        // First session
        viewModel = QuestionViewModel(repository)
        // 等待初始数据加载完成
        testDispatcher.scheduler.advanceTimeBy(1000)
        testDispatcher.scheduler.runCurrent()

        val initialState = viewModel.uiState.value
        val answerOptions = initialState.answerOptions
        
        assertTrue("应该有答案选项", answerOptions.isNotEmpty())
        assertNotNull("应该有当前题目", initialState.currentQuestion)
        
        // Answer some questions in first session
        viewModel.selectAnswer(answerOptions[0])
        val afterFirstAnswer = viewModel.uiState.value
        assertEquals("第一个答案应已选择", answerOptions[0], afterFirstAnswer.selectedAnswer)

        // Navigate to next question and answer
        viewModel.nextQuestion()
        // 等待新题目加载
        testDispatcher.scheduler.advanceTimeBy(600)
        testDispatcher.scheduler.runCurrent()
        
        val secondQuestionState = viewModel.uiState.value
        assertEquals("应该在第二题", 1, secondQuestionState.currentQuestionIndex)
        
        if (secondQuestionState.answerOptions.isNotEmpty()) {
            viewModel.selectAnswer(secondQuestionState.answerOptions[1])
        }

        // Create new session by creating new ViewModel instance
        viewModel = QuestionViewModel(repository)
        // 等待新会话初始数据加载完成
        testDispatcher.scheduler.advanceTimeBy(1000)
        testDispatcher.scheduler.runCurrent()

        // Verify clean state
        val resetState = viewModel.uiState.value
        assertEquals("新会话应从第一题开始", 0, resetState.currentQuestionIndex)
        assertNull("新会话不应有选中答案", resetState.selectedAnswer)
        assertFalse("新会话不应完成测试", resetState.testCompleted)
        assertTrue("新会话应有答案选项", resetState.answerOptions.isNotEmpty())

        // Second session - verify independence
        testDispatcher.scheduler.advanceUntilIdle()

        val newSessionState = viewModel.uiState.value
        assertNotNull("新会话应有当前题目", newSessionState.currentQuestion)
        assertNull("新会话不应有选中答案", newSessionState.selectedAnswer)
        assertEquals("新会话应从第一题开始", 0, newSessionState.currentQuestionIndex)
    }
}