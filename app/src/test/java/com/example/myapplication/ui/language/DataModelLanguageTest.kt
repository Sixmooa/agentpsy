package com.example.myapplication.ui.language

import com.example.myapplication.data.model.AnswerOption
import com.example.myapplication.data.model.Question
import org.junit.Test
import org.junit.Assert.*

/**
 * TDD单元测试：验证数据模型的多语言支持
 * 用于验证语言切换功能的预期行为
 */
class DataModelLanguageTest {

    @Test
    fun question_shouldReturnCorrectChineseText_byDefault() {
        // Given: 一个包含中英文的题目
        val question = Question(
            id = 1,
            questionTextZh = "我有很多想象力。",
            questionTextEn = "I have a vivid imagination.",
            dimension = "openness"
        )

        // When: 使用默认语言获取题目文本
        val text = question.getQuestionText()

        // Then: 应该返回中文文本
        assertEquals("我有很多想象力。", text)
    }

    @Test
    fun question_shouldReturnCorrectChineseText_whenLanguageIsZh() {
        // Given: 一个包含中英文的题目
        val question = Question(
            id = 1,
            questionTextZh = "我有很多想象力。",
            questionTextEn = "I have a vivid imagination.",
            dimension = "openness"
        )

        // When: 明确指定中文语言
        val text = question.getQuestionText("zh")

        // Then: 应该返回中文文本
        assertEquals("我有很多想象力。", text)
    }

    @Test
    fun question_shouldReturnCorrectEnglishText_whenLanguageIsEn() {
        // Given: 一个包含中英文的题目
        val question = Question(
            id = 1,
            questionTextZh = "我有很多想象力。",
            questionTextEn = "I have a vivid imagination.",
            dimension = "openness"
        )

        // When: 明确指定英文语言
        val text = question.getQuestionText("en")

        // Then: 应该返回英文文本
        assertEquals("I have a vivid imagination.", text)
    }

    @Test
    fun question_shouldReturnChineseText_forUnsupportedLanguage() {
        // Given: 一个包含中英文的题目
        val question = Question(
            id = 1,
            questionTextZh = "我有很多想象力。",
            questionTextEn = "I have a vivid imagination.",
            dimension = "openness"
        )

        // When: 使用不支持的语言代码
        val text = question.getQuestionText("fr")

        // Then: 应该回退到中文文本
        assertEquals("我有很多想象力。", text)
    }

    @Test
    fun answerOption_shouldReturnCorrectChineseText_byDefault() {
        // Given: 一个包含中英文的答案选项
        val option = AnswerOption(
            id = 1,
            optionTextZh = "完全同意",
            optionTextEn = "Strongly agree",
            score = 5
        )

        // When: 使用默认语言获取选项文本
        val text = option.getOptionText()

        // Then: 应该返回中文文本
        assertEquals("完全同意", text)
    }

    @Test
    fun answerOption_shouldReturnCorrectEnglishText_whenLanguageIsEn() {
        // Given: 一个包含中英文的答案选项
        val option = AnswerOption(
            id = 1,
            optionTextZh = "完全同意",
            optionTextEn = "Strongly agree",
            score = 5
        )

        // When: 明确指定英文语言
        val text = option.getOptionText("en")

        // Then: 应该返回英文文本
        assertEquals("Strongly agree", text)
    }

    @Test
    fun answerOption_shouldFallbackToGenericText_whenLanguageSpecificTextIsNull() {
        // Given: 一个只有通用文本的答案选项
        val option = AnswerOption(
            id = 1,
            text = "Generic Option"
        )

        // When: 获取英文文本但特定语言文本为null
        val englishText = option.getOptionText("en")
        val chineseText = option.getOptionText("zh")

        // Then: 应该返回通用文本
        assertEquals("Generic Option", englishText)
        assertEquals("Generic Option", chineseText)
    }

    @Test
    fun answerOption_shouldReturnFallbackText_whenAllTextsAreNull() {
        // Given: 一个所有文本都为null的答案选项
        val option = AnswerOption(
            id = 1
        )

        // When: 获取任何语言的文本
        val englishText = option.getOptionText("en")
        val chineseText = option.getOptionText("zh")

        // Then: 应该返回fallback文本
        assertEquals("未知选项", englishText)
        assertEquals("未知选项", chineseText)
    }

    @Test
    fun answerOption_shouldReturnCorrectScore() {
        // Given: 包含score和value的答案选项
        val optionWithScore = AnswerOption(
            id = 1,
            optionTextZh = "同意",
            score = 4
        )

        val optionWithValue = AnswerOption(
            id = 2,
            optionTextZh = "中立",
            value = 3
        )

        // When: 获取分数
        val score1 = optionWithScore.getScore()
        val score2 = optionWithValue.getScore()

        // Then: 应该返回正确的分数
        assertEquals(4, score1)
        assertEquals(3, score2)
    }
}