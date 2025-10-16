const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkQuestionsAgain() {
    console.log('重新检查questions表（使用正确字段名）...\n');

    try {
        // 查询所有题目，使用正确的字段名
        const { data: questions, error } = await supabase
            .from('questions')
            .select('*')
            .order('id');

        if (error) {
            console.error('查询题目失败:', error);
            return;
        }

        console.log(`找到 ${questions.length} 个题目\n`);

        // 分析每个题目
        const problematicQuestions = [];

        questions.forEach((question, index) => {
            const chineseText = question.text_zh;
            const englishText = question.text_en;

            console.log(`${index + 1}. ID: ${question.id}`);
            console.log(`   中文: ${chineseText || 'N/A'}`);
            console.log(`   英文: ${englishText || 'N/A'}`);
            console.log(`   维度: ${question.dimension || 'N/A'}`);
            console.log(`   反向计分: ${question.reverse || false}`);
            console.log('');

            // 检查中文翻译问题
            if (chineseText) {
                const issues = [];

                // 检查是否包含用户提到的问题模式
                if (chineseText.includes('更注重')) {
                    issues.push('包含"更注重"');
                }

                if (chineseText.includes('更倾向于')) {
                    issues.push('包含"更倾向于"');
                }

                if (chineseText.includes('时，你')) {
                    issues.push('包含"时，你"结构');
                }

                if (chineseText.includes('？') || chineseText.includes('?')) {
                    issues.push('包含问号');
                }

                if (chineseText.endsWith('：') || chineseText.endsWith(':')) {
                    issues.push('以冒号结尾');
                }

                // 检查是否是不适合同意/不同意量表的句式
                if (chineseText.includes('在学习新事物时') || chineseText.includes('在') && chineseText.includes('时')) {
                    issues.push('包含时间状语从句');
                }

                if (issues.length > 0) {
                    problematicQuestions.push({
                        id: question.id,
                        chinese: chineseText,
                        english: englishText,
                        dimension: question.dimension,
                        issues: issues
                    });
                }
            }
        });

        // 输出问题总结
        console.log('=== 问题总结 ===');
        if (problematicQuestions.length > 0) {
            console.log(`发现 ${problematicQuestions.length} 个需要修复的题目：\n`);
            problematicQuestions.forEach((q, index) => {
                console.log(`${index + 1}. ID: ${q.id}`);
                console.log(`   维度: ${q.dimension}`);
                console.log(`   中文: ${q.chinese}`);
                console.log(`   英文: ${q.english}`);
                console.log(`   问题: ${q.issues.join(', ')}`);
                console.log('');
            });
        } else {
            console.log('所有题目格式都正确');
        }

        // 提供修复建议
        if (problematicQuestions.length > 0) {
            console.log('\n=== 修复建议 ===');
            problematicQuestions.forEach(q => {
                console.log(`ID ${q.id}:`);
                console.log(`  原文: ${q.chinese}`);
                console.log(`  建议: 需要改为简单的陈述句，适合用同意/不同意来回答`);
                console.log('');
            });
        }

        return problematicQuestions;

    } catch (error) {
        console.error('检查过程中发生错误:', error);
        return [];
    }
}

// 运行检查
checkQuestionsAgain();