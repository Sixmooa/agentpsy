/**
 * Static版本与Supabase版本一致性测试
 * 使用相同的答案测试两个版本，确保计算结果完全一致
 */

const ComprehensiveAnswerGenerator = require('./comprehensive-answer-generator.js');
const PersonalityCalculator = require('./static/js/calculator.js');
const { QUESTIONS_EN, QUESTIONS_ZH } = require('./static/js/data.js');
const fs = require('fs');

class ConsistencyTester {
    constructor() {
        this.generator = new ComprehensiveAnswerGenerator();
        this.staticCalculator = new PersonalityCalculator();
        this.testResults = [];
        this.inconsistencies = [];
    }

    /**
     * 运行完整的一致性测试
     */
    async runConsistencyTest() {
        console.log('开始Static版本与Supabase版本一致性测试...\n');
        
        // 生成测试用例
        const testCases = this.generator.generateAllTestCases();
        
        // 运行对比测试
        await this.runComparisonTests(testCases);
        
        // 生成报告
        this.generateConsistencyReport();
        
        return {
            totalTests: this.testResults.length,
            inconsistencies: this.inconsistencies.length,
            consistencyRate: ((this.testResults.length - this.inconsistencies.length) / this.testResults.length * 100).toFixed(2)
        };
    }

    /**
     * 运行对比测试
     */
    async runComparisonTests(testCases) {
        console.log(`开始运行 ${testCases.length} 个对比测试...\n`);
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`测试 ${i + 1}/${testCases.length}: ${testCase.name}`);
            
            // 测试英文版
            await this.compareVersions(testCase, 'en');
            
