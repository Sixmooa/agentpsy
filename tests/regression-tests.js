/**
 * 回归测试 - 前端与后端一致性验证
 * 确保前端PersonalityCalculator与Supabase Edge Functions计算结果100%一致
 */

// 导入前端计算器
const PersonalityCalculator = require('../static/js/calculator.js');
const { QUESTIONS_EN, QUESTIONS_ZH } = require('../static/js/data.js');

// Supabase配置
const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

// Edge Function URLs
const EDGE_FUNCTIONS = {
  calculatePersonality: `${SUPABASE_URL}/functions/v1/calculate-personality`,
  generateReport: `${SUPABASE_URL}/functions/v1/generate-report`,
  personalityApi: `${SUPABASE_URL}/functions/v1/personality-api`
};

// 测试数据生成器
class TestDataGenerator {
  static generateRandomAnswers(questions, seed = 12345) {
    // 使用简单的伪随机数生成器确保可重现的随机结果
    let randomSeed = seed;
    const seededRandom = () => {
      randomSeed = (randomSeed * 9301 + 49297) % 233280;
      return randomSeed / 233280;
    };
    
    const answers = {};
    questions.forEach(question => {
      answers[question.id] = Math.floor(seededRandom() * 5) + 1;
    });
    
    return answers;
  }
  
  static generatePatternAnswers(questions, pattern) {
    const answers = {};
    
    questions.forEach(question => {
      switch (pattern) {
        case 'all_max':
          answers[question.id] = question.reverse ? 1 : 5;
          break;
        case 'all_min':
          answers[question.id] = question.reverse ? 5 : 1;
          break;
        case 'all_neutral':
          answers[question.id] = 3;
          break;
        case 'alternating':
          answers[question.id] = question.id % 2 === 0 ? 5 : 1;
          break;
        case 'gradient':
          const index = questions.findIndex(q => q.id === question.id);
          answers[question.id] = Math.floor((index / questions.length) * 5) + 1;
          break;
        default:
          answers[question.id] = 3;
      }
    });
    
    return answers;
  }
  
  static generateTestSuite() {
    const testCases = [];
    
    // 模式化测试用例
    const patterns = ['all_max', 'all_min', 'all_neutral', 'alternating', 'gradient'];
    patterns.forEach(pattern => {
      testCases.push({
        name: `pattern_${pattern}`,
        description: `模式测试: ${pattern}`,
        answers: this.generatePatternAnswers(QUESTIONS_EN, pattern),
        language: 'en'
      });
    });
    
    // 随机测试用例
    for (let i = 0; i < 10; i++) {
      testCases.push({
        name: `random_${i}`,
        description: `随机测试 ${i + 1}`,
        answers: this.generateRandomAnswers(QUESTIONS_EN, i),
        language: 'en'
      });
    }
    
    // 中文版本测试
    testCases.push({
      name: 'chinese_neutral',
      description: '中文版本中性测试',
      answers: this.generatePatternAnswers(QUESTIONS_ZH, 'all_neutral'),
      language: 'zh'
    });
    
    return testCases;
  }
}

// 后端API调用器
class BackendApiClient {
  static async callEdgeFunction(functionUrl, payload, headers = {}) {
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      ...headers
    };
    
    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`调用Edge Function失败: ${functionUrl}`, error);
      throw error;
    }
  }
  
  static async calculatePersonality(answers, language = 'en') {
    return await this.callEdgeFunction(EDGE_FUNCTIONS.calculatePersonality, {
      answers,
      language
    });
  }
  
  static async generateReport(calculationResult, language = 'en', saveResult = false) {
    return await this.callEdgeFunction(EDGE_FUNCTIONS.generateReport, {
      calculationResult,
      language,
      saveResult
    });
  }
  
  static async submitTest(answers, language = 'en') {
    return await this.callEdgeFunction(EDGE_FUNCTIONS.personalityApi + '/submit-test', {
      answers,
      language,
      saveResult: false
    });
  }
}

// 结果比较器
class ResultComparator {
  static compareNumbers(frontend, backend, tolerance = 0.001) {
    return Math.abs(frontend - backend) <= tolerance;
  }
  
  static compareBigFiveScores(frontendScores, backendScores, tolerance = 0.001) {
    const dimensions = ['extraversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'];
    const results = {};
    
    dimensions.forEach(dim => {
      const frontendScore = frontendScores[dim];
      const backendScore = backendScores[dim];
      const isEqual = this.compareNumbers(frontendScore, backendScore, tolerance);
      
      results[dim] = {
        frontend: frontendScore,
        backend: backendScore,
        equal: isEqual,
        difference: Math.abs(frontendScore - backendScore)
      };
    });
    
    return results;
  }
  
