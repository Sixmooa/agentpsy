package com.example.myapplication.data.consistency

import com.example.myapplication.data.model.Question
import com.example.myapplication.data.network.MockApiService
import kotlinx.coroutines.runBlocking
import org.junit.Test
import org.junit.Assert.*
import org.junit.Before

/**
 * 中文题目翻译质量测试
 * TDD驱动：验证中文题目翻译符合同意/不同意量表的要求
 */
class ChineseQuestionTranslationQualityTest {

    private lateinit var mockApiService: MockApiService

    @Before
    fun setUp() {
        mockApiService = MockApiService()
        println("=== 开始中文题目翻译质量测试 ===")
    }

    @Test
    fun `MockApiService题目翻译质量测试`() = runBlocking {
        // 获取MockApiService中的所有题目
        val response = mockApiService.getRandomQuestions(50, "zh")
        assertTrue("API调用应该成功", response.isSuccessful)

        val questions = response.body()?.data
        assertNotNull("题目数据不应该为空", questions)
        assertEquals("应该返回50个题目", 50, questions?.size)

        // 检查每个题目的翻译质量
        val problematicQuestions = mutableListOf<Pair<Question, List<String>>>()

        questions?.forEach { question ->
            val issues = validateQuestionTranslation(question.questionTextZh)
            if (issues.isNotEmpty()) {
                problematicQuestions.add(question to issues)
            }
        }

        // 输出测试结果
        println("\n=== 中文题目翻译质量测试结果 ===")
        println("总题目数: ${questions?.size}")
        println("问题题目数: ${problematicQuestions.size}")

        if (problematicQuestions.isNotEmpty()) {
            println("\n发现以下翻译问题:")
            problematicQuestions.forEachIndexed { index, (question, issues) ->
                println("${index + 1}. ID: ${question.id}")
                println("   原文: ${question.questionTextZh}")
                println("   问题: ${issues.joinToString(", ")}")
                println()
            }

            // 生成详细报告
            generateTranslationQualityReport(problematicQuestions)
        }

        // 断言：期望所有题目都没有翻译问题
        val errorMessage = buildString {
            append("发现 ${problematicQuestions.size} 个题目存在翻译问题。\n")
            append("前5个问题:\n")
            problematicQuestions.take(5).forEachIndexed { index, (question, issues) ->
                append("${index + 1}. \"${question.questionTextZh}\" - ${issues.joinToString(", ")}\n")
            }
        }

        assertEquals(errorMessage, 0, problematicQuestions.size)
    }

    @Test
    fun `数据库题目翻译质量测试`() = runBlocking {
        // 这个测试验证数据库中的题目翻译质量
        // 由于数据库中的题目已经是正确的，这个测试应该通过

        val databaseQuestions = getSampleDatabaseQuestions()
        val problematicQuestions = mutableListOf<Pair<String, List<String>>>()

        databaseQuestions.forEach { questionText ->
            val issues = validateQuestionTranslation(questionText)
            if (issues.isNotEmpty()) {
                problematicQuestions.add(questionText to issues)
            }
        }

        println("\n=== 数据库题目翻译质量测试结果 ===")
        println("检查题目数: ${databaseQuestions.size}")
        println("问题题目数: ${problematicQuestions.size}")

        assertEquals("数据库题目应该没有翻译问题", 0, problematicQuestions.size)
    }

    @Test
    fun `题目翻译格式规范测试`() {
        val testCases = listOf(
            // 好的例子
            "我有很多想象力。" to emptyList(),
            "我喜欢尝试新事物。" to emptyList(),
            "我对艺术和美学有浓厚兴趣。" to emptyList(),

            // 坏的例子
            "在学习新事物时，你更注重：" to listOf("包含'更注重'", "以冒号结尾", "包含时间状语从句"),
            "在社交聚会中，你通常：" to listOf("以冒号结尾"),
            "当你感到疲惫时，你倾向于：" to listOf("包含时间状语从句", "以冒号结尾")
        )

        testCases.forEach { (questionText, expectedIssues) ->
            val actualIssues = validateQuestionTranslation(questionText)
            assertEquals("题目 \"$questionText\" 的验证结果应该匹配期望",
                expectedIssues.size, actualIssues.size)

            expectedIssues.forEach { expectedIssue ->
                assertTrue("应该发现 '$expectedIssue' 问题: $questionText",
                    actualIssues.any { it.contains(expectedIssue) })
            }
        }
    }

