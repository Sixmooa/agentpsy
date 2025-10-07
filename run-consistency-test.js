/**
 * 一致性测试运行器
 * 提供简化的命令行接口来运行各种测试
 */

const ConsistencyTester = require('./consistency-test.js');
const ComprehensiveAnswerGenerator = require('./comprehensive-answer-generator.js');

class TestRunner {
    constructor() {
        this.consistencyTester = new ConsistencyTester();
        this.answerGenerator = new ComprehensiveAnswerGenerator();
    }

    /**
     * 运行快速测试（少量测试用例）
     */
    async runQuickTest() {
        console.log('运行快速一致性测试...\n');
        
        // 生成少量关键测试用例
        const quickTestCases = this.generateQuickTestCases();
        
        console.log(`生成了 ${quickTestCases.length} 个快速测试用例`);
        
        // 运行测试
        const results = await this.runTestCases(quickTestCases);
        
        this.printQuickResults(results);
        
        return results;
    }

    /**
     * 运行完整测试
     */
    async runFullTest() {
        console.log('运行完整一致性测试...\n');
        
        const result = await this.consistencyTester.runConsistencyTest();
        
        return result;
    }

    /**
     * 运行特定类型的测试
     */
    async runSpecificTest(testType) {
        console.log(`运行 ${testType} 类型测试...\n`);
        
        let testCases = [];
        
        switch (testType) {
            case 'extreme':
                testCases = this.generateExtremeTestCases();
                break;
            case 'mbti':
                testCases = this.generateMBTITestCases();
                break;
            case 'random':
                testCases = this.generateRandomTestCases(10);
                break;
            case 'realistic':
                testCases = this.generateRealisticTestCases();
                break;
            default:
                console.log('未知的测试类型');
                return null;
        }
        
        const results = await this.runTestCases(testCases);
        this.printQuickResults(results);
        
        return results;
    }

    /**
     * 生成快速测试用例
     */
    generateQuickTestCases() {
        const testCases = [];
        
        // 极端值测试
        testCases.push({
            name: 'all_maximum',
            description: '所有答案最大值',
            answers: this.generateAllSameAnswers(5)
        });
        
        testCases.push({
            name: 'all_minimum',
            description: '所有答案最小值',
            answers: this.generateAllSameAnswers(1)
        });
        
        testCases.push({
            name: 'all_neutral',
            description: '所有答案中性值',
            answers: this.generateAllSameAnswers(3)
        });
        
        // 典型MBTI类型测试
        const mbtiTypes = ['INTJ-A', 'ENFP-T', 'ISTJ-A', 'ESFP-T'];
        mbtiTypes.forEach(type => {
            testCases.push({
                name: `mbti_${type.toLowerCase()}`,
                description: `MBTI类型: ${type}`,
                answers: this.answerGenerator.generateAnswersForMBTIType(type)
            });
        });
        
        // 随机测试
        for (let i = 0; i < 3; i++) {
            testCases.push({
                name: `random_${i + 1}`,
                description: `随机测试 ${i + 1}`,
                answers: this.generateRandomAnswers()
            });
        }
        
        return testCases;
    }

    /**
     * 生成极端测试用例
     */
    generateExtremeTestCases() {
        const testCases = [];
        const { QUESTIONS_EN } = require('./static/js/data.js');
        
        const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
        
        dimensions.forEach(dimension => {
            // 高值测试
            const highAnswers = {};
            QUESTIONS_EN.forEach(question => {
                highAnswers[question.id] = question.dimension === dimension ? 5 : 3;
            });
            
            testCases.push({
                name: `extreme_high_${dimension}`,
                description: `${dimension}维度极高值`,
                answers: highAnswers
            });
            
            // 低值测试
            const lowAnswers = {};
            QUESTIONS_EN.forEach(question => {
                lowAnswers[question.id] = question.dimension === dimension ? 1 : 3;
            });
            
            testCases.push({
                name: `extreme_low_${dimension}`,
                description: `${dimension}维度极低值`,
                answers: lowAnswers
            });
        });
        
        return testCases;
    }

    /**
     * 生成MBTI测试用例
     */
    generateMBTITestCases() {
        const testCases = [];
        const { MBTI_DETAILS } = require('./static/js/data.js');
        
        // 选择一些代表性的MBTI类型
        const selectedTypes = ['INTJ-A', 'ENFP-T', 'ISTJ-A', 'ESFP-T', 'ENTP-A', 'ISFJ-T'];
        
        selectedTypes.forEach(type => {
            testCases.push({
                name: `mbti_${type.toLowerCase()}`,
                description: `MBTI类型: ${type}`,
                answers: this.answerGenerator.generateAnswersForMBTIType(type)
            });
        });
        
        return testCases;
    }

