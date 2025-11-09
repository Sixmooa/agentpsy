package com.example.myapplication.ui.viewmodel

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.example.myapplication.data.repository.WeChatAuthRepository

/**
 * 微信登录ViewModel工厂
 * 用于创建WeChatLoginViewModel实例
 */
class WeChatLoginViewModelFactory(
    private val context: Context,
    private val dataStore: DataStore<Preferences>
) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(WeChatLoginViewModel::class.java)) {
            val repository = WeChatAuthRepository(context, dataStore)
            return WeChatLoginViewModel(repository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}