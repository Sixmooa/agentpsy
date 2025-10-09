const https = require('https');
const { URL } = require('url');

const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

async function testMBTITypeAPI() {
  console.log('🔍 测试MBTI类型详细API...');
  console.log('================================================================================');

  try {
    const url = `${SUPABASE_URL}/functions/v1/personality-api/mbti-type/INTP-A?language=zh`;
    const urlObj = new URL(url);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    };

    console.log('📡 请求URL:', url);
    console.log('📡 请求路径:', urlObj.pathname + urlObj.search);

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('📋 HTTP状态码:', res.statusCode);
          console.log('📋 响应头:', JSON.stringify(res.headers, null, 2));
          console.log('📋 MBTI类型API响应数据:', JSON.stringify(result, null, 2));
        } catch (e) {
          console.log('📋 MBTI类型API原始响应:', data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ 请求失败:', error.message);
    });

    req.end();
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testMBTITypeAPI();