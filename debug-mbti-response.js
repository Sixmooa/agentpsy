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

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(data);
          console.log('📋 HTTP状态码:', res.statusCode);
          console.log('📋 响应头:', JSON.stringify(res.headers, null, 2));
          console.log('📋 原始响应数据:', JSON.stringify(jsonResponse, null, 2));

          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(jsonResponse);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        } catch (error) {
          console.log('📋 原始文本响应:', data);
          reject(error);
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (postData) {
      req.write(postData);
    }

    req.end();
  });
}

async function debugSubmitTest() {
  console.log('🔍 调试提交测试响应结构...');
  console.log('================================================================================');

  try {
    // 1. 获取问题
    console.log('📋 获取问题列表...');
    const questionsResponse = await makeRequest('/questions?language=zh&count=50');
    const questions = questionsResponse.questions || questionsResponse.data || questionsResponse;
    console.log(`✅ 获取到 ${questions.length} 个问题`);

    // 2. 生成答案
    const answers = questions.slice(0, 3).map(q => ({
      questionId: q.id,
      answerScore: Math.floor(Math.random() * 5) + 1
    }));

    console.log('📝 提交答案:', answers);

    // 3. 提交测试并查看详细响应
    console.log('\n🚀 提交测试...');
    const submitResponse = await makeRequest('/submit-test', 'POST', {
      answers: answers,
      language: 'zh',
      saveResult: false
    });

    console.log('\n📊 完整响应结构:');
    console.log(JSON.stringify(submitResponse, null, 2));

    // 4. 特别关注MBTI相关的字段
    console.log('\n🎯 重点分析MBTI相关字段:');
    if (submitResponse.report) {
      console.log('report字段存在');
      console.log('report.mbtiResult:', submitResponse.report.mbtiResult);
      console.log('report.mbtiTypeInfo:', submitResponse.report.mbtiTypeInfo);

      if (submitResponse.report.mbtiResult) {
        console.log('mbtiResult结构:', JSON.stringify(submitResponse.report.mbtiResult, null, 2));
      }

      if (submitResponse.report.mbtiTypeInfo) {
        console.log('mbtiTypeInfo结构:', JSON.stringify(submitResponse.report.mbtiTypeInfo, null, 2));
      }
    } else {
      console.log('❌ report字段不存在');
    }

  } catch (error) {
    console.error('❌ 调试失败:', error.message);
  }
}

debugSubmitTest();