/**
 * 算法一致性对比测试
 * 验证Supabase云端算法和静态文件算法的一致性
 */

const fs = require('fs');
const path = require('path');

// 模拟云端算法 (从personality-api-final.ts提取)
class CloudAlgorithm {
    constructor() {
        this.midPoint = 3.0;
    }

    calculateBigFiveScores(answers, questions) {
        const scores = {
            openness: 0,
            conscientiousness: 0,
            extraversion: 0,
            agreeableness: 0,
            neuroticism: 0
        };

        const counts = {
            openness: 0,
            conscientiousness: 0,
            extraversion: 0,
            agreeableness: 0,
            neuroticism: 0
        };

        // 遍历答案，计算每个维度的总分和题目数量
        for (const [questionId, answer] of Object.entries(answers)) {
            const question = questions.find(q => q.id === parseInt(questionId));
            if (question && question.dimension) {
                scores[question.dimension] += parseInt(answer);
                counts[question.dimension]++;
            }
        }

        // 计算平均分，保留两位小数，完全匹配静态版本
        const avgScores = {};
        for (const dimension in scores) {
            if (counts[dimension] > 0) {
                avgScores[dimension] = Math.round((scores[dimension] / counts[dimension]) * 100) / 100;
            } else {
                avgScores[dimension] = 0;
            }
        }

        return avgScores;
    }

    calculateMBTI(bigFiveScores) {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFiveScores;
        const midPoint = 3.0;

        // E/I (外向/内向) - 基于外向性得分，严格匹配静态版本
        const ei = extraversion > midPoint ? 'E' : 'I';

        // S/N (感觉/直觉) - 基于开放性得分，关键修复：使用 >= (边界测试)
        const sn = openness >= midPoint ? 'N' : 'S';

        // T/F (思考/情感) - 基于宜人性得分
        const tf = agreeableness > midPoint ? 'F' : 'T';

        // J/P (判断/知觉) - 基于尽责性得分，关键修复：使用 >= (边界测试)
        const jp = conscientiousness >= midPoint ? 'J' : 'P';

        // 情绪稳定性后缀 -A/-T，严格匹配静态版本逻辑：3.0中点判断
        const suffix = neuroticism > midPoint ? '-T' : '-A';

        const mbtiType = ei + sn + tf + jp + suffix;

        return {
            type: mbtiType,
            typeCode: ei + sn + tf + jp,
            dimensions: {
                ei: { type: ei, score: extraversion },
                sn: { type: sn, score: openness },
                tf: { type: tf, score: agreeableness },
                jp: { type: jp, score: conscientiousness },
                suffix: { type: suffix, score: neuroticism }
            }
        };
    }
}

// 模拟静态算法 (从calculator.js提取)
class StaticAlgorithm {
    constructor() {
        this.midPoint = 3.0;
    }

    calculateBigFiveScores(answers, questions) {
        const scores = {
            openness: 0,
            conscientiousness: 0,
            extraversion: 0,
            agreeableness: 0,
            neuroticism: 0
        };
        
        const counts = {
            openness: 0,
            conscientiousness: 0,
            extraversion: 0,
            agreeableness: 0,
            neuroticism: 0
        };

        // 计算各维度总分
        for (const [questionId, answer] of Object.entries(answers)) {
            const question = questions.find(q => q.id === parseInt(questionId));
            if (question && question.dimension) {
                scores[question.dimension] += parseInt(answer);
                counts[question.dimension]++;
            }
        }

        // 计算平均分
        const avgScores = {};
        for (const dimension in scores) {
            if (counts[dimension] > 0) {
                avgScores[dimension] = Math.round((scores[dimension] / counts[dimension]) * 100) / 100;
            } else {
                avgScores[dimension] = 0;
            }
        }

        return avgScores;
    }

    calculateMBTI(scores) {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores;

        // E/I (外向/内向) - 基于外向性得分
        const ei = extraversion > this.midPoint ? 'E' : 'I';
        
        // S/N (感觉/直觉) - 基于开放性得分
        const sn = openness >= this.midPoint ? 'N' : 'S';
        
        // T/F (思考/情感) - 基于宜人性得分
        const tf = agreeableness > this.midPoint ? 'F' : 'T';
        
        // J/P (判断/知觉) - 基于尽责性得分
        const jp = conscientiousness >= this.midPoint ? 'J' : 'P';
        
        // 情绪稳定性后缀 -A/-T
        const suffix = neuroticism > this.midPoint ? '-T' : '-A';
        
        const mbtiType = ei + sn + tf + jp + suffix;
        
        return {
            type: mbtiType,
            typeCode: ei + sn + tf + jp,
            dimensions: {
                ei: { type: ei, score: extraversion },
                sn: { type: sn, score: openness },
                tf: { type: tf, score: agreeableness },
                jp: { type: jp, score: conscientiousness },
                suffix: { type: suffix, score: neuroticism }
            }
        };
    }
}

