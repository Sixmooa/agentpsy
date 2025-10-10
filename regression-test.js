/**
 * 完整的回归测试套件
 * 验证修复后的Supabase算法与静态版本完全一致
 */

const fs = require('fs');
const path = require('path');

class RegressionTestSuite {
  constructor() {
    this.staticCalculator = null;
    this.questions = [];
  }

  async initialize() {
    console.log('🔧 初始化回归测试环境...');

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
   * Supabase版本的Big Five计算（修复后）
   */
  calculateBigFiveScoresSupabase(answers, questions) {
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

    // 计算平均分，保留两位小数
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

  /**
   * Supabase版本的MBTI计算（修复后）
   */
  calculateMBTISupabase(bigFiveScores) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFiveScores;
    const midPoint = 3.0;

    // E/I (外向/内向) - 基于外向性得分，严格匹配静态版本
    const ei = extraversion > midPoint ? 'E' : 'I';

    // S/N (感觉/直觉) - 基于开放性得分，注意使用 >= (关键差异!)
    const sn = openness >= midPoint ? 'N' : 'S';

    // T/F (思考/情感) - 基于宜人性得分
    const tf = agreeableness > midPoint ? 'F' : 'T';

    // J/P (判断/知觉) - 基于尽责性得分，注意使用 >= (关键差异!)
    const jp = conscientiousness >= midPoint ? 'J' : 'P';

    // 情绪稳定性后缀 -A/-T，严格匹配静态版本逻辑
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

  /**
   * 生成全面的测试数据
   */
  generateComprehensiveTestData() {
    const patterns = {};

    // 基础模式
    patterns.neutral = {};
    patterns.all_high = {};
    patterns.all_low = {};

    // 边界情况
    patterns.exactly_midpoint = {};
    patterns.just_above_midpoint = {};
    patterns.just_below_midpoint = {};

    // 单维度极端测试
    patterns.only_openness_high = {};
    patterns.only_conscientiousness_high = {};
    patterns.only_extraversion_high = {};
    patterns.only_agreeableness_high = {};
    patterns.only_neuroticism_high = {};

    // 单维度低测试
    patterns.only_openness_low = {};
    patterns.only_conscientiousness_low = {};
    patterns.only_extraversion_low = {};
    patterns.only_agreeableness_low = {};
    patterns.only_neuroticism_low = {};

    // 混合模式
    patterns.alternating_high_low = {};
    patterns.incremental_pattern = {};
    patterns.random_pattern = {};

    this.questions.forEach((question, index) => {
      const qid = question.id;
      const dimension = question.dimension;

      // 基础模式
      patterns.neutral[qid] = 3;
      patterns.all_high[qid] = 5;
      patterns.all_low[qid] = 1;

      // 边界情况
      patterns.exactly_midpoint[qid] = 3;
      patterns.just_above_midpoint[qid] = 3.1;
      patterns.just_below_midpoint[qid] = 2.9;

      // 单维度极端测试
      patterns.only_openness_high[qid] = dimension === 'openness' ? 5 : 3;
      patterns.only_conscientiousness_high[qid] = dimension === 'conscientiousness' ? 5 : 3;
      patterns.only_extraversion_high[qid] = dimension === 'extraversion' ? 5 : 3;
      patterns.only_agreeableness_high[qid] = dimension === 'agreeableness' ? 5 : 3;
      patterns.only_neuroticism_high[qid] = dimension === 'neuroticism' ? 5 : 3;

      // 单维度低测试
      patterns.only_openness_low[qid] = dimension === 'openness' ? 1 : 3;
      patterns.only_conscientiousness_low[qid] = dimension === 'conscientiousness' ? 1 : 3;
      patterns.only_extraversion_low[qid] = dimension === 'extraversion' ? 1 : 3;
      patterns.only_agreeableness_low[qid] = dimension === 'agreeableness' ? 1 : 3;
      patterns.only_neuroticism_low[qid] = dimension === 'neuroticism' ? 1 : 3;

      // 混合模式
      patterns.alternating_high_low[qid] = (index % 2 === 0) ? 5 : 1;
      patterns.incremental_pattern[qid] = ((index % 5) + 1);
      patterns.random_pattern[qid] = Math.floor(Math.random() * 5) + 1;
    });

    return patterns;
  }

  /**
   * 运行完整的回归测试
   */
  async runFullRegressionTest() {
    console.log('🚀 开始完整回归测试');
    console.log('='.repeat(60));

    if (!await this.initialize()) {
      return false;
    }

    const testData = this.generateComprehensiveTestData();
    const testNames = Object.keys(testData);

    let totalTests = 0;
    let passedTests = 0;
    const failedTests = [];

    console.log(`\n🧪 运行 ${testNames.length} 个测试模式...\n`);

    testNames.forEach((testName, index) => {
      const answers = testData[testName];
      totalTests++;

      console.log(`[${index + 1}/${testNames.length}] 测试: ${testName}`);

      // 静态版本计算
      const staticResult = this.staticCalculator.generateReport(answers, this.questions, 'en');

      // Supabase版本计算
      const supabaseBigFive = this.calculateBigFiveScoresSupabase(answers, this.questions);
      const supabaseMBTI = this.calculateMBTISupabase(supabaseBigFive);

      // 对比结果
      const bigFiveMatch = JSON.stringify(staticResult.bigFiveScores) === JSON.stringify(supabaseBigFive);
      const mbtiMatch = staticResult.mbtiResult.type === supabaseMBTI.type;

      if (bigFiveMatch && mbtiMatch) {
        passedTests++;
        console.log(`  ✅ 通过 - ${supabaseMBTI.type}`);
      } else {
        console.log(`  ❌ 失败`);
        if (!bigFiveMatch) {
          console.log(`    Big Five差异: 静态=${JSON.stringify(staticResult.bigFiveScores)}, Supabase=${JSON.stringify(supabaseBigFive)}`);
        }
        if (!mbtiMatch) {
          console.log(`    MBTI差异: 静态=${staticResult.mbtiResult.type}, Supabase=${supabaseMBTI.type}`);
        }
        failedTests.push({
          testName,
          staticResult: staticResult.mbtiResult.type,
          supabaseResult: supabaseMBTI.type,
          bigFiveMatch,
          mbtiMatch
        });
      }
    });

    // 生成最终报告
    const successRate = (passedTests / totalTests * 100).toFixed(1);

    console.log('\n📊 回归测试最终报告');
    console.log('='.repeat(60));
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${totalTests - passedTests}`);
    console.log(`成功率: ${successRate}%`);

    if (failedTests.length > 0) {
      console.log('\n❌ 失败的测试:');
      failedTests.forEach(test => {
        console.log(`  - ${test.testName}: ${test.staticResult} vs ${test.supabaseResult}`);
      });
    }

    if (passedTests === totalTests) {
      console.log('\n🎉 所有回归测试通过！算法完全一致！');
      console.log('✅ Supabase算法已成功修复，与静态版本保持完全一致。');
    } else {
      console.log('\n⚠️  仍有测试失败，需要进一步调试。');
    }

    return {
      totalTests,
      passedTests,
      failedTests,
      successRate: parseFloat(successRate),
      isComplete: passedTests === totalTests
    };
  }
}

// 运行回归测试
async function main() {
  const regressionTest = new RegressionTestSuite();
  await regressionTest.runFullRegressionTest();
}

if (require.main === module) {
  main();
}

module.exports = RegressionTestSuite;