package com.example.myapplication.ui

import android.content.Context
import androidx.arch.core.executor.testing.InstantTaskExecutorRule
import com.example.myapplication.ui.question.QuestionViewModel
import com.example.myapplication.ui.result.ResultViewModel
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.Assert.*
import org.mockito.Mock
import org.mockito.MockitoAnnotations
import org.mockito.Mockito.`when`

/**
 * ViewModelFactory单元测试
 */
@OptIn(ExperimentalCoroutinesApi::class)
class ViewModelFactoryTest {

    @get:Rule
    val instantTaskExecutorRule = InstantTaskExecutorRule()

    @Mock
    private lateinit var mockContext: Context

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var factory: ViewModelFactory

    @Before
    fun setup() {
        MockitoAnnotations.openMocks(this)
        Dispatchers.setMain(testDispatcher)
        
        // 设置mock Context的applicationContext
        `when`(mockContext.applicationContext).thenReturn(mockContext)
        
        factory = ViewModelFactory(mockContext)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `create QuestionViewModel should return QuestionViewModel instance`() = kotlinx.coroutines.test.runTest {
        // When
        val viewModel = factory.create(QuestionViewModel::class.java)
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Then
        assertTrue("Should create QuestionViewModel instance", viewModel is QuestionViewModel)
    }

    @Test
    fun `create ResultViewModel should return ResultViewModel instance`() {
        // When
        val viewModel = factory.create(ResultViewModel::class.java)
        
        // Then
        assertTrue("Should create ResultViewModel instance", viewModel is ResultViewModel)
    }

    @Test(expected = IllegalArgumentException::class)
    fun `create unknown ViewModel should throw IllegalArgumentException`() {
        // When & Then
        factory.create(UnknownViewModel::class.java)
    }

    // 测试用的未知ViewModel类
    private class UnknownViewModel : androidx.lifecycle.ViewModel()
}