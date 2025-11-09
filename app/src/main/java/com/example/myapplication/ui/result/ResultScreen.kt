package com.example.myapplication.ui.result

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.clickable
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.myapplication.data.model.BigFiveScores
import com.example.myapplication.data.model.CareerSuggestion
import com.example.myapplication.data.model.MBTIType
import com.example.myapplication.data.model.TestReport

/**
 * 结果展示界面
 * 显示MBTI类型、详细分析和职业建议
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResultScreen(
    viewModel: ResultViewModel,
    testReport: TestReport?,
    onRestartTest: () -> Unit,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    // 当前语言状态，从测试报告中获取或默认中文
    val currentLanguage = remember(testReport?.language) {
        testReport?.language ?: "zh"
    }
    
    // 设置测试报告
    LaunchedEffect(testReport) {
        testReport?.let { viewModel.setTestReport(it) }
    }
    
    // 监听重新开始测试
    LaunchedEffect(uiState.shouldRestartTest) {
        if (uiState.shouldRestartTest) {
            onRestartTest()
            viewModel.clearRestartFlag()
        }
    }
    
    // 处理分享
    LaunchedEffect(uiState.shareText) {
        uiState.shareText?.let { shareText ->
            // TODO: 实现分享功能
            // 这里可以使用Android的分享Intent
            viewModel.clearShareText()
        }
    }
    
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        when {
            uiState.isLoading -> {
                LoadingContent(currentLanguage)
            }
            
            uiState.testReport != null -> {
                val testReport = uiState.testReport!!
                ResultContent(
                    testReport = testReport,
                    currentLanguage = currentLanguage,
                    onRestartTest = viewModel::restartTest,
                    onShareResult = viewModel::shareResult,
                    modifier = Modifier.weight(1f)
                )
            }
            
            else -> {
                ErrorContent(
                    onRestartTest = viewModel::restartTest
                )
            }
        }
    }
}

@Composable
private fun LoadingContent(
    currentLanguage: String = "zh",
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
                text = if (currentLanguage == "zh") "正在生成测试报告..." else "Generating test report...",
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}

@Composable
private fun ErrorContent(
    onRestartTest: () -> Unit,
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
                text = "无法显示测试结果",
                style = MaterialTheme.typography.titleMedium,
                color = MaterialTheme.colorScheme.onErrorContainer
            )
            
            Button(
                onClick = onRestartTest,
                colors = ButtonDefaults.buttonColors(
                    containerColor = MaterialTheme.colorScheme.error
                )
            ) {
                Icon(Icons.Default.Refresh, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("重新测试")
            }
        }
    }
}

@Composable
private fun ResultContent(
    testReport: TestReport,
    currentLanguage: String,
    onRestartTest: () -> Unit,
    onShareResult: () -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 顶部操作按钮
        item {
            ActionButtons(
                onRestartTest = onRestartTest,
                onShareResult = onShareResult
            )
        }
        
        // MBTI类型卡片
        item {
            MBTITypeCard(
                mbtiType = testReport.mbtiType,
                mbtiTypeInfo = testReport.getMBTITypeInfo(),
                currentLanguage = currentLanguage
            )
        }

        // Big Five人格维度得分
        item {
            BigFiveScoresCard(
                bigFiveScores = testReport.bigFiveScores,
                currentLanguage = currentLanguage
            )
        }

        // 职业建议
        item {
            CareerSuggestionsCard(
                careerSuggestions = testReport.careerSuggestions,
                currentLanguage = currentLanguage
            )
        }
        
        // 测试时间
        item {
            TestInfoCard(
                timestamp = testReport.timestamp,
                language = testReport.language
            )
        }
    }
}

@Composable
private fun ActionButtons(
    onRestartTest: () -> Unit,
    onShareResult: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            OutlinedButton(
                onClick = onRestartTest,
                modifier = Modifier.weight(1f),
                contentPadding = ButtonDefaults.ButtonWithIconContentPadding
            ) {
                Icon(
                    Icons.Default.Refresh,
                    contentDescription = "重新测试",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("重新测试")
            }

            Button(
                onClick = onShareResult,
                modifier = Modifier.weight(1f),
                contentPadding = ButtonDefaults.ButtonWithIconContentPadding,
                elevation = ButtonDefaults.buttonElevation(
                    defaultElevation = 6.dp,
                    pressedElevation = 8.dp
                )
            ) {
                Icon(
                    Icons.Default.Share,
                    contentDescription = "分享结果",
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text("分享结果")
            }
        }
    }
}

@Composable
private fun MBTITypeCard(
    mbtiType: String,
    mbtiTypeInfo: MBTIType,
    currentLanguage: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.primaryContainer
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 8.dp,
            pressedElevation = 12.dp
        ),
        shape = RoundedCornerShape(20.dp)
    ) {
        Column(
            modifier = Modifier.padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 标题区域
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "🧠",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.size(24.dp)
                )
                Text(
                    text = if (currentLanguage == "zh") "您的人格类型" else "Your Personality Type",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.onPrimaryContainer,
                    fontWeight = FontWeight.SemiBold
                )
            }

            // MBTI类型展示
            Surface(
                modifier = Modifier
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
            ) {
                Text(
                    text = mbtiType,
                    style = MaterialTheme.typography.displayMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.primary,
                    modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp)
                )
            }

            // 类型名称
            Text(
                text = mbtiTypeInfo.getTypeName(currentLanguage),
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Medium,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
                textAlign = TextAlign.Center
            )

            HorizontalDivider(
                modifier = Modifier.padding(vertical = 12.dp),
                color = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
                thickness = 1.dp
            )

            // 描述文本
            Text(
                text = mbtiTypeInfo.getDescription(currentLanguage),
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onPrimaryContainer,
                textAlign = TextAlign.Center,
                lineHeight = 26.sp,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            // 优势和挑战区域
            if (mbtiTypeInfo.strengths?.isNotEmpty() == true || mbtiTypeInfo.challenges?.isNotEmpty() == true) {
                Spacer(modifier = Modifier.height(8.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // 优势
                    mbtiTypeInfo.strengths?.takeIf { it.isNotEmpty() }?.let { strengths ->
                        ExpandedTraitCard(
                            title = if (currentLanguage == "zh") "优势特质" else "Strengths",
                            iconText = "⭐",
                            items = strengths,
                            containerColor = MaterialTheme.colorScheme.secondaryContainer,
                            contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
                            currentLanguage = currentLanguage,
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // 挑战
                    mbtiTypeInfo.challenges?.takeIf { it.isNotEmpty() }?.let { challenges ->
                        ExpandedTraitCard(
                            title = if (currentLanguage == "zh") "发展建议" else "Growth Areas",
                            iconText = "🎯",
                            items = challenges,
                            containerColor = MaterialTheme.colorScheme.tertiaryContainer,
                            contentColor = MaterialTheme.colorScheme.onTertiaryContainer,
                            currentLanguage = currentLanguage,
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun ExpandedTraitCard(
    title: String,
    iconText: String,
    items: List<String>,
    containerColor: Color,
    contentColor: Color,
    currentLanguage: String = "zh",
    modifier: Modifier = Modifier
) {
    // 展开状态管理
    var isExpanded by remember { mutableStateOf(false) }

    // 显示的项目数量
    val visibleItems = if (isExpanded) items else items.take(3)

    // 是否显示展开/折叠按钮
    val shouldShowToggleButton = items.size > 3

    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(
            containerColor = containerColor
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 4.dp
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Text(
                    text = iconText,
                    style = MaterialTheme.typography.titleSmall,
                    modifier = Modifier.size(16.dp)
                )
                Text(
                    text = title,
                    style = MaterialTheme.typography.labelMedium,
                    fontWeight = FontWeight.Medium,
                    color = contentColor
                )
            }

            visibleItems.forEach { item ->
                Row(
                    verticalAlignment = Alignment.Top,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "•",
                        style = MaterialTheme.typography.bodySmall,
                        color = contentColor,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                    Text(
                        text = item,
                        style = MaterialTheme.typography.bodySmall,
                        color = contentColor,
                        lineHeight = 18.sp,
                        modifier = Modifier.weight(1f)
                    )
                }
            }

            // 展开/折叠按钮
            if (shouldShowToggleButton) {
                Text(
                    text = if (isExpanded) {
                        if (currentLanguage == "zh") "收起" else "Collapse"
                    } else {
                        val moreCount = items.size - 3
                        if (currentLanguage == "zh") "+$moreCount 更多" else "+$moreCount more"
                    },
                    style = MaterialTheme.typography.bodySmall,
                    color = contentColor.copy(alpha = 0.7f),
                    textAlign = TextAlign.Center,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { isExpanded = !isExpanded }
                        .padding(vertical = 4.dp)
                )
            }
        }
    }
}

@Composable
private fun BigFiveScoresCard(
    bigFiveScores: BigFiveScores,
    currentLanguage: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 6.dp
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "📊",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.size(28.dp)
                )
                Text(
                    text = if (currentLanguage == "zh") "Big Five人格维度得分" else "Big Five Personality Scores",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            EnhancedScoreItem(getBigFiveLabel("openness", currentLanguage), bigFiveScores.openness, getBigFiveDescription("openness", currentLanguage))
            EnhancedScoreItem(getBigFiveLabel("conscientiousness", currentLanguage), bigFiveScores.conscientiousness, getBigFiveDescription("conscientiousness", currentLanguage))
            EnhancedScoreItem(getBigFiveLabel("extraversion", currentLanguage), bigFiveScores.extraversion, getBigFiveDescription("extraversion", currentLanguage))
            EnhancedScoreItem(getBigFiveLabel("agreeableness", currentLanguage), bigFiveScores.agreeableness, getBigFiveDescription("agreeableness", currentLanguage))
            EnhancedScoreItem(getBigFiveLabel("neuroticism", currentLanguage), bigFiveScores.neuroticism, getBigFiveDescription("neuroticism", currentLanguage))
        }
    }
}

@Composable
private fun EnhancedScoreItem(
    dimension: String,
    score: Double,
    description: String,
    modifier: Modifier = Modifier
) {
    // 将1-5分转换为百分比用于颜色判断
    val percentage = ((score - 1) / 4.0) * 100
    val progressColor = when {
        percentage >= 75 -> MaterialTheme.colorScheme.primary
        percentage >= 50 -> MaterialTheme.colorScheme.secondary
        else -> MaterialTheme.colorScheme.tertiary
    }

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = dimension,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
                )
            }

            Surface(
                shape = RoundedCornerShape(8.dp),
                color = progressColor.copy(alpha = 0.1f)
            ) {
                Text(
                    text = String.format("%.0f%%", percentage),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.Bold,
                    color = progressColor,
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
                )
            }
        }

        Box(
            modifier = Modifier.fillMaxWidth()
        ) {
            LinearProgressIndicator(
                progress = { ((score - 1) / 4.0).toFloat() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp),
                color = progressColor,
                trackColor = MaterialTheme.colorScheme.outline.copy(alpha = 0.2f),
            )
        }
    }
}

@Composable
private fun CareerSuggestionsCard(
    careerSuggestions: List<CareerSuggestion>,
    currentLanguage: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 6.dp
        ),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier.padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "💼",
                    style = MaterialTheme.typography.titleLarge,
                    modifier = Modifier.size(28.dp)
                )
                Text(
                    text = if (currentLanguage == "zh") "推荐职业" else "Recommended Careers",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onSecondaryContainer
                )
            }

            if (careerSuggestions.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 20.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = if (currentLanguage == "zh") "暂无职业建议数据" else "No career suggestions available",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.7f)
                    )
                }
            } else {
                // 职业建议网格布局
                val chunkedCareers = careerSuggestions.chunked(2)

                chunkedCareers.forEach { chunk ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        chunk.forEach { career ->
                            EnhancedCareerItem(
                                career = career,
                                currentLanguage = currentLanguage,
                                modifier = Modifier.weight(1f)
                            )
                        }

                        // 如果只有一个职业，添加一个空白占位
                        if (chunk.size == 1) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }

                    if (chunk !== chunkedCareers.last()) {
                        Spacer(modifier = Modifier.height(12.dp))
                    }
                }

                // 如果有很多职业建议，显示提示
                if (careerSuggestions.size > 6) {
                    Spacer(modifier = Modifier.height(8.dp))

                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        color = MaterialTheme.colorScheme.secondary.copy(alpha = 0.1f)
                    ) {
                        Text(
                            text = "以上为部分推荐职业，更多职业建议请参考专业职业指导",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSecondaryContainer.copy(alpha = 0.8f),
                            textAlign = TextAlign.Center,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EnhancedCareerItem(
    career: CareerSuggestion,
    currentLanguage: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable { /* 可以添加点击事件，如职业详情 */ },
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 3.dp,
            pressedElevation = 6.dp
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // 职业图标区域
            Surface(
                modifier = Modifier.size(40.dp),
                shape = RoundedCornerShape(12.dp),
                color = MaterialTheme.colorScheme.primaryContainer
            ) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = getCareerIcon(career.getCareerName(currentLanguage)),
                        style = MaterialTheme.typography.titleMedium
                    )
                }
            }

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = career.getCareerName(currentLanguage),
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = MaterialTheme.colorScheme.onSurface,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                // career.getCareerNameEn()?.let { englishName ->
                //     Text(
                //         text = englishName,
                //         style = MaterialTheme.typography.bodySmall,
                //         color = MaterialTheme.colorScheme.onSurfaceVariant,
                //         maxLines = 1,
                //         overflow = TextOverflow.Ellipsis
                //     )
                // }
            }
        }
    }
}

