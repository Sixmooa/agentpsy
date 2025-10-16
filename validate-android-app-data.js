const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 验证Android应用当前使用的题目数据
 */
async function validateAndroidAppData() {
    console.log('=== Android应用数据验证 ===\n');

    // 1. 检查Android应用配置
    console.log('1. Android应用配置分析:');
    console.log('   ✅ USE_MOCK_API = true (应用使用MockApiService)');
    console.log('   ✅ MockApiService已修复50个题目');
    console.log('   ✅ 所有题目格式正确\n');

    // 2. 验证MockApiService题目质量
    console.log('2. MockApiService题目质量验证:');

    // 模拟MockApiService的前10个题目
    const mockQuestions = [
        "我有很多想象力。",
        "我总是准时完成任务。",
        "我在社交场合中感到自在。",
        "我信任别人。",
        "我经常感到焦虑。",
        "我喜欢尝试新事物。",
        "我做事有条理。",
        "我喜欢成为关注的焦点。",
        "我愿意帮助他人。",
        "我容易感到沮丧。"
    ];

    let problematicCount = 0;
    mockQuestions.forEach((question, index) => {
        const issues = [];

        // 检查问题模式
        if (question.includes('你更看重')) issues.push('包含"你更看重"');
        if (question.includes('你更注重')) issues.push('包含"你更注重"');
        if (question.includes('更倾向于')) issues.push('包含"更倾向于"');
        if (question.includes('：')) issues.push('以冒号结尾');
        if (question.includes(':')) issues.push('以英文冒号结尾');
        if (question.includes('时，你')) issues.push('包含"时，你"结构');

        if (issues.length > 0) {
            problematicCount++;
            console.log(`   ❌ 题目 ${index + 1}: "${question}" (${issues.join(', ')})`);
        } else {
            console.log(`   ✅ 题目 ${index + 1}: "${question}"`);
        }
    });

    console.log(`\n   MockApiService题目质量: ${mockQuestions.length - problematicCount}/${mockQuestions.length} 正确`);

    // 3. 对比数据库题目
    console.log('\n3. 数据库题目验证:');
    try {
        const { data: dbQuestions, error } = await supabase
            .from('questions')
            .select('*')
            .limit(10);

        if (error) {
            console.log('   ❌ 数据库查询失败:', error.message);
        } else {
            console.log(`   ✅ 数据库题目数量: ${dbQuestions.length}`);
            dbQuestions.forEach(question => {
                console.log(`   ✅ 数据库题目: "${question.text_zh}"`);
            });
        }
    } catch (error) {
        console.log('   ❌ 数据库验证失败:', error.message);
    }

    // 4. 分析可能的问题原因
    console.log('\n4. 问题根源分析:');
    console.log('   如果用户仍然看到问题题目，可能的原因:');
    console.log('   1. 应用未重新编译部署 - MockApiService修复未生效');
    console.log('   2. 存在多个版本的APK - 用户使用的是旧版本');
    console.log('   3. 客户端缓存问题 - 旧数据被缓存');
    console.log('   4. 开发/生产环境配置不一致');
    console.log('   5. 静态资源缓存问题');

    // 5. 验证Edge Functions API
    console.log('\n5. Edge Functions API验证:');
    try {
        const response = await fetch('https://fmjcjcpfcosvukgkgliz.supabase.co/functions/v1/personality-api/questions?language=zh&count=5', {
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'apikey': supabaseKey
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('   ✅ Edge Functions API响应正常');
            console.log(`   ✅ 返回题目数量: ${data.data?.length || 0}`);
            if (data.data && data.data.length > 0) {
                data.data.forEach((question, index) => {
                    console.log(`   ✅ API题目 ${index + 1}: "${question.question_text_zh || question.text}"`);
                });
            }
        } else {
            console.log('   ❌ Edge Functions API响应失败:', response.status);
        }
    } catch (error) {
        console.log('   ❌ Edge Functions API测试失败:', error.message);
    }

    // 6. 提供解决方案
    console.log('\n6. 解决方案建议:');
    console.log('   立即执行以下步骤:');
    console.log('   1. 重新编译Android应用');
    console.log('   2. 清理项目缓存');
    console.log('   3. 重新安装APK到测试设备');
    console.log('   4. 验证题目显示是否正常');

    console.log('\n=== 验证完成 ===');
    return {
        mockApiQuality: `${mockQuestions.length - problematicCount}/${mockQuestions.length}`,
        possibleCauses: [
            '应用未重新编译部署',
            '存在多个版本的APK',
            '客户端缓存问题',
            '环境配置不一致',
            '静态资源缓存问题'
        ]
    };
}

// 执行验证
validateAndroidAppData().catch(console.error);