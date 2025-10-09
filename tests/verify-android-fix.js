/**
 * 验证Android格式修复的测试脚本
 */

// Supabase配置
const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

// Edge Function URLs
const API_BASE = `${SUPABASE_URL}/functions/v1/personality-api`;

class AndroidFixTestClient {
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
    
    console.log(`\n🔍 发送请求: ${method} ${url}`);
    if (body) {
      console.log(`📤 请求体:`, JSON.stringify(body, null, 2));
    }
    
    try {
      const response = await fetch(url, options);
      
      console.log(`📥 响应状态: ${response.status} ${response.statusText}`);
      
      const responseText = await response.text();
      console.log(`📥 响应内容:`, responseText.substring(0, 300) + (responseText.length > 300 ? '...' : ''));
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error(`❌ 请求失败:`, error.message);
      throw error;
    }
  }
  
  async getQuestions(language = 'zh') {
    const response = await this.makeRequest(`/questions?language=${language}`);
    const raw = response.questions || response.data || response;
    const arr = Array.isArray(raw) ? raw : [];
    return arr.map(q => ({
      ...q,
      text: q.text ?? (language === 'zh' 
        ? (q.question_text_zh ?? q.text_zh)
        : (q.question_text_en ?? q.text_en))
    }));
  }
  
  async submitTest(answers, language = 'zh', saveResult = false) {
    return await this.makeRequest('/submit-test', 'POST', {
      answers,
      language,
      saveResult
    });
  }
}

async function verifyAndroidFix() {
  console.log('================================================================================');
  console.log('🔧 验证Android格式修复');
  console.log('================================================================================');
  
  const client = new AndroidFixTestClient();
  let testResults = {
    objectFormat: false,
    androidFormat: false,
    fullAndroidFormat: false
  };
  
  try {
    // 1. 获取问题
    console.log('\n📋 步骤1: 获取问题列表');
    const questions = await client.getQuestions('zh');
    console.log(`✅ 成功获取 ${questions.length} 个问题`);
    
    // 2. 测试对象格式（确保向后兼容）
    console.log('\n🧪 步骤2: 测试对象格式（向后兼容性）');
    const objectFormatAnswers = {};
    questions.slice(0, 5).forEach(q => {
      objectFormatAnswers[q.id] = 3;
    });
    
    try {
      const objectResult = await client.submitTest(objectFormatAnswers, 'zh', false);
      console.log('✅ 对象格式提交成功!');
      testResults.objectFormat = true;
    } catch (objectError) {
      console.error('❌ 对象格式提交失败:', objectError.message);
    }
    
    // 3. 测试Android数组格式（5题）
    console.log('\n🤖 步骤3: 测试Android数组格式（5题）');
    const androidFormatAnswers = questions.slice(0, 5).map(q => ({
      questionId: q.id,
      answerScore: 3
    }));
    
    try {
      const androidResult = await client.submitTest(androidFormatAnswers, 'zh', false);
      console.log('✅ Android格式（5题）提交成功!');
      testResults.androidFormat = true;
    } catch (androidError) {
      console.error('❌ Android格式（5题）提交失败:', androidError.message);
    }
    
    // 4. 测试完整的50题Android格式
    console.log('\n🎯 步骤4: 测试完整的50题Android格式');
    const fullAndroidAnswers = questions.map(q => ({
      questionId: q.id,
      answerScore: Math.floor(Math.random() * 5) + 1 // 随机答案1-5
    }));
    
    console.log(`📊 完整Android格式答案数量: ${fullAndroidAnswers.length}`);
    
    try {
      const fullAndroidResult = await client.submitTest(fullAndroidAnswers, 'zh', false);
      console.log('✅ 完整Android格式（50题）提交成功!');
      console.log('🎉 用户的400错误已修复!');
      testResults.fullAndroidFormat = true;
      
      // 显示测试结果摘要
      if (fullAndroidResult.report) {
        console.log('\n📊 测试结果摘要:');
        console.log(`- MBTI类型: ${fullAndroidResult.report.mbtiResult?.type || 'N/A'}`);
        console.log(`- 语言: ${fullAndroidResult.report.language}`);
        console.log(`- 时间戳: ${fullAndroidResult.report.timestamp}`);
      }
    } catch (fullAndroidError) {
      console.error('❌ 完整Android格式（50题）提交失败:', fullAndroidError.message);
    }
    
    // 5. 测试边界情况
    console.log('\n🔍 步骤5: 测试边界情况');
    
    // 测试无效答案分数
    const invalidScoreAnswers = questions.slice(0, 3).map(q => ({
      questionId: q.id,
      answerScore: 6 // 无效分数
    }));
    
    try {
      await client.submitTest(invalidScoreAnswers, 'zh', false);
      console.log('❌ 无效分数测试失败：应该返回400错误');
    } catch (invalidScoreError) {
      console.log('✅ 无效分数正确被拒绝:', invalidScoreError.message);
    }
    
    // 测试不完整答案
    const incompleteAnswers = questions.slice(0, 3).map(q => ({
      questionId: q.id,
      answerScore: 3
    }));
    
    try {
      await client.submitTest(incompleteAnswers, 'zh', false);
      console.log('❌ 不完整答案测试失败：应该返回400错误');
    } catch (incompleteError) {
      console.log('✅ 不完整答案正确被拒绝:', incompleteError.message);
    }
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  }
  
  // 6. 测试结果总结
  console.log('\n================================================================================');
  console.log('📊 测试结果总结');
  console.log('================================================================================');
  
  const totalTests = Object.keys(testResults).length;
  const passedTests = Object.values(testResults).filter(result => result).length;
  const successRate = (passedTests / totalTests * 100).toFixed(1);
  
  console.log(`✅ 对象格式兼容性: ${testResults.objectFormat ? '通过' : '失败'}`);
  console.log(`✅ Android格式支持: ${testResults.androidFormat ? '通过' : '失败'}`);
  console.log(`✅ 完整50题Android格式: ${testResults.fullAndroidFormat ? '通过' : '失败'}`);
  console.log(`\n🎯 总体成功率: ${successRate}% (${passedTests}/${totalTests})`);
  
  if (testResults.fullAndroidFormat) {
    console.log('\n🎉 修复成功！Android应用现在可以正常提交50题答案了！');
  } else {
    console.log('\n⚠️  修复可能不完整，需要进一步调试。');
  }
}

// 运行测试
if (require.main === module) {
  verifyAndroidFix().catch(console.error);
}

module.exports = { verifyAndroidFix, AndroidFixTestClient };