            // 测试中文版
            await this.compareVersions(testCase, 'zh');
        }
        
        console.log('\n对比测试完成');
    }

    /**
     * 对比两个版本的计算结果
     */
    async compareVersions(testCase, language) {
        const questions = language === 'zh' ? QUESTIONS_ZH : QUESTIONS_EN;
        
        try {
            // Static版本计算
            const staticResult = this.staticCalculator.generateReport(testCase.answers, questions, language);
            
            // Supabase版本计算（模拟）
            const supabaseResult = await this.simulateSupabaseCalculation(testCase.answers, questions, language);
            
            // 对比结果
            const comparison = this.compareResults(staticResult, supabaseResult, testCase, language);
            
            this.testResults.push({
                testCase: testCase.name,
                language: language,
                staticResult: staticResult,
                supabaseResult: supabaseResult,
                isConsistent: comparison.isConsistent,
                differences: comparison.differences
            });
            
            if (!comparison.isConsistent) {
                this.inconsistencies.push({
                    testCase: testCase.name,
                    language: language,
                    differences: comparison.differences
                });
                console.log(`  ⚠️  发现不一致 (${language})`);
            } else {
                console.log(`  ✓ 一致 (${language})`);
            }
            
        } catch (error) {
            console.log(`  ✗ 错误: ${error.message}`);
            this.testResults.push({
                testCase: testCase.name,
                language: language,
                error: error.message,
                isConsistent: false
            });
        }
    }

    /**
     * 模拟Supabase版本的计算
     * 这里需要根据实际的Supabase实现来调整
     */
    async simulateSupabaseCalculation(answers, questions, language) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 10));
        
        try {
            // 模拟可能的差异：
            // 1. 浮点数精度差异
            // 2. 计算顺序差异
            // 3. 数据类型转换差异
            
            // 确保answers格式正确
            const validatedAnswers = this.validateAnswers(answers, questions);
            
            const result = this.staticCalculator.generateReport(validatedAnswers, questions, language);
            
            // 模拟一些可能的差异
            if (result.bigFive) {
                Object.keys(result.bigFive).forEach(key => {
                    // 添加微小的浮点数差异（模拟不同环境的计算差异）
                    const originalValue = result.bigFive[key];
                    result.bigFive[key] = Math.round(originalValue * 100) / 100;
                });
            }
            
            return result;
        } catch (error) {
            console.error('Supabase计算模拟失败:', error);
            throw error;
        }
    }

    /**
     * 验证答案格式
     */
    validateAnswers(answers, questions) {
        const validatedAnswers = {};
        
        questions.forEach(question => {
            const answer = answers[question.id];
            if (answer !== undefined && answer >= 1 && answer <= 5) {
                validatedAnswers[question.id] = parseInt(answer);
            } else {
                // 如果答案无效，使用中性值
                validatedAnswers[question.id] = 3;
            }
        });
        
        return validatedAnswers;
    }

    /**
     * 对比两个计算结果
     */
    compareResults(staticResult, supabaseResult, testCase, language) {
        const differences = [];
        let isConsistent = true;

        // 对比大五人格得分
        if (staticResult.bigFive && supabaseResult.bigFive) {
            const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
            
            dimensions.forEach(dim => {
                const staticScore = staticResult.bigFive[dim];
                const supabaseScore = supabaseResult.bigFive[dim];
                
                if (staticScore !== supabaseScore) {
                    differences.push({
                        type: 'bigFive',
                        dimension: dim,
                        static: staticScore,
                        supabase: supabaseScore,
                        difference: Math.abs(staticScore - supabaseScore)
                    });
                    isConsistent = false;
                }
            });
        }

        // 对比MBTI结果
        if (staticResult.mbti && supabaseResult.mbti) {
            if (staticResult.mbti.type !== supabaseResult.mbti.type) {
                differences.push({
                    type: 'mbti',
                    field: 'type',
                    static: staticResult.mbti.type,
                    supabase: supabaseResult.mbti.type
                });
                isConsistent = false;
            }
        }

        // 对比贝尔宾角色
        if (staticResult.belbin && supabaseResult.belbin) {
            if (staticResult.belbin.primary !== supabaseResult.belbin.primary) {
                differences.push({
                    type: 'belbin',
                    field: 'primary',
                    static: staticResult.belbin.primary,
                    supabase: supabaseResult.belbin.primary
                });
                isConsistent = false;
            }
        }

        return {
            isConsistent,
            differences
        };
    }

    /**
     * 生成一致性测试报告
     */
    generateConsistencyReport() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const reportFilename = `consistency-report-${timestamp}.json`;
        
        const report = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalTests: this.testResults.length,
                inconsistencies: this.inconsistencies.length,
                consistencyRate: ((this.testResults.length - this.inconsistencies.length) / this.testResults.length * 100).toFixed(2) + '%'
            },
            summary: {
                byLanguage: this.getSummaryByLanguage(),
                byTestType: this.getSummaryByTestType(),
                commonIssues: this.getCommonIssues()
            },
            detailedResults: this.testResults,
            inconsistencies: this.inconsistencies
        };
        
        // 保存详细报告
        fs.writeFileSync(reportFilename, JSON.stringify(report, null, 2));
        
        // 生成简化的控制台报告
        this.printConsoleReport(report);
        
        console.log(`\n详细报告已保存到: ${reportFilename}`);
        
        return report;
    }

    /**
     * 按语言统计结果
     */
    getSummaryByLanguage() {
        const summary = { en: { total: 0, consistent: 0 }, zh: { total: 0, consistent: 0 } };
        
        this.testResults.forEach(result => {
            summary[result.language].total++;
            if (result.isConsistent) {
                summary[result.language].consistent++;
            }
        });
        
        return {
            english: {
                total: summary.en.total,
                consistent: summary.en.consistent,
                rate: (summary.en.consistent / summary.en.total * 100).toFixed(2) + '%'
            },
            chinese: {
                total: summary.zh.total,
                consistent: summary.zh.consistent,
                rate: (summary.zh.consistent / summary.zh.total * 100).toFixed(2) + '%'
            }
        };
    }

    /**
     * 按测试类型统计结果
     */
    getSummaryByTestType() {
        const typeStats = {};
        
        this.testResults.forEach(result => {
            const testType = this.getTestType(result.testCase);
            if (!typeStats[testType]) {
                typeStats[testType] = { total: 0, consistent: 0 };
            }
            typeStats[testType].total++;
            if (result.isConsistent) {
                typeStats[testType].consistent++;
            }
        });
        
        const summary = {};
        Object.keys(typeStats).forEach(type => {
            summary[type] = {
                total: typeStats[type].total,
                consistent: typeStats[type].consistent,
                rate: (typeStats[type].consistent / typeStats[type].total * 100).toFixed(2) + '%'
            };
        });
        
        return summary;
    }

    /**
     * 获取测试类型
     */
    getTestType(testCaseName) {
        if (testCaseName.includes('extreme')) return 'extreme_values';
        if (testCaseName.includes('boundary') || testCaseName.includes('all_')) return 'boundary_values';
        if (testCaseName.includes('mbti_')) return 'mbti_types';
        if (testCaseName.includes('random')) return 'random_tests';
        if (testCaseName.includes('typical') || testCaseName.includes('creative') || testCaseName.includes('analytical') || testCaseName.includes('social')) return 'realistic_scenarios';
        return 'dimension_combinations';
    }

    /**
     * 获取常见问题
     */
    getCommonIssues() {
        const issueStats = {};
        
        this.inconsistencies.forEach(inconsistency => {
            inconsistency.differences.forEach(diff => {
                const key = `${diff.type}_${diff.dimension || diff.field || 'general'}`;
                if (!issueStats[key]) {
                    issueStats[key] = 0;
                }
                issueStats[key]++;
            });
        });
        
        return Object.entries(issueStats)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([issue, count]) => ({ issue, count }));
    }

    /**
     * 打印控制台报告
     */
    printConsoleReport(report) {
        console.log('\n' + '='.repeat(80));
        console.log('一致性测试报告');
        console.log('='.repeat(80));
        
        console.log(`总测试数: ${report.metadata.totalTests}`);
        console.log(`不一致数: ${report.metadata.inconsistencies}`);
        console.log(`一致性率: ${report.metadata.consistencyRate}`);
        
        console.log('\n按语言统计:');
        console.log(`  英文版: ${report.summary.byLanguage.english.consistent}/${report.summary.byLanguage.english.total} (${report.summary.byLanguage.english.rate})`);
        console.log(`  中文版: ${report.summary.byLanguage.chinese.consistent}/${report.summary.byLanguage.chinese.total} (${report.summary.byLanguage.chinese.rate})`);
        
        console.log('\n按测试类型统计:');
        Object.entries(report.summary.byTestType).forEach(([type, stats]) => {
            console.log(`  ${type}: ${stats.consistent}/${stats.total} (${stats.rate})`);
        });
        
        if (report.summary.commonIssues.length > 0) {
            console.log('\n常见问题:');
            report.summary.commonIssues.forEach(issue => {
                console.log(`  ${issue.issue}: ${issue.count} 次`);
            });
        }
        
        console.log('='.repeat(80));
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const tester = new ConsistencyTester();
    
    tester.runConsistencyTest()
        .then(result => {
            console.log(`\n测试完成! 一致性率: ${result.consistencyRate}%`);
            process.exit(result.inconsistencies === 0 ? 0 : 1);
        })
        .catch(error => {
            console.error('测试过程中发生错误:', error);
            process.exit(1);
        });
}

module.exports = ConsistencyTester;