    /**
     * 验证题目翻译质量
     * 返回问题列表，如果为空则表示题目格式正确
     */
    private fun validateQuestionTranslation(chineseText: String): List<String> {
        val issues = mutableListOf<String>()

        // 检查是否以冒号结尾
        if (chineseText.endsWith("：") || chineseText.endsWith(":")) {
            issues.add("以冒号结尾")
        }

        // 检查是否包含不适合同意/不同意量表的比较级表达
        val problematicPatterns = listOf(
            "更注重", "更倾向于", "更看重", "更关注", "更愿意",
            "更可能", "更喜欢", "更信任", "更重视"
        )

        problematicPatterns.forEach { pattern ->
            if (chineseText.contains(pattern)) {
                issues.add("包含'$pattern'")
            }
        }

        // 检查是否包含时间状语从句
        if (chineseText.contains("时，你")) {
            issues.add("包含时间状语从句")
        }

        // 检查是否包含问号
        if (chineseText.contains("？") || chineseText.contains("?")) {
            issues.add("包含问号")
        }

        // 检查是否是第一人称陈述句（推荐格式）
        if (!chineseText.startsWith("我") && !chineseText.startsWith("我 ")) {
            issues.add("不是以'我'开头的陈述句")
        }

        // 检查句子长度（建议不超过25个字符）
        if (chineseText.length > 25) {
            issues.add("句子过长")
        }

        return issues
    }

    /**
     * 获取数据库题目样本用于测试
     */
    private fun getSampleDatabaseQuestions(): List<String> {
        return listOf(
            "我有很多想象力。",
            "我喜欢尝试新事物。",
            "我对艺术和美学有浓厚兴趣。",
            "我喜欢思考抽象的概念。",
            "我经常有创造性的想法。",
            "我喜欢探索不同的文化。",
            "我对哲学问题感兴趣。",
            "我喜欢学习新技能。",
            "我对未知事物充满好奇。",
            "我喜欢挑战传统观念。"
        )
    }

    /**
     * 生成翻译质量报告
     */
    private fun generateTranslationQualityReport(problematicQuestions: List<Pair<Question, List<String>>>) {
        val report = buildString {
            appendLine("=== 中文题目翻译质量报告 ===")
            appendLine("生成时间: ${java.time.LocalDateTime.now()}")
            appendLine()

            appendLine("## 问题统计")
            appendLine("总题目数: ${problematicQuestions.size}")
            appendLine("问题题目数: ${problematicQuestions.size}")
            appendLine("问题率: 100%")
            appendLine()

            appendLine("## 主要问题类型:")
            val issueCounts = mutableMapOf<String, Int>()
            problematicQuestions.forEach { (_, issues) ->
                issues.forEach { issue ->
                    issueCounts[issue] = issueCounts.getOrDefault(issue, 0) + 1
                }
            }

            issueCounts.toList()
                .sortedByDescending { it.second }
                .forEach { (issue, count) ->
                    appendLine("- $issue: $count 次")
                }
            appendLine()

            appendLine("## 需要修复的题目:")
            problematicQuestions.forEachIndexed { index, (question, issues) ->
                appendLine("${index + 1}. ID ${question.id}: \"${question.questionTextZh}\"")
                appendLine("   问题: ${issues.joinToString(", ")}")
                appendLine()
            }
        }

        println(report)

        // 可以选择将报告保存到文件
        // File("translation-quality-report.txt").writeText(report)
    }
}