/**
 * 根据职业名称返回对应的图标
 */
private fun getCareerIcon(careerName: String): String {
    return when {
        careerName.contains("软件") || careerName.contains("技术") || careerName.contains("工程师") -> "💻"
        careerName.contains("数据") || careerName.contains("分析") -> "📊"
        careerName.contains("管理") || careerName.contains("经理") || careerName.contains("主管") -> "👔"
        careerName.contains("设计") || careerName.contains("创意") -> "🎨"
        careerName.contains("教育") || careerName.contains("老师") -> "📚"
        careerName.contains("医疗") || careerName.contains("健康") -> "🏥"
        careerName.contains("销售") || careerName.contains("市场") -> "📈"
        careerName.contains("金融") || careerName.contains("银行") -> "💰"
        careerName.contains("法律") || careerName.contains("律师") -> "⚖️"
        careerName.contains("咨询") || careerName.contains("顾问") -> "💡"
        else -> "💼"
    }
}

@Composable
private fun TestInfoCard(
    timestamp: String,
    language: String,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 2.dp
        ),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "ℹ️",
                    style = MaterialTheme.typography.titleMedium,
                    modifier = Modifier.size(20.dp)
                )
                Text(
                    text = "测试信息",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            Column(
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = formatTimestamp(timestamp),
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                    fontWeight = FontWeight.Medium
                )

                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = MaterialTheme.colorScheme.primary.copy(alpha = 0.1f)
                ) {
                    Text(
                        text = if (language == "zh") "中文" else "English",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.primary,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            }
        }
    }
}

