const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeAllQuestions() {
    console.log('开始分析所有题目内容...\n');

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

        // 显示所有题目的详细信息
        questions.forEach((question, index) => {
            console.log(`${index + 1}. ID: ${question.id}`);
            console.log(`   英文: ${question.text || 'N/A'}`);
            console.log(`   中文: ${question.text_zh || question.text_cn || 'N/A'}`);
            console.log(`   分类: ${question.category || 'N/A'}`);
            console.log(`   维度: ${question.dimension || 'N/A'}`);
            console.log(`   选项类型: ${question.options_type || 'N/A'}`);
            console.log('');
        });

        console.log('\n=== 特别检查中文翻译格式问题 ===');

        const problematicQuestions = [];

        questions.forEach((question) => {
            const chineseText = question.text_zh || question.text_cn;

            if (chineseText) {
                // 检查各种可能的翻译问题
                const issues = [];

                // 检查问号
                if (chineseText.includes('？') || chineseText.includes('?')) {
                    issues.push('包含问号');
                }

                // 检查冒号结尾
                if (chineseText.endsWith('：') || chineseText.endsWith(':')) {
                    issues.push('以冒号结尾');
                }

                // 检查"更"字（可能表示比较）
                if (chineseText.includes('更')) {
                    issues.push('包含"更"字');
                }

                // 检查"时，你"结构
                if (chineseText.includes('时，你')) {
                    issues.push('包含"时，你"结构');
                }

                // 检查长句（超过30个字符）
                if (chineseText.length > 30) {
                    issues.push('句子过长');
                }

                if (issues.length > 0) {
                    problematicQuestions.push({
                        id: question.id,
                        text: chineseText,
                        english: question.text,
                        issues: issues
                    });
                }
            }
        });

        if (problematicQuestions.length > 0) {
            console.log(`\n发现 ${problematicQuestions.length} 个可能存在问题的题目：\n`);
            problematicQuestions.forEach((q, index) => {
                console.log(`${index + 1}. ID: ${q.id}`);
                console.log(`   中文: ${q.text}`);
                console.log(`   英文: ${q.english}`);
                console.log(`   问题: ${q.issues.join(', ')}`);
                console.log('');
            });
        } else {
            console.log('未发现明显的格式问题');
        }

    } catch (error) {
        console.error('分析过程中发生错误:', error);
    }
}

// 运行分析
analyzeAllQuestions();