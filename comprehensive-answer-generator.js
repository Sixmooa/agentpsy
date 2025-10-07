/**
 * 全面的自动答案生成器
 * 生成各种测试场景的答案组合，用于测试static版本和supabase版本的一致性
 */

const PersonalityCalculator = require('./static/js/calculator.js');
const { QUESTIONS_EN, QUESTIONS_ZH, MBTI_DETAILS } = require('./static/js/data.js');

class ComprehensiveAnswerGenerator {
    constructor() {
        this.calculator = new PersonalityCalculator();
        this.testCases = [];
    }

    /**
     * 生成所有可能的测试答案组合
     */
    generateAllTestCases() {
        console.log('开始生成全面的测试答案组合...\n');
        
        // 1. 极端值测试
        this.generateExtremeValueTests();
        
        // 2. 边界值测试
        this.generateBoundaryValueTests();
        
        // 3. 维度组合测试
        this.generateDimensionCombinationTests();
        
        // 4. MBTI类型覆盖测试
        this.generateMBTITypeTests();
        
        // 5. 随机测试
        this.generateRandomTests();
        
        // 6. 真实场景模拟测试
        this.generateRealisticScenarioTests();
        
        console.log(`总共生成了 ${this.testCases.length} 个测试用例\n`);
        return this.testCases;
    }

    /**
     * 生成极端值测试用例
     */
    generateExtremeValueTests() {
        console.log('生成极端值测试用例...');
        
        const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
        
        dimensions.forEach(dimension => {
            // 极高值测试
            const highAnswers = this.generateAnswersForDimension(dimension, 'high');
            this.testCases.push({
                name: `extreme_high_${dimension}`,
                description: `${dimension}维度极高值测试`,
                answers: highAnswers,
                expectedDimension: dimension,
                expectedRange: { min: 80, max: 100 }
            });
            
            // 极低值测试
            const lowAnswers = this.generateAnswersForDimension(dimension, 'low');
            this.testCases.push({
                name: `extreme_low_${dimension}`,
                description: `${dimension}维度极低值测试`,
                answers: lowAnswers,
                expectedDimension: dimension,
                expectedRange: { min: 0, max: 20 }
            });
        });
        
        console.log(`生成了 ${dimensions.length * 2} 个极端值测试用例`);
    }

    /**
     * 生成边界值测试用例
     */
    generateBoundaryValueTests() {
        console.log('生成边界值测试用例...');
        
        const boundaryTests = [
            { name: 'all_minimum', description: '所有答案最小值', value: 1 },
            { name: 'all_maximum', description: '所有答案最大值', value: 5 },
            { name: 'all_neutral', description: '所有答案中性值', value: 3 },
            { name: 'mixed_boundary', description: '混合边界值', value: 'mixed' }
        ];
        
        boundaryTests.forEach(test => {
            const answers = {};
            QUESTIONS_EN.forEach(question => {
                if (test.value === 'mixed') {
                    // 交替使用1和5
                    answers[question.id] = question.id % 2 === 0 ? 5 : 1;
                } else {
                    answers[question.id] = test.value;
                }
            });
            
            this.testCases.push({
                name: test.name,
                description: test.description,
                answers: answers,
                expectedRange: test.value === 3 ? { min: 45, max: 55 } : null
            });
        });
        
        console.log(`生成了 ${boundaryTests.length} 个边界值测试用例`);
    }

