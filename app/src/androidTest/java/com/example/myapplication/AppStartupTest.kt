package com.example.myapplication

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

/**
 * 应用启动集成测试
 * 验证应用能正常启动并显示欢迎界面
 */
@RunWith(AndroidJUnit4::class)
class AppStartupTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<MainActivity>()

    @Test
    fun appStartsSuccessfully() {
        // 验证应用启动后显示欢迎界面
        composeTestRule.onNodeWithText("开始测试").assertExists()
    }

    @Test
    fun welcomeScreenDisplaysCorrectly() {
        // 验证欢迎界面的关键元素
        composeTestRule.onNodeWithText("人格测试").assertExists()
        composeTestRule.onNodeWithText("开始测试").assertExists()
    }
}