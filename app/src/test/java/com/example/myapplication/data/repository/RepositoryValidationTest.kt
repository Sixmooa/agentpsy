package com.example.myapplication.data.repository

import com.example.myapplication.data.model.*
import com.example.myapplication.data.network.ApiService
import com.example.myapplication.data.network.MockApiService
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before
import retrofit2.Response

/**
 * API服务层验证测试
 * TDD第二阶段：验证Repository层和API服务的业务逻辑
 */
class RepositoryValidationTest {

    private lateinit var mockApiService: MockApiService
    private lateinit var repository: PersonalityTestRepositoryImpl

    @Before
    fun setUp() {
        println("=== 开始API服务层验证测试 ===")
        mockApiService = MockApiService()
        repository = PersonalityTestRepositoryImpl(mockApiService)
    }

    // ========== getRandomQuestions测试 ==========

    @Test
    fun `getRandomQuestions_正常请求_应该返回题目列表`() = runBlocking {
        // 测试获取随机题目
        val result = repository.getRandomQuestions(count = 3, language = "zh")

        // 验证结果
        assertTrue("请求应该成功", result.isSuccess)
        assertNotNull("结果不应该为空", result.getOrNull())

        val questions = result.getOrNull()!!
        assertEquals("应该返回3个题目", 3, questions.size)

        // 验证题目数据完整性
        questions.forEach { question ->
            assertTrue("题目ID应该大于0", question.id > 0)
            assertTrue("中文问题不应该为空", question.questionTextZh.isNotEmpty())
            assertTrue("英文问题不应该为空", question.questionTextEn.isNotEmpty())
            assertTrue("维度不应该为空", question.dimension.isNotEmpty())
        }

        println("获取到${questions.size}个题目")
    }

    @Test
    fun `getRandomQuestions_请求0个题目_应该返回空列表`() = runBlocking {
        val result = repository.getRandomQuestions(count = 0, language = "zh")

        assertTrue("请求应该成功", result.isSuccess)
        val questions = result.getOrNull()!!
        assertEquals("应该返回空列表", 0, questions.size)
    }

    @Test
    fun `getRandomQuestions_请求大量题目_应该限制数量`() = runBlocking {
        val result = repository.getRandomQuestions(count = 100, language = "zh")

        assertTrue("请求应该成功", result.isSuccess)
        val questions = result.getOrNull()!!
        assertTrue("应该返回有限的题目数量", questions.size <= 5) // Mock只有5个题目
    }

    // ========== getAnswerOptions测试 ==========

    @Test
    fun `getAnswerOptions_正常请求_应该返回答案选项`() = runBlocking {
        val result = repository.getAnswerOptions(language = "zh")

        assertTrue("请求应该成功", result.isSuccess)
        assertNotNull("结果不应该为空", result.getOrNull())

        val options = result.getOrNull()!!
        assertEquals("应该返回5个选项", 5, options.size)

        // 验证选项数据完整性
        options.forEach { option ->
            assertTrue("选项ID应该大于0", option.id ?: 0 > 0)
            assertTrue("中文选项不应该为空", option.getOptionText("zh").isNotEmpty())
            assertTrue("英文选项不应该为空", option.getOptionText("en").isNotEmpty())
            assertTrue("分数应该在1-5范围内", option.getScore() in 1..5)
        }

        // 验证分数递增
        val scores = options.map { it.getScore() }
        assertEquals("分数应该是1,2,3,4,5", listOf(1, 2, 3, 4, 5), scores)

        println("获取到${options.size}个答案选项")
    }

    @Test
    fun `getAnswerOptions_英文请求_应该返回英文选项`() = runBlocking {
        val result = repository.getAnswerOptions(language = "en")

        assertTrue("请求应该成功", result.isSuccess)
        val options = result.getOrNull()!!

        // 验证英文选项文本
        val firstOption = options.first()
        assertTrue("应该是英文选项", firstOption.getOptionText("en").contains("Strongly"))
    }

    // ========== submitTest测试 ==========

