package com.example.myapplication.ui

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.test.ext.junit.runners.AndroidJUnit4
import com.example.myapplication.ui.theme.MyApplicationTheme
import com.example.myapplication.ui.welcome.WelcomeScreen
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LanguageSwitchTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun testWelcomeScreenDisplaysCorrectly() {
        composeTestRule.setContent {
            MyApplicationTheme {
                WelcomeScreen(
                    onStartTest = { }
                )
            }
        }

        // 验证欢迎页面的基本元素
        composeTestRule.onNodeWithText("人格测试").assertExists()
        composeTestRule.onNodeWithText("MBTI & Big Five 人格分析").assertExists()
        composeTestRule.onNodeWithText("开始测试").assertExists()
    }

    @Test
    fun testWelcomeScreenStartButton() {
        var startTestClicked = false
        
        composeTestRule.setContent {
            MyApplicationTheme {
                WelcomeScreen(
                    onStartTest = { startTestClicked = true }
                )
            }
        }

        // 点击开始测试按钮
        composeTestRule.onNodeWithText("开始测试").performClick()
        
        // 验证回调被调用
        assert(startTestClicked)
    }

    @Test
    fun testWelcomeScreenLayout() {
        composeTestRule.setContent {
            MyApplicationTheme {
                WelcomeScreen(
                    onStartTest = { }
                )
            }
        }

        // 验证页面布局元素存在
        composeTestRule.onNodeWithText("人格测试").assertIsDisplayed()
        composeTestRule.onNodeWithText("开始测试").assertIsDisplayed()
        
        // 验证测试介绍文本
        composeTestRule.onNodeWithText("关于这个测试").assertExists()
        composeTestRule.onNodeWithText("MBTI 16种人格类型分析").assertExists()
        composeTestRule.onNodeWithText("Big Five 五大人格维度评估").assertExists()
    }

    @Test
    fun testWelcomeScreenInstructions() {
        composeTestRule.setContent {
            MyApplicationTheme {
                WelcomeScreen(
                    onStartTest = { }
                )
            }
        }

        // 验证测试说明文本存在
        composeTestRule.onNodeWithText("测试说明").assertExists()
        composeTestRule.onNode(hasText("10-15 分钟", substring = true)).assertExists()
        composeTestRule.onNode(hasText("诚实回答", substring = true)).assertExists()
    }
}