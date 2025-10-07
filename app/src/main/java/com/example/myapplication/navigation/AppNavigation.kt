package com.example.myapplication.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.myapplication.data.model.TestReport
import com.example.myapplication.ui.question.QuestionScreen
import com.example.myapplication.ui.question.QuestionViewModel
import com.example.myapplication.ui.result.ResultScreen
import com.example.myapplication.ui.result.ResultViewModel
import com.example.myapplication.ui.welcome.WelcomeScreen

/**
 * 应用导航配置
 * 定义所有页面的路由和导航逻辑
 */
@Composable
fun AppNavigation(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Welcome.route,
        modifier = modifier
    ) {
        // 欢迎页面
        composable(Screen.Welcome.route) {
            WelcomeScreen(
                onStartTest = {
                    navController.navigate(Screen.Question.route) {
                        // 清除欢迎页面，防止返回
                        popUpTo(Screen.Welcome.route) { inclusive = true }
                    }
                }
            )
        }
        
        // 问题页面
        composable(Screen.Question.route) {
            val viewModel: QuestionViewModel = viewModel()
            
            QuestionScreen(
                viewModel = viewModel,
                onTestCompleted = { testReport ->
                    // 导航到结果页面，传递测试报告
                    navController.navigate(Screen.Result.createRoute(testReport)) {
                        // 清除问题页面，防止返回
                        popUpTo(Screen.Question.route) { inclusive = true }
                    }
                },
                onBackToWelcome = {
                    navController.navigate(Screen.Welcome.route) {
                        popUpTo(Screen.Question.route) { inclusive = true }
                    }
                }
            )
        }
        
        // 结果页面
        composable(
            route = Screen.Result.route,
            arguments = Screen.Result.arguments
        ) { backStackEntry ->
            val viewModel: ResultViewModel = viewModel()
            val testReport = Screen.Result.getTestReport(backStackEntry)
            
            ResultScreen(
                viewModel = viewModel,
                testReport = testReport,
                onRestartTest = {
                    navController.navigate(Screen.Welcome.route) {
                        // 清除所有页面，重新开始
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }
    }
}

/**
 * 导航目标定义
 */
sealed class Screen(val route: String) {
    object Welcome : Screen("welcome")
    object Question : Screen("question")
    object Result : Screen("result/{testReport}") {
        val arguments = listOf(
            androidx.navigation.navArgument("testReport") {
                type = androidx.navigation.NavType.StringType
            }
        )
        
        fun createRoute(testReport: TestReport): String {
            // 将TestReport序列化为JSON字符串
            val json = kotlinx.serialization.json.Json.encodeToString(
                TestReport.serializer(),
                testReport
            )
            // URL编码
            val encoded = java.net.URLEncoder.encode(json, "UTF-8")
            return "result/$encoded"
        }
        
        fun getTestReport(backStackEntry: androidx.navigation.NavBackStackEntry): TestReport? {
            return try {
                val encoded = backStackEntry.arguments?.getString("testReport")
                val json = java.net.URLDecoder.decode(encoded, "UTF-8")
                kotlinx.serialization.json.Json.decodeFromString(
                    TestReport.serializer(),
                    json
                )
            } catch (e: Exception) {
                null
            }
        }
    }
}

/**
 * 导航扩展函数
 */
fun NavHostController.navigateToQuestion() {
    navigate(Screen.Question.route) {
        popUpTo(Screen.Welcome.route) { inclusive = true }
    }
}

fun NavHostController.navigateToResult(testReport: TestReport) {
    navigate(Screen.Result.createRoute(testReport)) {
        popUpTo(Screen.Question.route) { inclusive = true }
    }
}

fun NavHostController.navigateToWelcome() {
    navigate(Screen.Welcome.route) {
        popUpTo(0) { inclusive = true }
    }
}

fun NavHostController.navigateBack(): Boolean {
    return if (canGoBack()) {
        popBackStack()
        true
    } else {
        false
    }
}

fun NavHostController.canGoBack(): Boolean {
    return previousBackStackEntry != null
}