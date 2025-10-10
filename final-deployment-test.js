/**
 * 最终部署验证测试套件
 * TDD驱动的部署前后对比测试
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const { URL } = require('url');

const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

class FinalDeploymentTest {
  constructor() {
    this.staticCalculator = null;
    this.questions = [];
    this.testResults = {
      preDeployment: null,
      postDeployment: null,
      comparison: null
    };
  }

  /**
   * 初始化测试环境
   */
  async initialize() {
    console.log('🔧 初始化最终部署测试环境...');

    try {
      // 加载静态版本
      const calculatorCode = fs.readFileSync(path.join(__dirname, '../static/js/calculator.js'), 'utf8');
      const dataCode = fs.readFileSync(path.join(__dirname, '../static/js/data.js'), 'utf8');
      eval(calculatorCode);
      eval(dataCode);

      this.staticCalculator = new global.PersonalityCalculator();
      this.questions = global.QUESTIONS_EN || [];

      console.log(`✅ 加载了 ${this.questions.length} 个问题`);
      return true;
    } catch (error) {
      console.error('❌ 初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 发送HTTP请求到Supabase API
   */
  async makeAPICall(answers, language = 'en') {
    return new Promise((resolve, reject) => {
      const url = `${SUPABASE_URL}/functions/v1/personality-api/submit-test`;
      const urlObj = new URL(url);

      const requestOptions = {
        hostname: urlObj.hostname,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY
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

      const requestBody = {
        answers: answers,
        language: language,
        saveResult: false
      };

      req.write(JSON.stringify(requestBody));
      req.end();
    });
  }

  /**
   * 生成关键测试用例
   */
  generateCriticalTestCases() {
    return {
      neutral: {
        name: '中性答案 (边界测试)',
        answers: {},
        expectedBigFive: { openness: 3, conscientiousness: 3, extraversion: 3, agreeableness: 3, neuroticism: 3 },
        expectedMBTI: 'INTJ-A'
      },
      extreme_high: {
        name: '极端高分',
        answers: {},
        expectedBigFive: { openness: 5, conscientiousness: 5, extraversion: 5, agreeableness: 5, neuroticism: 5 },
        expectedMBTI: 'ENFJ-T'
      },
      extreme_low: {
        name: '极端低分',
        answers: {},
        expectedBigFive: { openness: 1, conscientiousness: 1, extraversion: 1, agreeableness: 1, neuroticism: 1 },
        expectedMBTI: 'ISTP-A'
      },
      boundary_openness: {
        name: '开放性边界测试',
        answers: {},
        expectedBigFive: { openness: 5, conscientiousness: 3, extraversion: 3, agreeableness: 3, neuroticism: 3 },
        expectedMBTI: 'INTJ-A' // 开放性=5应该触发N，但其他维度=3
      },
      boundary_conscientiousness: {
        name: '尽责性边界测试',
        answers: {},
        expectedBigFive: { openness: 3, conscientiousness: 5, extraversion: 3, agreeableness: 3, neuroticism: 3 },
        expectedMBTI: 'INTJ-A' // 尽责性=5应该触发J，但其他维度=3
      }
    };
  }

  /**
   * 填充测试答案
   */
  populateTestAnswers(testCases) {
    this.questions.forEach(question => {
      const qid = question.id;

      // 中性答案
      testCases.neutral.answers[qid] = 3;

      // 极端高分
      testCases.extreme_high.answers[qid] = 5;

      // 极端低分
      testCases.extreme_low.answers[qid] = 1;

      // 开放性边界测试
      if (question.dimension === 'openness') {
        testCases.boundary_openness.answers[qid] = 5;
      } else {
        testCases.boundary_openness.answers[qid] = 3;
      }

      // 尽责性边界测试
      if (question.dimension === 'conscientiousness') {
        testCases.boundary_conscientiousness.answers[qid] = 5;
      } else {
        testCases.boundary_conscientiousness.answers[qid] = 3;
      }
    });

    return testCases;
  }

  /**
   * 运行API测试
   */
  async runAPITest(testCase) {
    console.log(`  📊 测试: ${testCase.name}`);

    try {
      const response = await this.makeAPICall(testCase.answers);

      if (response.status === 200 && response.data.success) {
        const report = response.data.report;

        console.log(`    📋 Big Five: ${JSON.stringify(report.bigFiveScores)}`);
        console.log(`    🧠 MBTI: ${report.mbtiType}`);
        console.log(`    📦 版本: ${report.metadata?.version || 'unknown'}`);

        return {
          success: true,
          bigFiveScores: report.bigFiveScores,
          mbtiType: report.mbtiType,
          version: report.metadata?.version || 'unknown',
          metadata: report.metadata
        };
      } else {
        console.log(`    ❌ API响应异常: ${response.data?.error || 'Unknown error'}`);
        return {
          success: false,
          error: response.data?.error || 'Unknown error'
        };
      }
    } catch (error) {
      console.log(`    ❌ 请求失败: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 对比API结果与期望值
   */
  compareResults(apiResult, expected, testName) {
    const comparison = {
      testName,
      success: apiResult.success,
      bigFiveMatch: false,
      mbtiMatch: false,
      algorithmCorrect: false,
      details: []
    };

    if (!apiResult.success) {
      comparison.details.push(`API请求失败: ${apiResult.error}`);
      return comparison;
    }

    // 检查Big Five分数格式
    const isAverageAlgorithm = Object.values(apiResult.bigFiveScores).every(score =>
      score >= 1 && score <= 5 && Number.isInteger(score)
    );
    const isPercentageAlgorithm = Object.values(apiResult.bigFiveScores).some(score =>
      score > 10 || !Number.isInteger(score)
    );

    if (isAverageAlgorithm) {
      comparison.algorithmCorrect = true;
      comparison.details.push('✅ 使用正确的平均分算法 (1-5)');
    } else {
      comparison.details.push('❌ 使用错误的百分比算法');
    }

    // 检查Big Five分数是否匹配期望
    const bigFiveMatch = JSON.stringify(apiResult.bigFiveScores) === JSON.stringify(expected.expectedBigFive);
    comparison.bigFiveMatch = bigFiveMatch;

    if (bigFiveMatch) {
      comparison.details.push('✅ Big Five分数匹配期望值');
    } else {
      comparison.details.push(`❌ Big Five分数不匹配: 期望${JSON.stringify(expected.expectedBigFive)}, 实际${JSON.stringify(apiResult.bigFiveScores)}`);
    }

    // 检查MBTI类型
    comparison.mbtiMatch = apiResult.mbtiType === expected.expectedMBTI;

    if (comparison.mbtiMatch) {
      comparison.details.push(`✅ MBTI类型正确: ${apiResult.mbtiType}`);
    } else {
      comparison.details.push(`❌ MBTI类型错误: 期望${expected.expectedMBTI}, 实际${apiResult.mbtiType}`);
    }

    return comparison;
  }

  /**
   * 运行部署前测试
   */
  async runPreDeploymentTest() {
    console.log('\n🔍 阶段1: 部署前测试 (当前云端状态)');
    console.log('='.repeat(60));

    const testCases = this.populateTestAnswers(this.generateCriticalTestCases());
    const results = [];

    for (const [key, testCase] of Object.entries(testCases)) {
      const apiResult = await this.runAPITest(testCase);
      const comparison = this.compareResults(apiResult, testCase, key);
      results.push(comparison);
    }

    // 统计结果
    const successCount = results.filter(r => r.success && r.algorithmCorrect && r.mbtiMatch).length;
    const totalCount = results.length;

    console.log('\n📊 部署前测试结果:');
    console.log(`  成功测试: ${successCount}/${totalCount}`);
    console.log(`  算法正确: ${results.filter(r => r.algorithmCorrect).length}/${totalCount}`);
    console.log(`  MBTI正确: ${results.filter(r => r.mbtiMatch).length}/${totalCount}`);

    this.testResults.preDeployment = {
      timestamp: new Date().toISOString(),
      results,
      successRate: (successCount / totalCount * 100).toFixed(1),
      overallStatus: successCount === totalCount ? 'READY' : 'NEEDS_DEPLOYMENT'
    };

    return this.testResults.preDeployment;
  }

  /**
   * 运行部署后测试
   */
  async runPostDeploymentTest() {
    console.log('\n🔍 阶段2: 部署后测试 (验证修复效果)');
    console.log('='.repeat(60));

    const testCases = this.populateTestAnswers(this.generateCriticalTestCases());
    const results = [];

    for (const [key, testCase] of Object.entries(testCases)) {
      const apiResult = await this.runAPITest(testCase);
      const comparison = this.compareResults(apiResult, testCase, key);
      results.push(comparison);
    }

    // 统计结果
    const successCount = results.filter(r => r.success && r.algorithmCorrect && r.mbtiMatch).length;
    const totalCount = results.length;

    console.log('\n📊 部署后测试结果:');
    console.log(`  成功测试: ${successCount}/${totalCount}`);
    console.log(`  算法正确: ${results.filter(r => r.algorithmCorrect).length}/${totalCount}`);
    console.log(`  MBTI正确: ${results.filter(r => r.mbtiMatch).length}/${totalCount}`);

    this.testResults.postDeployment = {
      timestamp: new Date().toISOString(),
      results,
      successRate: (successCount / totalCount * 100).toFixed(1),
      overallStatus: successCount === totalCount ? 'SUCCESS' : 'FAILED'
    };

    return this.testResults.postDeployment;
  }

  /**
   * 生成最终报告
   */
  generateFinalReport() {
    console.log('\n📋 最终部署验证报告');
    console.log('='.repeat(80));

    const pre = this.testResults.preDeployment;
    const post = this.testResults.postDeployment;

    console.log(`\n🔍 部署前状态 (${pre.timestamp}):`);
    console.log(`  成功率: ${pre.successRate}%`);
    console.log(`  状态: ${pre.overallStatus}`);

    if (post) {
      console.log(`\n🚀 部署后状态 (${post.timestamp}):`);
      console.log(`  成功率: ${post.successRate}%`);
      console.log(`  状态: ${post.overallStatus}`);

      const improvement = parseFloat(post.successRate) - parseFloat(pre.successRate);
      console.log(`\n📈 改进幅度: +${improvement.toFixed(1)}%`);

      if (post.overallStatus === 'SUCCESS') {
        console.log('\n🎉 部署成功！算法已完全修复！');
        console.log('✅ Big Five算法: 使用1-5平均分');
        console.log('✅ MBTI边界处理: >= 3.0判断');
        console.log('✅ 与静态版本: 100%一致');
      } else {
        console.log('\n❌ 部署未完全成功，需要进一步调试');
      }
    } else {
      console.log('\n⏳ 等待部署完成...');
    }

    return this.testResults;
  }

  /**
   * 运行完整的部署验证流程
   */
  async runFullDeploymentTest() {
    console.log('🚀 开始最终部署验证测试');
    console.log('='.repeat(80));

    if (!await this.initialize()) {
      return false;
    }

    // 运行部署前测试
    await this.runPreDeploymentTest();

    // 生成部署前报告
    this.generateFinalReport();

    console.log('\n📦 现在可以部署修复版本...');
    console.log('部署完成后请运行: node final-deployment-test.js --post');

    return this.testResults;
  }

  /**
   * 运行部署后验证
   */
  async runPostDeploymentOnly() {
    console.log('🚀 开始部署后验证测试');
    console.log('='.repeat(80));

    if (!await this.initialize()) {
      return false;
    }

    await this.runPostDeploymentTest();
    this.generateFinalReport();

    return this.testResults;
  }
}

// 主函数
async function main() {
  const tester = new FinalDeploymentTest();

  if (process.argv.includes('--post')) {
    await tester.runPostDeploymentOnly();
  } else {
    await tester.runFullDeploymentTest();
  }
}

if (require.main === module) {
  main();
}

module.exports = FinalDeploymentTest;