    /**
     * 生成随机测试用例
     */
    generateRandomTestCases(count = 10) {
        const testCases = [];
        
        for (let i = 0; i < count; i++) {
            testCases.push({
                name: `random_${i + 1}`,
                description: `随机测试 ${i + 1}`,
                answers: this.generateRandomAnswers()
            });
        }
        
        return testCases;
    }

    /**
     * 生成真实场景测试用例
     */
    generateRealisticTestCases() {
        const scenarios = [
            {
                name: 'typical_introvert',
                description: '典型内向者',
                pattern: { extraversion: 2, openness: 4, conscientiousness: 4, agreeableness: 4, neuroticism: 3 }
            },
            {
                name: 'typical_extravert',
                description: '典型外向者',
                pattern: { extraversion: 4, openness: 4, conscientiousness: 3, agreeableness: 4, neuroticism: 2 }
            },
            {
                name: 'creative_type',
                description: '创意型人格',
                pattern: { extraversion: 3, openness: 5, conscientiousness: 2, agreeableness: 3, neuroticism: 3 }
            }
        ];
        
        return scenarios.map(scenario => ({
            name: scenario.name,
            description: scenario.description,
            answers: this.generateAnswersFromPattern(scenario.pattern)
        }));
    }

    /**
     * 运行测试用例
     */
    async runTestCases(testCases) {
        const results = [];
        let successCount = 0;
        
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            console.log(`运行测试 ${i + 1}/${testCases.length}: ${testCase.name}`);
            
            try {
                // 测试英文版和中文版
                const enResult = await this.consistencyTester.compareVersions(testCase, 'en');
                const zhResult = await this.consistencyTester.compareVersions(testCase, 'zh');
                
                results.push({
                    testCase: testCase,
                    english: enResult,
                    chinese: zhResult,
                    success: true
                });
                
                successCount++;
                console.log('  ✓ 完成');
                
            } catch (error) {
                results.push({
                    testCase: testCase,
                    error: error.message,
                    success: false
                });
                console.log(`  ✗ 错误: ${error.message}`);
            }
        }
        
        return {
            results: results,
            summary: {
                total: testCases.length,
                success: successCount,
                failure: testCases.length - successCount
            }
        };
    }

    /**
     * 生成所有相同答案
     */
    generateAllSameAnswers(value) {
        const { QUESTIONS_EN } = require('./static/js/data.js');
        const answers = {};
        QUESTIONS_EN.forEach(question => {
            answers[question.id] = value;
        });
        return answers;
    }

    /**
     * 生成随机答案
     */
    generateRandomAnswers() {
        const { QUESTIONS_EN } = require('./static/js/data.js');
        const answers = {};
        QUESTIONS_EN.forEach(question => {
            answers[question.id] = Math.floor(Math.random() * 5) + 1;
        });
        return answers;
    }

    /**
     * 根据模式生成答案
     */
    generateAnswersFromPattern(pattern) {
        const { QUESTIONS_EN } = require('./static/js/data.js');
        const answers = {};
        
        QUESTIONS_EN.forEach(question => {
            const baseValue = pattern[question.dimension] || 3;
            const variation = Math.random() * 0.8 - 0.4;
            const finalValue = Math.max(1, Math.min(5, Math.round(baseValue + variation)));
            answers[question.id] = finalValue;
        });
        
        return answers;
    }

    /**
     * 打印快速测试结果
     */
    printQuickResults(results) {
        console.log('\n' + '='.repeat(60));
        console.log('快速测试结果');
        console.log('='.repeat(60));
        
        console.log(`总测试数: ${results.summary.total}`);
        console.log(`成功: ${results.summary.success}`);
        console.log(`失败: ${results.summary.failure}`);
        console.log(`成功率: ${(results.summary.success / results.summary.total * 100).toFixed(2)}%`);
        
        console.log('='.repeat(60));
    }
}

// 命令行接口
if (require.main === module) {
    const runner = new TestRunner();
    const args = process.argv.slice(2);
    const command = args[0] || 'quick';
    
    async function main() {
        try {
            switch (command) {
                case 'quick':
                    await runner.runQuickTest();
                    break;
                case 'full':
                    await runner.runFullTest();
                    break;
                case 'extreme':
                case 'mbti':
                case 'random':
                case 'realistic':
                    await runner.runSpecificTest(command);
                    break;
                default:
                    console.log('使用方法:');
                    console.log('  node run-consistency-test.js quick     # 快速测试');
                    console.log('  node run-consistency-test.js full      # 完整测试');
                    console.log('  node run-consistency-test.js extreme   # 极端值测试');
                    console.log('  node run-consistency-test.js mbti      # MBTI类型测试');
                    console.log('  node run-consistency-test.js random    # 随机测试');
                    console.log('  node run-consistency-test.js realistic # 真实场景测试');
                    break;
            }
        } catch (error) {
            console.error('测试运行失败:', error);
            process.exit(1);
        }
    }
    
    main();
}

module.exports = TestRunner;