/**
 * 人格测试综合测试运行器
 * 执行所有测试套件并生成综合报告
 */

const fs = require('fs');
const path = require('path');
const PersonalityTestSuite = require('./comprehensive-personality-test');
const APIPersonalityTestSuite = require('./api-personality-test');

class TestRunner {
    constructor() {
        this.allResults = [];
        this.startTime = Date.now();
        this.suiteResults = {};
    }
    
    // 运行所有测试套件
    async runAllTestSuites() {
        console.log('🚀 开始执行全面的人格测试验证...\n');
        console.log('=' * 60);
        console.log('测试范围:');
        console.log('- personality-api-fixed.ts API版本');
        console.log('- E:\\work\\static 静态文件版本');
        console.log('- 计算逻辑一致性验证');
        console.log('- 边界条件和异常处理');
        console.log('- 性能和压力测试');
        console.log('=' * 60);
        console.log();
        
        try {
            // 运行综合测试套件
            console.log('📋 第一阶段: 综合计算逻辑测试');
            const comprehensiveTestSuite = new PersonalityTestSuite();
            await comprehensiveTestSuite.runAllTests();
            this.suiteResults.comprehensive = {
                totalTests: comprehensiveTestSuite.totalTests,
                passedTests: comprehensiveTestSuite.passedTests,
                failedTests: comprehensiveTestSuite.failedTests,
                results: comprehensiveTestSuite.testResults
            };
            
            console.log('\n' + '='.repeat(60) + '\n');
            
            // 运行API测试套件
            console.log('📋 第二阶段: API功能测试');
            const apiTestSuite = new APIPersonalityTestSuite();
            await apiTestSuite.runAllTests();
            this.suiteResults.api = {
                totalTests: apiTestSuite.totalTests,
                passedTests: apiTestSuite.passedTests,
                failedTests: apiTestSuite.failedTests,
                results: apiTestSuite.testResults
            };
            
            console.log('\n' + '='.repeat(60) + '\n');
            
            // 运行对比测试
            console.log('📋 第三阶段: 版本对比测试');
            await this.runComparisonTests();
            
            // 生成综合报告
            this.generateComprehensiveReport();
            
        } catch (error) {
            console.error('❌ 测试运行器发生错误:', error);
            this.generateErrorReport(error);
        }
    }
    
    // 运行版本对比测试
    async runComparisonTests() {
        console.log('\n🔍 执行API版本与静态版本对比测试...');
        
        const comparisonResults = [];
        
        // 创建测试实例
        const comprehensiveTestSuite = new PersonalityTestSuite();
        const apiTestSuite = new APIPersonalityTestSuite();
        
        // 生成相同的测试数据
        const testCases = [
            { name: 'INTJ模式', answers: this.generateINTJAnswers() },
            { name: 'ENFP模式', answers: this.generateENFPAnswers() },
            { name: '平衡模式', answers: this.generateBalancedAnswers() },
            { name: '极端高分', answers: this.generateExtremeHighAnswers() },
            { name: '极端低分', answers: this.generateExtremeLowAnswers() }
        ];
        
        const questions = this.generateMockQuestions();
        
        for (const testCase of testCases) {
            console.log(`  测试案例: ${testCase.name}`);
            
            try {
                // 静态版本计算
                const staticScores = comprehensiveTestSuite.staticCalculator.calculateBigFiveScores(testCase.answers, questions);
                const staticMBTI = comprehensiveTestSuite.staticCalculator.calculateMBTI(staticScores);
                
                // API版本计算
                const apiScores = apiTestSuite.apiHandlers.calculateBigFiveScores(testCase.answers, questions);
                const apiMBTI = apiTestSuite.apiHandlers.calculateMBTI(apiScores);
                
                // 对比结果
                const scoresMatch = this.compareScores(staticScores, apiScores);
                const mbtiMatch = staticMBTI.type === apiMBTI.type;
                
                comparisonResults.push({
                    testCase: testCase.name,
                    scoresMatch,
                    mbtiMatch,
                    staticScores,
                    apiScores,
                    staticMBTI: staticMBTI.type,
                    apiMBTI: apiMBTI.type,
                    scoreDifferences: this.calculateScoreDifferences(staticScores, apiScores)
                });
                
                console.log(`    Big Five分数匹配: ${scoresMatch ? '✅' : '❌'}`);
                console.log(`    MBTI类型匹配: ${mbtiMatch ? '✅' : '❌'}`);
                
                if (!scoresMatch || !mbtiMatch) {
                    console.log(`    静态版本MBTI: ${staticMBTI.type}`);
                    console.log(`    API版本MBTI: ${apiMBTI.type}`);
                }
                
            } catch (error) {
                console.log(`    ❌ 测试失败: ${error.message}`);
                comparisonResults.push({
                    testCase: testCase.name,
                    error: error.message
                });
            }
        }
        
        this.suiteResults.comparison = {
            totalComparisons: comparisonResults.length,
            matchingResults: comparisonResults.filter(r => r.scoresMatch && r.mbtiMatch).length,
            results: comparisonResults
        };
        
        console.log('✅ 版本对比测试完成');
    }
    
