const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkChineseQuestions() {
    console.log('开始检查中文题目翻译质量...\n');

    try {
        // 查询所有题目
        const { data: questions, error } = await supabase
            .from('questions')
            .select('*')
            .order('id');

        if (error) {
            console.error('查询题目失败:', error);
            return;
        }

        console.log(`找到 ${questions.length} 个题目\n`);

        // 分析中文题目翻译问题
        const problematicQuestions = [];

        questions.forEach((question, index) => {
            const chineseText = question.text_zh || question.text_cn || question.text;

            if (chineseText) {
                // 检查常见的翻译问题模式
                const issues = [];

                // 检查是否有"你更注重"、"你更倾向于"等不适用于同意/不同意量表的表达
                if (chineseText.includes('更注重') || chineseText.includes('更倾向于')) {
                    issues.push('包含比较级表达，不适合同意/不同意量表');
                }

                // 检查是否有问号（应该改为陈述句）
                if (chineseText.includes('？') || chineseText.includes('?')) {
                    issues.push('包含问号，应该是陈述句');
                }

                // 检查是否有"在学习新事物时，你更注重："这样的表达
                if (chineseText.includes('时，你')) {
                    issues.push('包含时间状语从句，结构复杂');
                }

                // 检查是否有冒号结尾
                if (chineseText.endsWith('：') || chineseText.endsWith(':')) {
                    issues.push('以冒号结尾，格式不正确');
                }

                if (issues.length > 0) {
                    problematicQuestions.push({
                        id: question.id,
                        text: chineseText,
                        issues: issues,
                        category: question.category,
                        dimension: question.dimension
                    });
                }
            }
        });

        // 输出问题题目
        if (problematicQuestions.length > 0) {
            console.log('发现翻译问题的题目：\n');
            problematicQuestions.forEach((q, index) => {
                console.log(`${index + 1}. ID: ${q.id}`);
                console.log(`   分类: ${q.category || 'N/A'}`);
                console.log(`   维度: ${q.dimension || 'N/A'}`);
                console.log(`   题目: ${q.text}`);
                console.log(`   问题: ${q.issues.join(', ')}`);
                console.log('');
            });

            console.log(`\n共发现 ${problematicQuestions.length} 个需要修复的题目`);
        } else {
            console.log('未发现明显的翻译问题');
        }

        return problematicQuestions;

    } catch (error) {
        console.error('检查过程中发生错误:', error);
    }
}

// 运行检查
checkChineseQuestions();