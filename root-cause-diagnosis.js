const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseRootCause() {
    console.log('=== 问题根源深度诊断 ===\n');

    try {
        // 1. 检查数据库中的实际题目
        console.log('1. 检查数据库中的实际题目...');
        const { data: questions, error } = await supabase
            .from('questions')
            .select('*')
            .order('id');

        if (error) {
            console.error('❌ 数据库查询失败:', error);
            return;
        }

        console.log(`   找到 ${questions.length} 个题目\n`);

        // 2. 详细分析每个题目
        let problematicQuestions = [];
        questions.forEach((question, index) => {
            const chineseText = question.text_zh;
            const issues = [];

            // 检查用户报告的问题模式
            if (chineseText.includes('你更看重')) {
                issues.push('包含"你更看重"');
            }
            if (chineseText.includes('你更注重')) {
                issues.push('包含"你更注重"');
            }
            if (chineseText.includes('更倾向于')) {
                issues.push('包含"更倾向于"');
            }
            if (chineseText.includes('：')) {
                issues.push('以冒号结尾');
            }
            if (chineseText.includes('时，你')) {
                issues.push('包含"时，你"结构');
            }

            if (issues.length > 0) {
                problematicQuestions.push({
                    id: question.id,
                    text: chineseText,
                    dimension: question.dimension,
                    issues: issues
                });
            }
        });

        // 3. 输出诊断结果
        console.log('2. 诊断结果:');
        console.log(`   总题目数: ${questions.length}`);
        console.log(`   问题题目数: ${problematicQuestions.length}`);
        console.log(`   问题比例: ${(problematicQuestions.length / questions.length * 100).toFixed(1)}%\n`);

        if (problematicQuestions.length > 0) {
            console.log('3. 发现的问题题目:');
            problematicQuestions.forEach((q, index) => {
                console.log(`   ${index + 1}. ID ${q.id}: "${q.text}"`);
                console.log(`      维度: ${q.dimension}`);
                console.log(`      问题: ${q.issues.join(', ')}`);
                console.log('');
            });
        } else {
            console.log('✅ 数据库中没有发现题目翻译问题');
        }

        // 4. 检查题目分布
        console.log('4. 题目分布分析:');
        const dimensionCount = {};
        questions.forEach(q => {
            dimensionCount[q.dimension] = (dimensionCount[q.dimension] || 0) + 1;
        });
        Object.entries(dimensionCount).forEach(([dimension, count]) => {
            console.log(`   ${dimension}: ${count} 个题目`);
        });

        // 5. 提供诊断结论
        console.log('\n5. 诊断结论:');
        if (problematicQuestions.length > 0) {
            console.log('❌ 数据库中确实存在题目翻译问题');
            console.log('📝 需要从数据库层面进行修复');
            console.log('🔧 建议直接修复数据库中的问题题目');
        } else {
            console.log('✅ 数据库中的题目格式正确');
            console.log('🤔 问题可能来自其他数据源（如API、缓存、客户端代码等）');
            console.log('🔍 需要进一步检查其他可能的数据源');
        }

        return {
            totalQuestions: questions.length,
            problematicQuestions: problematicQuestions,
            hasDatabaseIssues: problematicQuestions.length > 0
        };

    } catch (error) {
        console.error('诊断过程中发生错误:', error);
    }
}

// 执行诊断
diagnoseRootCause();