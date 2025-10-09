/**
 * 诊断数据模型字段映射问题
 * 基于TDD方法，先诊断问题再制定修复方案
 */

const https = require('https');
const { URL } = require('url');

const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

class DiagnosticClient {
  constructor() {
    this.baseHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    };
  }

  async makeRequest(endpoint, method = 'GET', body = null) {
    const url = `${SUPABASE_URL}/functions/v1/personality-api${endpoint}`;
    const urlObj = new URL(url);

    const postData = body ? JSON.stringify(body) : null;
    const headers = { ...this.baseHeaders };
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          try {
            const jsonResponse = JSON.parse(data);
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: jsonResponse,
              rawData: data
            });
          } catch (error) {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              data: null,
              rawData: data,
              parseError: error.message
            });
          }
        });
      });

      req.on('error', reject);
      if (postData) req.write(postData);
      req.end();
    });
  }

  async diagnoseAnswerOptions() {
    console.log('🔍 诊断AnswerOption数据格式...');
    console.log('================================================================================');

    try {
      const response = await this.makeRequest('/answer-options?language=zh');

      console.log('📋 HTTP状态码:', response.statusCode);
      console.log('📋 响应结构分析:');

      if (response.data) {
        console.log('- success:', response.data.success);
        console.log('- data类型:', Array.isArray(response.data.data) ? 'Array' : typeof response.data.data);
        console.log('- data长度:', response.data.data ? response.data.data.length : 'N/A');

        if (response.data.data && response.data.data.length > 0) {
          const firstOption = response.data.data[0];
          console.log('\n📊 第一个AnswerOption数据结构:');
          console.log(JSON.stringify(firstOption, null, 2));

          console.log('\n🎯 字段映射分析:');
          console.log('- id:', firstOption.id !== undefined ? '✅ 存在' : '❌ 缺失');
          console.log('- option_text_zh:', firstOption.option_text_zh !== undefined ? '✅ 存在' : '❌ 缺失');
          console.log('- option_text_en:', firstOption.option_text_en !== undefined ? '✅ 存在' : '❌ 缺失');
          console.log('- score:', firstOption.score !== undefined ? '✅ 存在' : '❌ 缺失');

          // 检查可能的替代字段名
          console.log('\n🔍 检查可能的替代字段名:');
          console.log('- text:', firstOption.text !== undefined ? '✅ 可能替代 option_text_zh' : '❌ 不存在');
          console.log('- optionText:', firstOption.optionText !== undefined ? '✅ 可能替代' : '❌ 不存在');
          console.log('- value:', firstOption.value !== undefined ? '✅ 可能替代 score' : '❌ 不存在');
        }
      } else {
        console.log('❌ 响应数据解析失败');
        console.log('原始数据:', response.rawData);
      }

      return response;
    } catch (error) {
      console.error('❌ 诊断失败:', error.message);
      return null;
    }
  }

  async diagnoseCareerSuggestions() {
    console.log('\n🔍 诊断CareerSuggestion数据格式...');
    console.log('================================================================================');

    try {
      // 先提交一个测试获取职业建议
      const questionsResponse = await this.makeRequest('/questions?language=zh&count=3');
      const questions = questionsResponse.data?.data || questionsResponse.data?.questions || [];

      if (questions.length === 0) {
        console.log('❌ 无法获取问题数据');
        return null;
      }

      const answers = questions.slice(0, 1).map(q => ({
        questionId: q.id,
        answerScore: 3
      }));

      const submitResponse = await this.makeRequest('/submit-test', 'POST', {
        answers,
        language: 'zh',
        saveResult: false
      });

      console.log('📋 提交测试状态码:', submitResponse.statusCode);

      if (submitResponse.data?.success && submitResponse.data?.report) {
        const report = submitResponse.data.report;
        console.log('- careerSuggestions类型:', Array.isArray(report.careerSuggestions) ? 'Array' : typeof report.careerSuggestions);
        console.log('- careerSuggestions长度:', report.careerSuggestions ? report.careerSuggestions.length : 'N/A');

        if (report.careerSuggestions && report.careerSuggestions.length > 0) {
          const firstCareer = report.careerSuggestions[0];
          console.log('\n📊 第一个CareerSuggestion数据结构:');
          console.log(JSON.stringify(firstCareer, null, 2));

          console.log('\n🎯 字段映射分析:');
          console.log('- id:', firstCareer.id !== undefined ? '✅ 存在' : '❌ 缺失');
          console.log('- mbti_type:', firstCareer.mbti_type !== undefined ? '✅ 存在' : '❌ 缺失');
          console.log('- career_zh:', firstCareer.career_zh !== undefined ? '✅ 存在' : '❌ 缺失');
          console.log('- career_en:', firstCareer.career_en !== undefined ? '✅ 存在' : '❌ 缺失');

          // 检查可能的替代字段名
          console.log('\n🔍 检查可能的替代字段名:');
          console.log('- career:', firstCareer.career !== undefined ? '✅ 可能替代 career_zh' : '❌ 不存在');
          console.log('- careerName:', firstCareer.careerName !== undefined ? '✅ 可能替代' : '❌ 不存在');
          console.log('- title:', firstCareer.title !== undefined ? '✅ 可能替代' : '❌ 不存在');
          console.log('- name:', firstCareer.name !== undefined ? '✅ 可能替代' : '❌ 不存在');
        } else {
          console.log('⚠️ careerSuggestions为空数组');
        }
      } else {
        console.log('❌ 无法获取测试报告');
        console.log('响应:', submitResponse.data);
      }

      return submitResponse;
    } catch (error) {
      console.error('❌ 诊断失败:', error.message);
      return null;
    }
  }

  async diagnoseButtonLogic() {
    console.log('\n🔍 诊断最后一题按钮逻辑问题...');
    console.log('================================================================================');

    console.log('📋 当前问题分析:');
    console.log('1. 用户选择答案后依然显示"下一题"而不是"提交答案"');
    console.log('2. 这表明canNavigateNext状态没有正确更新');
    console.log('3. 需要检查QuestionViewModel中的逻辑');

    console.log('\n🎯 需要检查的关键点:');
    console.log('- selectAnswer方法中的isLastQuestion逻辑');
    console.log('- updateCurrentQuestion方法中的canNavigateNext覆盖问题');
    console.log('- QuestionScreen中的按钮显示逻辑');

    return {
      diagnosis: 'ButtonLogicIssue',
      recommendation: '检查QuestionViewModel.kt中的updateCurrentQuestion方法'
    };
  }
}

async function runFullDiagnosis() {
  console.log('🧪 开始数据模型诊断');
  console.log('================================================================================');

  const client = new DiagnosticClient();

  // 1. 诊断AnswerOption
  const answerOptionDiagnosis = await client.diagnoseAnswerOptions();

  // 2. 诊断CareerSuggestion
  const careerSuggestionDiagnosis = await client.diagnoseCareerSuggestions();

  // 3. 诊断按钮逻辑
  const buttonLogicDiagnosis = await client.diagnoseButtonLogic();

  console.log('\n================================================================================');
  console.log('📊 诊断结果汇总');
  console.log('================================================================================');

  console.log('🎯 修复计划:');
  console.log('1. 基于AnswerOption诊断结果修复字段映射');
  console.log('2. 基于CareerSuggestion诊断结果修复字段映射');
  console.log('3. 修复QuestionViewModel中的按钮逻辑');
  console.log('4. 创建单元测试验证修复效果');
  console.log('5. 运行集成测试验证完整流程');

  return {
    answerOptionDiagnosis,
    careerSuggestionDiagnosis,
    buttonLogicDiagnosis
  };
}

if (require.main === module) {
  runFullDiagnosis().catch(console.error);
}

module.exports = { DiagnosticClient, runFullDiagnosis };