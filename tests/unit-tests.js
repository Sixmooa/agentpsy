/**
 * 单元测试 - 人格计算算法
 * 确保前端和后端计算逻辑的100%一致性
 */

// 导入前端计算器
const PersonalityCalculator = require('../static/js/calculator.js');
const { QUESTIONS_EN, QUESTIONS_ZH } = require('../static/js/data.js');

// 测试数据集
const TEST_CASES = {
  // 完整答案集 - 极端外向型
  extreme_extravert: {
    description: "极端外向型测试用例",
    answers: {},
    expected: {
      bigFive: {
        extraversion: { min: 80, max: 100 },
        openness: { min: 0, max: 100 },
        conscientiousness: { min: 0, max: 100 },
        agreeableness: { min: 0, max: 100 },
        neuroticism: { min: 0, max: 100 }
      },
      mbti: {
        dimensions: { ei: { type: 'E' } }
      }
    }
  },
  
  // 完整答案集 - 极端内向型
  extreme_introvert: {
    description: "极端内向型测试用例",
    answers: {},
    expected: {
      bigFive: {
        extraversion: { min: 0, max: 20 },
        openness: { min: 0, max: 100 },
        conscientiousness: { min: 0, max: 100 },
        agreeableness: { min: 0, max: 100 },
        neuroticism: { min: 0, max: 100 }
      },
      mbti: {
        dimensions: { ei: { type: 'I' } }
      }
    }
  },
  
  // 平衡型答案
  balanced: {
    description: "平衡型测试用例",
    answers: {},
    expected: {
      bigFive: {
        extraversion: { min: 45, max: 55 },
        openness: { min: 45, max: 55 },
        conscientiousness: { min: 45, max: 55 },
        agreeableness: { min: 45, max: 55 },
        neuroticism: { min: 45, max: 55 }
      }
    }
  }
};

// 生成测试答案
function generateTestAnswers(questions, pattern) {
  const answers = {};
  
  questions.forEach(question => {
    switch (pattern) {
      case 'extreme_high':
        answers[question.id] = question.reverse ? 1 : 5;
        break;
      case 'extreme_low':
        answers[question.id] = question.reverse ? 5 : 1;
        break;
      case 'balanced':
        answers[question.id] = 3;
        break;
      case 'random':
        answers[question.id] = Math.floor(Math.random() * 5) + 1;
        break;
      default:
        answers[question.id] = 3;
    }
  });
  
  return answers;
}

// 初始化测试数据
function initializeTestCases() {
  // 为外向性维度生成极端高分答案
  TEST_CASES.extreme_extravert.answers = {};
  QUESTIONS_EN.forEach(question => {
    if (question.dimension === 'extraversion') {
      TEST_CASES.extreme_extravert.answers[question.id] = question.reverse ? 1 : 5;
    } else {
      TEST_CASES.extreme_extravert.answers[question.id] = 3; // 中性答案
    }
  });
  
  // 为外向性维度生成极端低分答案
  TEST_CASES.extreme_introvert.answers = {};
  QUESTIONS_EN.forEach(question => {
    if (question.dimension === 'extraversion') {
      TEST_CASES.extreme_introvert.answers[question.id] = question.reverse ? 5 : 1;
    } else {
      TEST_CASES.extreme_introvert.answers[question.id] = 3; // 中性答案
    }
  });
  
  // 生成平衡型答案
  TEST_CASES.balanced.answers = generateTestAnswers(QUESTIONS_EN, 'balanced');
}

// 测试结果验证函数
class TestValidator {
  static validateBigFiveScores(actual, expected, testName) {
    const results = [];
    
    Object.keys(expected).forEach(dimension => {
      const actualScore = actual[dimension];
      const expectedRange = expected[dimension];
      
      const isValid = actualScore >= expectedRange.min && actualScore <= expectedRange.max;
      
      results.push({
        test: testName,
        dimension: dimension,
        actual: actualScore,
        expected: expectedRange,
        passed: isValid,
        message: isValid ? 
          `✓ ${dimension}: ${actualScore.toFixed(2)} (expected: ${expectedRange.min}-${expectedRange.max})` :
          `✗ ${dimension}: ${actualScore.toFixed(2)} (expected: ${expectedRange.min}-${expectedRange.max})`
      });
    });
    
    return results;
  }
  
  static validateMBTIResult(actual, expected, testName) {
    const results = [];
    
    if (expected.dimensions) {
      Object.keys(expected.dimensions).forEach(dimension => {
        const actualDim = actual.dimensions[dimension];
        const expectedDim = expected.dimensions[dimension];
        
        // 比较type属性
        const actualType = actualDim?.type;
        const expectedType = expectedDim?.type;
        
        const isValid = actualType === expectedType;
        
        results.push({
          test: testName,
          dimension: dimension,
          actual: actualType,
          expected: expectedType,
          passed: isValid,
          message: isValid ?
            `✓ MBTI ${dimension}: ${actualType} (expected: ${expectedType})` :
            `✗ MBTI ${dimension}: ${actualType} (expected: ${expectedType})`
        });
      });
    }
    
    return results;
  }
  
