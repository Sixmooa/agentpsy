/**
 * 对比静态文件版本和Supabase版本的得分计算差异
 */

const https = require('https');
const { URL } = require('url');
const fs = require('fs');
const path = require('path');

// 加载静态文件
const calculatorCode = fs.readFileSync(path.join(__dirname, '../static/js/calculator.js'), 'utf8');
const dataCode = fs.readFileSync(path.join(__dirname, '../static/js/data.js'), 'utf8');

// 在Node.js环境中执行静态代码
eval(calculatorCode);
eval(dataCode);

// 获取PersonalityCalculator类
const PersonalityCalculator = global.PersonalityCalculator;
const { QUESTIONS_EN, QUESTIONS_ZH, MBTI_DETAILS, BELBIN_ROLES, CAREER_SUGGESTIONS, CAREER_SUGGESTIONS_EN } = global;

// Supabase配置
const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

class ScoreComparisonAnalyzer {
    constructor() {
        this.calculator = new PersonalityCalculator();
        this.comparisonResults = [];
    }

    /**
     * 发送HTTP请求到Supabase API
     */
    async makeRequest(url, options = {}) {
        return new Promise((resolve, reject) => {
            const urlObj = new URL(url);
            const requestOptions = {
                hostname: urlObj.hostname,
                path: urlObj.pathname + urlObj.search,
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY,
                    ...options.headers
                }
            };

            const req = https.request(requestOptions, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        resolve({ status: res.statusCode, data: result });
                    } catch (error) {
                        reject(error);
                    }
                });
            });

            req.on('error', reject);

            if (options.body) {
                req.write(JSON.stringify(options.body));
            }

            req.end();
        });
    }

    /**
     * 获取Supabase版本的问题
     */
    async getSupabaseQuestions(language = 'en') {
        try {
            const response = await this.makeRequest(
                `${SUPABASE_URL}/functions/v1/personality-api/questions?language=${language}`
            );

            if (response.status !== 200 || !response.data.success) {
                throw new Error(`获取Supabase问题失败: ${response.data?.error || '未知错误'}`);
            }

            return response.data.data;
        } catch (error) {
            console.error('获取Supabase问题失败:', error.message);
            throw error;
        }
    }

    /**
     * 提交答案到Supabase并获取结果
     */
    async submitToSupabase(answers, language = 'en') {
        try {
            const response = await this.makeRequest(
                `${SUPABASE_URL}/functions/v1/personality-api/submit-test`,
                {
                    method: 'POST',
                    body: {
                        answers,
                        language,
                        saveResult: false
                    }
                }
            );

            if (response.status !== 200 || !response.data.success) {
                throw new Error(`提交Supabase失败: ${response.data?.error || '未知错误'}`);
            }

            return response.data.report;
        } catch (error) {
            console.error('提交Supabase失败:', error.message);
            throw error;
        }
    }

    /**
     * 生成测试答案
     */
    generateTestAnswers(pattern) {
        const answers = {};
        const questions = QUESTIONS_EN;

        questions.forEach(question => {
            switch (pattern) {
                case 'extreme_high':
                    answers[question.id] = 5;
                    break;
                case 'extreme_low':
                    answers[question.id] = 1;
                    break;
                case 'neutral':
                    answers[question.id] = 3;
                    break;
                case 'random':
                    answers[question.id] = Math.floor(Math.random() * 5) + 1;
                    break;
                case 'high_openness':
                    answers[question.id] = question.dimension === 'openness' ? 5 :
                                       question.dimension === 'neuroticism' ? 2 : 3;
                    break;
                case 'high_extraversion':
                    answers[question.id] = question.dimension === 'extraversion' ? 5 :
                                       question.dimension === 'neuroticism' ? 2 : 3;
                    break;
                default:
                    answers[question.id] = 3;
            }
        });

        return answers;
    }

    /**
     * 计算静态版本的结果
     */
    calculateStaticResult(answers, language = 'en') {
        const questions = language === 'en' ? QUESTIONS_EN : QUESTIONS_ZH;
        return this.calculator.generateReport(answers, questions, language);
    }

    /**
     * 对比两个结果对象的差异
     */
    compareResults(staticResult, supabaseResult, testAnswers) {
        const comparison = {
            testName: testAnswers.testName || 'unknown',
            answers: testAnswers.answers,
            differences: [],
            staticBigFive: staticResult.bigFiveScores,
            supabaseBigFive: supabaseResult.bigFiveScores,
            staticMBTI: staticResult.mbtiResult,
            supabaseMBTI: supabaseResult.mbtiResult,
            isIdentical: true
        };

        // 对比大五人格得分
        const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
        dimensions.forEach(dimension => {
            const staticScore = staticResult.bigFiveScores[dimension];
            const supabaseScore = supabaseResult.bigFiveScores[dimension];
            const difference = Math.abs(staticScore - supabaseScore);

            if (difference > 0.01) { // 允许微小的浮点数误差
                comparison.differences.push({
                    type: 'big_five',
                    dimension,
                    staticScore,
                    supabaseScore,
                    difference,
                    percentDifference: (difference / Math.max(staticScore, supabaseScore, 1)) * 100
                });
                comparison.isIdentical = false;
            }
        });

        // 对比MBTI类型
        if (staticResult.mbtiResult.type !== supabaseResult.mbtiResult.type) {
            comparison.differences.push({
                type: 'mbti_type',
                staticType: staticResult.mbtiResult.type,
                supabaseType: supabaseResult.mbtiResult.type
            });
            comparison.isIdentical = false;
        }

        // 对比MBTI维度
        if (staticResult.mbtiResult.dimensions && supabaseResult.mbtiResult.dimensions) {
            ['EI', 'SN', 'TF', 'JP'].forEach(dimension => {
                const staticDim = staticResult.mbtiResult.dimensions[dimension];
                const supabaseDim = supabaseResult.mbtiResult.dimensions[dimension];

                if (staticDim && supabaseDim && staticDim.type !== supabaseDim) {
                    comparison.differences.push({
                        type: 'mbti_dimension',
                        dimension,
                        staticType: staticDim.type,
                        supabaseType: supabaseDim
                    });
                    comparison.isIdentical = false;
                }
            });
        }

        return comparison;
    }

    /**
     * 运行完整的对比测试
     */
    async runComparisonTest() {
        console.log('开始运行静态文件版本与Supabase版本的对比测试...\n');

        const testPatterns = [
            { name: 'extreme_high', description: '所有答案最高分' },
            { name: 'extreme_low', description: '所有答案最低分' },
            { name: 'neutral', description: '所有答案中性分' },
            { name: 'high_openness', description: '高开放性模式' },
            { name: 'high_extraversion', description: '高外向性模式' },
            { name: 'random_1', description: '随机测试1' },
            { name: 'random_2', description: '随机测试2' },
            { name: 'random_3', description: '随机测试3' }
        ];

        console.log('获取Supabase问题数据...');
        const supabaseQuestions = await this.getSupabaseQuestions('en');
        console.log(`获取到 ${supabaseQuestions.length} 个Supabase问题\n`);

        for (let i = 0; i < testPatterns.length; i++) {
            const pattern = testPatterns[i];
            console.log(`运行测试 ${i + 1}/${testPatterns.length}: ${pattern.description}`);

            try {
                // 生成测试答案
                const answers = this.generateTestAnswers(pattern.name);
                const testAnswers = {
                    testName: pattern.name,
                    answers: answers
                };

                // 计算静态版本结果
                console.log('  计算静态版本结果...');
                const staticResult = this.calculateStaticResult(answers, 'en');

                // 获取Supabase版本结果
                console.log('  获取Supabase版本结果...');
                const supabaseResult = await this.submitToSupabase(answers, 'en');

                // 对比结果
                const comparison = this.compareResults(staticResult, supabaseResult, testAnswers);
                this.comparisonResults.push(comparison);

                if (comparison.isIdentical) {
                    console.log('  ✓ 结果完全一致');
                } else {
                    console.log(`  ✗ 发现 ${comparison.differences.length} 个差异`);
                    comparison.differences.forEach(diff => {
                        console.log(`    - ${diff.type}: ${JSON.stringify(diff)}`);
                    });
                }

            } catch (error) {
                console.error(`  测试失败: ${error.message}`);
                this.comparisonResults.push({
                    testName: pattern.name,
                    error: error.message,
                    isIdentical: false
                });
            }

            console.log('');
        }

        return this.comparisonResults;
    }

    /**
     * 生成分析报告
     */
    generateReport() {
        const totalTests = this.comparisonResults.length;
        const identicalTests = this.comparisonResults.filter(r => r.isIdentical).length;
        const differentTests = totalTests - identicalTests;
        const errorTests = this.comparisonResults.filter(r => r.error).length;

        const report = {
            summary: {
                totalTests,
                identicalTests,
                differentTests,
                errorTests,
                consistencyRate: (identicalTests / totalTests * 100).toFixed(2)
            },
            differences: [],
            details: this.comparisonResults
        };

        // 收集所有差异类型
        this.comparisonResults.forEach(result => {
            if (result.differences) {
                result.differences.forEach(diff => {
                    report.differences.push({
                        testName: result.testName,
                        ...diff
                    });
                });
            }
        });

        return report;
    }

    /**
     * 保存报告到文件
     */
    async saveReport(filename = 'score-comparison-report.json') {
        const report = this.generateReport();
        const reportContent = {
            metadata: {
                generatedAt: new Date().toISOString(),
                analyzer: 'ScoreComparisonAnalyzer',
                version: '1.0'
            },
            ...report
        };

        fs.writeFileSync(filename, JSON.stringify(reportContent, null, 2));
        console.log(`对比报告已保存到: ${filename}`);

        return report;
    }

    /**
     * 打印详细报告
     */
    printDetailedReport() {
        const report = this.generateReport();

        console.log('\n' + '='.repeat(80));
        console.log('静态文件版本 vs Supabase版本 得分对比分析报告');
        console.log('='.repeat(80));

        console.log('\n📊 测试概要:');
        console.log(`总测试数: ${report.summary.totalTests}`);
        console.log(`完全一致: ${report.summary.identicalTests}`);
        console.log(`存在差异: ${report.summary.differentTests}`);
        console.log(`测试错误: ${report.summary.errorTests}`);
        console.log(`一致性率: ${report.summary.consistencyRate}%`);

        if (report.differences.length > 0) {
            console.log('\n🔍 差异详情:');

            // 按差异类型分组
            const differencesByType = {};
            report.differences.forEach(diff => {
                if (!differencesByType[diff.type]) {
                    differencesByType[diff.type] = [];
                }
                differencesByType[diff.type].push(diff);
            });

            Object.entries(differencesByType).forEach(([type, diffs]) => {
                console.log(`\n${type.toUpperCase()} 差异 (${diffs.length}个):`);
                diffs.forEach(diff => {
                    if (type === 'big_five') {
                        console.log(`  - ${diff.dimension}: 静态=${diff.staticScore.toFixed(2)}, Supabase=${diff.supabaseScore.toFixed(2)}, 差异=${diff.difference.toFixed(2)} (${diff.percentDifference.toFixed(1)}%)`);
                    } else if (type === 'mbti_type') {
                        console.log(`  - MBTI类型: 静态=${diff.staticType}, Supabase=${diff.supabaseType}`);
                    } else if (type === 'mbti_dimension') {
                        console.log(`  - MBTI维度${diff.dimension}: 静态=${diff.staticType}, Supabase=${diff.supabaseType}`);
                    }
                });
            });
        }

        console.log('\n' + '='.repeat(80));
    }
}

// 主函数
async function runComparison() {
    const analyzer = new ScoreComparisonAnalyzer();

    try {
        await analyzer.runComparisonTest();
        await analyzer.saveReport();
        analyzer.printDetailedReport();
    } catch (error) {
        console.error('对比测试失败:', error);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    runComparison();
}

module.exports = ScoreComparisonAnalyzer;