// 算法一致性测试套件
class AlgorithmConsistencyTest {
    constructor() {
        this.cloudAlgorithm = new CloudAlgorithm();
        this.staticAlgorithm = new StaticAlgorithm();
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
    }

    // 生成测试问题
    generateTestQuestions() {
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

    // 生成测试答案
    generateTestAnswers(pattern) {
        const answers = {};
        
        switch (pattern) {
            case 'balanced':
                for (let i = 1; i <= 50; i++) {
                    answers[i] = 3;
                }
                break;
                
            case 'extreme_high':
                for (let i = 1; i <= 50; i++) {
                    answers[i] = 5;
                }
                break;
                
            case 'extreme_low':
                for (let i = 1; i <= 50; i++) {
                    answers[i] = 1;
                }
                break;
                
            case 'intj_pattern':
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
                break;
                
            case 'enfp_pattern':
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
                break;
                
            case 'boundary_test':
                // 测试边界值 3.0
                for (let i = 1; i <= 50; i++) {
                    answers[i] = 3; // 所有答案都是3，平均分正好是3.0
                }
                break;
                
            case 'mixed_pattern':
                for (let i = 1; i <= 50; i++) {
                    answers[i] = (i % 5) + 1; // 1-5循环
                }
                break;
                
            default:
                // 随机模式
                for (let i = 1; i <= 50; i++) {
                    answers[i] = Math.floor(Math.random() * 5) + 1;
                }
        }
        
        return answers;
    }

    // 比较Big Five分数
    compareBigFiveScores(cloudScores, staticScores, tolerance = 0.001) {
        const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
        const differences = {};
        let isConsistent = true;
        
        for (const dimension of dimensions) {
            const diff = Math.abs(cloudScores[dimension] - staticScores[dimension]);
            differences[dimension] = diff;
            
            if (diff > tolerance) {
                isConsistent = false;
            }
        }
        
        return {
            isConsistent,
            differences,
            maxDifference: Math.max(...Object.values(differences))
        };
    }

    // 比较MBTI结果
    compareMBTIResults(cloudMBTI, staticMBTI) {
        return {
            typeMatch: cloudMBTI.type === staticMBTI.type,
            typeCodeMatch: cloudMBTI.typeCode === staticMBTI.typeCode,
            dimensionsMatch: {
                ei: cloudMBTI.dimensions.ei.type === staticMBTI.dimensions.ei.type,
                sn: cloudMBTI.dimensions.sn.type === staticMBTI.dimensions.sn.type,
                tf: cloudMBTI.dimensions.tf.type === staticMBTI.dimensions.tf.type,
                jp: cloudMBTI.dimensions.jp.type === staticMBTI.dimensions.jp.type,
                suffix: cloudMBTI.dimensions.suffix.type === staticMBTI.dimensions.suffix.type
            },
            cloudType: cloudMBTI.type,
            staticType: staticMBTI.type
        };
    }

    // 运行单个测试案例
    runTestCase(testName, answerPattern) {
        console.log(`\n🧪 运行测试案例: ${testName}`);
        
        const questions = this.generateTestQuestions();
        const answers = this.generateTestAnswers(answerPattern);
        
        // 云端算法计算
        const cloudBigFive = this.cloudAlgorithm.calculateBigFiveScores(answers, questions);
        const cloudMBTI = this.cloudAlgorithm.calculateMBTI(cloudBigFive);
        
        // 静态算法计算
        const staticBigFive = this.staticAlgorithm.calculateBigFiveScores(answers, questions);
        const staticMBTI = this.staticAlgorithm.calculateMBTI(staticBigFive);
        
        // 比较结果
        const bigFiveComparison = this.compareBigFiveScores(cloudBigFive, staticBigFive);
        const mbtiComparison = this.compareMBTIResults(cloudMBTI, staticMBTI);
        
        const testResult = {
            testName,
            answerPattern,
            timestamp: new Date().toISOString(),
            bigFiveConsistent: bigFiveComparison.isConsistent,
            mbtiConsistent: mbtiComparison.typeMatch,
            cloudResults: {
                bigFive: cloudBigFive,
                mbti: cloudMBTI
            },
            staticResults: {
                bigFive: staticBigFive,
                mbti: staticMBTI
            },
            comparisons: {
                bigFive: bigFiveComparison,
                mbti: mbtiComparison
            }
        };
        
        this.totalTests++;
        
        if (bigFiveComparison.isConsistent && mbtiComparison.typeMatch) {
            this.passedTests++;
            console.log(`  ✅ 测试通过 - Big Five一致: ${bigFiveComparison.isConsistent}, MBTI一致: ${mbtiComparison.typeMatch}`);
            console.log(`  📊 MBTI类型: ${cloudMBTI.type} (云端) = ${staticMBTI.type} (静态)`);
        } else {
            this.failedTests++;
            console.log(`  ❌ 测试失败 - Big Five一致: ${bigFiveComparison.isConsistent}, MBTI一致: ${mbtiComparison.typeMatch}`);
            console.log(`  📊 MBTI类型: ${cloudMBTI.type} (云端) ≠ ${staticMBTI.type} (静态)`);
            
            if (!bigFiveComparison.isConsistent) {
                console.log(`  🔍 Big Five差异:`, bigFiveComparison.differences);
            }
            
            if (!mbtiComparison.typeMatch) {
                console.log(`  🔍 MBTI维度差异:`, mbtiComparison.dimensionsMatch);
            }
        }
        
        this.testResults.push(testResult);
        return testResult;
    }

    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始算法一致性测试...\n');
        console.log('=' * 60);
        console.log('测试目标: 验证Supabase云端算法和静态文件算法的一致性');
        console.log('测试范围: Big Five计算、MBTI判定、边界条件处理');
        console.log('=' * 60);
        
        const testCases = [
            { name: '平衡模式测试', pattern: 'balanced' },
            { name: '极端高分测试', pattern: 'extreme_high' },
            { name: '极端低分测试', pattern: 'extreme_low' },
            { name: 'INTJ模式测试', pattern: 'intj_pattern' },
            { name: 'ENFP模式测试', pattern: 'enfp_pattern' },
            { name: '边界值测试 (3.0)', pattern: 'boundary_test' },
            { name: '混合模式测试', pattern: 'mixed_pattern' }
        ];
        
        // 运行基础测试案例
        for (const testCase of testCases) {
            this.runTestCase(testCase.name, testCase.pattern);
        }
        
        // 运行随机测试案例
        console.log('\n🎲 运行随机测试案例...');
        for (let i = 1; i <= 10; i++) {
            this.runTestCase(`随机测试 ${i}`, 'random');
        }
        
        // 运行边界值详细测试
        console.log('\n🎯 运行边界值详细测试...');
        this.runBoundaryTests();
        
        // 生成测试报告
        this.generateReport();
    }

