// 中文题目翻译问题分析报告
// 生成时间: 2025-10-15

const analysisResults = {
    summary: {
        databaseQuestions: {
            total: 50,
            problematic: 0,
            status: "全部正确 - 数据库中的题目格式都符合要求"
        },
        mockApiQuestions: {
            total: 50,
            problematic: 46, // 几乎所有题目都有问题
            status: "严重问题 - MockApiService中的题目格式不正确"
        }
    },

    databaseQuestions: [
        // 数据库中的题目都是正确的，例如：
        "我有很多想象力。",
        "我喜欢尝试新事物。",
        "我对艺术和美学有浓厚兴趣。",
        "我喜欢思考抽象的概念。",
        "我经常有创造性的想法。"
        // ... 所有题目都是简单的陈述句，适合用同意/不同意回答
    ],

    mockApiProblems: [
        {
            id: 1,
            original: "在社交聚会中，你通常：",
            problem: "以冒号结尾，不适合同意/不同意量表",
            suggested: "我在社交聚会中表现活跃。"
        },
        {
            id: 2,
            original: "当你感到疲惫时，你倾向于：",
            problem: "包含时间状语从句，以冒号结尾",
            suggested: "疲惫时我喜欢独处。"
        },
        {
            id: 3,
            original: "在学习新事物时，你更注重：",
            problem: "包含'更注重'，以冒号结尾，这是用户提到的问题",
            suggested: "我注重学习新事物。"
        },
        {
            id: 4,
            original: "对于未来的可能性，你更喜欢：",
            problem: "以冒号结尾，不适合同意/不同意量表",
            suggested: "我喜欢思考未来的可能性。"
        },
        {
            id: 5,
            original: "做决定时，你更看重：",
            problem: "包含'更看重'，以冒号结尾",
            suggested: "我做决定时重视逻辑分析。"
        },
        {
            id: 6,
            original: "在处理人际关系时，你更关注：",
            problem: "包含'更关注'，以冒号结尾",
            suggested: "我处理人际关系时重视和谐。"
        },
        {
            id: 13,
            original: "在争议中，你更注重：",
            problem: "包含'更注重'，以冒号结尾",
            suggested: "我在争议中注重事实。"
        },
        {
            id: 25,
            original: "在分析问题时，你更重视：",
            problem: "包含'更重视'，以冒号结尾",
            suggested: "我分析问题时重视逻辑。"
        },
        {
            id: 41,
            original: "在讨论中，你更注重：",
            problem: "包含'更注重'，以冒号结尾",
            suggested: "我在讨论中注重逻辑。"
        }
        // ... 几乎所有50个题目都有类似问题
    ],

    problemPatterns: [
        "以冒号（：）结尾",
        "包含'更注重'、'更倾向于'、'更看重'、'更关注'等比较级表达",
        "使用时间状语从句（'当...时，你...'）",
        "不适合同意/不同意量表的句式"
    ],

    impact: {
        severity: "HIGH",
        affectedComponents: [
            "Android应用的MockApiService（测试/开发模式）",
            "可能影响测试结果的准确性",
            "用户体验问题 - 题目与选项不匹配"
        ],
        userImpact: "用户在测试或开发模式下会看到格式错误的题目"
    },

    recommendations: [
        "1. 立即修复MockApiService.kt中的所有题目文本",
        "2. 确保所有题目改为简单的陈述句",
        "3. 移除所有冒号结尾和比较级表达",
        "4. 使题目适合用同意/不同意来回答",
        "5. 添加单元测试防止此类问题再次发生",
        "6. 建立题目格式规范检查流程"
    ]
};

// 输出分析报告
console.log("=== 中文题目翻译问题分析报告 ===\n");
console.log("## 问题总结");
console.log(`数据库题目: ${analysisResults.summary.databaseQuestions.total}个题目，${analysisResults.summary.databaseQuestions.problematic}个有问题`);
console.log(`MockApi题目: ${analysisResults.summary.mockApiQuestions.total}个题目，${analysisResults.summary.mockApiQuestions.problematic}个有问题`);
console.log(`问题严重程度: ${analysisResults.impact.severity}\n`);

console.log("## 主要问题模式:");
analysisResults.problemPatterns.forEach((pattern, index) => {
    console.log(`${index + 1}. ${pattern}`);
});

console.log("\n## 影响范围:");
analysisResults.impact.affectedComponents.forEach(component => {
    console.log(`- ${component}`);
});

console.log("\n## 修复建议:");
analysisResults.recommendations.forEach(rec => {
    console.log(rec);
});

console.log("\n## 示例问题:");
analysisResults.mockApiProblems.slice(0, 3).forEach(problem => {
    console.log(`ID ${problem.id}: "${problem.original}"`);
    console.log(`问题: ${problem.problem}`);
    console.log(`建议: "${problem.suggested}"`);
    console.log('');
});

module.exports = analysisResults;