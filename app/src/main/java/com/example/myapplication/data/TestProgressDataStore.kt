package com.example.myapplication.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "test_progress")

/**
 * 测试进度数据存储管理器
 * 负责保存和恢复答题进度，包括当前题目索引、用户答案等
 */
class TestProgressDataStore(private val context: Context) {
    
    companion object {
        private val CURRENT_QUESTION_INDEX = intPreferencesKey("current_question_index")
        private val USER_ANSWERS = stringPreferencesKey("user_answers")
        private val LANGUAGE = stringPreferencesKey("language")
        private val IS_TEST_COMPLETED = stringPreferencesKey("is_test_completed")
        private val QUESTIONS_JSON = stringPreferencesKey("questions_json")
        private val ANSWER_OPTIONS_JSON = stringPreferencesKey("answer_options_json")
        private val TEST_PROGRESS = stringPreferencesKey("test_progress")
    }
    
    /**
     * 保存当前答题进度
     */
    suspend fun saveProgress(
        currentQuestionIndex: Int,
        userAnswers: List<Int>,
        language: String,
        isCompleted: Boolean = false,
        questionsJson: String? = null,
        answerOptionsJson: String? = null
    ) {
        context.dataStore.edit { preferences ->
            preferences[CURRENT_QUESTION_INDEX] = currentQuestionIndex
            preferences[USER_ANSWERS] = Json.encodeToString(userAnswers)
            preferences[LANGUAGE] = language
            preferences[IS_TEST_COMPLETED] = isCompleted.toString()
            
            questionsJson?.let { preferences[QUESTIONS_JSON] = it }
            answerOptionsJson?.let { preferences[ANSWER_OPTIONS_JSON] = it }
        }
    }
    
    /**
     * 获取当前题目索引
     */
    val currentQuestionIndex: Flow<Int> = context.dataStore.data.map { preferences ->
        preferences[CURRENT_QUESTION_INDEX] ?: 0
    }
    
    /**
     * 获取用户答案列表
     */
    val userAnswers: Flow<List<Int>> = context.dataStore.data.map { preferences ->
        val answersJson = preferences[USER_ANSWERS] ?: "[]"
        try {
            Json.decodeFromString<List<Int>>(answersJson)
        } catch (e: Exception) {
            emptyList()
        }
    }
    
    /**
     * 获取语言设置
     */
    val language: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[LANGUAGE] ?: "zh"
    }
    
    /**
     * 获取测试完成状态
     */
    val isTestCompleted: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[IS_TEST_COMPLETED]?.toBoolean() ?: false
    }
    
    /**
     * 获取保存的题目数据
     */
    val questionsJson: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[QUESTIONS_JSON]
    }
    
    /**
     * 获取保存的答案选项数据
     */
    val answerOptionsJson: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[ANSWER_OPTIONS_JSON]
    }
    
    /**
     * 清除所有进度数据（重新开始测试时使用）
     */
    suspend fun clearProgress() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }
    
    /**
     * 保存单个答案
     */
    suspend fun saveAnswer(questionIndex: Int, answer: Int) {
        context.dataStore.edit { preferences ->
            val currentAnswersJson = preferences[USER_ANSWERS] ?: "[]"
            val currentAnswers = try {
                Json.decodeFromString<List<Int>>(currentAnswersJson).toMutableList()
            } catch (e: Exception) {
                mutableListOf()
            }
            
            // 确保列表足够大
            while (currentAnswers.size <= questionIndex) {
                currentAnswers.add(0)
            }
            
            currentAnswers[questionIndex] = answer
            preferences[USER_ANSWERS] = Json.encodeToString(currentAnswers)
            preferences[CURRENT_QUESTION_INDEX] = questionIndex + 1
        }
    }
    
    /**
     * 保存完整的测试进度
     */
    suspend fun saveTestProgress(progressJson: String) {
        context.dataStore.edit { preferences ->
            preferences[TEST_PROGRESS] = progressJson
        }
    }
    
    /**
     * 获取完整的测试进度
     */
    val getTestProgress: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[TEST_PROGRESS] ?: ""
    }
    
    /**
     * 清除测试进度
     */
    suspend fun clearTestProgress() {
        context.dataStore.edit { preferences ->
            preferences.remove(TEST_PROGRESS)
        }
    }
}