    // 生成测试数据的辅助方法
    generateMockQuestions() {
        const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
        const questions = [];
        
        for (let i = 1; i <= 50; i++) {
            questions.push({
                id: i,
                text_zh: `测试问题 ${i}`,
                text_en: `Test Question ${i}`,
                dimension: dimensions[(i - 1) % 5],
                reverse_scored: i % 3 === 0
            });
        }
        
        return questions;
    }
    
    generateINTJAnswers() {
        const answers = {};
        for (let i = 1; i <= 50; i++) {
            const dimension = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'][(i - 1) % 5];
            switch (dimension) {
                case 'openness': answers[i] = 4; break;
                case 'conscientiousness': answers[i] = 4; break;
                case 'extraversion': answers[i] = 2; break;
                case 'agreeableness': answers[i] = 2; break;
                case 'neuroticism': answers[i] = 2; break;
            }
        }
        return answers;
    }
    
    generateENFPAnswers() {
        const answers = {};
        for (let i = 1; i <= 50; i++) {
            const dimension = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'][(i - 1) % 5];
            switch (dimension) {
                case 'openness': answers[i] = 4; break;
                case 'conscientiousness': answers[i] = 2; break;
                case 'extraversion': answers[i] = 4; break;
                case 'agreeableness': answers[i] = 4; break;
                case 'neuroticism': answers[i] = 4; break;
            }
        }
        return answers;
    }
    
    generateBalancedAnswers() {
        const answers = {};
        for (let i = 1; i <= 50; i++) {
            answers[i] = 3;
        }
        return answers;
    }
    
    generateExtremeHighAnswers() {
        const answers = {};
        for (let i = 1; i <= 50; i++) {
            answers[i] = 5;
        }
        return answers;
    }
    
    generateExtremeLowAnswers() {
        const answers = {};
        for (let i = 1; i <= 50; i++) {
            answers[i] = 1;
        }
        return answers;
    }
    
    // 对比分数
    compareScores(scores1, scores2, tolerance = 0.01) {
        const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
        
        for (const dimension of dimensions) {
            const diff = Math.abs(scores1[dimension] - scores2[dimension]);
            if (diff > tolerance) {
                return false;
            }
        }
        
        return true;
    }
    
    // 计算分数差异
    calculateScoreDifferences(scores1, scores2) {
        const differences = {};
        const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
        
        for (const dimension of dimensions) {
            differences[dimension] = Math.abs(scores1[dimension] - scores2[dimension]);
        }
        
        return differences;
    }
    
    // 生成综合报告
    generateComprehensiveReport() {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;
        
        // 计算总体统计
        const totalTests = Object.values(this.suiteResults).reduce((sum, suite) => sum + (suite.totalTests || 0), 0);
        const totalPassed = Object.values(this.suiteResults).reduce((sum, suite) => sum + (suite.passedTests || 0), 0);
        const totalFailed = Object.values(this.suiteResults).reduce((sum, suite) => sum + (suite.failedTests || 0), 0);
        
        const comprehensiveReport = {
            summary: {
                testSuites: Object.keys(this.suiteResults).length,
                totalTests,
                totalPassed,
                totalFailed,
                overallSuccessRate: ((totalPassed / totalTests) * 100).toFixed(2) + '%',
                totalDuration: totalDuration + 'ms',
                timestamp: new Date().toISOString()
            },
            suiteResults: this.suiteResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                testRunner: 'ComprehensivePersonalityTestRunner v1.0'
            },
            recommendations: this.generateRecommendations()
        };
        
