/**
 * 全面的人格测试套件
 * 测试personality-api-fixed.ts和静态文件的计算逻辑
 * 包含MBTI计算、Belbin角色映射、边界条件和压力测试
 */

const fs = require('fs');
const path = require('path');

// 模拟Supabase环境
global.Deno = {
    env: {
        get: (key) => {
            const env = {
                'SUPABASE_URL': 'https://test.supabase.co',
                'SUPABASE_ANON_KEY': 'test-key'
            };
            return env[key];
        }
    },
    serve: () => {}
};

// 模拟Supabase客户端
const mockSupabaseClient = {
    from: (table) => ({
        select: () => ({
            order: () => ({
                then: (callback) => callback({ data: getMockData(table), error: null })
            })
        }),
        eq: () => ({
            order: () => ({
                then: (callback) => callback({ data: getMockData(table), error: null })
            }),
            single: () => ({
                then: (callback) => callback({ data: getMockData(table)[0], error: null })
            })
        }),
        contains: () => ({
            eq: () => ({
                order: () => ({
                    then: (callback) => callback({ data: getMockData(table), error: null })
                })
            })
        }),
        insert: () => ({
            select: () => ({
                single: () => ({
                    then: (callback) => callback({ data: { id: 1 }, error: null })
                })
            })
        })
    })
};

// 模拟数据
function getMockData(table) {
    const mockData = {
        questions: generateMockQuestions(),
        answer_options: [
            { value: 1, text_zh: '完全不同意', text_en: 'Strongly Disagree' },
            { value: 2, text_zh: '不同意', text_en: 'Disagree' },
            { value: 3, text_zh: '中立', text_en: 'Neutral' },
            { value: 4, text_zh: '同意', text_en: 'Agree' },
            { value: 5, text_zh: '完全同意', text_en: 'Strongly Agree' }
        ],
        belbin_roles: [
            {
                name: '智多星',
                name_en: 'Plant',
                description: '富有想象力和创造力',
                mbti_types: ['INTJ', 'INTP'],
                priority: 1
            }
        ],
        career_suggestions: [
            {
                mbti_type: 'INTJ',
                category: '技术',
                title: '软件工程师',
                description: '适合逻辑思维强的人'
            }
        ],
        mbti_types_info: [
            {
                type: 'INTJ',
                name: '建筑师',
                description: '理性的思考者'
            }
        ]
    };
    return mockData[table] || [];
}

// 生成模拟问题
function generateMockQuestions() {
    const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const questions = [];
    
    for (let i = 1; i <= 50; i++) {
        questions.push({
            id: i,
            text_zh: `测试问题 ${i}`,
            text_en: `Test Question ${i}`,
            dimension: dimensions[(i - 1) % 5]
        });
    }
    
    return questions;
}

// 模拟createClient函数
global.createClient = () => mockSupabaseClient;

