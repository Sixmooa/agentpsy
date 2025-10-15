/**
 * 数据一致性测试执行器
 * JavaScript版本的TDD测试，替代Android单元测试
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

// 测试数据提供者
class DataConsistencyTestProvider {
    getLocalBelbinRoles() {
        return [
            'Plant', 'Resource_Investigator', 'Coordinator', 'Shaper',
            'Monitor_Evaluator', 'Teamworker', 'Implementer',
            'Completer_Finisher', 'Specialist'
        ];
    }

    async getSupabaseBelbinRoles() {
        const { data, error } = await supabase
            .from('belbin_roles')
            .select('role_key')
            .order('role_key');

        if (error) throw error;
        return data.map(role => role.role_key);
    }

    getLocalCareerTypes() {
        return [
            'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
            'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
        ];
    }

    async getSupabaseCareerTypes() {
        const { data, error } = await supabase
            .from('career_suggestions')
            .select('mbti_type')
            .order('mbti_type');

        if (error) throw error;
        return [...new Set(data.map(item => item.mbti_type))];
    }

    getLocalCareersForType(mbtiType) {
        const localCareers = {
            'INTJ': ['科学家', '工程师', '战略顾问', '研究员', '系统分析师', '软件工程师'],
            'INTP': ['研究员', '科学家', '哲学家', '软件工程师', '大学教授', '技术专家'],
            'ENTJ': ['企业高管', '项目经理', '律师', '企业家', '管理顾问'],
            'ENTP': ['企业家', '市场营销', '公关专家', '创新顾问', '咨询师'],
            'INFJ': ['心理咨询师', '教师', '作家', '人力资源', '社会工作者'],
            'INFP': ['作家', '心理咨询师', '艺术家', '社会工作者', '培训师'],
            'ENFJ': ['教师', '培训师', '人力资源经理', '公关经理', '心理咨询师'],
            'ENFP': ['记者', '演员', '创意总监', '市场营销', '培训师'],
            'ISTJ': ['会计师', '审计师', '行政主管', '质量控制', '运营经理'],
            'ISFJ': ['护士', '教师', '人力资源', '客户服务经理', '社会工作者'],
            'ESTJ': ['管理者', '军官', '项目经理', '运营经理', '行政主管'],
            'ESFJ': ['人力资源', '护士', '教师', '客户服务', '活动策划'],
            'ISTP': ['技术专家', '工程师', '外科医生', '机械师', '程序员'],
            'ISFP': ['设计师', '艺术家', '音乐家', '兽医', '心理咨询师'],
            'ESTP': ['销售代表', '警察', '运动员', '企业家', '急救医生'],
            'ESFP': ['演员', '活动策划', '销售代表', '教师', '社会工作者']
        };
        return localCareers[mbtiType] || [];
    }

    async getSupabaseCareersForType(mbtiType) {
        const { data, error } = await supabase
            .from('career_suggestions')
            .select('career_zh')
            .eq('mbti_type', mbtiType)
            .order('career_zh');

        if (error) throw error;
        return data.map(item => item.career_zh);
    }

    async getDetailedComparison(mbtiType) {
        const localCareers = this.getLocalCareersForType(mbtiType);
        const supabaseCareers = await this.getSupabaseCareersForType(mbtiType);

        const missingInLocal = supabaseCareers.filter(career => !localCareers.includes(career));
        const missingInSupabase = localCareers.filter(career => !supabaseCareers.includes(career));

        return {
            mbtiType,
            localCareers,
            supabaseCareers,
            missingInLocal,
            missingInSupabase,
            isConsistent: missingInLocal.length === 0 && missingInSupabase.length === 0
        };
    }

    async getAllTypeComparisons() {
        const allTypes = this.getLocalCareerTypes();
        const comparisons = [];
        for (const type of allTypes) {
            const comparison = await this.getDetailedComparison(type);
            comparisons.push(comparison);
        }
        return comparisons;
    }

    async getConsistencyStatistics() {
        const allComparisons = await this.getAllTypeComparisons();
        const consistentTypes = allComparisons.filter(comp => comp.isConsistent);
        const inconsistentTypes = allComparisons.filter(comp => !comp.isConsistent);

        const localBelbinRoles = this.getLocalBelbinRoles();
        const supabaseBelbinRoles = await this.getSupabaseBelbinRoles();

        const belbinConsistent = localBelbinRoles.length === supabaseBelbinRoles.length &&
                               localBelbinRoles.every(role => supabaseBelbinRoles.includes(role));

        return {
            totalTypes: allComparisons.length,
            consistentTypes: consistentTypes.length,
            inconsistentTypes: inconsistentTypes.length,
            consistencyRate: consistentTypes.length / allComparisons.length,
            belbinConsistent,
            details: allComparisons
        };
    }
}

// 测试套件
class DataConsistencyTestSuite {
    constructor() {
        this.testProvider = new DataConsistencyTestProvider();
        this.passedTests = 0;
        this.failedTests = 0;
        this.testResults = [];
    }

    async runTest(testName, testFunction) {
        try {
            console.log(`\n🧪 运行测试: ${testName}`);
            await testFunction();
            console.log(`✅ 测试通过: ${testName}`);
            this.passedTests++;
            this.testResults.push({ name: testName, status: 'PASSED', error: null });
        } catch (error) {
            console.log(`❌ 测试失败: ${testName}`);
            console.log(`   错误: ${error.message}`);
            this.failedTests++;
            this.testResults.push({ name: testName, status: 'FAILED', error: error.message });
        }
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(message || 'Assertion failed');
        }
    }

    async testBelbinRoleConsistency() {
        const localRoles = this.testProvider.getLocalBelbinRoles();
        const supabaseRoles = await this.testProvider.getSupabaseBelbinRoles();

        const missingInLocal = supabaseRoles.filter(role => !localRoles.includes(role));
        const missingInSupabase = localRoles.filter(role => !supabaseRoles.includes(role));

        this.assert(missingInLocal.length === 0, `云端有但本地没有的贝尔宾角色: ${missingInLocal.join(', ')}`);
        this.assert(missingInSupabase.length === 0, `本地有但云端没有的贝尔宾角色: ${missingInSupabase.join(', ')}`);
        this.assert(localRoles.length === supabaseRoles.length, `贝尔宾角色数量不一致: 本地${localRoles.length}, 云端${supabaseRoles.length}`);

        console.log(`   本地角色数量: ${localRoles.size}`);
        console.log(`   云端角色数量: ${supabaseRoles.size}`);
    }

    async testCareerTypeCoverage() {
        const localTypes = this.testProvider.getLocalCareerTypes();
        const supabaseTypes = await this.testProvider.getSupabaseCareerTypes();

        const missingInLocal = supabaseTypes.filter(type => !localTypes.includes(type));
        const missingInSupabase = localTypes.filter(type => !supabaseTypes.includes(type));

        this.assert(missingInLocal.length === 0, `云端有但本地没有的MBTI类型: ${missingInLocal.join(', ')}`);
        this.assert(missingInSupabase.length === 0, `本地有但云端没有的MBTI类型: ${missingInSupabase.join(', ')}`);
        this.assert(localTypes.length === supabaseTypes.length, `MBTI类型数量不一致: 本地${localTypes.length}, 云端${supabaseTypes.length}`);

        console.log(`   本地MBTI类型: ${localTypes.length}`);
        console.log(`   云端MBTI类型: ${supabaseTypes.length}`);
    }

    async testIntjCareerDifferences() {
        const comparison = await this.testProvider.getDetailedComparison('INTJ');

        console.log(`   本地 (${comparison.localCareers.length}): ${comparison.localCareers.join(', ')}`);
        console.log(`   云端 (${comparison.supabaseCareers.length}): ${comparison.supabaseCareers.join(', ')}`);

        if (comparison.missingInLocal.length > 0) {
            console.log(`   ❌ 云端有但本地没有: ${comparison.missingInLocal.join(', ')}`);
        }
        if (comparison.missingInSupabase.length > 0) {
            console.log(`   ❌ 本地有但云端没有: ${comparison.missingInSupabase.join(', ')}`);
        }

        // TDD Red阶段: 验证确实存在差异
        this.assert(comparison.missingInLocal.length > 0 || comparison.missingInSupabase.length > 0,
                   'INTJ类型应该检测到数据差异，但数据竟然一致了？');
    }

    async testIntpCareerDifferences() {
        const comparison = await this.testProvider.getDetailedComparison('INTP');

        console.log(`   本地 (${comparison.localCareers.length}): ${comparison.localCareers.join(', ')}`);
        console.log(`   云端 (${comparison.supabaseCareers.length}): ${comparison.supabaseCareers.join(', ')}`);

        if (comparison.missingInLocal.length > 0) {
            console.log(`   ❌ 云端有但本地没有: ${comparison.missingInLocal.join(', ')}`);
        }
        if (comparison.missingInSupabase.length > 0) {
            console.log(`   ❌ 本地有但云端没有: ${comparison.missingInSupabase.join(', ')}`);
        }

        this.assert(comparison.missingInLocal.length > 0 || comparison.missingInSupabase.length > 0,
                   'INTP类型应该检测到数据差异');
    }

    async testEntjCareerDifferences() {
        const comparison = await this.testProvider.getDetailedComparison('ENTJ');

        console.log(`   本地 (${comparison.localCareers.length}): ${comparison.localCareers.join(', ')}`);
        console.log(`   云端 (${comparison.supabaseCareers.length}): ${comparison.supabaseCareers.join(', ')}`);

        if (comparison.missingInLocal.length > 0) {
            console.log(`   ❌ 云端有但本地没有: ${comparison.missingInLocal.join(', ')}`);
        }
        if (comparison.missingInSupabase.length > 0) {
            console.log(`   ❌ 本地有但云端没有: ${comparison.missingInSupabase.join(', ')}`);
        }

        this.assert(comparison.missingInLocal.length > 0 || comparison.missingInSupabase.length > 0,
                   'ENTJ类型应该检测到数据差异');
    }

    async testDataConsistencyStatistics() {
        const stats = await this.testProvider.getConsistencyStatistics();

        this.assert(stats.totalTypes === 16, `应该有16个MBTI类型，实际${stats.totalTypes}`);
        this.assert(stats.belbinConsistent, '贝尔宾角色应该一致');
        this.assert(stats.inconsistentTypes > 0, '应该存在不一致的类型');
        this.assert(stats.consistencyRate < 1.0, '一致性率应该小于1');
        this.assert(stats.details.length === 16, '详情列表应该有16个条目');

        console.log(`   总MBTI类型数: ${stats.totalTypes}`);
        console.log(`   完全一致的类型: ${stats.consistentTypes}`);
        console.log(`   存在差异的类型: ${stats.inconsistentTypes}`);
        console.log(`   贝尔宾角色一致性: ${stats.belbinConsistent ? '✅' : '❌'}`);
        console.log(`   整体一致性率: ${(stats.consistencyRate * 100).toFixed(1)}%`);
    }

    async testTddPhaseVerification() {
        const stats = await this.testProvider.getConsistencyStatistics();

        const hasCareerInconsistencies = stats.inconsistentTypes > 0;
        const belbinIsConsistent = stats.belbinConsistent;
        const needsDataSync = hasCareerInconsistencies;

        this.assert(hasCareerInconsistencies, '职业建议应该存在不一致，进入TDD Red阶段');
        this.assert(belbinIsConsistent, '贝尔宾角色应该一致');
        this.assert(needsDataSync, '应该需要数据同步');

        console.log(`   TDD阶段: RED (检测到数据不一致)`);
        console.log(`   职业建议不一致: ${stats.inconsistentTypes}个类型`);
        console.log(`   贝尔宾角色一致: ✅`);
        console.log(`   下一步: 需要同步修复数据`);
    }

    async generateDiagnosticReport() {
        const stats = await this.testProvider.getConsistencyStatistics();

        console.log('\n=== 数据一致性诊断报告 ===');
        console.log(`测试时间: ${new Date().toLocaleString()}`);
        console.log(`测试方法: TDD驱动单元测试`);
        console.log('');

        console.log('📊 总体状态:');
        console.log(`  MBTI类型总数: ${stats.totalTypes}`);
        console.log(`  贝尔宾角色一致性: ${stats.belbinConsistent ? '✅ 完全一致' : '❌ 存在差异'}`);
        console.log(`  职业建议一致性: ${stats.inconsistentTypes === 0 ? '✅ 完全一致' : `❌ ${stats.inconsistentTypes}个类型存在差异`}`);
        console.log('');

        console.log('🔍 详细分析:');
        const inconsistentDetails = stats.details.filter(detail => !detail.isConsistent);
        inconsistentDetails.forEach(detail => {
            console.log(`  ${detail.mbtiType}:`);
            console.log(`    本地 (${detail.localCareers.length}): ${detail.localCareers.join(', ')}`);
            console.log(`    云端 (${detail.supabaseCareers.length}): ${detail.supabaseCareers.join(', ')}`);
            if (detail.missingInLocal.length > 0) {
                console.log(`    云端新增: ${detail.missingInLocal.join(', ')}`);
            }
            if (detail.missingInSupabase.length > 0) {
                console.log(`    本地独有: ${detail.missingInSupabase.join(', ')}`);
            }
            console.log('');
        });

        console.log('📋 修复建议:');
        console.log('  1. 优先级: HIGH - 影响用户体验');
        console.log('  2. 同步策略: 将云端完整数据同步到本地static文件');
        console.log('  3. 验证方法: 运行回归测试确保修复后的一致性');
        console.log('  4. 部署注意: 确保本地和云端数据同步更新');

        this.assert(true, '报告生成成功');
    }

    async runAllTests() {
        console.log('🚀 开始执行TDD驱动数据一致性测试套件\n');

        await this.runTest('贝尔宾角色数据一致性', () => this.testBelbinRoleConsistency());
        await this.runTest('职业建议数据类型覆盖', () => this.testCareerTypeCoverage());
        await this.runTest('INTJ类型职业建议差异分析', () => this.testIntjCareerDifferences());
        await this.runTest('INTP类型职业建议差异分析', () => this.testIntpCareerDifferences());
        await this.runTest('ENTJ类型职业建议差异分析', () => this.testEntjCareerDifferences());
        await this.runTest('数据一致性统计', () => this.testDataConsistencyStatistics());
        await this.runTest('TDD阶段验证', () => this.testTddPhaseVerification());
        await this.runTest('生成问题诊断报告', () => this.generateDiagnosticReport());

        // 输出测试总结
        console.log('\n' + '='.repeat(60));
        console.log('📊 测试执行总结');
        console.log('='.repeat(60));
        console.log(`总测试数: ${this.passedTests + this.failedTests}`);
        console.log(`✅ 通过: ${this.passedTests}`);
        console.log(`❌ 失败: ${this.failedTests}`);
        console.log(`📈 成功率: ${((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1)}%`);

        if (this.failedTests > 0) {
            console.log('\n❌ 失败的测试:');
            this.testResults.filter(test => test.status === 'FAILED').forEach(test => {
                console.log(`  - ${test.name}: ${test.error}`);
            });
        }

        // 保存测试结果
        const testReport = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.passedTests + this.failedTests,
                passed: this.passedTests,
                failed: this.failedTests,
                successRate: (this.passedTests / (this.passedTests + this.failedTests)) * 100
            },
            results: this.testResults
        };

        require('fs').writeFileSync('consistency-test-report.json', JSON.stringify(testReport, null, 2));
        console.log('\n📄 详细测试报告已保存到: consistency-test-report.json');

        return testReport;
    }
}

// 主执行函数
async function main() {
    const testSuite = new DataConsistencyTestSuite();
    return await testSuite.runAllTests();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, DataConsistencyTestSuite, DataConsistencyTestProvider };