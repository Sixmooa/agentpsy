package com.example.myapplication.network

import com.example.myapplication.data.network.MockApiService
import com.example.myapplication.data.model.SubmitAnswerRequest
import com.example.myapplication.data.model.TestSubmissionRequest
import kotlinx.coroutines.test.runTest
import org.junit.Test
import org.junit.Assert.*

/**
 * Mock API服务成功场景测试
 * 验证Mock API服务的各项功能正常工作
 */
class MockApiServiceTest {

    private val mockApiService = MockApiService()

    @Test
    fun `test getRandomQuestions returns correct number of questions`() = runTest {
        // When: 请求3道题目
        val response = mockApiService.getRandomQuestions(3)

        // Then: 应该返回成功响应
        assertTrue("API响应应该成功", response.isSuccessful)
        val apiResponse = response.body()
        assertNotNull("响应体不应为空", apiResponse)
        assertTrue("API调用应该成功", apiResponse!!.success)
        
        val questions = apiResponse.data!!
        assertEquals("应该返回3道题目", 3, questions.size)
        
        // 验证题目内容
        questions.forEach { question ->
            assertNotNull("题目ID不应为空", question.id)
            assertNotNull("题目中文文本不应为空", question.questionTextZh)
            assertNotNull("题目英文文本不应为空", question.questionTextEn)
            assertNotNull("题目维度不应为空", question.dimension)
        }
    }

    @Test
    fun `test getRandomQuestions with different counts`() = runTest {
        // Test different counts
        val counts = listOf(1, 2, 5, 10)
        
        for (count in counts) {
            val response = mockApiService.getRandomQuestions(count)
            assertTrue("API响应应该成功", response.isSuccessful)
            val questions = response.body()!!.data!!
            val expectedCount = minOf(count, 5) // Mock service has 5 questions max
            assertEquals("请求$count 道题目应该返回$expectedCount 道", expectedCount, questions.size)
        }
    }

    @Test
    fun `test getAnswerOptions returns all options`() = runTest {
        // When: 获取答案选项
        val response = mockApiService.getAnswerOptions()

        // Then: 应该返回成功响应
        assertTrue("API响应应该成功", response.isSuccessful)
        val apiResponse = response.body()
        assertNotNull("响应体不应为空", apiResponse)
        assertTrue("API调用应该成功", apiResponse!!.success)
        
        val options = apiResponse.data!!
        assertEquals("应该返回5个答案选项", 5, options.size)
        
        // 验证选项内容
        options.forEach { option ->
            assertNotNull("选项ID不应为空", option.id)
            assertNotNull("选项中文文本不应为空", option.optionTextZh)
            assertNotNull("选项英文文本不应为空", option.optionTextEn)
            assertTrue("选项分数应在1-5之间", option.score in 1..5)
        }
    }

    @Test
    fun `test submitTest returns valid report`() = runTest {
        // Given: 准备测试答案
        val answers = listOf(
            SubmitAnswerRequest(1, 4), // E
            SubmitAnswerRequest(2, 3), // S
            SubmitAnswerRequest(3, 5), // T
            SubmitAnswerRequest(4, 2)  // J
        )

        // When: 提交测试
        val request = TestSubmissionRequest(
            answers = answers,
            language = "zh",
            saveResult = true
        )
        val response = mockApiService.submitTest(request)

        // Then: 验证响应
        assertTrue("API响应应该成功", response.isSuccessful)
        val submissionResponse = response.body()
        assertNotNull("响应体不应为空", submissionResponse)
        assertTrue("提交应该成功", submissionResponse!!.success)
        
        val report = submissionResponse.report
        assertNotNull("报告不应为空", report)
        assertNotNull("MBTI类型不应为空", report!!.mbtiType)
        assertEquals("MBTI类型应为4个字符", 4, report.mbtiType.length)
        assertTrue("MBTI类型应包含有效字符", 
            report.mbtiType.all { it in "EISTNJFP" })
        
        assertNotNull("Big Five得分不应为空", report.bigFiveScores)
        assertNotNull("MBTI类型信息不应为空", report.mbtiTypeInfo)
        assertNotNull("职业建议不应为空", report.careerSuggestions)
        assertTrue("职业建议不应为空", report.careerSuggestions.isNotEmpty())
    }

    @Test
    fun `test getMBTITypeInfo returns valid info`() = runTest {
        // Given: 测试不同的MBTI类型
        val testTypes = listOf("INTJ", "ENFP", "ISTP", "ESFJ")

        for (type in testTypes) {
            // When: 获取类型信息
            val response = mockApiService.getMBTITypeInfo(type)

            // Then: 验证响应结构
            assertTrue("响应应该成功", response.isSuccessful)
            assertNotNull("响应体不应为空", response.body())
            assertTrue("API调用应该成功", response.body()!!.success)
            assertNotNull("数据不应为空", response.body()!!.data)
            
            val info = response.body()!!.data!!
            assertEquals("类型应该匹配", type, info.typeCode)
            assertNotNull("名称不应为空", info.typeNameZh)
            assertNotNull("英文名称不应为空", info.typeNameEn)
            assertNotNull("描述不应为空", info.descriptionZh)
            assertNotNull("英文描述不应为空", info.descriptionEn)
            assertTrue("优势列表不应为空", info.strengths.isNotEmpty())
            assertTrue("挑战列表不应为空", info.challenges.isNotEmpty())
        }
    }

    @Test
    fun `test getCareerSuggestions returns valid suggestions`() = runTest {
        // When: 获取职业建议
        val response = mockApiService.getCareerSuggestions("INTJ")

        // Then: 验证响应结构
        assertTrue("响应应该成功", response.isSuccessful)
        assertNotNull("响应体不应为空", response.body())
        assertTrue("API调用应该成功", response.body()!!.success)
        assertNotNull("数据不应为空", response.body()!!.data)
        
        val suggestions = response.body()!!.data!!
        assertTrue("应该返回至少一个职业建议", suggestions.isNotEmpty())
        
        suggestions.forEach { suggestion ->
            assertNotNull("职业ID不应为空", suggestion.id)
            assertEquals("MBTI类型应该匹配", "INTJ", suggestion.mbtiType)
            assertNotNull("中文职业名称不应为空", suggestion.careerZh)
            assertNotNull("英文职业名称不应为空", suggestion.careerEn)
        }
    }

    @Test
    fun `test API response times are reasonable`() = runTest {
        // Test that API calls complete within reasonable time
        val startTime = System.currentTimeMillis()
        
        // Call all APIs
        mockApiService.getAnswerOptions()
        mockApiService.getRandomQuestions(1)
        mockApiService.getMBTITypeInfo("INTJ")
        mockApiService.getCareerSuggestions("INTJ")
        
        val endTime = System.currentTimeMillis()
        val totalTime = endTime - startTime
        
        // Should complete within 5 seconds (including simulated delays)
        assertTrue("所有API调用应在5秒内完成", totalTime < 5000)
    }
}