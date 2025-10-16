const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

/**
 * 调试Edge Functions API响应
 */
async function debugEdgeFunctions() {
    console.log('🔍 调试Edge Functions API...\n');

    const url = 'https://fmjcjcpfcosvukgkgliz.supabase.co/functions/v1/personality-api/questions?language=zh&count=5';

    console.log(`请求URL: ${url}`);
    console.log('请求头:', {
        'Authorization': `Bearer ${supabaseKey.substring(0, 20)}...`,
        'apikey': supabaseKey.substring(0, 20) + '...'
    });

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey,
                'Content-Type': 'application/json'
            }
        });

        console.log(`\n响应状态: ${response.status} ${response.statusText}`);
        console.log('响应头:', Object.fromEntries(response.headers.entries()));

        const responseText = await response.text();
        console.log(`\n响应体 (原始): ${responseText}`);

        try {
            const data = JSON.parse(responseText);
            console.log('\n解析后的响应:', JSON.stringify(data, null, 2));

            if (data.success && data.data) {
                console.log('\n✅ API响应正常');
                console.log(`返回题目数量: ${data.data.length}`);

                // 检查题目质量
                let problematicCount = 0;
                data.data.forEach((question, index) => {
                    const text = question.question_text_zh || question.text;
                    console.log(`\n题目 ${index + 1}: "${text}"`);

                    const issues = [];
                    if (text.includes('你更看重')) issues.push('包含"你更看重"');
                    if (text.includes('你更注重')) issues.push('包含"你更注重"');
                    if (text.includes('更倾向于')) issues.push('包含"更倾向于"');
                    if (text.includes('：')) issues.push('以冒号结尾');

                    if (issues.length > 0) {
                        problematicCount++;
                        console.log(`   ❌ 问题: ${issues.join(', ')}`);
                    } else {
                        console.log(`   ✅ 格式正确`);
                    }
                });

                console.log(`\nEdge Functions题目质量: ${data.data.length - problematicCount}/${data.data.length} 正确`);

            } else {
                console.log('\n❌ API响应格式错误');
            }

        } catch (parseError) {
            console.log('\n❌ JSON解析失败:', parseError.message);
        }

    } catch (error) {
        console.log('\n❌ 请求失败:', error.message);
    }
}

// 执行调试
debugEdgeFunctions();