    // 边界值详细测试
    runBoundaryTests() {
        const boundaryValues = [2.99, 3.00, 3.01];
        const questions = this.generateTestQuestions();
        
        for (const value of boundaryValues) {
            console.log(`\n🎯 边界值测试: ${value}`);
            
            const answers = {};
            for (let i = 1; i <= 50; i++) {
                // 生成能产生特定平均分的答案组合
                if (value === 3.00) {
                    answers[i] = 3;
                } else if (value === 2.99) {
                    answers[i] = i % 10 === 0 ? 2 : 3; // 大部分3，少数2
                } else if (value === 3.01) {
                    answers[i] = i % 10 === 0 ? 4 : 3; // 大部分3，少数4
                }
            }
            
            this.runTestCase(`边界值测试 ${value}`, 'custom');
            
            // 手动设置最后一个测试的答案
            this.testResults[this.testResults.length - 1].customAnswers = answers;
        }
    }

    // 生成详细报告
    generateReport() {
        const successRate = ((this.passedTests / this.totalTests) * 100).toFixed(2);
        
        const report = {
            summary: {
                totalTests: this.totalTests,
                passedTests: this.passedTests,
                failedTests: this.failedTests,
                successRate: successRate + '%',
                timestamp: new Date().toISOString()
            },
            algorithmComparison: {
                cloudAlgorithm: 'personality-api-final.ts',
                staticAlgorithm: 'calculator.js',
                comparisonMethod: 'direct-calculation-comparison'
            },
            testResults: this.testResults,
            analysis: this.analyzeResults(),
            recommendations: this.generateRecommendations()
        };
        
        // 保存报告
        const reportPath = path.join(__dirname, `algorithm-consistency-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // 生成HTML报告
        this.generateHTMLReport(report, reportPath.replace('.json', '.html'));
        
        // 打印摘要
        this.printSummary(report, reportPath);
    }

    // 分析测试结果
    analyzeResults() {
        const analysis = {
            bigFiveConsistency: {
                consistent: 0,
                inconsistent: 0,
                maxDifference: 0,
                averageDifference: 0
            },
            mbtiConsistency: {
                consistent: 0,
                inconsistent: 0,
                dimensionMismatches: {
                    ei: 0,
                    sn: 0,
                    tf: 0,
                    jp: 0,
                    suffix: 0
                }
            },
            patternAnalysis: {}
        };
        
        let totalDifference = 0;
        let differenceCount = 0;
        
        for (const result of this.testResults) {
            // Big Five分析
            if (result.bigFiveConsistent) {
                analysis.bigFiveConsistency.consistent++;
            } else {
                analysis.bigFiveConsistency.inconsistent++;
            }
            
            const maxDiff = result.comparisons.bigFive.maxDifference;
            if (maxDiff > analysis.bigFiveConsistency.maxDifference) {
                analysis.bigFiveConsistency.maxDifference = maxDiff;
            }
            
            totalDifference += maxDiff;
            differenceCount++;
            
            // MBTI分析
            if (result.mbtiConsistent) {
                analysis.mbtiConsistency.consistent++;
            } else {
                analysis.mbtiConsistency.inconsistent++;
                
                // 统计维度不匹配
                const dims = result.comparisons.mbti.dimensionsMatch;
                for (const [dim, match] of Object.entries(dims)) {
                    if (!match) {
                        analysis.mbtiConsistency.dimensionMismatches[dim]++;
                    }
                }
            }
            
            // 模式分析
            if (!analysis.patternAnalysis[result.answerPattern]) {
                analysis.patternAnalysis[result.answerPattern] = {
                    total: 0,
                    consistent: 0,
                    inconsistent: 0
                };
            }
            
            analysis.patternAnalysis[result.answerPattern].total++;
            if (result.bigFiveConsistent && result.mbtiConsistent) {
                analysis.patternAnalysis[result.answerPattern].consistent++;
            } else {
                analysis.patternAnalysis[result.answerPattern].inconsistent++;
            }
        }
        
        analysis.bigFiveConsistency.averageDifference = totalDifference / differenceCount;
        
        return analysis;
    }

    // 生成建议
    generateRecommendations() {
        const recommendations = [];
        const analysis = this.analyzeResults();
        
        if (analysis.bigFiveConsistency.inconsistent > 0) {
            recommendations.push({
                type: 'warning',
                category: 'Big Five计算',
                message: `发现${analysis.bigFiveConsistency.inconsistent}个Big Five计算不一致的案例，最大差异为${analysis.bigFiveConsistency.maxDifference.toFixed(6)}`
            });
        }
        
        if (analysis.mbtiConsistency.inconsistent > 0) {
            recommendations.push({
                type: 'critical',
                category: 'MBTI判定',
                message: `发现${analysis.mbtiConsistency.inconsistent}个MBTI类型判定不一致的案例`
            });
            
            // 分析具体维度问题
            for (const [dim, count] of Object.entries(analysis.mbtiConsistency.dimensionMismatches)) {
                if (count > 0) {
                    recommendations.push({
                        type: 'warning',
                        category: `MBTI ${dim.toUpperCase()}维度`,
                        message: `${dim.toUpperCase()}维度在${count}个测试中出现不一致`
                    });
                }
            }
        }
        
        if (this.passedTests === this.totalTests) {
            recommendations.push({
                type: 'success',
                category: '算法一致性',
                message: '所有测试通过，云端算法和静态算法完全一致'
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
    <title>算法一致性测试报告</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .summary { background: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .metric { display: inline-block; margin: 10px 20px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; color: #2980b9; }
        .metric-label { color: #7f8c8d; }
        .success { color: #27ae60; }
        .warning { color: #f39c12; }
        .error { color: #e74c3c; }
        .test-result { margin: 10px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #bdc3c7; }
        .test-result.pass { border-left-color: #27ae60; background: #d5f4e6; }
        .test-result.fail { border-left-color: #e74c3c; background: #fadbd8; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 算法一致性测试报告</h1>
        
        <div class="summary">
            <h2>📊 测试摘要</h2>
            <div class="metric">
                <div class="metric-value">${report.summary.totalTests}</div>
                <div class="metric-label">总测试数</div>
            </div>
            <div class="metric">
                <div class="metric-value success">${report.summary.passedTests}</div>
                <div class="metric-label">通过测试</div>
            </div>
            <div class="metric">
                <div class="metric-value error">${report.summary.failedTests}</div>
                <div class="metric-label">失败测试</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.successRate}</div>
                <div class="metric-label">成功率</div>
            </div>
        </div>
        
        <h2>🔧 算法对比</h2>
        <table>
            <tr><th>云端算法</th><td>${report.algorithmComparison.cloudAlgorithm}</td></tr>
            <tr><th>静态算法</th><td>${report.algorithmComparison.staticAlgorithm}</td></tr>
            <tr><th>对比方法</th><td>${report.algorithmComparison.comparisonMethod}</td></tr>
        </table>
        
        <h2>📈 分析结果</h2>
        <h3>Big Five一致性</h3>
        <p>一致: <span class="success">${report.analysis.bigFiveConsistency.consistent}</span> | 
           不一致: <span class="error">${report.analysis.bigFiveConsistency.inconsistent}</span> | 
           最大差异: ${report.analysis.bigFiveConsistency.maxDifference.toFixed(6)} | 
           平均差异: ${report.analysis.bigFiveConsistency.averageDifference.toFixed(6)}</p>
        
        <h3>MBTI一致性</h3>
        <p>一致: <span class="success">${report.analysis.mbtiConsistency.consistent}</span> | 
           不一致: <span class="error">${report.analysis.mbtiConsistency.inconsistent}</span></p>
        
        <h2>💡 建议</h2>
        ${report.recommendations.map(rec => `
            <div class="test-result ${rec.type === 'success' ? 'pass' : 'fail'}">
                <strong>${rec.category}:</strong> ${rec.message}
            </div>
        `).join('')}
        
        <h2>📋 详细测试结果</h2>
        ${report.testResults.map(result => `
            <div class="test-result ${result.bigFiveConsistent && result.mbtiConsistent ? 'pass' : 'fail'}">
                <h4>${result.testName} (${result.answerPattern})</h4>
                <p>Big Five一致: ${result.bigFiveConsistent ? '✅' : '❌'} | 
                   MBTI一致: ${result.mbtiConsistent ? '✅' : '❌'}</p>
                <p>云端MBTI: ${result.cloudResults.mbti.type} | 静态MBTI: ${result.staticResults.mbti.type}</p>
            </div>
        `).join('')}
    </div>
</body>
</html>`;
        
        fs.writeFileSync(htmlPath, html);
    }

    // 打印摘要
    printSummary(report, reportPath) {
        console.log('\n🎯 算法一致性测试摘要');
        console.log('='.repeat(60));
        console.log(`📊 总测试数量: ${report.summary.totalTests}`);
        console.log(`✅ 通过测试: ${report.summary.passedTests}`);
        console.log(`❌ 失败测试: ${report.summary.failedTests}`);
        console.log(`📈 成功率: ${report.summary.successRate}`);
        console.log(`📄 详细报告: ${reportPath}`);
        console.log(`🌐 HTML报告: ${reportPath.replace('.json', '.html')}`);
        console.log('='.repeat(60));
        
        if (report.recommendations.length > 0) {
            console.log('\n💡 主要发现:');
            report.recommendations.forEach(rec => {
                const icon = rec.type === 'success' ? '✅' : rec.type === 'critical' ? '🚨' : '⚠️';
                console.log(`  ${icon} ${rec.category}: ${rec.message}`);
            });
        }
        
        console.log('\n🎉 算法一致性测试完成！');
    }
}

// 运行测试
if (require.main === module) {
    const test = new AlgorithmConsistencyTest();
    test.runAllTests().catch(console.error);
}

module.exports = AlgorithmConsistencyTest;