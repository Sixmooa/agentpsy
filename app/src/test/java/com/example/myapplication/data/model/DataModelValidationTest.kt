package com.example.myapplication.data.model

import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString
import org.junit.Test
import org.junit.Assert.*

/**
 * 数据模型验证单元测试
 * 基于TDD方法，先验证错误场景，再修复代码
 */
class DataModelValidationTest {

    @Test
    fun testAnswerOption_withValidData_shouldDeserializeSuccessfully() {
        val json = """
        {
            "id": 1,
            "option_text_zh": "完全不同意",
            "option_text_en": "Strongly Disagree",
            "score": 1
        }
        """.trimIndent()

        val answerOption = Json.decodeFromString<AnswerOption>(json)

        assertEquals(1, answerOption.id)
        assertEquals("完全不同意", answerOption.optionTextZh)
        assertEquals("Strongly Disagree", answerOption.optionTextEn)
        assertEquals(1, answerOption.score)
    }

    @Test
    fun testAnswerOption_withNullFields_shouldHandleGracefully() {
        val json = """
        {
            "id": null,
            "option_text_zh": null,
            "option_text_en": null,
            "score": null
        }
        """.trimIndent()

        try {
            val answerOption = Json.decodeFromString<AnswerOption>(json)
            fail("Expected deserialization to fail with null fields")
        } catch (e: Exception) {
            // 预期会失败，因为字段是必需的
            assertTrue(e.message?.contains("required") == true)
        }
    }

    @Test
    fun testCareerSuggestion_withValidData_shouldDeserializeSuccessfully() {
        val json = """
        {
            "id": 1,
            "mbti_type": "ENFJ",
            "career_zh": "人力资源经理",
            "career_en": "Human Resources Manager"
        }
        """.trimIndent()

        val careerSuggestion = Json.decodeFromString<CareerSuggestion>(json)

        assertEquals(1, careerSuggestion.id)
        assertEquals("ENFJ", careerSuggestion.mbtiType)
        assertEquals("人力资源经理", careerSuggestion.careerZh)
        assertEquals("Human Resources Manager", careerSuggestion.careerEn)
    }

    @Test
    fun testCareerSuggestion_withNullFields_shouldHandleGracefully() {
        val json = """
        {
            "id": null,
            "mbti_type": null,
            "career_zh": null,
            "career_en": null
        }
        """.trimIndent()

        try {
            val careerSuggestion = Json.decodeFromString<CareerSuggestion>(json)
            fail("Expected deserialization to fail with null fields")
        } catch (e: Exception) {
            // 预期会失败，因为字段是必需的
            assertTrue(e.message?.contains("required") == true)
        }
    }

    @Test
    fun testMBTIType_withValidData_shouldDeserializeSuccessfully() {
        val json = """
        {
            "id": 1,
            "type_code": "ENFJ",
            "type_name_zh": "主人公",
            "type_name_en": "Protagonist",
            "description_zh": "ENFJ类型描述",
            "description_en": "ENFJ type description",
            "strengths": ["领导力", "同理心"],
            "challenges": ["过度理想化", "忽略自我需求"]
        }
        """.trimIndent()

        val mbtiType = Json.decodeFromString<MBTIType>(json)

        assertEquals(1, mbtiType.id)
        assertEquals("ENFJ", mbtiType.typeCode)
        assertEquals("主人公", mbtiType.typeNameZh)
        assertEquals("Protagonist", mbtiType.typeNameEn)
        assertEquals("ENFJ类型描述", mbtiType.descriptionZh)
        assertEquals("ENFJ type description", mbtiType.descriptionEn)
        assertEquals(2, mbtiType.strengths?.size)
        assertEquals(2, mbtiType.challenges?.size)
    }

    @Test
    fun testMBTIType_withNullFields_shouldDeserializeSuccessfully() {
        val json = """
        {
            "id": null,
            "type_code": null,
            "type_name_zh": null,
            "type_name_en": null,
            "description_zh": null,
            "description_en": null,
            "strengths": null,
            "challenges": null
        }
        """.trimIndent()

        // 这个测试应该成功，因为我们已经修复了MBTIType模型
        val mbtiType = Json.decodeFromString<MBTIType>(json)

        assertNull(mbtiType.id)
        assertNull(mbtiType.typeCode)
        assertNull(mbtiType.typeNameZh)
        assertNull(mbtiType.typeNameEn)
        assertNull(mbtiType.descriptionZh)
        assertNull(mbtiType.descriptionEn)
        assertNull(mbtiType.strengths)
        assertNull(mbtiType.challenges)
    }

    @Test
    fun testTestReport_withNullMBTITypeInfo_shouldGetFallbackMBTIType() {
        val json = """
        {
            "timestamp": "2025-10-08T12:00:00Z",
            "language": "zh",
            "mbtiType": "ENFJ-A",
            "bigFiveScores": {
                "openness": 60.0,
                "conscientiousness": 60.0,
                "extraversion": 60.0,
                "agreeableness": 60.0,
                "neuroticism": 60.0
            },
            "mbtiResult": {
                "type": "ENFJ-A",
                "dimensions": {
                    "EI": "E",
                    "SN": "N",
                    "TF": "F",
                    "JP": "J"
                },
                "confidence": {
                    "EI": 0.8,
                    "SN": 0.6,
                    "TF": 0.7,
                    "JP": 0.9
                }
            },
            "mbtiTypeInfo": null,
            "careerSuggestions": []
        }
        """.trimIndent()

        val testReport = Json.decodeFromString<TestReport>(json)

        assertEquals("ENFJ-A", testReport.mbtiType)
        assertNotNull(testReport.bigFiveScores)
        assertNotNull(testReport.mbtiResult)
        assertNull(testReport.mbtiTypeInfo)

        // 测试getMBTITypeInfo方法
        val fallbackMBTIType = testReport.getMBTITypeInfo()
        assertNotNull(fallbackMBTIType)
        assertEquals("ENFJ", fallbackMBTIType.typeCode) // 去掉-A/-T后缀
        assertEquals("ENFJ-A", fallbackMBTIType.typeNameZh)
        assertEquals("ENFJ-A", fallbackMBTIType.typeNameEn)
    }

    @Test
    fun testTestReport_withBothNullMBTI_shouldStillWork() {
        val json = """
        {
            "timestamp": "2025-10-08T12:00:00Z",
            "language": "zh",
            "mbtiType": "ENFJ-A",
            "bigFiveScores": {
                "openness": 60.0,
                "conscientiousness": 60.0,
                "extraversion": 60.0,
                "agreeableness": 60.0,
                "neuroticism": 60.0
            },
            "mbtiResult": null,
            "mbtiTypeInfo": null,
            "careerSuggestions": []
        }
        """.trimIndent()

        val testReport = Json.decodeFromString<TestReport>(json)

        assertEquals("ENFJ-A", testReport.mbtiType)
        assertNull(testReport.mbtiResult)
        assertNull(testReport.mbtiTypeInfo)

        // 测试getMBTITypeInfo方法的最后fallback
        val fallbackMBTIType = testReport.getMBTITypeInfo()
        assertNotNull(fallbackMBTIType)
        assertNull(fallbackMBTIType.typeCode)
        assertEquals("未知类型", fallbackMBTIType.getTypeName())
    }
}