    /**
     * 生成维度组合测试用例
     */
    generateDimensionCombinationTests() {
        console.log('生成维度组合测试用例...');
        
        const combinations = [
            { name: 'high_extraversion_low_neuroticism', dims: { extraversion: 'high', neuroticism: 'low' } },
            { name: 'high_openness_high_conscientiousness', dims: { openness: 'high', conscientiousness: 'high' } },
            { name: 'low_agreeableness_high_extraversion', dims: { agreeableness: 'low', extraversion: 'high' } },
            { name: 'balanced_all_dimensions', dims: { openness: 'medium', conscientiousness: 'medium', extraversion: 'medium', agreeableness: 'medium', neuroticism: 'medium' } }
        ];
        
        combinations.forEach(combo => {
            const answers = {};
            QUESTIONS_EN.forEach(question => {
                const dimLevel = combo.dims[question.dimension] || 'medium';
                answers[question.id] = this.getAnswerForLevel(dimLevel);
            });
            
            this.testCases.push({
                name: combo.name,
                description: `维度组合测试: ${Object.keys(combo.dims).join(', ')}`,
                answers: answers,
                combination: combo.dims
            });
        });
        
        console.log(`生成了 ${combinations.length} 个维度组合测试用例`);
    }

    /**
     * 生成MBTI类型覆盖测试用例
     */
    generateMBTITypeTests() {
        console.log('生成MBTI类型覆盖测试用例...');
        
        const mbtiTypes = Object.keys(MBTI_DETAILS);
        let generatedCount = 0;
        
        mbtiTypes.forEach(mbtiType => {
            if (mbtiType.includes('-')) { // 只处理完整的MBTI类型（包含-A/-T）
                const answers = this.generateAnswersForMBTIType(mbtiType);
                this.testCases.push({
                    name: `mbti_${mbtiType.toLowerCase()}`,
                    description: `MBTI类型测试: ${mbtiType}`,
                    answers: answers,
                    expectedMBTI: mbtiType
                });
                generatedCount++;
            }
        });
        
        console.log(`生成了 ${generatedCount} 个MBTI类型测试用例`);
    }

    /**
     * 生成随机测试用例
     */
    generateRandomTests() {
        console.log('生成随机测试用例...');
        
        const randomTestCount = 20;
        for (let i = 0; i < randomTestCount; i++) {
            const answers = {};
            QUESTIONS_EN.forEach(question => {
                answers[question.id] = Math.floor(Math.random() * 5) + 1;
            });
            
            this.testCases.push({
                name: `random_test_${i + 1}`,
                description: `随机测试用例 ${i + 1}`,
                answers: answers,
                isRandom: true
            });
        }
        
        console.log(`生成了 ${randomTestCount} 个随机测试用例`);
    }