/**
 * 获取Big Five维度的标签
 */
private fun getBigFiveLabel(dimension: String, language: String): String {
    return if (language == "zh") {
        when (dimension) {
            "openness" -> "开放性"
            "conscientiousness" -> "尽责性"
            "extraversion" -> "外向性"
            "agreeableness" -> "宜人性"
            "neuroticism" -> "神经质"
            else -> dimension
        }
    } else {
        when (dimension) {
            "openness" -> "Openness"
            "conscientiousness" -> "Conscientiousness"
            "extraversion" -> "Extraversion"
            "agreeableness" -> "Agreeableness"
            "neuroticism" -> "Neuroticism"
            else -> dimension
        }
    }
}

/**
 * 获取Big Five维度的描述
 */
private fun getBigFiveDescription(dimension: String, language: String): String {
    return if (language == "zh") {
        when (dimension) {
            "openness" -> "对新体验和创意的接受程度"
            "conscientiousness" -> "自律和组织能力"
            "extraversion" -> "社交活跃度和能量来源"
            "agreeableness" -> "与他人和谐相处的能力"
            "neuroticism" -> "情绪稳定性和压力应对"
            else -> ""
        }
    } else {
        when (dimension) {
            "openness" -> "Openness to new experiences and creativity"
            "conscientiousness" -> "Self-discipline and organization"
            "extraversion" -> "Social activity and energy source"
            "agreeableness" -> "Ability to harmonize with others"
            "neuroticism" -> "Emotional stability and stress coping"
            else -> ""
        }
    }
}

/**
 * 格式化时间戳显示
 */
private fun formatTimestamp(timestamp: String): String {
    return try {
        // 简单的时间格式化，实际项目中可以使用更复杂的格式化逻辑
        val cleanTimestamp = timestamp.replace("T", " ").replace("Z", "")
        if (cleanTimestamp.length > 16) {
            cleanTimestamp.substring(0, 16)
        } else {
            cleanTimestamp
        }
    } catch (e: Exception) {
        timestamp
    }
}