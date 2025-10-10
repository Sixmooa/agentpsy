package com.example.myapplication.ui.result

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.myapplication.data.model.TestReport
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

/**
 * 结果展示界面ViewModel
 * 管理测试结果的显示逻辑
 */
class ResultViewModel : ViewModel() {
    
    // UI状态
    private val _uiState = MutableStateFlow(ResultUiState())
    val uiState: StateFlow<ResultUiState> = _uiState.asStateFlow()
    
    /**
     * 设置测试报告
     */
    fun setTestReport(testReport: TestReport) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(
                testReport = testReport,
                isLoading = false
            )
        }
    }
    
    /**
     * 重新开始测试
     */
    fun restartTest() {
        _uiState.value = _uiState.value.copy(
            shouldRestartTest = true
        )
    }
    
    /**
     * 清除重新开始标志
     */
    fun clearRestartFlag() {
        _uiState.value = _uiState.value.copy(
            shouldRestartTest = false
        )
    }
    
    /**
     * 分享结果
     */
    fun shareResult() {
        val testReport = _uiState.value.testReport ?: return
        val language = testReport.language
        val mbtiTypeInfo = testReport.getMBTITypeInfo()

        val shareText = buildString {
            if (language == "en") {
                appendLine("My MBTI Personality Test Results:")
                appendLine()
                appendLine("Type: ${testReport.mbtiType} - ${mbtiTypeInfo.getTypeName(language)}")
                appendLine()
                appendLine("Description: ${mbtiTypeInfo.getDescription(language)}")
                appendLine()
                appendLine("Big Five Personality Scores:")
                appendLine("Openness: ${String.format("%.1f", testReport.bigFiveScores.openness)}")
                appendLine("Conscientiousness: ${String.format("%.1f", testReport.bigFiveScores.conscientiousness)}")
                appendLine("Extraversion: ${String.format("%.1f", testReport.bigFiveScores.extraversion)}")
                appendLine("Agreeableness: ${String.format("%.1f", testReport.bigFiveScores.agreeableness)}")
                appendLine("Neuroticism: ${String.format("%.1f", testReport.bigFiveScores.neuroticism)}")
                appendLine()
                appendLine("Recommended Careers:")
                testReport.careerSuggestions.take(3).forEach { career ->
                    appendLine("• ${career.getCareerName(language)}")
                }
            } else {
                appendLine("我的MBTI人格测试结果：")
                appendLine()
                appendLine("类型：${testReport.mbtiType} - ${mbtiTypeInfo.getTypeName(language)}")
                appendLine()
                appendLine("描述：${mbtiTypeInfo.getDescription(language)}")
                appendLine()
                appendLine("Big Five人格维度得分：")
                appendLine("开放性：${String.format("%.1f", testReport.bigFiveScores.openness)}")
                appendLine("尽责性：${String.format("%.1f", testReport.bigFiveScores.conscientiousness)}")
                appendLine("外向性：${String.format("%.1f", testReport.bigFiveScores.extraversion)}")
                appendLine("宜人性：${String.format("%.1f", testReport.bigFiveScores.agreeableness)}")
                appendLine("神经质：${String.format("%.1f", testReport.bigFiveScores.neuroticism)}")
                appendLine()
                appendLine("推荐职业：")
                testReport.careerSuggestions.take(3).forEach { career ->
                    appendLine("• ${career.getCareerName(language)}")
                }
            }
        }
        
        _uiState.value = _uiState.value.copy(
            shareText = shareText
        )
    }
    
    /**
     * 生成可分享的文本
     */
    fun generateShareableText(): String? {
        val testReport = _uiState.value.testReport ?: return null
        val mbtiTypeInfo = testReport.getMBTITypeInfo()

        return buildString {
            appendLine("我的MBTI人格测试结果：")
            appendLine()
            appendLine("类型：${testReport.mbtiType} - ${mbtiTypeInfo.getTypeName()}")
            appendLine()
            appendLine("描述：${mbtiTypeInfo.getDescription()}")
            appendLine()
            appendLine("Big Five人格维度得分：")
            appendLine("开放性：${String.format("%.1f", testReport.bigFiveScores.openness)}")
            appendLine("尽责性：${String.format("%.1f", testReport.bigFiveScores.conscientiousness)}")
            appendLine("外向性：${String.format("%.1f", testReport.bigFiveScores.extraversion)}")
            appendLine("宜人性：${String.format("%.1f", testReport.bigFiveScores.agreeableness)}")
            appendLine("神经质：${String.format("%.1f", testReport.bigFiveScores.neuroticism)}")
            appendLine()
            appendLine("推荐职业：")
            testReport.careerSuggestions.take(3).forEach { career ->
                appendLine("• ${career.getCareerName()}")
            }
        }
    }
    
    /**
     * 清除分享文本
     */
    fun clearShareText() {
        _uiState.value = _uiState.value.copy(
            shareText = null
        )
    }
}

/**
 * 结果展示界面UI状态
 */
data class ResultUiState(
    val isLoading: Boolean = true,
    val testReport: TestReport? = null,
    val shouldRestartTest: Boolean = false,
    val shareText: String? = null,
    val error: String? = null
)