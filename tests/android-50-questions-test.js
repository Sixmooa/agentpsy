/**
 * 专门测试Android应用50题提交的脚本
 */

// Supabase配置
const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

class Android50QuestionsTestClient {
  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    };
  }
  
  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${SUPABASE_URL}/functions/v1/personality-api${endpoint}`;
    const options = {
      method,
      headers: this.baseHeaders
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, options);
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      throw error;
    }
  }
  
  async getQuestions(language = 'zh') {
    const response = await this.makeRequest(`/questions?language=${language}`);
    const raw = response.questions || response.data || response;
    return Array.isArray(raw) ? raw : [];
  }
  
  async submitTest(answers, language = 'zh', saveResult = false) {
    return await this.makeRequest('/submit-test', 'POST', {
      answers,
      language,
      saveResult
    });
  }
}

async function testAndroid50Questions() {
  console.log('🤖 测试Android应用50题提交');
  console.log('================================================================================');
  
  const client = new Android50QuestionsTestClient();
  
  try {
    // 1. 获取所有问题
    console.log('📋 获取问题列表...');
    const questions = await client.getQuestions('zh');
    console.log(`✅ 获取到 ${questions.length} 个问题`);
    
    if (questions.length !== 50) {
      console.log(`⚠️  警告：期望50个问题，实际获取到${questions.length}个`);
    }
    
    // 2. 生成Android格式的答案
    console.log('\n🎯 生成Android格式的50题答案...');
    const androidAnswers = questions.map(q => ({
      questionId: q.id,
      answerScore: Math.floor(Math.random() * 5) + 1 // 随机答案1-5
    }));
    
    console.log(`📊 生成了 ${androidAnswers.length} 个答案`);
    console.log('📝 答案格式示例:', androidAnswers.slice(0, 3));
    
    // 3. 提交测试
    console.log('\n🚀 提交Android格式答案...');
    
    const startTime = Date.now();
    const result = await client.submitTest(androidAnswers, 'zh', false);
    const endTime = Date.now();
    
    console.log(`✅ 提交成功！耗时: ${endTime - startTime}ms`);
    
    // 4. 验证结果
    if (result.success && result.report) {
      console.log('\n📊 测试结果:');
      console.log(`- MBTI类型: ${result.report.mbtiResult?.type || 'N/A'}`);
      console.log(`- 语言: ${result.report.language}`);
      console.log(`- 时间戳: ${result.report.timestamp}`);
      
      if (result.report.bigFiveScores) {
        const scores = result.report.bigFiveScores;
        console.log('- Big Five分数:');
        console.log(`  外向性: ${scores.extraversion?.toFixed(1) || 'N/A'}`);
        console.log(`  开放性: ${scores.openness?.toFixed(1) || 'N/A'}`);
        console.log(`  尽责性: ${scores.conscientiousness?.toFixed(1) || 'N/A'}`);
        console.log(`  宜人性: ${scores.agreeableness?.toFixed(1) || 'N/A'}`);
        console.log(`  神经质: ${scores.neuroticism?.toFixed(1) || 'N/A'}`);
      }
      
      console.log('\n🎉 Android应用50题提交测试成功！');
      console.log('✅ 用户的400错误已经修复！');
      
      return true;
    } else {
      console.log('❌ 测试结果格式异常');
      console.log('响应:', result);
      return false;
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.message.includes('400')) {
      console.log('\n🚨 仍然存在400错误！');
      console.log('可能的原因:');
      console.log('1. API修复未部署到Supabase Edge Function');
      console.log('2. 答案验证逻辑仍有问题');
      console.log('3. 网络连接问题');
    }
    
    return false;
  }
}

// 运行多次测试确保稳定性
async function runMultipleTests() {
  console.log('🔄 运行多次测试确保稳定性');
  console.log('================================================================================');
  
  const testCount = 3;
  let successCount = 0;
  
  for (let i = 1; i <= testCount; i++) {
    console.log(`\n🧪 第 ${i} 次测试:`);
    const success = await testAndroid50Questions();
    if (success) {
      successCount++;
    }
    
    if (i < testCount) {
      console.log('⏳ 等待2秒后进行下一次测试...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n================================================================================');
  console.log('📊 多次测试结果汇总');
  console.log('================================================================================');
  console.log(`总测试次数: ${testCount}`);
  console.log(`成功次数: ${successCount}`);
  console.log(`成功率: ${(successCount / testCount * 100).toFixed(1)}%`);
  
  if (successCount === testCount) {
    console.log('\n🎉 所有测试都成功！Android应用50题提交功能完全正常！');
  } else if (successCount > 0) {
    console.log('\n⚠️  部分测试成功，可能存在间歇性问题');
  } else {
    console.log('\n❌ 所有测试都失败，需要进一步调试');
  }
}

// 运行测试
if (require.main === module) {
  runMultipleTests().catch(console.error);
}

module.exports = { testAndroid50Questions, Android50QuestionsTestClient };