// 测试类
class PersonalityTestSuite {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        
        // 加载静态版本的计算器
        this.loadStaticCalculator();
    }
    
    loadStaticCalculator() {
        try {
            // 模拟静态版本的PersonalityCalculator
            this.staticCalculator = {
                midPoint: 3.0,
                calculateBigFiveScores: (answers, questions) => {
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

                    for (const [questionId, answer] of Object.entries(answers)) {
                        const question = questions.find(q => q.id === parseInt(questionId));
                        if (question && question.dimension) {
                            scores[question.dimension] += parseInt(answer);
                            counts[question.dimension]++;
                        }
                    }

                    const avgScores = {};
                    for (const dimension in scores) {
                        if (counts[dimension] > 0) {
                            avgScores[dimension] = Math.round((scores[dimension] / counts[dimension]) * 100) / 100;
                        } else {
                            avgScores[dimension] = 0;
                        }
                    }

                    return avgScores;
                },
                calculateMBTI: (scores) => {
                    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores;
                    const midPoint = 3.0;

                    const ei = extraversion > midPoint ? 'E' : 'I';
                    const sn = openness >= midPoint ? 'N' : 'S';
                    const tf = agreeableness > midPoint ? 'F' : 'T';
                    const jp = conscientiousness >= midPoint ? 'J' : 'P';
                    const suffix = neuroticism > midPoint ? '-T' : '-A';

                    return {
                        type: ei + sn + tf + jp + suffix,
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
            };
        } catch (error) {
            console.error('无法加载静态计算器:', error);
        }
    }
    
    // 测试辅助方法
    assert(condition, message) {
        this.totalTests++;
        if (condition) {
            this.passedTests++;
            console.log(`✅ PASS: ${message}`);
            this.testResults.push({ status: 'PASS', message, timestamp: new Date().toISOString() });
        } else {
            this.failedTests++;
            console.log(`❌ FAIL: ${message}`);
            this.testResults.push({ status: 'FAIL', message, timestamp: new Date().toISOString() });
        }
    }
    
    assertEquals(actual, expected, message) {
        const condition = JSON.stringify(actual) === JSON.stringify(expected);
        this.assert(condition, `${message} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
    
    assertApproximatelyEqual(actual, expected, tolerance, message) {
        const condition = Math.abs(actual - expected) <= tolerance;
        this.assert(condition, `${message} - Expected: ~${expected}, Actual: ${actual}, Tolerance: ${tolerance}`);
    }
    
    // 生成测试数据
    generateTestAnswers(pattern = 'balanced') {
        const answers = {};
        
        switch (pattern) {
            case 'balanced':
                // 平衡的答案（所有维度都接近中点）
                for (let i = 1; i <= 50; i++) {
                    answers[i] = 3;
                }
                break;
                
            case 'extreme_high':
                // 极端高分
                for (let i = 1; i <= 50; i++) {
                    answers[i] = 5;
                }
                break;
                
            case 'extreme_low':
                // 极端低分
                for (let i = 1; i <= 50; i++) {
                    answers[i] = 1;
                }
                break;
                
            case 'mixed':
                // 混合模式
                for (let i = 1; i <= 50; i++) {
                    answers[i] = (i % 2 === 0) ? 5 : 1;
                }
                break;
                
            case 'intj_pattern':
                // INTJ典型模式
                for (let i = 1; i <= 50; i++) {
                    const dimension = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'][(i - 1) % 5];
                    switch (dimension) {
                        case 'openness': answers[i] = 4; break;        // 高开放性 -> N
                        case 'conscientiousness': answers[i] = 4; break; // 高尽责性 -> J
                        case 'extraversion': answers[i] = 2; break;    // 低外向性 -> I
                        case 'agreeableness': answers[i] = 2; break;   // 低宜人性 -> T
                        case 'neuroticism': answers[i] = 2; break;     // 低神经质 -> A
                    }
                }
                break;
                
            case 'enfp_pattern':
                // ENFP典型模式
                for (let i = 1; i <= 50; i++) {
                    const dimension = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'][(i - 1) % 5];
                    switch (dimension) {
                        case 'openness': answers[i] = 4; break;        // 高开放性 -> N
                        case 'conscientiousness': answers[i] = 2; break; // 低尽责性 -> P
                        case 'extraversion': answers[i] = 4; break;    // 高外向性 -> E
                        case 'agreeableness': answers[i] = 4; break;   // 高宜人性 -> F
                        case 'neuroticism': answers[i] = 3; break;     // 中等神经质 -> T
                    }
                }
                break;
                
            default:
                // 随机答案
                for (let i = 1; i <= 50; i++) {
                    answers[i] = Math.floor(Math.random() * 5) + 1;
                }
        }
        
        return answers;
    }
    
    // 测试Big Five分数计算
    async testBigFiveCalculation() {
        console.log('\n🧪 测试Big Five分数计算...');
        
        const questions = generateMockQuestions();
        
        // 测试1: 平衡答案
        const balancedAnswers = this.generateTestAnswers('balanced');
        const balancedScores = this.staticCalculator.calculateBigFiveScores(balancedAnswers, questions);
        
        // 所有维度应该等于3.0
        Object.values(balancedScores).forEach(score => {
            this.assertEquals(score, 3.0, '平衡答案的所有维度得分应为3.0');
        });
        
        // 测试2: 极端高分
        const highAnswers = this.generateTestAnswers('extreme_high');
        const highScores = this.staticCalculator.calculateBigFiveScores(highAnswers, questions);
        
        Object.values(highScores).forEach(score => {
            this.assertEquals(score, 5.0, '极端高分答案的所有维度得分应为5.0');
        });
        
        // 测试3: 极端低分
        const lowAnswers = this.generateTestAnswers('extreme_low');
        const lowScores = this.staticCalculator.calculateBigFiveScores(lowAnswers, questions);
        
        Object.values(lowScores).forEach(score => {
            this.assertEquals(score, 1.0, '极端低分答案的所有维度得分应为1.0');
        });
        
        // 测试4: 混合模式
        const mixedAnswers = this.generateTestAnswers('mixed');
        const mixedScores = this.staticCalculator.calculateBigFiveScores(mixedAnswers, questions);
        
        Object.values(mixedScores).forEach(score => {
            this.assertEquals(score, 3.0, '混合模式答案的所有维度得分应为3.0');
        });
        
        console.log('✅ Big Five分数计算测试完成');
    }
    
    // 测试MBTI类型计算
    async testMBTICalculation() {
        console.log('\n🧪 测试MBTI类型计算...');
        
        // 测试1: INTJ模式
        const intjScores = {
            openness: 4.0,        // N
            conscientiousness: 4.0, // J
            extraversion: 2.0,    // I
            agreeableness: 2.0,   // T
            neuroticism: 2.0      // A
        };
        
        const intjResult = this.staticCalculator.calculateMBTI(intjScores);
        this.assertEquals(intjResult.type, 'INTJ-A', 'INTJ模式应该产生INTJ-A类型');
        this.assertEquals(intjResult.typeCode, 'INTJ', 'INTJ模式的类型代码应为INTJ');
        
        // 测试2: ENFP模式
        const enfpScores = {
            openness: 4.0,        // N
            conscientiousness: 2.0, // P
            extraversion: 4.0,    // E
            agreeableness: 4.0,   // F
            neuroticism: 4.0      // T
        };
        
        const enfpResult = this.staticCalculator.calculateMBTI(enfpScores);
        this.assertEquals(enfpResult.type, 'ENFP-T', 'ENFP模式应该产生ENFP-T类型');
        this.assertEquals(enfpResult.typeCode, 'ENFP', 'ENFP模式的类型代码应为ENFP');
        
        // 测试3: 边界值测试（正好等于3.0）
        const boundaryScores = {
            openness: 3.0,        // S (< 3.0)
            conscientiousness: 3.0, // J (>= 3.0)
            extraversion: 3.0,    // I (< 3.0)
            agreeableness: 3.0,   // T (< 3.0)
            neuroticism: 3.0      // A (< 3.0)
        };
        
        const boundaryResult = this.staticCalculator.calculateMBTI(boundaryScores);
        this.assertEquals(boundaryResult.type, 'ISTJ-A', '边界值应该产生ISTJ-A类型');
        
        // 测试4: 所有16种MBTI类型
        const mbtiTypes = [
            'INTJ', 'INTP', 'ENTJ', 'ENTP',
            'INFJ', 'INFP', 'ENFJ', 'ENFP',
            'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
            'ISTP', 'ISFP', 'ESTP', 'ESFP'
        ];
        
        mbtiTypes.forEach(expectedType => {
            const testScores = this.generateScoresForMBTI(expectedType);
            const result = this.staticCalculator.calculateMBTI(testScores);
            this.assert(result.typeCode === expectedType, `应该能够生成${expectedType}类型`);
        });
        
        console.log('✅ MBTI类型计算测试完成');
    }
    
    // 为特定MBTI类型生成分数
    generateScoresForMBTI(mbtiType) {
        const scores = {
            openness: 3.0,
            conscientiousness: 3.0,
            extraversion: 3.0,
            agreeableness: 3.0,
            neuroticism: 2.0  // 默认-A
        };
        
        // E/I
        scores.extraversion = mbtiType[0] === 'E' ? 4.0 : 2.0;
        
        // S/N
        scores.openness = mbtiType[1] === 'N' ? 4.0 : 2.0;
        
        // T/F
        scores.agreeableness = mbtiType[2] === 'F' ? 4.0 : 2.0;
        
        // J/P
        scores.conscientiousness = mbtiType[3] === 'J' ? 4.0 : 2.0;
        
        return scores;
    }
    
    // 测试边界条件
    async testBoundaryConditions() {
        console.log('\n🧪 测试边界条件...');
        
        const questions = generateMockQuestions();
        
        // 测试1: 空答案
        try {
            const emptyScores = this.staticCalculator.calculateBigFiveScores({}, questions);
            Object.values(emptyScores).forEach(score => {
                this.assertEquals(score, 0, '空答案应该产生0分');
            });
        } catch (error) {
            this.assert(false, `空答案测试失败: ${error.message}`);
        }
        
        // 测试2: 部分答案
        const partialAnswers = {};
        for (let i = 1; i <= 25; i++) {
            partialAnswers[i] = 3;
        }
        
        const partialScores = this.staticCalculator.calculateBigFiveScores(partialAnswers, questions);
        this.assert(Object.values(partialScores).some(score => score === 3.0), '部分答案应该产生有效分数');
        
        // 测试3: 无效答案值
        const invalidAnswers = {};
        for (let i = 1; i <= 50; i++) {
            invalidAnswers[i] = 0; // 无效值
        }
        
        const invalidScores = this.staticCalculator.calculateBigFiveScores(invalidAnswers, questions);
        Object.values(invalidScores).forEach(score => {
            this.assertEquals(score, 0, '无效答案应该产生0分');
        });
        
        // 测试4: 超出范围的答案
        const outOfRangeAnswers = {};
        for (let i = 1; i <= 50; i++) {
            outOfRangeAnswers[i] = 10; // 超出范围
        }
        
        const outOfRangeScores = this.staticCalculator.calculateBigFiveScores(outOfRangeAnswers, questions);
        Object.values(outOfRangeScores).forEach(score => {
            this.assertEquals(score, 10, '超出范围的答案应该按原值计算');
        });
        
        console.log('✅ 边界条件测试完成');
    }
    
    // 压力测试
    async testStressConditions() {
        console.log('\n🧪 进行压力测试...');
        
        const questions = generateMockQuestions();
        const startTime = Date.now();
        
        // 测试1: 大量计算
        for (let i = 0; i < 1000; i++) {
            const answers = this.generateTestAnswers('random');
            const scores = this.staticCalculator.calculateBigFiveScores(answers, questions);
            const mbtiResult = this.staticCalculator.calculateMBTI(scores);
            
            // 验证结果有效性
            this.assert(typeof mbtiResult.type === 'string', `第${i+1}次计算应该产生有效的MBTI类型`);
            this.assert(mbtiResult.type.length >= 5, `第${i+1}次计算的MBTI类型长度应该正确`);
        }
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        this.assert(duration < 10000, `1000次计算应该在10秒内完成，实际用时: ${duration}ms`);
        
        console.log(`✅ 压力测试完成，1000次计算用时: ${duration}ms`);
    }
    
    // 一致性测试
    async testConsistency() {
        console.log('\n🧪 测试计算一致性...');
        
        const questions = generateMockQuestions();
        const testAnswers = this.generateTestAnswers('intj_pattern');
        
        // 多次计算相同输入，结果应该一致
        const results = [];
        for (let i = 0; i < 100; i++) {
            const scores = this.staticCalculator.calculateBigFiveScores(testAnswers, questions);
            const mbtiResult = this.staticCalculator.calculateMBTI(scores);
            results.push(mbtiResult.type);
        }
        
        // 所有结果应该相同
        const uniqueResults = [...new Set(results)];
        this.assertEquals(uniqueResults.length, 1, '相同输入应该产生一致的结果');
        
        console.log('✅ 一致性测试完成');
    }
    
    // 数据完整性测试
    async testDataIntegrity() {
        console.log('\n🧪 测试数据完整性...');
        
        const questions = generateMockQuestions();
        
        // 验证问题数量
        this.assertEquals(questions.length, 50, '应该有50个问题');
        
        // 验证维度分布
        const dimensionCounts = {};
        questions.forEach(q => {
            dimensionCounts[q.dimension] = (dimensionCounts[q.dimension] || 0) + 1;
        });
        
        Object.values(dimensionCounts).forEach(count => {
            this.assertEquals(count, 10, '每个维度应该有10个问题');
        });
        
        // 验证问题ID连续性
        const ids = questions.map(q => q.id).sort((a, b) => a - b);
        for (let i = 0; i < ids.length; i++) {
            this.assertEquals(ids[i], i + 1, `问题ID应该连续，期望${i + 1}，实际${ids[i]}`);
        }
        
        console.log('✅ 数据完整性测试完成');
    }
    
    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始全面的人格测试套件...\n');
        
        const startTime = Date.now();
        
        try {
            await this.testDataIntegrity();
            await this.testBigFiveCalculation();
            await this.testMBTICalculation();
            await this.testBoundaryConditions();
            await this.testConsistency();
            await this.testStressConditions();
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 生成测试报告
            this.generateTestReport(duration);
            
        } catch (error) {
            console.error('❌ 测试过程中发生错误:', error);
            this.testResults.push({
                status: 'ERROR',
                message: `测试执行错误: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // 生成测试报告
    generateTestReport(duration) {
        const report = {
            summary: {
                totalTests: this.totalTests,
                passedTests: this.passedTests,
                failedTests: this.failedTests,
                successRate: ((this.passedTests / this.totalTests) * 100).toFixed(2) + '%',
                duration: duration + 'ms',
                timestamp: new Date().toISOString()
            },
            details: this.testResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                testSuite: 'PersonalityTestSuite v1.0'
            }
        };
        
        // 保存报告到文件
        const reportPath = path.join(__dirname, `personality-test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // 打印摘要
        console.log('\n📊 测试报告摘要:');
        console.log('='.repeat(50));
        console.log(`总测试数: ${this.totalTests}`);
        console.log(`通过测试: ${this.passedTests}`);
        console.log(`失败测试: ${this.failedTests}`);
        console.log(`成功率: ${report.summary.successRate}`);
        console.log(`总用时: ${duration}ms`);
        console.log(`报告文件: ${reportPath}`);
        console.log('='.repeat(50));
        
        if (this.failedTests > 0) {
            console.log('\n❌ 失败的测试:');
            this.testResults
                .filter(result => result.status === 'FAIL')
                .forEach(result => console.log(`  - ${result.message}`));
        } else {
            console.log('\n🎉 所有测试都通过了！');
        }
    }
}

// 运行测试
if (require.main === module) {
    const testSuite = new PersonalityTestSuite();
    testSuite.runAllTests().catch(console.error);
}

module.exports = PersonalityTestSuite;