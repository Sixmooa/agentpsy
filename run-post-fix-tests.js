/**
 * 修复后的数据一致性测试
 * 验证修复后的本地static数据与云端数据的一致性
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 修复后的数据一致性测试
 */
class PostFixConsistencyTest {
    constructor() {
        this.testResults = [];
    }

    /**
     * 读取更新后的本地数据
     */
    getUpdatedLocalData() {
        try {
            const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');
            const fileContent = fs.readFileSync(dataJsPath, 'utf8');

            // 提取CAREER_SUGGESTIONS数据
            const careerMatch = fileContent.match(/const CAREER_SUGGESTIONS = \{[\s\S]*?\};/);
            if (!careerMatch) {
                throw new Error('无法找到CAREER_SUGGESTIONS定义');
            }

            const careerDataStr = careerMatch[0].replace('const CAREER_SUGGESTIONS = ', '');
            const careerData = eval(`(${careerDataStr})`);

            console.log('📖 成功读取更新后的本地数据');
            console.log(`   发现 ${Object.keys(careerData).length} 个MBTI类型`);

            return careerData;
        } catch (error) {
            console.error('❌ 读取本地数据失败:', error.message);
            return null;
        }
    }

    /**
     * 获取云端数据
     */
    async getSupabaseData() {
        try {
            const { data, error } = await supabase
                .from('career_suggestions')
                .select('*')
                .order('mbti_type, id');

            if (error) throw error;

            // 按MBTI类型分组
            const groupedData = {};
            data.forEach(item => {
                if (!groupedData[item.mbti_type]) {
                    groupedData[item.mbti_type] = [];
                }
                groupedData[item.mbti_type].push(item.career_zh);
            });

            console.log('☁️  成功获取云端数据');
            console.log(`   发现 ${Object.keys(groupedData).length} 个MBTI类型，${data.length} 条记录`);

            return groupedData;
        } catch (error) {
            console.error('❌ 获取云端数据失败:', error.message);
            return null;
        }
    }

    /**
     * 验证单个MBTI类型的一致性
     */
    verifyTypeConsistency(type, localCareers, supabaseCareers) {
        const missingInLocal = supabaseCareers.filter(career => !localCareers.includes(career));
        const missingInSupabase = localCareers.filter(career => !supabaseCareers.includes(career));

        const isConsistent = missingInLocal.length === 0 && missingInSupabase.length === 0;

        return {
            type,
            localCareers,
            supabaseCareers,
            missingInLocal,
            missingInSupabase,
            isConsistent,
            localCount: localCareers.length,
            supabaseCount: supabaseCareers.length
        };
    }

