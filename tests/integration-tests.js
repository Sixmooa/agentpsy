/**
 * 集成测试 - 完整答题流程测试
 * 测试从获取问题到生成报告的完整流程
 */

// Supabase配置
const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

// Edge Function URLs
const API_BASE = `${SUPABASE_URL}/functions/v1/personality-api`;

// 集成测试客户端
class IntegrationTestClient {
  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    };
  }
  
  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE}${endpoint}`;
    const options = {
      method,
      headers: this.baseHeaders
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`请求失败 ${method} ${url}:`, error);
      throw error;
    }
  }
  
  async getQuestions(language = 'en') {
    const response = await this.makeRequest(`/questions?language=${language}`);
    return response.questions || response; // 处理新的API响应格式
  }
  
  async getAnswerOptions(language = 'en') {
    const response = await this.makeRequest(`/answer-options?language=${language}`);
    return response.options || response; // 处理新的API响应格式
  }
  
  async submitTest(answers, language = 'en', saveResult = false) {
    return await this.makeRequest('/submit-test', 'POST', {
      answers,
      language,
      saveResult
    });
  }
}

// 测试场景生成器
class TestScenarioGenerator {
  static generateCompleteTestScenario(questions, pattern = 'balanced') {
    const answers = {};
    
    questions.forEach(question => {
      switch (pattern) {
        case 'balanced':
          answers[question.id] = 3;
          break;
        case 'extravert':
          if (question.dimension === 'extraversion') {
            answers[question.id] = question.reverse ? 1 : 5;
          } else {
            answers[question.id] = 3;
          }
          break;
        case 'introvert':
          if (question.dimension === 'extraversion') {
            answers[question.id] = question.reverse ? 5 : 1;
          } else {
            answers[question.id] = 3;
          }
          break;
        case 'random':
          answers[question.id] = Math.floor(Math.random() * 5) + 1;
          break;
        case 'extreme_high':
          answers[question.id] = question.reverse ? 1 : 5;
          break;
        case 'extreme_low':
          answers[question.id] = question.reverse ? 5 : 1;
          break;
        default:
          answers[question.id] = 3;
      }
    });
    
    return answers;
  }
  
  static generateIncompleteAnswers(questions, completionRate = 0.8) {
    const completeAnswers = this.generateCompleteTestScenario(questions, 'random');
    const targetCount = Math.floor(questions.length * completionRate);
    
    const questionIds = Object.keys(completeAnswers);
    const selectedIds = questionIds.slice(0, targetCount);
    
    const incompleteAnswers = {};
    selectedIds.forEach(id => {
      incompleteAnswers[id] = completeAnswers[id];
    });
    
    return incompleteAnswers;
  }
  
  static generateInvalidAnswers(questions) {
    const answers = {};
    
    questions.forEach((question, index) => {
      if (index % 5 === 0) {
        answers[question.id] = 0; // 无效值
      } else if (index % 5 === 1) {
        answers[question.id] = 6; // 超出范围
      } else if (index % 5 === 2) {
        answers[question.id] = -1; // 负数
      } else if (index % 5 === 3) {
        answers[question.id] = 'invalid'; // 非数字
      } else {
        answers[question.id] = 3; // 正常值
      }
    });
    
    return answers;
  }
}

// 性能监控器
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }
  
  startTimer(name) {
    this.metrics[name] = {
      start: performance.now(),
      end: null,
      duration: null
    };
  }
  
  endTimer(name) {
    if (this.metrics[name]) {
      this.metrics[name].end = performance.now();
      this.metrics[name].duration = this.metrics[name].end - this.metrics[name].start;
    }
  }
  
  getMetric(name) {
    return this.metrics[name];
  }
  
  getAllMetrics() {
    return this.metrics;
  }
  
  generateReport() {
    const report = {};
    Object.entries(this.metrics).forEach(([name, metric]) => {
      report[name] = {
        duration: metric.duration,
        durationFormatted: `${metric.duration.toFixed(2)}ms`
      };
    });
    return report;
  }
}

// 数据验证器
class DataValidator {
  static validateQuestions(questions, language) {
    const errors = [];
    
    if (!Array.isArray(questions)) {
      errors.push('问题数据不是数组格式');
      return errors;
    }
    
    if (questions.length === 0) {
      errors.push('问题数据为空');
      return errors;
    }
    
    // 验证必需字段
    const requiredFields = ['id', 'text', 'dimension', 'reverse'];
    questions.forEach((question, index) => {
      requiredFields.forEach(field => {
        if (!(field in question)) {
          errors.push(`问题 ${index + 1} 缺少必需字段: ${field}`);
        }
      });
      
      // 验证维度
      const validDimensions = ['extraversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'];
      if (question.dimension && !validDimensions.includes(question.dimension)) {
        errors.push(`问题 ${index + 1} 维度无效: ${question.dimension}`);
      }
      
      // 验证reverse字段
      if (question.reverse !== undefined && typeof question.reverse !== 'boolean') {
        errors.push(`问题 ${index + 1} reverse字段必须是布尔值`);
      }
    });
    
    // 验证维度分布
    const dimensionCounts = {};
    questions.forEach(question => {
      if (question.dimension) {
        dimensionCounts[question.dimension] = (dimensionCounts[question.dimension] || 0) + 1;
      }
    });
    
    Object.entries(dimensionCounts).forEach(([dimension, count]) => {
      if (count < 2) {
        errors.push(`维度 ${dimension} 的问题数量过少: ${count}`);
      }
    });
    
    return errors;
  }
  
  static validateAnswerOptions(answerOptions, language) {
    const errors = [];
    
    if (!Array.isArray(answerOptions)) {
      errors.push('答案选项数据不是数组格式');
      return errors;
    }
    
    if (answerOptions.length !== 5) {
      errors.push(`答案选项数量应为5个，实际为: ${answerOptions.length}`);
    }
    
    // 验证必需字段
    const requiredFields = ['value', 'text'];
    answerOptions.forEach((option, index) => {
      requiredFields.forEach(field => {
        if (!(field in option)) {
          errors.push(`答案选项 ${index + 1} 缺少必需字段: ${field}`);
        }
      });
      
      // 验证value字段
      if (option.value !== undefined && (option.value < 1 || option.value > 5)) {
        errors.push(`答案选项 ${index + 1} value值无效: ${option.value}`);
      }
    });
    
    return errors;
  }
  
  static validateTestResult(result) {
    const errors = [];
    
    // 检查是否有report字段
    if (!result.report) {
      errors.push('缺少report字段');
      return errors;
    }
    
    // 验证Big Five分数 (API返回格式: result.report.bigFiveScores)
    if (!result.report.bigFiveScores) {
      errors.push('缺少Big Five分数');
    } else {
      const dimensions = ['extraversion', 'openness', 'conscientiousness', 'agreeableness', 'neuroticism'];
      dimensions.forEach(dim => {
        if (!(dim in result.report.bigFiveScores)) {
          errors.push(`缺少Big Five维度: ${dim}`);
        } else {
          const score = result.report.bigFiveScores[dim];
          if (typeof score !== 'number' || score < 0 || score > 100) {
            errors.push(`Big Five维度 ${dim} 分数无效: ${score}`);
          }
        }
      });
    }
    
    // 验证MBTI结果 (API返回格式: result.report.mbtiResult)
    if (!result.report.mbtiResult) {
      errors.push('缺少MBTI结果');
    } else {
      if (!result.report.mbtiResult.type || typeof result.report.mbtiResult.type !== 'string') {
        errors.push('MBTI类型无效');
      }
      
      if (!result.report.mbtiResult.dimensions) {
        errors.push('缺少MBTI维度信息');
      }
      
      if (!result.report.mbtiResult.confidence) {
        errors.push('缺少MBTI置信度信息');
      }
    }
    
    return errors;
  }
}

// 主集成测试函数
async function runIntegrationTests() {
  console.log('='.repeat(80));
  console.log('开始集成测试 - 完整答题流程');
  console.log('='.repeat(80));
  
  const client = new IntegrationTestClient();
  const monitor = new PerformanceMonitor();
  const results = {
    tests: [],
    performance: {},
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      passRate: 0
    }
  };
  
  // 测试1: 获取问题数据
  console.log('\n1. 测试获取问题数据');
  console.log('-'.repeat(50));
  
  try {
    monitor.startTimer('getQuestions');
    const questionsEN = await client.getQuestions('en');
    monitor.endTimer('getQuestions');
    
    const questionValidationErrors = DataValidator.validateQuestions(questionsEN, 'en');
    
    if (questionValidationErrors.length === 0) {
      console.log(`  ✓ 英文问题获取成功 (${questionsEN.length}个问题)`);
      console.log(`  ✓ 数据验证通过`);
      results.tests.push({
        name: 'get_questions_en',
        passed: true,
        duration: monitor.getMetric('getQuestions').duration
      });
    } else {
      console.log(`  ✗ 英文问题数据验证失败:`);
      questionValidationErrors.forEach(error => console.log(`    ${error}`));
      results.tests.push({
        name: 'get_questions_en',
        passed: false,
        errors: questionValidationErrors
      });
    }
    
    // 测试中文问题
    monitor.startTimer('getQuestionsZH');
    const questionsZH = await client.getQuestions('zh');
    monitor.endTimer('getQuestionsZH');
    
    const questionValidationErrorsZH = DataValidator.validateQuestions(questionsZH, 'zh');
    
    if (questionValidationErrorsZH.length === 0) {
      console.log(`  ✓ 中文问题获取成功 (${questionsZH.length}个问题)`);
      results.tests.push({
        name: 'get_questions_zh',
        passed: true,
        duration: monitor.getMetric('getQuestionsZH').duration
      });
    } else {
      console.log(`  ✗ 中文问题数据验证失败:`);
      questionValidationErrorsZH.forEach(error => console.log(`    ${error}`));
      results.tests.push({
        name: 'get_questions_zh',
        passed: false,
        errors: questionValidationErrorsZH
      });
    }
    
  } catch (error) {
    console.log(`  ✗ 获取问题失败: ${error.message}`);
    results.tests.push({
      name: 'get_questions',
      passed: false,
      error: error.message
    });
  }
  
  // 测试2: 获取答案选项
  console.log('\n2. 测试获取答案选项');
  console.log('-'.repeat(50));
  
  try {
    monitor.startTimer('getAnswerOptions');
    const answerOptionsEN = await client.getAnswerOptions('en');
    monitor.endTimer('getAnswerOptions');
    
    const optionValidationErrors = DataValidator.validateAnswerOptions(answerOptionsEN, 'en');
    
    if (optionValidationErrors.length === 0) {
      console.log(`  ✓ 英文答案选项获取成功 (${answerOptionsEN.length}个选项)`);
      results.tests.push({
        name: 'get_answer_options_en',
        passed: true,
        duration: monitor.getMetric('getAnswerOptions').duration
      });
    } else {
      console.log(`  ✗ 英文答案选项验证失败:`);
      optionValidationErrors.forEach(error => console.log(`    ${error}`));
      results.tests.push({
        name: 'get_answer_options_en',
        passed: false,
        errors: optionValidationErrors
      });
    }
    
  } catch (error) {
    console.log(`  ✗ 获取答案选项失败: ${error.message}`);
    results.tests.push({
      name: 'get_answer_options',
      passed: false,
      error: error.message
    });
  }
  
  // 测试3: 完整答题流程
  console.log('\n3. 测试完整答题流程');
  console.log('-'.repeat(50));
  
  try {
    // 获取问题用于生成答案
    const questions = await client.getQuestions('en');
    
    // 测试不同的答题模式
    const testPatterns = ['balanced', 'extravert', 'introvert', 'random'];
    
    for (const pattern of testPatterns) {
      console.log(`\n  测试模式: ${pattern}`);
      
      const answers = TestScenarioGenerator.generateCompleteTestScenario(questions, pattern);
      
      monitor.startTimer(`submitTest_${pattern}`);
      const testResult = await client.submitTest(answers, 'en', false);
      monitor.endTimer(`submitTest_${pattern}`);
      
      const resultValidationErrors = DataValidator.validateTestResult(testResult);
      
      if (resultValidationErrors.length === 0) {
        console.log(`    ✓ ${pattern}模式测试通过`);
        console.log(`    MBTI类型: ${testResult.report.mbtiResult.type}`);
        console.log(`    Big Five分数: E=${testResult.report.bigFiveScores.extraversion.toFixed(1)} O=${testResult.report.bigFiveScores.openness.toFixed(1)} C=${testResult.report.bigFiveScores.conscientiousness.toFixed(1)} A=${testResult.report.bigFiveScores.agreeableness.toFixed(1)} N=${testResult.report.bigFiveScores.neuroticism.toFixed(1)}`);
        
        results.tests.push({
          name: `submit_test_${pattern}`,
          passed: true,
          duration: monitor.getMetric(`submitTest_${pattern}`).duration,
          mbtiType: testResult.report.mbtiResult.type
        });
      } else {
        console.log(`    ✗ ${pattern}模式测试结果验证失败:`);
        resultValidationErrors.forEach(error => console.log(`      ${error}`));
        results.tests.push({
          name: `submit_test_${pattern}`,
          passed: false,
          errors: resultValidationErrors
        });
      }
      
      // 添加延迟避免API限制
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
  } catch (error) {
    console.log(`  ✗ 完整答题流程测试失败: ${error.message}`);
    results.tests.push({
      name: 'complete_test_flow',
      passed: false,
      error: error.message
    });
  }
  
  // 测试4: 错误处理
  console.log('\n4. 测试错误处理');
  console.log('-'.repeat(50));
  
  try {
    const questions = await client.getQuestions('en');
    
    // 测试不完整答案
    console.log('  测试不完整答案...');
    const incompleteAnswers = TestScenarioGenerator.generateIncompleteAnswers(questions, 0.5);
    
    try {
      await client.submitTest(incompleteAnswers, 'en', false);
      console.log('    ✗ 不完整答案应该被拒绝');
      results.tests.push({
        name: 'incomplete_answers_handling',
        passed: false,
        error: '不完整答案未被正确拒绝'
      });
    } catch (error) {
      console.log('    ✓ 不完整答案被正确拒绝');
      results.tests.push({
        name: 'incomplete_answers_handling',
        passed: true
      });
    }
    
    // 测试无效答案值
    console.log('  测试无效答案值...');
    const invalidAnswers = TestScenarioGenerator.generateInvalidAnswers(questions);
    
    try {
      await client.submitTest(invalidAnswers, 'en', false);
      console.log('    ✗ 无效答案应该被拒绝');
      results.tests.push({
        name: 'invalid_answers_handling',
        passed: false,
        error: '无效答案未被正确拒绝'
      });
    } catch (error) {
      console.log('    ✓ 无效答案被正确拒绝');
      results.tests.push({
        name: 'invalid_answers_handling',
        passed: true
      });
    }
    
  } catch (error) {
    console.log(`  ✗ 错误处理测试失败: ${error.message}`);
    results.tests.push({
      name: 'error_handling',
      passed: false,
      error: error.message
    });
  }
  
  // 测试5: 性能测试
  console.log('\n5. 性能测试');
  console.log('-'.repeat(50));
  
  try {
    const questions = await client.getQuestions('en');
    const testAnswers = TestScenarioGenerator.generateCompleteTestScenario(questions, 'random');
    
    // 并发测试
    console.log('  执行并发性能测试...');
    const concurrentTests = 5;
    const promises = [];
    
    monitor.startTimer('concurrent_tests');
    for (let i = 0; i < concurrentTests; i++) {
      promises.push(client.submitTest(testAnswers, 'en', false));
    }
    
    const concurrentResults = await Promise.all(promises);
    monitor.endTimer('concurrent_tests');
    
    const avgTime = monitor.getMetric('concurrent_tests').duration / concurrentTests;
    console.log(`    ✓ 并发测试完成 (${concurrentTests}个请求)`);
    console.log(`    总时间: ${monitor.getMetric('concurrent_tests').duration.toFixed(2)}ms`);
    console.log(`    平均时间: ${avgTime.toFixed(2)}ms`);
    
    results.tests.push({
      name: 'concurrent_performance',
      passed: true,
      duration: monitor.getMetric('concurrent_tests').duration,
      averageDuration: avgTime,
      concurrentRequests: concurrentTests
    });
    
  } catch (error) {
    console.log(`  ✗ 性能测试失败: ${error.message}`);
    results.tests.push({
      name: 'performance_test',
      passed: false,
      error: error.message
    });
  }
  
  // 生成测试报告
  console.log('\n\n' + '='.repeat(80));
  console.log('集成测试结果汇总');
  console.log('='.repeat(80));
  
  results.summary.total = results.tests.length;
  results.summary.passed = results.tests.filter(t => t.passed).length;
  results.summary.failed = results.summary.total - results.summary.passed;
  results.summary.passRate = (results.summary.passed / results.summary.total * 100).toFixed(2);
  
  console.log(`总测试数: ${results.summary.total}`);
  console.log(`通过测试: ${results.summary.passed}`);
  console.log(`失败测试: ${results.summary.failed}`);
  console.log(`通过率: ${results.summary.passRate}%`);
  
  // 性能报告
  results.performance = monitor.generateReport();
  console.log('\n性能指标:');
  Object.entries(results.performance).forEach(([name, metric]) => {
    console.log(`  ${name}: ${metric.durationFormatted}`);
  });
  
  if (results.summary.passRate === '100.00') {
    console.log('\n🎉 所有集成测试通过！系统运行正常！');
  } else {
    console.log('\n⚠️  存在测试失败，需要检查系统问题！');
    console.log('\n失败的测试:');
    results.tests.filter(t => !t.passed).forEach(test => {
      console.log(`  ${test.name}: ${test.error || test.errors?.join(', ')}`);
    });
  }
  
  return results;
}

// 导出测试函数
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runIntegrationTests,
    IntegrationTestClient,
    TestScenarioGenerator,
    PerformanceMonitor,
    DataValidator
  };
}

// 如果直接运行此文件
if (typeof window === 'undefined' && require.main === module) {
  (async () => {
    try {
      const results = await runIntegrationTests();
      
      console.log('\n' + '='.repeat(80));
      console.log('集成测试完成');
      console.log('='.repeat(80));
      
      process.exit(results.summary.passRate === '100.00' ? 0 : 1);
    } catch (error) {
      console.error('集成测试执行失败:', error);
      process.exit(1);
    }
  })();
}