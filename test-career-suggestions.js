/**
 * 测试CareerSuggestion数据格式
 */

const https = require('https');
const { URL } = require('url');

const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

function makeRequest(endpoint, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const url = `${SUPABASE_URL}/functions/v1/personality-api${endpoint}`;
    const urlObj = new URL(url);

    const postData = body ? JSON.stringify(body) : null;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    };
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: headers
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            data: result
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            data: null,
            rawData: data
          });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function testCareerSuggestions() {
  console.log('🔍 测试CareerSuggestion数据格式...');
  console.log('================================================================================');

  try {
    // 1. 获取50题
    console.log('📋 获取50题...');
    const questionsResponse = await makeRequest('/questions?language=zh&count=50');
    const questions = questionsResponse.data?.data || questionsResponse.data?.questions || [];
    console.log(`✅ 获取到 ${questions.length} 个问题`);

    // 2. 生成均匀分布的答案
    console.log('📊 生成答案...');
    const answers = questions.map((q, index) => ({
      questionId: q.id,
      answerScore: (index % 5) + 1 // 1-5分均匀分布
    }));
    console.log(`✅ 生成 ${answers.length} 个答案`);

    // 3. 提交完整测试
    console.log('\n🚀 提交完整测试...');
    const submitResponse = await makeRequest('/submit-test', 'POST', {
      answers: answers,
      language: 'zh',
      saveResult: false
    });

    console.log(`✅ 提交状态码: ${submitResponse.statusCode}`);

    if (submitResponse.data?.success && submitResponse.data?.report) {
      const report = submitResponse.data.report;
      console.log('\n📊 报告分析:');
      console.log(`- MBTI类型: ${report.mbtiType}`);
      console.log(`- careerSuggestions长度: ${report.careerSuggestions ? report.careerSuggestions.length : 0}`);

      if (report.careerSuggestions && report.careerSuggestions.length > 0) {
        console.log('\n🎯 CareerSuggestion数据结构分析:');
        const firstCareer = report.careerSuggestions[0];
        console.log(JSON.stringify(firstCareer, null, 2));

        console.log('\n📋 字段映射检查:');
        console.log('- id:', firstCareer.id !== undefined ? '✅ 存在' : '❌ 缺失');
        console.log('- mbti_type:', firstCareer.mbti_type !== undefined ? '✅ 存在' : '❌ 缺失');
        console.log('- career_zh:', firstCareer.career_zh !== undefined ? '✅ 存在' : '❌ 缺失');
        console.log('- career_en:', firstCareer.career_en !== undefined ? '✅ 存在' : '❌ 缺失');

        // 显示前3个职业建议
        console.log('\n📝 前3个职业建议:');
        report.careerSuggestions.slice(0, 3).forEach((career, index) => {
          console.log(`${index + 1}. ${career.career_zh || career.career || 'N/A'}`);
        });

        return {
          success: true,
          careerSuggestions: report.careerSuggestions,
          hasData: true
        };
      } else {
        console.log('⚠️ careerSuggestions为空数组，这可能是正常的');
        return {
          success: true,
          careerSuggestions: [],
          hasData: false
        };
      }
    } else {
      console.log('❌ 提交失败');
      console.log('响应:', submitResponse.data);
      return {
        success: false,
        error: submitResponse.data?.error || 'Unknown error'
      };
    }
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

testCareerSuggestions();