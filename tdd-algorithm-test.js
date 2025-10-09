/**
 * TDD驱动的算法对比测试框架
 * 用于精确定位Supabase算法与静态版本的差异
 */

const fs = require('fs');
const path = require('path');

class AlgorithmTestSuite {
  constructor() {
    this.staticCalculator = null;
    this.questions = [];
    this.testResults = [];
  }

  /**
   * 初始化测试环境
   */
  async initialize() {
    console.log('🔧 初始化TDD测试环境...');

    try {
      // 加载静态版本
      const calculatorCode = fs.readFileSync(path.join(__dirname, '../static/js/calculator.js'), 'utf8');
      const dataCode = fs.readFileSync(path.join(__dirname, '../static/js/data.js'), 'utf8');
      eval(calculatorCode);
      eval(dataCode);

      this.staticCalculator = new global.PersonalityCalculator();
      this.questions = global.QUESTIONS_EN || [];

      console.log(`✅ 加载了 ${this.questions.length} 个问题`);
      console.log('✅ 静态版本PersonalityCalculator已加载');

      return true;
    } catch (error) {
      console.error('❌ 初始化失败:', error.message);
      return false;
    }
  }

  /**
   * 生成标准测试数据
   */
  generateTestData() {
    const patterns = {
      neutral: {},
      extreme_high: {},
      extreme_low: {},
      mixed_1: {},
      mixed_2: {},
      edge_case: {}
    };

    this.questions.forEach((question, index) => {
      const qid = question.id;

      // 中性模式：全部答案为3
      patterns.neutral[qid] = 3;

      // 极高模式：全部答案为5
      patterns.extreme_high[qid] = 5;

      // 极低模式：全部答案为1
      patterns.extreme_low[qid] = 1;

      // 混合模式1：高低交替
      patterns.mixed_1[qid] = (index % 2 === 0) ? 5 : 1;

      // 混合模式2：递增模式
      patterns.mixed_2[qid] = ((index % 5) + 1);

      // 边界情况：特定维度的极端值
      if (question.dimension === 'openness') {
        patterns.edge_case[qid] = 5;
      } else if (question.dimension === 'neuroticism') {
        patterns.edge_case[qid] = 1;
      } else {
        patterns.edge_case[qid] = 3;
      }
    });

    return patterns;
  }

  /**
   * 单元测试：Big Five计算对比
   */
  testBigFiveCalculation() {
    console.log('\n🧪 单元测试：Big Five计算对比');
    console.log('='.repeat(50));

    const testData = this.generateTestData();
    const results = [];

    Object.entries(testData).forEach(([patternName, answers]) => {
      console.log(`\n📊 测试模式: ${patternName}`);

      // 静态版本计算
      const staticResult = this.staticCalculator.generateReport(answers, this.questions, 'en');
      const staticBigFive = staticResult.bigFiveScores;

      // Supabase版本计算（复制算法）
      const supabaseBigFive = this.calculateBigFiveScoresSupabase(answers, this.questions);

      // 对比结果
      const comparison = this.compareBigFive(staticBigFive, supabaseBigFive, patternName);
      results.push(comparison);

      // 详细输出
      console.log('  静态版本:', JSON.stringify(staticBigFive));
      console.log('  Supabase版本:', JSON.stringify(supabaseBigFive));
      console.log('  是否一致:', comparison.isIdentical ? '✅' : '❌');

      if (!comparison.isIdentical) {
        console.log('  差异详情:');
        comparison.differences.forEach(diff => {
          console.log(`    ${diff.dimension}: 静态=${diff.static}, Supabase=${diff.supabase}, 差异=${diff.diff}`);
        });
      }
    });

    this.testResults.push({
      testType: 'bigFive',
      results
    });

    return results;
  }

  /**
   * 单元测试：MBTI计算对比
   */
  testMBTICalculation() {
    console.log('\n🧪 单元测试：MBTI计算对比');
    console.log('='.repeat(50));

    const testData = this.generateTestData();
    const results = [];

    Object.entries(testData).forEach(([patternName, answers]) => {
      console.log(`\n📊 测试模式: ${patternName}`);

      // 静态版本计算
      const staticResult = this.staticCalculator.generateReport(answers, this.questions, 'en');
      const staticMBTI = staticResult.mbtiResult;
      const staticBigFive = staticResult.bigFiveScores;

      // Supabase版本计算
      const supabaseBigFive = this.calculateBigFiveScoresSupabase(answers, this.questions);
      const supabaseMBTI = this.calculateMBTISupabase(supabaseBigFive);

      // 对比结果
      const comparison = this.compareMBTI(staticMBTI, supabaseMBTI, patternName);
      results.push(comparison);

      // 详细输出
      console.log('  静态版本MBTI:', staticMBTI.type);
      console.log('  Supabase版本MBTI:', supabaseMBTI.type);
      console.log('  是否一致:', comparison.isIdentical ? '✅' : '❌');

      if (!comparison.isIdentical) {
        console.log('  Big Five对比:');
        console.log('    静态:', JSON.stringify(staticBigFive));
        console.log('    Supabase:', JSON.stringify(supabaseBigFive));
        console.log('  MBTI差异:', comparison.differences);
      }
    });

    this.testResults.push({
      testType: 'mbti',
      results
    });

    return results;
  }