        // 保存综合报告
        const reportPath = path.join(__dirname, `comprehensive-test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(comprehensiveReport, null, 2));
        
        // 生成HTML报告
        this.generateHTMLReport(comprehensiveReport, reportPath.replace('.json', '.html'));
        
        // 打印综合摘要
        this.printComprehensiveSummary(comprehensiveReport, reportPath);
    }
    
    // 生成建议
    generateRecommendations() {
        const recommendations = [];
        
        // 基于测试结果生成建议
        if (this.suiteResults.comprehensive && this.suiteResults.comprehensive.failedTests > 0) {
            recommendations.push({
                type: 'warning',
                message: '综合计算逻辑测试中发现问题，建议检查Big Five和MBTI计算算法'
            });
        }
        
        if (this.suiteResults.api && this.suiteResults.api.failedTests > 0) {
            recommendations.push({
                type: 'warning',
                message: 'API功能测试中发现问题，建议检查端点实现和错误处理'
            });
        }
        
        if (this.suiteResults.comparison) {
            const matchingRate = (this.suiteResults.comparison.matchingResults / this.suiteResults.comparison.totalComparisons) * 100;
            if (matchingRate < 100) {
                recommendations.push({
                    type: 'critical',
                    message: `版本对比测试显示${matchingRate.toFixed(1)}%的一致性，建议检查两个版本的计算逻辑差异`
                });
            } else {
                recommendations.push({
                    type: 'success',
                    message: '两个版本的计算逻辑完全一致，测试通过'
                });
            }
        }
        
        // 性能建议
        const totalDuration = Date.now() - this.startTime;
        if (totalDuration > 30000) {
            recommendations.push({
                type: 'info',
                message: `测试总用时${totalDuration}ms，建议优化计算性能`
            });
        }
        
        return recommendations;
    }
    
    // 生成HTML报告
    generateHTMLReport(report, htmlPath) {
        const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>人格测试综合报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        h3 { color: #2980b9; }
        .summary { background: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2980b9; }
        .metric-label { color: #7f8c8d; }
        .success { color: #27ae60; }
        .warning { color: #f39c12; }
        .error { color: #e74c3c; }
        .test-suite { margin: 20px 0; padding: 20px; border: 1px solid #bdc3c7; border-radius: 8px; }
        .recommendation { padding: 15px; margin: 10px 0; border-radius: 5px; }
        .recommendation.success { background: #d5f4e6; border-left: 4px solid #27ae60; }
        .recommendation.warning { background: #fef9e7; border-left: 4px solid #f39c12; }
        .recommendation.critical { background: #fadbd8; border-left: 4px solid #e74c3c; }
        .recommendation.info { background: #ebf3fd; border-left: 4px solid #3498db; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        .progress-bar { width: 100%; height: 20px; background-color: #ecf0f1; border-radius: 10px; overflow: hidden; }
        .progress-fill { height: 100%; background-color: #3498db; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧠 人格测试系统综合验证报告</h1>
        
        <div class="summary">
            <h2>📊 测试摘要</h2>
            <div class="metric">
                <div class="metric-value">${report.summary.testSuites}</div>
                <div class="metric-label">测试套件</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">总测试数</div>
            </div>
            <div class="metric">
                <div class="metric-value success">${report.summary.totalPassed}</div>
                <div class="metric-label">通过测试</div>
            </div>
            <div class="metric">
                <div class="metric-value error">${report.summary.totalFailed}</div>
                <div class="metric-label">失败测试</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.overallSuccessRate}</div>
                <div class="metric-label">成功率</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.totalDuration}</div>
                <div class="metric-label">总用时</div>
            </div>
        </div>
        
        <h2>📋 测试套件详情</h2>
        ${this.generateSuiteDetailsHTML(report.suiteResults)}
        
        <h2>💡 建议和改进</h2>
        ${report.recommendations.map(rec => `
            <div class="recommendation ${rec.type}">
                <strong>${rec.type.toUpperCase()}:</strong> ${rec.message}
            </div>
        `).join('')}
        
        <h2>🔧 环境信息</h2>
        <table>
            <tr><th>Node.js版本</th><td>${report.environment.nodeVersion}</td></tr>
            <tr><th>平台</th><td>${report.environment.platform}</td></tr>
            <tr><th>测试运行器</th><td>${report.environment.testRunner}</td></tr>
            <tr><th>生成时间</th><td>${new Date(report.summary.timestamp).toLocaleString('zh-CN')}</td></tr>
        </table>
    </div>
</body>
</html>`;
        
        fs.writeFileSync(htmlPath, html);
    }
    