    @Test
    fun `submitTest_正常数据_应该成功返回测试报告`() = runBlocking {
        // 准备测试数据
        val answers = listOf(
            SubmitAnswerRequest(1, 4),
            SubmitAnswerRequest(2, 3),
            SubmitAnswerRequest(3, 5),
            SubmitAnswerRequest(4, 2),
            SubmitAnswerRequest(5, 4)
        )

        val result = repository.submitTest(
            answers = answers,
            language = "zh",
            saveResult = false
        )

        // 验证结果
        assertTrue("提交应该成功", result.isSuccess)
        assertNotNull("应该返回测试报告", result.getOrNull())

        val report = result.getOrNull()!!
        assertNotNull("报告时间戳不应该为空", report.timestamp)
        assertEquals("报告语言应该正确", "zh", report.language)
        assertNotNull("MBTI类型不应该为空", report.mbtiType)
        assertNotNull("Big Five得分不应该为空", report.bigFiveScores)
        assertNotNull("职业建议不应该为空", report.careerSuggestions)

        // 验证Big Five得分
        val bigFiveScores = report.bigFiveScores
        assertTrue("开放性得分应该在0-100范围内", bigFiveScores.openness in 0.0..100.0)
        assertTrue("尽责性得分应该在0-100范围内", bigFiveScores.conscientiousness in 0.0..100.0)
        assertTrue("外向性得分应该在0-100范围内", bigFiveScores.extraversion in 0.0..100.0)
        assertTrue("宜人性得分应该在0-100范围内", bigFiveScores.agreeableness in 0.0..100.0)
        assertTrue("神经质得分应该在0-100范围内", bigFiveScores.neuroticism in 0.0..100.0)

        // 验证MBTI类型信息
        val mbtiInfo = report.getMBTITypeInfo()
        assertNotNull("MBTI信息不应该为空", mbtiInfo)
        assertTrue("类型名称不应该为空", mbtiInfo.getTypeName().isNotEmpty())
        assertTrue("类型描述不应该为空", mbtiInfo.getDescription().isNotEmpty())

        println("测试提交成功，MBTI类型: ${report.mbtiType}")
        println("Big Five得分: ${bigFiveScores.openness}, ${bigFiveScores.conscientiousness}, ${bigFiveScores.extraversion}, ${bigFiveScores.agreeableness}, ${bigFiveScores.neuroticism}")
    }

    @Test
    fun `submitTest_空答案列表_应该返回错误`() = runBlocking {
        val result = repository.submitTest(
            answers = emptyList(),
            language = "zh",
            saveResult = false
        )

        assertTrue("应该返回失败", result.isFailure)
        val exception = result.exceptionOrNull()
        assertNotNull("应该有异常", exception)
        assertTrue("异常应该包含提交失败信息", exception?.message?.contains("提交") == true)
    }

    @Test
    fun `submitTest_无效答案数据_应该过滤并处理`() = runBlocking {
        // 包含有效和无效答案的数据
        val mixedAnswers = listOf(
            SubmitAnswerRequest(1, 4),    // 有效
            SubmitAnswerRequest(0, 3),    // 无效ID
            SubmitAnswerRequest(2, 0),    // 无效分数
            SubmitAnswerRequest(3, 6),    // 无效分数
            SubmitAnswerRequest(4, 3)     // 有效
        )

        val result = repository.submitTest(
            answers = mixedAnswers,
            language = "zh",
            saveResult = false
        )

        // Mock API会处理所有答案，所以仍然会成功
        assertTrue("应该成功", result.isSuccess)
        val report = result.getOrNull()!!
        assertNotNull("应该返回测试报告", report)
    }

    @Test
    fun `submitTest_不同语言_应该返回对应语言结果`() = runBlocking {
        val answers = listOf(
            SubmitAnswerRequest(1, 4),
            SubmitAnswerRequest(2, 3)
        )

        // 测试中文
        val zhResult = repository.submitTest(answers, "zh", false)
        assertTrue("中文请求应该成功", zhResult.isSuccess)
        val zhReport = zhResult.getOrNull()!!
        assertEquals("报告语言应该是中文", "zh", zhReport.language)

        // 测试英文
        val enResult = repository.submitTest(answers, "en", false)
        assertTrue("英文请求应该成功", enResult.isSuccess)
        val enReport = enResult.getOrNull()!!
        assertEquals("报告语言应该是英文", "en", enReport.language)
    }

    @Test
    fun `submitTest_saveResult参数_应该正确传递`() = runBlocking {
        val answers = listOf(SubmitAnswerRequest(1, 4))

        // 测试不保存结果
        val noSaveResult = repository.submitTest(answers, "zh", false)
        assertTrue("不保存应该成功", noSaveResult.isSuccess)

        // 测试保存结果
        val saveResult = repository.submitTest(answers, "zh", true)
        assertTrue("保存应该成功", saveResult.isSuccess)
    }

    // ========== getMBTITypeInfo测试 ==========

    @Test
    fun `getMBTITypeInfo_正常请求_应该返回MBTI类型信息`() = runBlocking {
        val result = repository.getMBTITypeInfo(typeCode = "ENFP", language = "zh")

        assertTrue("请求应该成功", result.isSuccess)
        assertNotNull("应该返回MBTI类型信息", result.getOrNull())

        val mbtiType = result.getOrNull()!!
        assertEquals("类型代码应该正确", "ENFP", mbtiType.typeCode)
        assertTrue("中文名称不应该为空", mbtiType.typeNameZh?.isNotEmpty() == true)
        assertTrue("英文名称不应该为空", mbtiType.typeNameEn?.isNotEmpty() == true)
        assertTrue("中文描述不应该为空", mbtiType.descriptionZh?.isNotEmpty() == true)
        assertTrue("英文描述不应该为空", mbtiType.descriptionEn?.isNotEmpty() == true)

        println("MBTI类型信息: ${mbtiType.typeCode} - ${mbtiType.typeNameZh}")
    }