  /**
   * Supabase版本的Big Five计算（复制自当前实现）
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
   * Supabase版本的MBTI计算（复制自当前实现）
   */
  calculateMBTISupabase(bigFiveScores) {
    const dimensions = {};
    const confidence = {};

    // E/I - 基于外向性，使用3.0作为中点
    const extraversionScore = bigFiveScores.extraversion;
    dimensions.EI = extraversionScore > 3.0 ? 'E' : 'I';
    confidence.EI = Math.abs(extraversionScore - 3.0) / 2.0;

    // S/N - 基于开放性，使用3.0作为中点
    const opennessScore = bigFiveScores.openness;
    dimensions.SN = opennessScore > 3.0 ? 'N' : 'S';
    confidence.SN = Math.abs(opennessScore - 3.0) / 2.0;

    // T/F - 基于宜人性，使用3.0作为中点
    const agreeablenessScore = bigFiveScores.agreeableness;
    dimensions.TF = agreeablenessScore > 3.0 ? 'F' : 'T';
    confidence.TF = Math.abs(agreeablenessScore - 3.0) / 2.0;

    // J/P - 基于尽责性，使用3.0作为中点
    const conscientiousnessScore = bigFiveScores.conscientiousness;
    dimensions.JP = conscientiousnessScore > 3.0 ? 'J' : 'P';
    confidence.JP = Math.abs(conscientiousnessScore - 3.0) / 2.0;

    const mbtiType = dimensions.EI + dimensions.SN + dimensions.TF + dimensions.JP;

    // 基于神经质性添加-A/-T后缀，匹配静态版本逻辑
    const neuroticismScore = bigFiveScores.neuroticism;
    let suffix = '';
    if (neuroticismScore < 2.5) {
      suffix = '-A';
    } else if (neuroticismScore > 3.5) {
      suffix = '-T';
    }

    return {
      type: mbtiType + suffix,
      dimensions,
      confidence
    };
  }

  /**
   * 对比Big Five分数
   */
  compareBigFive(staticScores, supabaseScores, testName) {
    const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const differences = [];
    let isIdentical = true;

    dimensions.forEach(dimension => {
      const staticValue = staticScores[dimension];
      const supabaseValue = supabaseScores[dimension];

      if (Math.abs(staticValue - supabaseValue) > 0.001) { // 允许微小的浮点误差
        differences.push({
          dimension,
          static: staticValue,
          supabase: supabaseValue,
          diff: Math.abs(staticValue - supabaseValue)
        });
        isIdentical = false;
      }
    });

    return {
      testName,
      isIdentical,
      differences,
      staticScores,
      supabaseScores
    };
  }

  /**
   * 对比MBTI结果
   */
  compareMBTI(staticMBTI, supabaseMBTI, testName) {
    const differences = [];
    let isIdentical = true;

    // 对比MBTI类型
    if (staticMBTI.type !== supabaseMBTI.type) {
      differences.push({
        type: 'mbti_type',
        static: staticMBTI.type,
        supabase: supabaseMBTI.type
      });
      isIdentical = false;
    }

    // 对比维度
    if (staticMBTI.dimensions && supabaseMBTI.dimensions) {
      ['EI', 'SN', 'TF', 'JP'].forEach(dimension => {
        const staticDim = staticMBTI.dimensions[dimension];
        const supabaseDim = supabaseMBTI.dimensions[dimension];

        if (staticDim !== supabaseDim) {
          differences.push({
            type: 'dimension',
            dimension,
            static: staticDim,
            supabase: supabaseDim
          });
          isIdentical = false;
        }
      });
    }

    return {
      testName,
      isIdentical,
      differences,
      staticMBTI: staticMBTI.type,
      supabaseMBTI: supabaseMBTI.type
    };
  }

  /**
   * 运行完整的测试套件
   */
  async runFullTestSuite() {
    console.log('🚀 开始TDD算法对比测试');
    console.log('='.repeat(60));

    if (!await this.initialize()) {
      return false;
    }

    // 运行Big Five测试
    const bigFiveResults = this.testBigFiveCalculation();

    // 运行MBTI测试
    const mbtiResults = this.testMBTICalculation();

    // 生成总结报告
    this.generateSummaryReport();

    return {
      bigFiveResults,
      mbtiResults
    };
  }

  /**
   * 生成总结报告
   */
  generateSummaryReport() {
    console.log('\n📋 TDD测试总结报告');
    console.log('='.repeat(60));

    let totalTests = 0;
    let passedTests = 0;

    this.testResults.forEach(testGroup => {
      console.log(`\n🔍 ${testGroup.testType.toUpperCase()} 测试结果:`);

      testGroup.results.forEach(result => {
        totalTests++;
        if (result.isIdentical) {
          passedTests++;
          console.log(`  ✅ ${result.testName}: 通过`);
        } else {
          console.log(`  ❌ ${result.testName}: 失败 (${result.differences.length} 个差异)`);
        }
      });
    });

    const successRate = (passedTests / totalTests * 100).toFixed(1);
    console.log(`\n📊 总体结果: ${passedTests}/${totalTests} 通过 (${successRate}%)`);

    if (passedTests === totalTests) {
      console.log('🎉 所有测试通过！算法完全一致。');
    } else {
      console.log('⚠️  发现算法差异，需要进一步调试和修复。');
    }
  }
}

// 运行测试
async function main() {
  const testSuite = new AlgorithmTestSuite();
  await testSuite.runFullTestSuite();
}

if (require.main === module) {
  main();
}

module.exports = AlgorithmTestSuite;