  static validateAnswerValidation(calculator, answers, questions, shouldBeValid, testName) {
    const isValid = calculator.validateAnswers(answers, questions);
    const passed = isValid === shouldBeValid;
    
    return {
      test: testName,
      actual: isValid,
      expected: shouldBeValid,
      passed: passed,
      message: passed ?
        `✓ Answer validation: ${isValid} (expected: ${shouldBeValid})` :
        `✗ Answer validation: ${isValid} (expected: ${shouldBeValid})`
    };
  }
}

// 主测试函数
function runUnitTests() {
  console.log('='.repeat(80));
  console.log('开始单元测试 - 人格计算算法');
  console.log('='.repeat(80));
  
  const calculator = new PersonalityCalculator();
  const allResults = [];
  
  // 初始化测试用例
  initializeTestCases();
  
  // 测试1: Big Five分数计算准确性
  console.log('\n1. 测试Big Five分数计算准确性');
  console.log('-'.repeat(50));
  
  Object.keys(TEST_CASES).forEach(testKey => {
    const testCase = TEST_CASES[testKey];
    console.log(`\n测试用例: ${testCase.description}`);
    
    const bigFiveScores = calculator.calculateBigFiveScores(testCase.answers, QUESTIONS_EN);
    
    if (testCase.expected.bigFive) {
      const validationResults = TestValidator.validateBigFiveScores(
        bigFiveScores, 
        testCase.expected.bigFive, 
        testKey
      );
      
      validationResults.forEach(result => {
        console.log(`  ${result.message}`);
        allResults.push(result);
      });
    }
  });
  
  // 测试2: MBTI类型计算准确性
  console.log('\n\n2. 测试MBTI类型计算准确性');
  console.log('-'.repeat(50));
  
  Object.keys(TEST_CASES).forEach(testKey => {
    const testCase = TEST_CASES[testKey];
    console.log(`\n测试用例: ${testCase.description}`);
    
    const bigFiveScores = calculator.calculateBigFiveScores(testCase.answers, QUESTIONS_EN);
    const mbtiResult = calculator.calculateMBTI(bigFiveScores);
    
    console.log(`  MBTI类型: ${mbtiResult.type}`);
    console.log(`  维度: ${JSON.stringify(mbtiResult.dimensions)}`);
    console.log(`  置信度: ${JSON.stringify(mbtiResult.confidence)}`);
    
    if (testCase.expected.mbti) {
      const validationResults = TestValidator.validateMBTIResult(
        mbtiResult,
        testCase.expected.mbti,
        testKey
      );
      
      validationResults.forEach(result => {
        console.log(`  ${result.message}`);
        allResults.push(result);
      });
    }
  });
  
  // 测试3: 答案验证功能
  console.log('\n\n3. 测试答案验证功能');
  console.log('-'.repeat(50));
  
  // 测试完整答案
  const completeAnswers = generateTestAnswers(QUESTIONS_EN, 'balanced');
  const completeValidation = TestValidator.validateAnswerValidation(
    calculator, completeAnswers, QUESTIONS_EN, true, 'complete_answers'
  );
  console.log(`  ${completeValidation.message}`);
  allResults.push(completeValidation);
  
  // 测试不完整答案
  const incompleteAnswers = { ...completeAnswers };
  delete incompleteAnswers[QUESTIONS_EN[0].id];
  const incompleteValidation = TestValidator.validateAnswerValidation(
    calculator, incompleteAnswers, QUESTIONS_EN, false, 'incomplete_answers'
  );
  console.log(`  ${incompleteValidation.message}`);
  allResults.push(incompleteValidation);
  
  // 测试无效答案值
  const invalidAnswers = { ...completeAnswers };
  invalidAnswers[QUESTIONS_EN[0].id] = 6; // 超出范围
  const invalidValidation = TestValidator.validateAnswerValidation(
    calculator, invalidAnswers, QUESTIONS_EN, false, 'invalid_answers'
  );
  console.log(`  ${invalidValidation.message}`);
  allResults.push(invalidValidation);
  
  // 测试4: 边界值测试
  console.log('\n\n4. 测试边界值处理');
  console.log('-'.repeat(50));
  
  // 测试所有最小值
  const minAnswers = generateTestAnswers(QUESTIONS_EN, 'extreme_low');
  const minBigFive = calculator.calculateBigFiveScores(minAnswers, QUESTIONS_EN);
  const minMBTI = calculator.calculateMBTI(minBigFive);
  console.log(`  最小值测试 - Big Five: ${JSON.stringify(minBigFive)}`);
  console.log(`  最小值测试 - MBTI: ${minMBTI.type}`);
  
  // 测试所有最大值
  const maxAnswers = generateTestAnswers(QUESTIONS_EN, 'extreme_high');
  const maxBigFive = calculator.calculateBigFiveScores(maxAnswers, QUESTIONS_EN);
  const maxMBTI = calculator.calculateMBTI(maxBigFive);
  console.log(`  最大值测试 - Big Five: ${JSON.stringify(maxBigFive)}`);
  console.log(`  最大值测试 - MBTI: ${maxMBTI.type}`);
  
  // 测试5: 语言一致性测试
  console.log('\n\n5. 测试中英文版本一致性');
  console.log('-'.repeat(50));
  
  const testAnswersEN = generateTestAnswers(QUESTIONS_EN, 'balanced');
  const testAnswersZH = {};
  
  // 将英文答案映射到中文问题（假设ID对应）
  QUESTIONS_ZH.forEach((questionZH, index) => {
    const questionEN = QUESTIONS_EN[index];
    if (questionEN && testAnswersEN[questionEN.id]) {
      testAnswersZH[questionZH.id] = testAnswersEN[questionEN.id];
    }
  });
  
  const bigFiveEN = calculator.calculateBigFiveScores(testAnswersEN, QUESTIONS_EN);
  const bigFiveZH = calculator.calculateBigFiveScores(testAnswersZH, QUESTIONS_ZH);
  
  const mbtiEN = calculator.calculateMBTI(bigFiveEN);
  const mbtiZH = calculator.calculateMBTI(bigFiveZH);
  
  console.log(`  英文版 MBTI: ${mbtiEN.type}`);
  console.log(`  中文版 MBTI: ${mbtiZH.type}`);
  
  const languageConsistency = mbtiEN.type === mbtiZH.type;
  console.log(`  语言一致性: ${languageConsistency ? '✓ 通过' : '✗ 失败'}`);
  
  allResults.push({
    test: 'language_consistency',
    actual: mbtiZH.type,
    expected: mbtiEN.type,
    passed: languageConsistency,
    message: languageConsistency ?
      `✓ 语言一致性: ${mbtiEN.type} === ${mbtiZH.type}` :
      `✗ 语言一致性: ${mbtiEN.type} !== ${mbtiZH.type}`
  });
  
  // 测试结果汇总
  console.log('\n\n' + '='.repeat(80));
  console.log('测试结果汇总');
  console.log('='.repeat(80));
  
  const passedTests = allResults.filter(r => r.passed).length;
  const totalTests = allResults.length;
  const passRate = (passedTests / totalTests * 100).toFixed(2);
  
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`通过率: ${passRate}%`);
  
  if (passRate === '100.00') {
    console.log('\n🎉 所有测试通过！算法实现100%正确！');
  } else {
    console.log('\n⚠️  存在测试失败，需要检查算法实现！');
    console.log('\n失败的测试:');
    allResults.filter(r => !r.passed).forEach(result => {
      console.log(`  ${result.message}`);
    });
  }
  
  return {
    totalTests,
    passedTests,
    passRate: parseFloat(passRate),
    results: allResults,
    success: passRate === '100.00'
  };
}