    /**
     * 生成真实场景模拟测试用例
     */
    generateRealisticScenarioTests() {
        console.log('生成真实场景模拟测试用例...');
        
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
            },
            {
                name: 'analytical_type',
                description: '分析型人格',
                pattern: { extraversion: 2, openness: 4, conscientiousness: 5, agreeableness: 2, neuroticism: 2 }
            },
            {
                name: 'social_type',
                description: '社交型人格',
                pattern: { extraversion: 5, openness: 3, conscientiousness: 3, agreeableness: 5, neuroticism: 2 }
            }
        ];
        
        scenarios.forEach(scenario => {
            const answers = {};
            QUESTIONS_EN.forEach(question => {
                const baseValue = scenario.pattern[question.dimension];
                // 添加一些随机变化以模拟真实回答
                const variation = Math.random() * 0.8 - 0.4; // -0.4 到 +0.4 的变化
                const finalValue = Math.max(1, Math.min(5, Math.round(baseValue + variation)));
                answers[question.id] = finalValue;
            });
            
            this.testCases.push({
                name: scenario.name,
                description: scenario.description,
                answers: answers,
                scenario: scenario.pattern
            });
        });
        
        console.log(`生成了 ${scenarios.length} 个真实场景测试用例`);
    }

    /**
     * 为特定维度生成答案
     */
    generateAnswersForDimension(targetDimension, level) {
        const answers = {};
        QUESTIONS_EN.forEach(question => {
            if (question.dimension === targetDimension) {
                answers[question.id] = level === 'high' ? 5 : 1;
            } else {
                answers[question.id] = 3; // 其他维度使用中性值
            }
        });
        return answers;
    }

    /**
     * 为特定MBTI类型生成答案
     */
    generateAnswersForMBTIType(mbtiType) {
        const answers = {};
        const typeCode = mbtiType.substring(0, 4);
        const suffix = mbtiType.substring(4);
        
        QUESTIONS_EN.forEach(question => {
            let value = 3; // 默认中性值
            
            switch (question.dimension) {
                case 'extraversion':
                    value = typeCode[0] === 'E' ? 4 : 2;
                    break;
                case 'openness':
                    value = typeCode[1] === 'N' ? 4 : 2;
                    break;
                case 'agreeableness':
                    value = typeCode[2] === 'F' ? 4 : 2;
                    break;
                case 'conscientiousness':
                    value = typeCode[3] === 'J' ? 4 : 2;
                    break;
                case 'neuroticism':
                    value = suffix === '-T' ? 4 : 2;
                    break;
            }
            
            // 添加一些随机变化
            const variation = Math.random() * 0.6 - 0.3;
            answers[question.id] = Math.max(1, Math.min(5, Math.round(value + variation)));
        });
        
        return answers;
    }

    /**
     * 根据级别获取答案值
     */
    getAnswerForLevel(level) {
        switch (level) {
            case 'high': return 5;
            case 'low': return 1;
            case 'medium': return 3;
            default: return 3;
        }
    }

    /**
     * 运行单个测试用例
     */
    runTestCase(testCase, language = 'en') {
        const questions = language === 'zh' ? QUESTIONS_ZH : QUESTIONS_EN;
        
        try {
            const result = this.calculator.generateReport(testCase.answers, questions, language);
            
            return {
                testCase: testCase,
                result: result,
                success: true,
                error: null
            };
        } catch (error) {
            return {
                testCase: testCase,
                result: null,
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 运行所有测试用例
     */
    runAllTests(language = 'en') {
        console.log(`开始运行所有测试用例 (语言: ${language})...\n`);
        
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        
        this.testCases.forEach((testCase, index) => {
            console.log(`运行测试 ${index + 1}/${this.testCases.length}: ${testCase.name}`);
            
            const result = this.runTestCase(testCase, language);
            results.push(result);
            
            if (result.success) {
                successCount++;
                console.log(`✓ 成功`);
            } else {
                failureCount++;
                console.log(`✗ 失败: ${result.error}`);
            }
        });
        
        console.log(`\n测试完成: ${successCount} 成功, ${failureCount} 失败`);
        
        return {
            results: results,
            summary: {
                total: this.testCases.length,
                success: successCount,
                failure: failureCount,
                successRate: (successCount / this.testCases.length * 100).toFixed(2)
            }
        };
    }

    /**
     * 导出测试用例到JSON文件
     */
    exportTestCases(filename = 'generated-test-cases.json') {
        const fs = require('fs');
        const exportData = {
            metadata: {
                generatedAt: new Date().toISOString(),
                totalCases: this.testCases.length,
                generator: 'ComprehensiveAnswerGenerator'
            },
            testCases: this.testCases
        };
        
        fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
        console.log(`测试用例已导出到: ${filename}`);
    }
}

// 如果直接运行此文件
if (require.main === module) {
    const generator = new ComprehensiveAnswerGenerator();
    
    // 生成所有测试用例
    generator.generateAllTestCases();
    
    // 导出测试用例
    generator.exportTestCases();
    
    // 运行测试（英文版）
    const englishResults = generator.runAllTests('en');
    
    // 运行测试（中文版）
    const chineseResults = generator.runAllTests('zh');
    
    // 输出总结
    console.log('\n' + '='.repeat(80));
    console.log('测试总结:');
    console.log(`英文版测试: ${englishResults.summary.success}/${englishResults.summary.total} 成功 (${englishResults.summary.successRate}%)`);
    console.log(`中文版测试: ${chineseResults.summary.success}/${chineseResults.summary.total} 成功 (${chineseResults.summary.successRate}%)`);
    console.log('='.repeat(80));
}

module.exports = ComprehensiveAnswerGenerator;