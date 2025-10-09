/**
 * 测试Android应用答案格式与API期望格式的兼容性
 */

// Supabase配置
const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

// Edge Function URLs
const API_BASE = `${SUPABASE_URL}/functions/v1/personality-api`;

class AndroidFormatTestClient {
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
      console.log(`📥 响应内容:`, responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
      
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

async function testAndroidFormatCompatibility() {
  console.log('================================================================================');
  console.log('🔍 测试Android应用答案格式与API兼容性');
  console.log('================================================================================');
  
  const client = new AndroidFormatTestClient();
  
  try {
    // 1. 获取问题
    console.log('\n📋 步骤1: 获取问题列表');
    const questions = await client.getQuestions('zh');
    console.log(`✅ 成功获取 ${questions.length} 个问题`);
    
    // 取前5个问题进行测试
    const testQuestions = questions.slice(0, 5);
    console.log(`🎯 使用前 ${testQuestions.length} 个问题进行测试`);
    
    // 2. 测试当前API期望的格式（对象格式）
    console.log('\n🧪 步骤2: 测试当前API期望的格式（对象格式）');
    const objectFormatAnswers = {};
    testQuestions.forEach(q => {
      objectFormatAnswers[q.id] = 3;
    });
    
    console.log('📊 对象格式答案:', objectFormatAnswers);
    
    try {
      const objectResult = await client.submitTest(objectFormatAnswers, 'zh', false);
      console.log('✅ 对象格式提交成功!');
    } catch (objectError) {
      console.error('❌ 对象格式提交失败:', objectError.message);
    }
    
    // 3. 测试Android应用发送的格式（数组格式）
    console.log('\n🤖 步骤3: 测试Android应用发送的格式（数组格式）');
    const androidFormatAnswers = testQuestions.map(q => ({
      questionId: q.id,
      answerScore: 3
    }));
    
    console.log('📊 Android格式答案:', androidFormatAnswers);
    
    try {
      const androidResult = await client.submitTest(androidFormatAnswers, 'zh', false);
      console.log('✅ Android格式提交成功!');
    } catch (androidError) {
      console.error('❌ Android格式提交失败:', androidError.message);
      
      // 4. 分析Android格式失败的原因
      console.log('\n🔍 步骤4: 分析Android格式失败的原因');
      console.log('🔍 Android格式特征:');
      console.log('- 数据类型:', Array.isArray(androidFormatAnswers) ? '数组' : '对象');
      console.log('- 数组长度:', androidFormatAnswers.length);
      console.log('- 第一个元素:', androidFormatAnswers[0]);
      console.log('- 元素结构:', Object.keys(androidFormatAnswers[0]));
      
      console.log('\n🔍 API期望格式特征:');
      console.log('- 数据类型:', Array.isArray(objectFormatAnswers) ? '数组' : '对象');
      console.log('- 对象键数量:', Object.keys(objectFormatAnswers).length);
      console.log('- 对象键:', Object.keys(objectFormatAnswers));
      console.log('- 对象值:', Object.values(objectFormatAnswers));
    }
    
    // 5. 测试完整的50题Android格式
    console.log('\n🎯 步骤5: 测试完整的50题Android格式');
    const fullAndroidAnswers = questions.map(q => ({
      questionId: q.id,
      answerScore: 3
    }));
    
    console.log(`📊 完整Android格式答案数量: ${fullAndroidAnswers.length}`);
    
    try {
      const fullAndroidResult = await client.submitTest(fullAndroidAnswers, 'zh', false);
      console.log('✅ 完整Android格式提交成功!');
    } catch (fullAndroidError) {
      console.error('❌ 完整Android格式提交失败:', fullAndroidError.message);
      console.log('🚨 这就是用户遇到的400错误的根本原因！');
    }
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error);
  }
}

// 运行测试
if (require.main === module) {
  testAndroidFormatCompatibility().catch(console.error);
}

module.exports = { testAndroidFormatCompatibility, AndroidFormatTestClient };