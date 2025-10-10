package com.example.myapplication.ui

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.myapplication.data.TestProgressDataStore
import com.example.myapplication.data.repository.PersonalityTestRepository
import com.example.myapplication.di.AppModule
import com.example.myapplication.ui.question.QuestionViewModel
import com.example.myapplication.ui.result.ResultViewModel

/**
 * ViewModel工厂类
 * 用于创建带有依赖注入的ViewModel实例
 */
class ViewModelFactory(private val context: Context) : ViewModelProvider.Factory {
    
    private val repository: PersonalityTestRepository by lazy {
        AppModule.providePersonalityTestRepository()
    }
    
    private val dataStore: TestProgressDataStore by lazy {
        TestProgressDataStore(context)
    }
    
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        return when (modelClass) {
            QuestionViewModel::class.java -> {
                QuestionViewModel(repository, dataStore) as T
            }
            ResultViewModel::class.java -> {
                ResultViewModel() as T
            }
            else -> {
                throw IllegalArgumentException("Unknown ViewModel class: ${modelClass.name}")
            }
        }
    }
}