const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabaseStructure() {
    console.log('开始检查数据库结构...\n');

    try {
        // 检查questions表的结构
        console.log('=== 检查questions表结构 ===');
        const { data: sampleQuestions, error: qError } = await supabase
            .from('questions')
            .select('*')
            .limit(1);

        if (qError) {
            console.error('查询questions表失败:', qError);
        } else if (sampleQuestions && sampleQuestions.length > 0) {
            console.log('questions表字段:', Object.keys(sampleQuestions[0]));
        }

        // 检查是否有其他相关的表
        console.log('\n=== 检查其他可能的表 ===');

        // 尝试查询可能的其他表名
        const possibleTables = [
            'mbti_questions',
            'personality_questions',
            'test_questions',
            'survey_questions',
            'chinese_questions',
            'belbin_questions'
        ];

        for (const tableName of possibleTables) {
            try {
                const { data, error } = await supabase
                    .from(tableName)
                    .select('*')
                    .limit(1);

                if (error) {
                    // 表不存在或无权限
                    continue;
                }

                if (data && data.length > 0) {
                    console.log(`找到表: ${tableName}`);
                    console.log(`字段: ${Object.keys(data[0])}`);
                    console.log(`数据量: 需要进一步查询`);
                    console.log('');
                }
            } catch (e) {
                // 继续检查下一个表
                continue;
            }
        }

        // 检查是否有包含"更注重"或类似表达的记录
        console.log('=== 搜索可能的问题题目 ===');

        // 使用RPC调用搜索文本内容
        const { data: searchResults, error: searchError } = await supabase
            .from('questions')
            .select('*')
            .or('text_zh.ilike.%更注重%,text_zh.ilike.%更倾向于%,text_zh.ilike.%时，你%,text_zh.ilike.%？%,text_zh.ilike.%?%');

        if (searchError) {
            console.log('搜索未找到特定模式的题目');
        } else if (searchResults && searchResults.length > 0) {
            console.log(`找到 ${searchResults.length} 个可能存在问题的题目:`);
            searchResults.forEach(q => {
                console.log(`ID: ${q.id}, 中文: ${q.text_zh || q.text_cn}`);
            });
        } else {
            console.log('未找到包含特定问题模式的题目');
        }

        // 检查Edge Functions中是否有相关问题
        console.log('\n=== 检查Edge Functions ===');
        console.log('需要进一步检查Edge Functions中是否有硬编码的题目文本');

    } catch (error) {
        console.error('检查过程中发生错误:', error);
    }
}

// 运行检查
checkDatabaseStructure();