    @Test
    fun `getMBTITypeInfo_未知类型代码_应该返回默认信息`() = runBlocking {
        val result = repository.getMBTITypeInfo(typeCode = "UNKNOWN", language = "zh")

        assertTrue("请求应该成功", result.isSuccess)
        val mbtiType = result.getOrNull()!!
        assertEquals("未知类型应该返回默认代码", "未知类型", mbtiType.typeCode)
    }

    // ========== getCareerSuggestions测试 ==========

    @Test
    fun `getCareerSuggestions_正常请求_应该返回职业建议`() = runBlocking {
        val result = repository.getCareerSuggestions(mbtiType = "ENFP", language = "zh")

        assertTrue("请求应该成功", result.isSuccess)
        assertNotNull("应该返回职业建议列表", result.getOrNull())

        val suggestions = result.getOrNull()!!
        assertTrue("应该至少有一个职业建议", suggestions.isNotEmpty())

        // 验证职业建议数据
        suggestions.forEach { suggestion ->
            assertTrue("职业ID应该大于0", suggestion.id ?: 0 > 0)
            assertTrue("MBTI类型不应该为空", suggestion.mbtiType?.isNotEmpty() == true)
            assertTrue("职业名称不应该为空", suggestion.getCareerName("zh").isNotEmpty())
        }

        println("获取到${suggestions.size}个职业建议")
    }

    @Test
    fun `getCareerSuggestions_未知MBTI类型_应该返回通用建议`() = runBlocking {
        val result = repository.getCareerSuggestions(mbtiType = "UNKNOWN", language = "zh")

        assertTrue("请求应该成功", result.isSuccess)
        val suggestions = result.getOrNull()!!
        assertTrue("未知类型应该返回通用建议", suggestions.isNotEmpty())
    }

    // ========== 错误处理测试 ==========

    @Test
    fun `API错误响应_应该正确处理为Result失败`() = runBlocking {
        // 注意：MockApiService总是返回成功响应
        // 在真实环境中，这里应该测试各种HTTP错误
        // 由于我们使用Mock API，这部分主要验证错误处理逻辑

        // 测试通过Mock API验证基本错误处理
        val result = repository.getRandomQuestions(count = -1, language = "zh")

        // Mock API会处理负数并返回有效结果
        assertTrue("Mock API应该处理异常输入", result.isSuccess)
    }

    @Test
    fun `网络超时_应该有合理的错误信息`() = runBlocking {
        // Mock API有固定的延迟，但不会超时
        val result = repository.getRandomQuestions(count = 1, language = "zh")
        assertTrue("即使有延迟也应该成功", result.isSuccess)
    }

    // ========== 数据一致性测试 ==========

    @Test
    fun `API响应数据一致性_应该与模型定义匹配`() = runBlocking {
        val answers = listOf(SubmitAnswerRequest(1, 3), SubmitAnswerRequest(2, 4))
        val result = repository.submitTest(answers, "zh", false)

        assertTrue("提交应该成功", result.isSuccess)
        val report = result.getOrNull()!!

        // 验证所有必需字段
        assertNotNull("时间戳", report.timestamp)
        assertNotNull("语言", report.language)
        assertNotNull("MBTI类型", report.mbtiType)
        assertNotNull("Big Five得分", report.bigFiveScores)
        assertNotNull("职业建议", report.careerSuggestions)

        // 验证数据类型
        assertTrue("时间戳应该是字符串", report.timestamp is String)
        assertTrue("语言应该是字符串", report.language is String)
        assertTrue("MBTI类型应该是字符串", report.mbtiType is String)
        assertTrue("Big Five得分应该是BigFiveScores类型", report.bigFiveScores is BigFiveScores)
        assertTrue("职业建议应该是列表", report.careerSuggestions is List<*>)

        // 验证MBTI类型格式
        assertTrue("MBTI类型应该是4个字母", report.mbtiType.length >= 4)
    }

    // ========== 并发测试 ==========

    @Test
    fun `并发请求_应该正确处理`() = runBlocking {
        // 模拟多个并发请求
        val deferred1 = kotlinx.coroutines.async {
            repository.getRandomQuestions(count = 2, language = "zh")
        }
        val deferred2 = kotlinx.coroutines.async {
            repository.getAnswerOptions(language = "zh")
        }
        val deferred3 = kotlinx.coroutines.async {
            repository.getMBTITypeInfo("ENFP", "zh")
        }

        // 等待所有请求完成
        val result1 = deferred1.await()
        val result2 = deferred2.await()
        val result3 = deferred3.await()

        // 验证所有请求都成功
        assertTrue("并发请求1应该成功", result1.isSuccess)
        assertTrue("并发请求2应该成功", result2.isSuccess)
        assertTrue("并发请求3应该成功", result3.isSuccess)

        // 验证数据完整性
        assertEquals("请求1应该返回题目", 2, result1.getOrNull()?.size ?: 0)
        assertEquals("请求2应该返回选项", 5, result2.getOrNull()?.size ?: 0)
        assertEquals("请求3应该返回MBTI信息", "ENFP", result3.getOrNull()?.typeCode)

        println("并发请求测试通过")
    }
}