  static compareMBTIResults(frontendMBTI, backendMBTI) {
    const results = {
      type: {
        frontend: frontendMBTI.type,
        backend: backendMBTI.type,
        equal: frontendMBTI.type === backendMBTI.type
      },
      dimensions: {},
      confidence: {}
    };
    
    // 比较维度
    Object.keys(frontendMBTI.dimensions).forEach(dim => {
      results.dimensions[dim] = {
        frontend: frontendMBTI.dimensions[dim],
        backend: backendMBTI.dimensions[dim],
        equal: frontendMBTI.dimensions[dim] === backendMBTI.dimensions[dim]
      };
    });
    
    // 比较置信度
    Object.keys(frontendMBTI.confidence).forEach(dim => {
      const frontendConf = frontendMBTI.confidence[dim];
      const backendConf = backendMBTI.confidence[dim];
      const isEqual = this.compareNumbers(frontendConf, backendConf, 0.001);
      
      results.confidence[dim] = {
        frontend: frontendConf,
        backend: backendConf,
        equal: isEqual,
        difference: Math.abs(frontendConf - backendConf)
      };
    });
    
    return results;
  }
  
  static generateComparisonReport(testCase, frontendResult, backendResult) {
    const report = {
      testCase: testCase.name,
      description: testCase.description,
      bigFiveComparison: null,
      mbtiComparison: null,
      overallMatch: true,
      errors: []
    };
    
    try {
      // 比较Big Five分数
      if (frontendResult.bigFive && backendResult.bigFive) {
        report.bigFiveComparison = this.compareBigFiveScores(
          frontendResult.bigFive,
          backendResult.bigFive
        );
        
        // 检查是否所有维度都匹配
        Object.values(report.bigFiveComparison).forEach(dimResult => {
          if (!dimResult.equal) {
            report.overallMatch = false;
            report.errors.push(`Big Five维度不匹配: ${dimResult.frontend} vs ${dimResult.backend}`);
          }
        });
      }
      
      // 比较MBTI结果
      if (frontendResult.mbti && backendResult.mbti) {
        report.mbtiComparison = this.compareMBTIResults(
          frontendResult.mbti,
          backendResult.mbti
        );
        
        // 检查MBTI类型是否匹配
        if (!report.mbtiComparison.type.equal) {
          report.overallMatch = false;
          report.errors.push(`MBTI类型不匹配: ${report.mbtiComparison.type.frontend} vs ${report.mbtiComparison.type.backend}`);
        }
        
        // 检查维度是否匹配
        Object.values(report.mbtiComparison.dimensions).forEach(dimResult => {
          if (!dimResult.equal) {
            report.overallMatch = false;
            report.errors.push(`MBTI维度不匹配: ${dimResult.frontend} vs ${dimResult.backend}`);
          }
        });
      }
      
    } catch (error) {
      report.overallMatch = false;
      report.errors.push(`比较过程出错: ${error.message}`);
    }
    
    return report;
  }
}