    /**
     * 运行完整的一致性验证
     */
    async runConsistencyVerification() {
        console.log('🔍 开始运行修复后的数据一致性验证...\n');

        // 获取数据
        const localData = this.getUpdatedLocalData();
        const supabaseData = await this.getSupabaseData();

        if (!localData || !supabaseData) {
            console.log('❌ 无法获取必要数据，验证失败');
            return false;
        }

        // 验证类型覆盖
        const localTypes = Object.keys(localData);
        const supabaseTypes = Object.keys(supabaseData);

        console.log('\n📊 类型覆盖分析:');
        console.log(`   本地MBTI类型: ${localTypes.length} (${localTypes.join(', ')})`);
        console.log(`   云端MBTI类型: ${supabaseTypes.length} (${supabaseTypes.join(', ')})`);

        const missingInLocal = supabaseTypes.filter(type => !localTypes.includes(type));
        const missingInSupabase = localTypes.filter(type => !supabaseTypes.includes(type));

        if (missingInLocal.length > 0) {
            console.log(`   ⚠️  云端有但本地没有: ${missingInLocal.join(', ')}`);
        }
        if (missingInSupabase.length > 0) {
            console.log(`   ⚠️  本地有但云端没有: ${missingInSupabase.join(', ')}`);
        }
        if (missingInLocal.length === 0 && missingInSupabase.length === 0) {
            console.log('   ✅ MBTI类型覆盖完全一致');
        }

        // 验证每个类型的职业建议
        console.log('\n🔍 职业建议详细验证:');
        const commonTypes = localTypes.filter(type => supabaseTypes.includes(type));
        const typeResults = [];

        for (const type of commonTypes) {
            const result = this.verifyTypeConsistency(
                type,
                localData[type],
                supabaseData[type]
            );

            typeResults.push(result);

            if (result.isConsistent) {
                console.log(`   ✅ ${type}: 完全一致 (${result.localCount}个职业)`);
            } else {
                console.log(`   ❌ ${type}: 存在差异`);
                console.log(`      本地 (${result.localCount}): ${result.localCareers.join(', ')}`);
                console.log(`      云端 (${result.supabaseCount}): ${result.supabaseCareers.join(', ')}`);
                if (result.missingInLocal.length > 0) {
                    console.log(`      云端新增: ${result.missingInLocal.join(', ')}`);
                }
                if (result.missingInSupabase.length > 0) {
                    console.log(`      本地独有: ${result.missingInSupabase.join(', ')}`);
                }
            }
        }

        // 统计结果
        const consistentTypes = typeResults.filter(r => r.isConsistent);
        const inconsistentTypes = typeResults.filter(r => !r.isConsistent);

        console.log('\n📈 验证结果统计:');
        console.log(`   总验证类型: ${typeResults.length}`);
        console.log(`   ✅ 完全一致: ${consistentTypes.length}`);
        console.log(`   ❌ 存在差异: ${inconsistentTypes.length}`);
        console.log(`   📊 一致性率: ${((consistentTypes.length / typeResults.length) * 100).toFixed(1)}%`);

        // 生成验证报告
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTypes: typeResults.length,
                consistentTypes: consistentTypes.length,
                inconsistentTypes: inconsistentTypes.length,
                consistencyRate: (consistentTypes.length / typeResults.length) * 100,
                fullyConsistent: inconsistentTypes.length === 0
            },
            details: typeResults,
            conclusion: inconsistentTypes.length === 0 ? '✅ 修复成功，数据完全一致' : '⚠️ 仍有不一致，需要进一步检查'
        };

        // 保存报告
        const reportPath = path.join(__dirname, 'post-fix-verification-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n📄 详细验证报告已保存到: ${path.basename(reportPath)}`);

        // TDD阶段判断
        console.log('\n🔄 TDD阶段分析:');
        if (report.summary.fullyConsistent) {
            console.log('   🎉 TDD Green阶段完成：数据修复成功！');
            console.log('   📋 下一步：运行回归测试，确保修复稳定性');
        } else {
            console.log('   ⚠️  仍处于TDD Green阶段：需要进一步修复');
            console.log('   🔧 建议：检查剩余的不一致类型');
        }

        this.testResults = typeResults;
        return report.summary.fullyConsistent;
    }

    /**
     * 生成最终报告
     */
    generateFinalReport(success) {
        const finalReport = {
            timestamp: new Date().toISOString(),
            testType: 'TDD驱动的数据一致性验证 - 修复后验证',
            process: {
                phase1: '✅ Red阶段完成 - 检测到数据不一致',
                phase2: success ? '✅ Green阶段完成 - 数据修复成功' : '⚠️  Green阶段进行中 - 需要进一步修复',
                phase3: success ? '🔄 准备进入Refactor阶段' : '❌ 未进入Refactor阶段'
            },
            result: {
                success,
                message: success ? '数据同步修复完全成功，本地与云端数据完全一致' : '数据修复部分成功，仍有不一致需要处理',
                recommendation: success ? '可以进行回归测试和部署准备' : '需要继续修复剩余的不一致数据'
            },
            testResults: this.testResults
        };

        const reportPath = path.join(__dirname, 'tdd-final-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(finalReport, null, 2));

        console.log('\n' + '='.repeat(60));
        console.log('🎯 TDD数据一致性修复验证 - 最终报告');
        console.log('='.repeat(60));
        console.log(`修复结果: ${success ? '✅ 成功' : '⚠️  部分成功'}`);
        console.log(`详细信息: ${path.basename(reportPath)}`);

        if (success) {
            console.log('\n🎊 恭喜！TDD驱动的数据一致性修复完全成功！');
            console.log('📊 数据同步状态：本地static数据与Supabase云端数据完全一致');
            console.log('🚀 可以安全地进行下一步的回归测试和部署准备');
        }

        return finalReport;
    }
}

/**
 * 主执行函数
 */
async function main() {
    const test = new PostFixConsistencyTest();

    // 运行一致性验证
    const success = await test.runConsistencyVerification();

    // 生成最终报告
    const finalReport = test.generateFinalReport(success);

    return { success, report: finalReport };
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, PostFixConsistencyTest };