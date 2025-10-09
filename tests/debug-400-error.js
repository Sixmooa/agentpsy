/**
 * 专门用于调试50题答案提交400错误的测试脚本
 */

// Supabase配置
const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

// Edge Function URLs
const API_BASE = `${SUPABASE_URL}/functions/v1/personality-api`;

class DebugClient {
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
      console.log(`📥 响应内容:`, responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      return JSON.parse(responseText);
    } catch (error) {
      console.error(`❌ 请求失败:`, error.message);
      throw error;
    }
  }
  
  async getQuestions(language = 'en') {
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
  
  async submitTest(answers, language = 'en', saveResult = false) {
    return await this.makeRequest('/submit-test', 'POST', {
      answers,
      language,
      saveResult
    });
  }
}

async function debugSubmissionError() {
  console.log('================================================================================');
  console.log('🐛 调试50题答案提交400错误');
  console.log('================================================================================');
  
  const client = new DebugClient();
  
  try {
    // 1. 获取问题
    console.log('\n📋 步骤1: 获取问题列表');
    const questions = await client.getQuestions('zh');
    console.log(`✅ 成功获取 ${questions.length} 个问题`);
    
    if (questions.length !== 50) {
      console.warn(`⚠️  警告: 期望50个问题，实际获取到 ${questions.length} 个`);
    }
    
    // 2. 生成完整的50题答案
    console.log('\n📝 步骤2: 生成完整的50题答案');
    const completeAnswers = {};
    questions.forEach(q => {
      completeAnswers[q.id] = 3; // 中性答案
    });
    
    console.log(`✅ 生成了 ${Object.keys(completeAnswers).length} 个答案`);
    console.log('📊 答案样本:', Object.entries(completeAnswers).slice(0, 5));
    
    // 3. 提交完整答案
    console.log('\n🚀 步骤3: 提交完整的50题答案');
    try {
      const result = await client.submitTest(completeAnswers, 'zh', false);
      console.log('✅ 提交成功!');
      console.log('📊 结果:', JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('❌ 提交失败:', error.message);
      
      // 4. 分析错误原因
      console.log('\n🔍 步骤4: 分析错误原因');
      
      // 检查答案格式
      console.log('🔍 检查答案格式:');
      console.log('- 答案数量:', Object.keys(completeAnswers).length);
      console.log('- 问题数量:', questions.length);
      console.log('- 答案键类型:', typeof Object.keys(completeAnswers)[0]);
      console.log('- 问题ID类型:', typeof questions[0].id);
      
      // 检查是否所有问题都有答案
      const missingAnswers = questions.filter(q => !(q.id in completeAnswers));
      if (missingAnswers.length > 0) {
        console.log('❌ 缺少答案的问题:', missingAnswers.map(q => q.id));
      } else {
        console.log('✅ 所有问题都有答案');
      }
      
      // 检查答案值是否有效
      const invalidAnswers = Object.entries(completeAnswers).filter(([id, value]) => 
        value < 1 || value > 5 || !Number.isInteger(value)
      );
      if (invalidAnswers.length > 0) {
        console.log('❌ 无效的答案值:', invalidAnswers);
      } else {
        console.log('✅ 所有答案值都有效 (1-5)');
      }
      
      // 5. 尝试不同的答案格式
      console.log('\n🔄 步骤5: 尝试不同的答案格式');
      
      // 尝试字符串键
      const stringKeyAnswers = {};
      questions.forEach(q => {
        stringKeyAnswers[String(q.id)] = 3;
      });
      
      console.log('🔍 尝试字符串键格式...');
      try {
        const stringResult = await client.submitTest(stringKeyAnswers, 'zh', false);
        console.log('✅ 字符串键格式成功!');
      } catch (stringError) {
        console.log('❌ 字符串键格式也失败:', stringError.message);
      }
      
      // 尝试数字键
      const numberKeyAnswers = {};
      questions.forEach(q => {
        numberKeyAnswers[Number(q.id)] = 3;
      });
      
      console.log('🔍 尝试数字键格式...');
      try {
        const numberResult = await client.submitTest(numberKeyAnswers, 'zh', false);
        console.log('✅ 数字键格式成功!');
      } catch (numberError) {
        console.log('❌ 数字键格式也失败:', numberError.message);
      }
    }
    
  } catch (error) {
    console.error('💥 调试过程中发生错误:', error);
  }
}

// 运行调试
if (require.main === module) {
  debugSubmissionError().catch(console.error);
}

module.exports = { debugSubmissionError, DebugClient };