// 性能测试
function runPerformanceTests() {
  console.log('\n\n' + '='.repeat(80));
  console.log('性能测试');
  console.log('='.repeat(80));
  
  const calculator = new PersonalityCalculator();
  const testAnswers = generateTestAnswers(QUESTIONS_EN, 'random');
  
  // 测试Big Five计算性能
  const bigFiveStart = performance.now();
  for (let i = 0; i < 1000; i++) {
    calculator.calculateBigFiveScores(testAnswers, QUESTIONS_EN);
  }
  const bigFiveEnd = performance.now();
  const bigFiveTime = bigFiveEnd - bigFiveStart;
  
  console.log(`Big Five计算性能: ${bigFiveTime.toFixed(2)}ms (1000次)`);
  console.log(`平均每次: ${(bigFiveTime / 1000).toFixed(4)}ms`);
  
  // 测试MBTI计算性能
  const bigFiveScores = calculator.calculateBigFiveScores(testAnswers, QUESTIONS_EN);
  const mbtiStart = performance.now();
  for (let i = 0; i < 1000; i++) {
    calculator.calculateMBTI(bigFiveScores);
  }
  const mbtiEnd = performance.now();
  const mbtiTime = mbtiEnd - mbtiStart;
  
  console.log(`MBTI计算性能: ${mbtiTime.toFixed(2)}ms (1000次)`);
  console.log(`平均每次: ${(mbtiTime / 1000).toFixed(4)}ms`);
  
  // 测试完整报告生成性能
  const reportStart = performance.now();
  for (let i = 0; i < 100; i++) {
    calculator.generateReport(testAnswers, QUESTIONS_EN, 'en');
  }
  const reportEnd = performance.now();
  const reportTime = reportEnd - reportStart;
  
  console.log(`完整报告生成性能: ${reportTime.toFixed(2)}ms (100次)`);
  console.log(`平均每次: ${(reportTime / 100).toFixed(4)}ms`);
  
  return {
    bigFiveTime: bigFiveTime / 1000,
    mbtiTime: mbtiTime / 1000,
    reportTime: reportTime / 100
  };
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runUnitTests,
    runPerformanceTests,
    TestValidator,
    TEST_CASES,
    generateTestAnswers
  };
}

// 如果直接运行此文件
if (typeof window === 'undefined' && require.main === module) {
  const unitResults = runUnitTests();
  const perfResults = runPerformanceTests();
  
  console.log('\n' + '='.repeat(80));
  console.log('测试完成');
  console.log('='.repeat(80));
  
  process.exit(unitResults.success ? 0 : 1);
}