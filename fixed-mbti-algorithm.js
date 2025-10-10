/**
 * 修复后的MBTI计算算法 - 完全匹配静态版本
 */

/**
 * 修复后的MBTI计算算法 - 精确匹配静态版本
 */
function calculateMBTIFixed(bigFiveScores) {
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
 * 测试修复后的算法
 */
async function testFixedAlgorithm() {
  console.log('🧪 测试修复后的MBTI算法');
  console.log('='.repeat(50));

  // 加载静态版本
  const fs = require('fs');
  const path = require('path');

  const calculatorCode = fs.readFileSync(path.join(__dirname, '../static/js/calculator.js'), 'utf8');
  const dataCode = fs.readFileSync(path.join(__dirname, '../static/js/data.js'), 'utf8');
  eval(calculatorCode);
  eval(dataCode);

  const calculator = new global.PersonalityCalculator();
  const questions = global.QUESTIONS_EN || [];

  // 测试关键用例
  const testCases = [
    {
      name: '中性答案 (全部3分)',
      bigFive: { openness: 3, conscientiousness: 3, extraversion: 3, agreeableness: 3, neuroticism: 3 }
    },
    {
      name: '边界情况 - 开放性=3.0',
      bigFive: { openness: 3, conscientiousness: 2, extraversion: 2, agreeableness: 2, neuroticism: 2 }
    },
    {
      name: '边界情况 - 尽责性=3.0',
      bigFive: { openness: 2, conscientiousness: 3, extraversion: 2, agreeableness: 2, neuroticism: 2 }
    },
    {
      name: '边界情况 - 神经质性=3.0',
      bigFive: { openness: 2, conscientiousness: 2, extraversion: 2, agreeableness: 2, neuroticism: 3 }
    },
    {
      name: '极端高分',
      bigFive: { openness: 5, conscientiousness: 5, extraversion: 5, agreeableness: 5, neuroticism: 5 }
    },
    {
      name: '极端低分',
      bigFive: { openness: 1, conscientiousness: 1, extraversion: 1, agreeableness: 1, neuroticism: 1 }
    }
  ];

  let allTestsPassed = true;

  testCases.forEach(testCase => {
    console.log(`\n📊 测试: ${testCase.name}`);

    // 静态版本结果
    const staticResult = calculator.calculateMBTI(testCase.bigFive);

    // 修复后的算法结果
    const fixedResult = calculateMBTIFixed(testCase.bigFive);

    console.log(`  静态版本: ${staticResult.type}`);
    console.log(`  修复版本: ${fixedResult.type}`);

    const isMatch = staticResult.type === fixedResult.type;
    console.log(`  结果匹配: ${isMatch ? '✅' : '❌'}`);

    if (!isMatch) {
      allTestsPassed = false;
      console.log(`  ❌ 差异详情:`);
      console.log(`    静态维度: EI=${staticResult.dimensions.ei.type}(${staticResult.dimensions.ei.score}), SN=${staticResult.dimensions.sn.type}(${staticResult.dimensions.sn.score}), TF=${staticResult.dimensions.tf.type}(${staticResult.dimensions.tf.score}), JP=${staticResult.dimensions.jp.type}(${staticResult.dimensions.jp.score}), 后缀=${staticResult.dimensions.suffix.type}(${staticResult.dimensions.suffix.score})`);
      console.log(`    修复维度: EI=${fixedResult.dimensions.ei.type}(${fixedResult.dimensions.ei.score}), SN=${fixedResult.dimensions.sn.type}(${fixedResult.dimensions.sn.score}), TF=${fixedResult.dimensions.tf.type}(${fixedResult.dimensions.tf.score}), JP=${fixedResult.dimensions.jp.type}(${fixedResult.dimensions.jp.score}), 后缀=${fixedResult.dimensions.suffix.type}(${fixedResult.dimensions.suffix.score})`);
    }
  });

  console.log(`\n📋 测试总结: ${allTestsPassed ? '✅ 所有测试通过!' : '❌ 仍有失败测试'}`);

  return allTestsPassed;
}

// 如果直接运行此文件
if (require.main === module) {
  testFixedAlgorithm();
}

module.exports = { calculateMBTIFixed, testFixedAlgorithm };