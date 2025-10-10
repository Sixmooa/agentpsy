package com.example.myapplication.ui.question

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.selectable
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.myapplication.data.model.AnswerOption

/**
 * 答题界面
 * 实现单题显示和答案选择功能
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QuestionScreen(
    viewModel: QuestionViewModel,
    onTestCompleted: (com.example.myapplication.data.model.TestReport) -> Unit,
    onBackToWelcome: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // 监听测试完成状态
    LaunchedEffect(uiState.testCompleted, uiState.testReport) {
        val testReport = uiState.testReport
        if (uiState.testCompleted && testReport != null) {
            onTestCompleted(testReport)
        }
    }
    
    Column(
        modifier = modifier.fillMaxSize()
    ) {
        // 顶部栏
        TopAppBar(
            title = { 
                Text(
                    text = if (uiState.currentLanguage == "zh") "人格测试" else "Personality Test"
                ) 
            },
            navigationIcon = {
                IconButton(onClick = onBackToWelcome) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = if (uiState.currentLanguage == "zh") "返回" else "Back"
                    )
                }
            },
            actions = {
                IconButton(onClick = { viewModel.switchLanguage() }) {
                    Icon(
                        imageVector = Icons.Filled.Settings,
                        contentDescription = if (uiState.currentLanguage == "zh") "切换语言" else "Switch Language"
                    )
                }
                Text(
                    text = if (uiState.currentLanguage == "zh") "EN" else "中",
                    modifier = Modifier.padding(end = 8.dp),
                    style = MaterialTheme.typography.bodyMedium
                )
            }
        )
        
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 顶部进度指示器
            ProgressIndicator(
                currentQuestion = uiState.currentQuestionIndex + 1,
                totalQuestions = uiState.totalQuestions,
                language = uiState.currentLanguage
            )
        
        when {
            uiState.isLoading -> {
                LoadingContent(language = uiState.currentLanguage)
            }
            
            uiState.error != null -> {
                val error = uiState.error!!
                ErrorContent(
                    error = error,
                    language = uiState.currentLanguage,
                    onRetry = { viewModel.loadInitialData() }
                )
            }
            
            uiState.currentQuestion != null -> {
                val currentQuestion = uiState.currentQuestion!!
                QuestionContent(
                    question = currentQuestion,
                    answerOptions = uiState.answerOptions,
                    selectedAnswer = uiState.selectedAnswer,
                    language = uiState.currentLanguage,
                    onAnswerSelected = viewModel::selectAnswer,
                    canNavigatePrevious = uiState.canNavigatePrevious,
                    canNavigateNext = uiState.canNavigateNext,
                    shouldShowSubmitButton = uiState.shouldShowSubmitButton,
                    isPrimaryButtonEnabled = uiState.isPrimaryButtonEnabled,
                    onPreviousClick = viewModel::previousQuestion,
                    onNextClick = viewModel::nextQuestion,
                    onSubmitClick = viewModel::submitTest,
                    modifier = Modifier.weight(1f)
                )
            }
        }
        }
    }
}

@Composable
private fun ProgressIndicator(
    currentQuestion: Int,
    totalQuestions: Int,
    language: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = if (language == "zh") "题目进度" else "Progress",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = "$currentQuestion / $totalQuestions",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onPrimaryContainer
            )
            
            if (totalQuestions > 0) {
                Spacer(modifier = Modifier.height(8.dp))
                LinearProgressIndicator(
                    progress = { currentQuestion.toFloat() / totalQuestions.toFloat() },
                    modifier = Modifier.fillMaxWidth(),
                    color = MaterialTheme.colorScheme.primary,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant,
                )
            }
        }
    }
}

@Composable
private fun LoadingContent(
    language: String,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            CircularProgressIndicator()
            Text(
                text = if (language == "zh") "正在加载题目..." else "Loading questions...",
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

@Composable
private fun ErrorContent(
    error: String,
    language: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.errorContainer
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = if (language == "zh") "出现错误" else "Error Occurred",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
            
            Text(
                text = error,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onErrorContainer,
                textAlign = TextAlign.Center
            )
            
            Button(
                onClick = onRetry,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Text(if (language == "zh") "重试" else "Retry")
            }
        }
    }
}

@Composable
private fun QuestionContent(
    question: com.example.myapplication.data.model.Question,
    answerOptions: List<AnswerOption>,
    selectedAnswer: AnswerOption?,
    language: String,
    onAnswerSelected: (AnswerOption) -> Unit,
    canNavigatePrevious: Boolean,
    canNavigateNext: Boolean,
    shouldShowSubmitButton: Boolean,
    isPrimaryButtonEnabled: Boolean,
    onPreviousClick: () -> Unit,
    onNextClick: () -> Unit,
    onSubmitClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 题目内容
        Card(
            modifier = Modifier.fillMaxWidth(),
            colors = CardDefaults.cardColors(
                containerColor = MaterialTheme.colorScheme.surface
            )
        ) {
            Text(
                text = question.getQuestionText(),
                style = MaterialTheme.typography.headlineSmall,
                modifier = Modifier.padding(20.dp),
                textAlign = TextAlign.Center,
                lineHeight = 28.sp
            )
        }
        
        // 答案选项
        LazyColumn(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(answerOptions) { option ->
                AnswerOptionCard(
                    option = option,
                    isSelected = selectedAnswer?.id == option.id,
                    onSelected = { onAnswerSelected(option) }
                )
            }
        }
        
        // 导航按钮
        NavigationButtons(
            canNavigatePrevious = canNavigatePrevious,
            canNavigateNext = canNavigateNext,
            shouldShowSubmitButton = shouldShowSubmitButton,
            isPrimaryButtonEnabled = isPrimaryButtonEnabled,
            language = language,
            onPreviousClick = onPreviousClick,
            onNextClick = onNextClick,
            onSubmitClick = onSubmitClick
        )
    }
}

@Composable
private fun AnswerOptionCard(
    option: AnswerOption,
    isSelected: Boolean,
    onSelected: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .selectable(
                selected = isSelected,
                onClick = onSelected
            ),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) {
                MaterialTheme.colorScheme.primaryContainer
            } else {
                MaterialTheme.colorScheme.surfaceVariant
            }
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Text(
            text = option.getOptionText(),
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.padding(16.dp),
            color = if (isSelected) {
                MaterialTheme.colorScheme.onPrimaryContainer
            } else {
                MaterialTheme.colorScheme.onSurfaceVariant
            }
        )
    }
}

@Composable
private fun NavigationButtons(
    canNavigatePrevious: Boolean,
    canNavigateNext: Boolean,
    shouldShowSubmitButton: Boolean,
    isPrimaryButtonEnabled: Boolean,
    language: String,
    onPreviousClick: () -> Unit,
    onNextClick: () -> Unit,
    onSubmitClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 上一题按钮
        OutlinedButton(
            onClick = onPreviousClick,
            enabled = canNavigatePrevious,
            modifier = Modifier.weight(1f)
        ) {
            Text(if (language == "zh") "上一题" else "Previous")
        }
        
        // 下一题/提交按钮
        Button(
            onClick = if (shouldShowSubmitButton) onSubmitClick else onNextClick,
            enabled = isPrimaryButtonEnabled,
            modifier = Modifier.weight(1f)
        ) {
            Text(
                if (shouldShowSubmitButton) {
                    if (language == "zh") "提交测试" else "Submit Test"
                } else {
                    if (language == "zh") "下一题" else "Next"
                }
            )
        }
    }
}