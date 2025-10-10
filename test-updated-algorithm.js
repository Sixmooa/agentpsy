/**
 * 测试更新后的算法是否正确
 */

// 将在静态数据加载后从QUESTIONS_EN获取

/**
 * 更新后的Big Five计算算法 - 匹配静态版本
 */
function calculateBigFiveScoresNew(answers, questions) {
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
 * 更新后的MBTI计算算法 - 匹配静态版本
 */
function calculateMBTINew(bigFiveScores) {
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

// 测试不同答案模式
const testPatterns = [
  {
    name: 'neutral',
    description: '所有答案中性分',
    answers: {}
  },
  {
    name: 'extreme_high',
    description: '所有答案最高分',
    answers: {}
  },
  {
    name: 'extreme_low',
    description: '所有答案最低分',
    answers: {}
  }
];

// 加载静态版本的PersonalityCalculator
const fs = require('fs');
const path = require('path');

try {
  console.log('加载静态版本数据...');
  const calculatorCode = fs.readFileSync(path.join(__dirname, '../static/js/calculator.js'), 'utf8');
  const dataCode = fs.readFileSync(path.join(__dirname, '../static/js/data.js'), 'utf8');
  eval(calculatorCode);
  eval(dataCode);

  const PersonalityCalculator = global.PersonalityCalculator;
  const calculator = new PersonalityCalculator();
  const questions = global.QUESTIONS_EN || [];

  console.log(`加载了 ${questions.length} 个问题\n`);

  // 生成测试答案
  testPatterns.forEach(pattern => {
    questions.forEach(question => {
      switch (pattern.name) {
        case 'extreme_high':
          pattern.answers[question.id] = 5;
          break;
        case 'extreme_low':
          pattern.answers[question.id] = 1;
          break;
        case 'neutral':
          pattern.answers[question.id] = 3;
          break;
      }
    });
  });

  console.log('测试更新后的算法效果\n');

  testPatterns.forEach(pattern => {
    console.log(`测试模式: ${pattern.description}`);

    const bigFiveScores = calculateBigFiveScoresNew(pattern.answers, questions);
    const mbtiResult = calculateMBTINew(bigFiveScores);

    console.log('Big Five 分数:', JSON.stringify(bigFiveScores, null, 2));
    console.log('MBTI 结果:', JSON.stringify(mbtiResult, null, 2));
    console.log('---');
  });

  // 测试与静态版本的对比
  console.log('\n验证与静态版本的一致性:');

  // 使用中性答案测试
  const neutralAnswers = testPatterns.find(p => p.name === 'neutral').answers;

  console.log('\n中性答案测试对比:');

  // 静态版本结果
  const staticResult = calculator.generateReport(neutralAnswers, questions, 'en');

  // 新算法结果
  const newBigFive = calculateBigFiveScoresNew(neutralAnswers, questions);
  const newMBTI = calculateMBTINew(newBigFive);

  console.log('静态版本 Big Five:', staticResult.bigFiveScores);
  console.log('新算法 Big Five:', newBigFive);
  console.log('静态版本 MBTI:', staticResult.mbtiResult.type);
  console.log('新算法 MBTI:', newMBTI.type);

  // 检查一致性
  const bigFiveMatch = JSON.stringify(staticResult.bigFiveScores) === JSON.stringify(newBigFive);
  const mbtiMatch = staticResult.mbtiResult.type === newMBTI.type;

  console.log('\n一致性检查:');
  console.log('Big Five 匹配:', bigFiveMatch ? '✅' : '❌');
  console.log('MBTI 匹配:', mbtiMatch ? '✅' : '❌');
  console.log('总体匹配:', (bigFiveMatch && mbtiMatch) ? '✅ 完全一致!' : '❌ 仍有差异');

  // 测试其他模式的一致性
  console.log('\n其他测试模式一致性验证:');
  ['extreme_high', 'extreme_low'].forEach(patternName => {
    const pattern = testPatterns.find(p => p.name === patternName);
    const staticResult = calculator.generateReport(pattern.answers, questions, 'en');
    const newBigFive = calculateBigFiveScoresNew(pattern.answers, questions);
    const newMBTI = calculateMBTINew(newBigFive);

    const bigFiveMatch = JSON.stringify(staticResult.bigFiveScores) === JSON.stringify(newBigFive);
    const mbtiMatch = staticResult.mbtiResult.type === newMBTI.type;

    console.log(`${patternName} - Big Five: ${bigFiveMatch ? '✅' : '❌'}, MBTI: ${mbtiMatch ? '✅' : '❌'}`);
  });

} catch (error) {
  console.error('无法加载静态版本进行比较:', error.message);
}