    // 生成套件详情HTML
    generateSuiteDetailsHTML(suiteResults) {
        return Object.entries(suiteResults).map(([suiteName, suite]) => {
            const successRate = suite.totalTests ? ((suite.passedTests / suite.totalTests) * 100).toFixed(1) : 0;
            
            return `
                <div class="test-suite">
                    <h3>${this.getSuiteDisplayName(suiteName)}</h3>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${successRate}%"></div>
                    </div>
                    <p>
                        总测试: ${suite.totalTests || 0} | 
                        通过: <span class="success">${suite.passedTests || 0}</span> | 
                        失败: <span class="error">${suite.failedTests || 0}</span> | 
                        成功率: ${successRate}%
                    </p>
                    ${suite.results ? this.generateFailedTestsHTML(suite.results) : ''}
                </div>
            `;
        }).join('');
    }
    
    // 获取套件显示名称
    getSuiteDisplayName(suiteName) {
        const names = {
            comprehensive: '🧪 综合计算逻辑测试',
            api: '🌐 API功能测试',
            comparison: '🔍 版本对比测试'
        };
        return names[suiteName] || suiteName;
    }
    
    // 生成失败测试HTML
    generateFailedTestsHTML(results) {
        const failedTests = results.filter(r => r.status === 'FAIL');
        if (failedTests.length === 0) return '';
        
        return `
            <details>
                <summary>查看失败的测试 (${failedTests.length})</summary>
                <ul>
                    ${failedTests.map(test => `<li class="error">${test.message}</li>`).join('')}
                </ul>
            </details>
        `;
    }
    
    // 打印综合摘要
    printComprehensiveSummary(report, reportPath) {
        console.log('\n🎯 综合测试报告摘要');
        console.log('='.repeat(80));
        console.log(`📊 测试套件数量: ${report.summary.testSuites}`);
        console.log(`🧪 总测试数量: ${report.summary.totalTests}`);
        console.log(`✅ 通过测试: ${report.summary.totalPassed}`);
        console.log(`❌ 失败测试: ${report.summary.totalFailed}`);
        console.log(`📈 总体成功率: ${report.summary.overallSuccessRate}`);
        console.log(`⏱️  总执行时间: ${report.summary.totalDuration}`);
        console.log(`📄 详细报告: ${reportPath}`);
        console.log(`🌐 HTML报告: ${reportPath.replace('.json', '.html')}`);
        console.log('='.repeat(80));
        
        // 打印各套件结果
        console.log('\n📋 各测试套件结果:');
        Object.entries(this.suiteResults).forEach(([suiteName, suite]) => {
            const successRate = suite.totalTests ? ((suite.passedTests / suite.totalTests) * 100).toFixed(1) : 0;
            const status = suite.failedTests === 0 ? '✅' : '❌';
            console.log(`  ${status} ${this.getSuiteDisplayName(suiteName)}: ${successRate}% (${suite.passedTests}/${suite.totalTests})`);
        });
        
        // 打印建议
        if (report.recommendations.length > 0) {
            console.log('\n💡 建议和改进:');
            report.recommendations.forEach(rec => {
                const icon = rec.type === 'success' ? '✅' : rec.type === 'critical' ? '🚨' : rec.type === 'warning' ? '⚠️' : 'ℹ️';
                console.log(`  ${icon} ${rec.message}`);
            });
        }
        
        console.log('\n🎉 测试完成！');
    }
    
    // 生成错误报告
    generateErrorReport(error) {
        const errorReport = {
            error: {
                message: error.message,
                stack: error.stack,
                timestamp: new Date().toISOString()
            },
            partialResults: this.suiteResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform
            }
        };
        
        const errorPath = path.join(__dirname, `test-error-report-${Date.now()}.json`);
        fs.writeFileSync(errorPath, JSON.stringify(errorReport, null, 2));
        
        console.log('\n❌ 测试执行过程中发生错误');
        console.log(`错误信息: ${error.message}`);
        console.log(`错误报告: ${errorPath}`);
    }
}

// 运行所有测试
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTestSuites().catch(console.error);
}

module.exports = TestRunner;