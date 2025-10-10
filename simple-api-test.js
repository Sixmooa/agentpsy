/**
 * 简单的API测试，检查Supabase响应格式
 */

const https = require('https');
const { URL } = require('url');

const SUPABASE_URL = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const requestOptions = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY,
                ...options.headers
            }
        };

        const req = https.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    resolve({ status: res.statusCode, data: result });
                } catch (error) {
                    reject(error);
                }
            });
        });

        req.on('error', reject);

        if (options.body) {
            req.write(JSON.stringify(options.body));
        }

        req.end();
    });
}

async function testAPIResponse() {
    console.log('测试Supabase API响应格式...\n');

    // 生成简单测试答案
    const testAnswers = {};
    for (let i = 1; i <= 50; i++) {
        testAnswers[i] = 3; // 全部中性答案
    }

    try {
        console.log('提交测试答案到Supabase...');
        const response = await makeRequest(
            `${SUPABASE_URL}/functions/v1/personality-api/submit-test`,
            {
                method: 'POST',
                body: {
                    answers: testAnswers,
                    language: 'en',
                    saveResult: false
                }
            }
        );

        console.log(`HTTP状态码: ${response.status}`);
        console.log('完整响应数据:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.success) {
            console.log('\n成功获取结果!');
            const report = response.data.report;

            console.log('\n大五人格得分:');
            console.log(JSON.stringify(report.bigFiveScores, null, 2));

            console.log('\nMBTI结果:');
            console.log(JSON.stringify(report.mbtiResult, null, 2));
        } else {
            console.log('API返回错误:', response.data.error);
        }

    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

testAPIResponse();