// 主回归测试函数
async function runRegressionTests() {
  console.log('='.repeat(80));
  console.log('开始回归测试 - 前端与后端一致性验证');
  console.log('='.repeat(80));
  
  const calculator = new PersonalityCalculator();
  const testCases = TestDataGenerator.generateTestSuite();
  const results = [];
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n测试 ${i + 1}/${totalTests}: ${testCase.description}`);
    console.log('-'.repeat(50));
    
    try {
      // 前端计算
      console.log('  执行前端计算...');
      const questions = testCase.language === 'zh' ? QUESTIONS_ZH : QUESTIONS_EN;
      const frontendBigFive = calculator.calculateBigFiveScores(testCase.answers, questions);
      const frontendMBTI = calculator.calculateMBTI(frontendBigFive);
      
      const frontendResult = {
        bigFive: frontendBigFive,
        mbti: frontendMBTI
      };
      
      // 后端计算
      console.log('  执行后端计算...');
      const backendResult = await BackendApiClient.calculatePersonality(
        testCase.answers,
        testCase.language
      );
      
      // 比较结果
      console.log('  比较计算结果...');
      const comparisonReport = ResultComparator.generateComparisonReport(
        testCase,
        frontendResult,
        backendResult
      );
      
      results.push(comparisonReport);
      
      if (comparisonReport.overallMatch) {
        console.log('  ✓ 测试通过 - 前后端结果一致');
        passedTests++;
      } else {
        console.log('  ✗ 测试失败 - 前后端结果不一致');
        comparisonReport.errors.forEach(error => {
          console.log(`    错误: ${error}`);
        });
      }
      
      // 显示详细比较结果
      if (comparisonReport.bigFiveComparison) {
        console.log('  Big Five比较:');
        Object.entries(comparisonReport.bigFiveComparison).forEach(([dim, result]) => {
          const status = result.equal ? '✓' : '✗';
          console.log(`    ${status} ${dim}: ${result.frontend.toFixed(3)} vs ${result.backend.toFixed(3)} (差异: ${result.difference.toFixed(6)})`);
        });
      }
      
      if (comparisonReport.mbtiComparison) {
        console.log('  MBTI比较:');
        const typeStatus = comparisonReport.mbtiComparison.type.equal ? '✓' : '✗';
        console.log(`    ${typeStatus} 类型: ${comparisonReport.mbtiComparison.type.frontend} vs ${comparisonReport.mbtiComparison.type.backend}`);
      }
      
    } catch (error) {
      console.log(`  ✗ 测试出错: ${error.message}`);
      results.push({
        testCase: testCase.name,
        description: testCase.description,
        overallMatch: false,
        errors: [`测试执行出错: ${error.message}`]
      });
    }
    
    // 添加延迟避免API限制
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 生成测试报告
  console.log('\n\n' + '='.repeat(80));
  console.log('回归测试结果汇总');
  console.log('='.repeat(80));
  
  const passRate = (passedTests / totalTests * 100).toFixed(2);
  
  console.log(`总测试数: ${totalTests}`);
  console.log(`通过测试: ${passedTests}`);
  console.log(`失败测试: ${totalTests - passedTests}`);
  console.log(`一致性率: ${passRate}%`);
  
  if (passRate === '100.00') {
    console.log('\n🎉 所有回归测试通过！前后端计算结果100%一致！');
  } else {
    console.log('\n⚠️  存在一致性问题，需要检查实现差异！');
    console.log('\n失败的测试详情:');
    results.filter(r => !r.overallMatch).forEach(result => {
      console.log(`\n  测试: ${result.testCase} - ${result.description}`);
      result.errors.forEach(error => {
        console.log(`    ${error}`);
      });
    });
  }
  
  return {
    totalTests,
    passedTests,
    passRate: parseFloat(passRate),
    results,
    success: passRate === '100.00'
  };
}

// 性能对比测试
async function runPerformanceComparison() {
  console.log('\n\n' + '='.repeat(80));
  console.log('性能对比测试');
  console.log('='.repeat(80));
  
  const calculator = new PersonalityCalculator();
  const testAnswers = TestDataGenerator.generateRandomAnswers(QUESTIONS_EN);
  
  // 前端性能测试
  console.log('\n前端性能测试...');
  const frontendStart = performance.now();
  for (let i = 0; i < 100; i++) {
    const bigFive = calculator.calculateBigFiveScores(testAnswers, QUESTIONS_EN);
    calculator.calculateMBTI(bigFive);
  }
  const frontendEnd = performance.now();
  const frontendTime = frontendEnd - frontendStart;
  
  console.log(`前端计算时间: ${frontendTime.toFixed(2)}ms (100次)`);
  console.log(`前端平均每次: ${(frontendTime / 100).toFixed(4)}ms`);
  
  // 后端性能测试
  console.log('\n后端性能测试...');
  const backendStart = performance.now();
  const backendPromises = [];
  
  for (let i = 0; i < 10; i++) { // 减少并发数避免API限制
    backendPromises.push(
      BackendApiClient.calculatePersonality(testAnswers, 'en')
    );
  }
  
  try {
    await Promise.all(backendPromises);
    const backendEnd = performance.now();
    const backendTime = backendEnd - backendStart;
    
    console.log(`后端计算时间: ${backendTime.toFixed(2)}ms (10次并发)`);
    console.log(`后端平均每次: ${(backendTime / 10).toFixed(4)}ms`);
    
    return {
      frontend: frontendTime / 100,
      backend: backendTime / 10
    };
  } catch (error) {
    console.log(`后端性能测试失败: ${error.message}`);
    return {
      frontend: frontendTime / 100,
      backend: null,
      error: error.message
    };
  }
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runRegressionTests,
    runPerformanceComparison,
    TestDataGenerator,
    BackendApiClient,
    ResultComparator
  };
}

// 如果直接运行此文件
if (typeof window === 'undefined' && require.main === module) {
  (async () => {
    try {
      const regressionResults = await runRegressionTests();
      const performanceResults = await runPerformanceComparison();
      
      console.log('\n' + '='.repeat(80));
      console.log('回归测试完成');
      console.log('='.repeat(80));
      
      process.exit(regressionResults.success ? 0 : 1);
    } catch (error) {
      console.error('回归测试执行失败:', error);
      process.exit(1);
    }
  })();
}