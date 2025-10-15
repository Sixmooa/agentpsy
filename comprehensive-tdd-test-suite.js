/**
 * 全面TDD数据一致性验证测试套件
 * 重新验证Supabase云端与本地static数据的100%一致性
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 全面TDD测试套件
 */
class ComprehensiveTDDTestSuite {
    constructor() {
        this.testResults = {
            phase1: { name: "基础验证", tests: [], passed: 0, failed: 0 },
            phase2: { name: "详细对比", tests: [], passed: 0, failed: 0 },
            phase3: { name: "边界测试", tests: [], passed: 0, failed: 0 },
            phase4: { name: "回归测试", tests: [], passed: 0, failed: 0 }
        };
        this.startTime = Date.now();
        this.supabaseData = null;
        this.localData = { zh: null, en: null };
    }

    /**
     * 记录测试结果
     */
    logTestResult(phase, testName, passed, details = "", error = null) {
        const result = {
            name: testName,
            passed,
            details,
            error: error ? error.message : null,
            timestamp: new Date().toISOString()
        };

        this.testResults[phase].tests.push(result);

        if (passed) {
            this.testResults[phase].passed++;
            console.log(`✅ [${phase}] ${testName}: ${details}`);
        } else {
            this.testResults[phase].failed++;
            console.log(`❌ [${phase}] ${testName}: ${error ? error.message : details}`);
        }
    }

    /**
     * 运行单个测试
     */
    async runTest(phase, testName, testFunction) {
        try {
            const result = await testFunction();
            if (result === true || (typeof result === 'object' && result.success)) {
                const details = result.details || '测试通过';
                this.logTestResult(phase, testName, true, details);
            } else {
                const errorMsg = result.error || '测试失败';
                this.logTestResult(phase, testName, false, errorMsg, new Error(errorMsg));
            }
        } catch (error) {
            this.logTestResult(phase, testName, false, '测试执行异常', error);
        }
    }

    // ==================== 阶段1: 基础验证 (单元测试) ====================

    async phase1_BasicValidation() {
        console.log('\n🔍 ===== 阶段1: 基础验证 (单元测试) =====');

        // 1.1 Supabase连接测试
        await this.runTest('phase1', 'Supabase连接测试', async () => {
            try {
                const { data, error } = await supabase
                    .from('career_suggestions')
                    .select('count(*)', { count: 'exact', head: true });

                if (error) throw new Error(`Supabase连接失败: ${error.message}`);

                const totalCount = data[0]?.count || 0;
                if (totalCount === 0) throw new Error('云端数据为空');

                return { success: true, details: `成功连接，共${totalCount}条记录` };
            } catch (error) {
                throw error;
            }
        });

        // 1.2 本地文件读取测试
        await this.runTest('phase1', '本地文件读取测试', () => {
            try {
                const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');

                if (!fs.existsSync(dataJsPath)) {
                    throw new Error('本地data.js文件不存在');
                }

                const fileContent = fs.readFileSync(dataJsPath, 'utf8');
                if (fileContent.length === 0) {
                    throw new Error('本地文件内容为空');
                }

                return { success: true, details: `文件大小: ${fileContent.length}字符` };
            } catch (error) {
                throw error;
            }
        });

        // 1.3 MBTI类型覆盖测试
        await this.runTest('phase1', 'MBTI类型覆盖测试', async () => {
            // 获取云端类型
            const { data: supabaseTypes, error: typeError } = await supabase
                .from('career_suggestions')
                .select('mbti_type')
                .order('mbti_type');

            if (typeError) throw typeError;

            const cloudTypes = [...new Set(supabaseTypes.map(item => item.mbti_type))];
            const expectedTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                                   'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

            const missingInCloud = expectedTypes.filter(type => !cloudTypes.includes(type));
            const missingInExpected = cloudTypes.filter(type => !expectedTypes.includes(type));

            if (missingInCloud.length > 0) {
                throw new Error(`云端缺少类型: ${missingInCloud.join(', ')}`);
            }
            if (missingInExpected.length > 0) {
                throw new Error(`云端多出类型: ${missingInExpected.join(', ')}`);
            }

            return { success: true, details: `16个MBTI类型全部覆盖` };
        });

        // 1.4 贝尔宾角色一致性测试
        await this.runTest('phase1', '贝尔宾角色一致性测试', async () => {
            const { data: belbinData, error } = await supabase
                .from('belbin_roles')
                .select('role_key')
                .order('role_key');

            if (error) throw error;

            const expectedRoles = ['Plant', 'Resource_Investigator', 'Coordinator', 'Shaper',
                                  'Monitor_Evaluator', 'Teamworker', 'Implementer',
                                  'Completer_Finisher', 'Specialist'];

            const cloudRoles = belbinData.map(role => role.role_key);

            if (cloudRoles.length !== expectedRoles.length) {
                throw new Error(`角色数量不一致: 云端${cloudRoles.length}, 期望${expectedRoles.length}`);
            }

            const isConsistent = expectedRoles.every(role => cloudRoles.includes(role));
            if (!isConsistent) {
                throw new Error('贝尔宾角色数据不一致');
            }

            return { success: true, details: '9个贝尔宾角色完全一致' };
        });
    }

    // ==================== 阶段2: 详细对比 (集成测试) ====================

    async phase2_DetailedComparison() {
        console.log('\n🔍 ===== 阶段2: 详细对比 (集成测试) =====');

        // 首先获取所有数据
        await this.fetchAllData();

        // 2.1 职业建议总数对比
        await this.runTest('phase2', '职业建议总数对比', () => {
            const localTotal = Object.values(this.localData.zh).reduce((sum, careers) => sum + careers.length, 0);
            const supabaseTotal = Object.values(this.supabaseData).reduce((sum, careers) => sum + careers.length, 0);

            if (localTotal !== supabaseTotal) {
                throw new Error(`总数不一致: 本地${localTotal}, 云端${supabaseTotal}`);
            }

            return { success: true, details: `总数一致: ${localTotal}个职业建议` };
        });

        // 2.2 逐类型详细对比
        const mbtiTypes = Object.keys(this.supabaseData);
        let allTypesConsistent = true;
        let inconsistentTypes = [];

        for (const type of mbtiTypes) {
            await this.runTest('phase2', `${type}类型数据对比`, () => {
                const localCareers = this.localData.zh[type] || [];
                const supabaseCareers = this.supabaseData[type];

                const localCount = localCareers.length;
                const supabaseCount = supabaseCareers.length;

                if (localCount !== supabaseCount) {
                    throw new Error(`数量不一致: 本地${localCount}, 云端${supabaseCount}`);
                }

                // 检查内容一致性（考虑排序）
                const sortedLocal = [...localCareers].sort();
                const sortedSupabase = [...supabaseCareers].sort();

                const isContentConsistent = sortedLocal.every((career, index) =>
                    career === sortedSupabase[index]);

                if (!isContentConsistent) {
                    const missingInLocal = sortedSupabase.filter(c => !sortedLocal.includes(c));
                    const missingInSupabase = sortedLocal.filter(c => !sortedSupabase.includes(c));

                    inconsistentTypes.push({
                        type,
                        missingInLocal,
                        missingInSupabase,
                        localCount,
                        supabaseCount
                    });
                    allTypesConsistent = false;

                    throw new Error(`${type}类型内容不一致`);
                }

                return { success: true, details: `${supabaseCount}个职业建议完全一致` };
            });
        }

        // 2.3 一致性总结测试
        await this.runTest('phase2', '整体一致性验证', () => {
            if (!allTypesConsistent) {
                throw new Error(`发现${inconsistentTypes.length}个类型不一致: ${inconsistentTypes.map(t => t.type).join(', ')}`);
            }
            return { success: true, details: '所有16个MBTI类型100%一致' };
        });
    }

    // ==================== 阶段3: 边界测试 ====================

    async phase3_BoundaryTesting() {
        console.log('\n🔍 ===== 阶段3: 边界测试 =====');

        // 3.1 数据格式验证
        await this.runTest('phase3', '数据格式验证', () => {
            // 验证本地数据格式
            const localTypes = Object.keys(this.localData.zh);

            localTypes.forEach(type => {
                const careers = this.localData.zh[type];
                if (!Array.isArray(careers)) {
                    throw new Error(`${type}类型数据不是数组格式`);
                }

                careers.forEach(career => {
                    if (typeof career !== 'string' || career.trim() === '') {
                        throw new Error(`${type}类型包含无效职业名称: "${career}"`);
                    }
                });
            });

            return { success: true, details: `所有${localTypes.length}个类型数据格式正确` };
        });

        // 3.2 中英文对应关系测试
        await this.runTest('phase3', '中英文对应关系测试', () => {
            const zhTypes = Object.keys(this.localData.zh);
            const enTypes = Object.keys(this.localData.en);

            if (zhTypes.length !== enTypes.length) {
                throw new Error(`中英文类型数量不一致: 中文${zhTypes.length}, 英文${enTypes.length}`);
            }

            const missingInEn = zhTypes.filter(type => !enTypes.includes(type));
            const missingInZh = enTypes.filter(type => !zhTypes.includes(type));

            if (missingInEn.length > 0 || missingInZh.length > 0) {
                throw new Error(`中英文类型不匹配: 缺失En[${missingInEn.join(', ')}], 缺失Zh[${missingInZh.join(', ')}]`);
            }

            // 验证每个类型的中英文数量一致
            let countMismatch = 0;
            zhTypes.forEach(type => {
                const zhCount = this.localData.zh[type].length;
                const enCount = this.localData.en[type].length;

                if (zhCount !== enCount) {
                    countMismatch++;
                    console.log(`⚠️  ${type}中英文数量不一致: 中文${zhCount}, 英文${enCount}`);
                }
            });

            if (countMismatch > 0) {
                throw new Error(`${countMismatch}个类型中英文数量不一致`);
            }

            return { success: true, details: `${zhTypes.length}个类型中英文对应关系正确` };
        });

        // 3.3 数据完整性测试
        await this.runTest('phase3', '数据完整性测试', () => {
            // 检查是否有空值
            const allZhCareers = Object.values(this.localData.zh).flat();
            const allEnCareers = Object.values(this.localData.en).flat();

            const emptyZhCareers = allZhCareers.filter(c => !c || c.trim() === '');
            const emptyEnCareers = allEnCareers.filter(c => !c || c.trim() === '');

            if (emptyZhCareers.length > 0) {
                throw new Error(`发现${emptyZhCareers.length}个空中文职业`);
            }
            if (emptyEnCareers.length > 0) {
                throw new Error(`发现${emptyEnCareers.length}个空英文职业`);
            }

            // 检查重复值
            const duplicateCheck = (type, careers) => {
                const unique = new Set(careers);
                if (unique.size !== careers.length) {
                    const duplicates = careers.filter((item, index) => careers.indexOf(item) !== index);
                    return { hasDuplicates: true, duplicates: [...new Set(duplicates)] };
                }
                return { hasDuplicates: false };
            };

            let duplicateCount = 0;
            Object.keys(this.localData.zh).forEach(type => {
                const zhDup = duplicateCheck(`${type}-中文`, this.localData.zh[type]);
                const enDup = duplicateCheck(`${type}-英文`, this.localData.en[type]);

                if (zhDup.hasDuplicates) {
                    duplicateCount++;
                    console.log(`⚠️  ${type}中文有重复: ${zhDup.duplicates.join(', ')}`);
                }
                if (enDup.hasDuplicates) {
                    duplicateCount++;
                    console.log(`⚠️  ${type}英文有重复: ${enDup.duplicates.join(', ')}`);
                }
            });

            if (duplicateCount > 0) {
                throw new Error(`发现${duplicateCount}个重复职业项`);
            }

            return { success: true, details: `数据完整性验证通过，无空值或重复` };
        });
    }

    // ==================== 阶段4: 回归测试 ====================

    async phase4_RegressionTesting() {
        console.log('\n🔍 ===== 阶段4: 回归测试 =====');

        // 4.1 完整性回归测试
        await this.runTest('phase4', '完整性回归测试', async () => {
            // 重新获取数据进行验证
            const freshSupabaseData = await this.fetchSupabaseData();
            const freshLocalData = this.fetchLocalData();

            // 对比总数量
            const originalTotal = Object.values(this.supabaseData).reduce((sum, careers) => sum + careers.length, 0);
            const freshTotal = Object.values(freshSupabaseData).reduce((sum, careers) => sum + careers.length, 0);

            if (originalTotal !== freshTotal) {
                throw new Error(`云端数据总量发生变化: 原来${originalTotal}, 现在${freshTotal}`);
            }

            // 验证所有类型仍然存在
            const originalTypes = Object.keys(this.supabaseData).sort();
            const freshTypes = Object.keys(freshSupabaseData).sort();

            if (JSON.stringify(originalTypes) !== JSON.stringify(freshTypes)) {
                throw new Error('MBTI类型列表发生变化');
            }

            return { success: true, details: '回归测试通过，数据稳定性确认' };
        });

        // 4.2 性能测试
        await this.runTest('phase4', '性能测试', () => {
            const startTime = Date.now();

            // 模拟数据访问
            Object.values(this.localData.zh).forEach(careers => {
                careers.forEach(career => career.length); // 访问每个字符串
            });

            const endTime = Date.now();
            const duration = endTime - startTime;

            if (duration > 1000) { // 超过1秒认为性能有问题
                throw new Error(`数据访问性能问题: 耗时${duration}ms`);
            }

            return { success: true, details: `性能测试通过: ${duration}ms` };
        });

        // 4.3 最终一致性验证
        await this.runTest('phase4', '最终一致性验证', () => {
            const totalTests = Object.values(this.testResults).reduce((sum, phase) => sum + phase.tests.length, 0);
            const totalPassed = Object.values(this.testResults).reduce((sum, phase) => sum + phase.passed, 0);
            const totalFailed = Object.values(this.testResults).reduce((sum, phase) => sum + phase.failed, 0);

            if (totalFailed > 0) {
                throw new Error(`最终验证失败: ${totalFailed}/${totalTests}个测试失败`);
            }

            const successRate = ((totalPassed / totalTests) * 100).toFixed(1);
            return { success: true, details: `所有测试通过: ${totalPassed}/${totalTests} (${successRate}%)` };
        });
    }

    // ==================== 数据获取辅助方法 ====================

    async fetchSupabaseData() {
        try {
            const { data, error } = await supabase
                .from('career_suggestions')
                .select('*')
                .order('mbti_type, id');

            if (error) throw error;

            const groupedData = {};
            data.forEach(item => {
                if (!groupedData[item.mbti_type]) {
                    groupedData[item.mbti_type] = [];
                }
                groupedData[item.mbti_type].push(item.career_zh);
            });

            return groupedData;
        } catch (error) {
            throw new Error(`获取Supabase数据失败: ${error.message}`);
        }
    }

    fetchLocalData() {
        try {
            const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');
            const fileContent = fs.readFileSync(dataJsPath, 'utf8');

            // 提取中文职业建议
            const zhMatch = fileContent.match(/const CAREER_SUGGESTIONS = \{[\s\S]*?\};/);
            if (!zhMatch) throw new Error('无法找到CAREER_SUGGESTIONS定义');

            const zhData = eval(`(${zhMatch[0].replace('const CAREER_SUGGESTIONS = ', '')})`);

            // 提取英文职业建议
            const enMatch = fileContent.match(/const CAREER_SUGGESTIONS_EN = \{[\s\S]*?\};/);
            if (!enMatch) throw new Error('无法找到CAREER_SUGGESTIONS_EN定义');

            const enData = eval(`(${enMatch[0].replace('const CAREER_SUGGESTIONS_EN = ', '')})`);

            return { zh: zhData, en: enData };
        } catch (error) {
            throw new Error(`读取本地数据失败: ${error.message}`);
        }
    }

    async fetchAllData() {
        console.log('📊 获取测试数据...');
        this.supabaseData = await this.fetchSupabaseData();
        this.localData = this.fetchLocalData();

        console.log(`   云端数据: ${Object.keys(this.supabaseData).length}个类型`);
        console.log(`   本地数据: ${Object.keys(this.localData.zh).length}个类型`);
    }

    // ==================== 主执行方法 ====================

    async runComprehensiveTest() {
        console.log('🚀 开始全面TDD数据一致性验证测试\n');
        console.log('测试目标: 验证Supabase云端与本地static数据的100%一致性');
        console.log('测试原则: TDD驱动，从单元测试到回归测试\n');

        try {
            // 执行所有测试阶段
            await this.phase1_BasicValidation();
            await this.phase2_DetailedComparison();
            await this.phase3_BoundaryTesting();
            await this.phase4_RegressionTesting();

            // 生成最终报告
            return this.generateFinalReport();

        } catch (error) {
            console.error('\n💥 测试执行过程中发生错误:', error.message);
            return this.generateFinalReport(error);
        }
    }

    generateFinalReport(error = null) {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;

        // 统计总结果
        const totalTests = Object.values(this.testResults).reduce((sum, phase) => sum + phase.tests.length, 0);
        const totalPassed = Object.values(this.testResults).reduce((sum, phase) => sum + phase.passed, 0);
        const totalFailed = Object.values(this.testResults).reduce((sum, phase) => sum + phase.failed, 0);
        const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

        const report = {
            timestamp: new Date().toISOString(),
            duration: totalDuration,
            summary: {
                totalTests,
                totalPassed,
                totalFailed,
                successRate: parseFloat(successRate),
                status: totalFailed === 0 ? 'SUCCESS' : 'FAILED'
            },
            phases: this.testResults,
            dataSummary: {
                supabaseTypes: Object.keys(this.supabaseData || {}).length,
                localTypes: Object.keys(this.localData?.zh || {}).length,
                totalCareers: this.supabaseData ?
                    Object.values(this.supabaseData).reduce((sum, careers) => sum + careers.length, 0) : 0
            },
            conclusion: error ? error.message :
                     (totalFailed === 0 ? '✅ 所有测试通过，数据一致性验证100%成功' : '❌ 部分测试失败，需要修复数据不一致问题')
        };

        // 保存报告
        const reportPath = path.join(__dirname, `tdd-comprehensive-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // 输出结果
        console.log('\n' + '='.repeat(70));
        console.log('🎯 全面TDD数据一致性验证测试 - 最终报告');
        console.log('='.repeat(70));
        console.log(`⏱️  测试耗时: ${totalDuration}ms`);
        console.log(`📊 总测试数: ${totalTests}`);
        console.log(`✅ 通过: ${totalPassed}`);
        console.log(`❌ 失败: ${totalFailed}`);
        console.log(`📈 成功率: ${successRate}%`);
        console.log(`📄 详细报告: ${path.basename(reportPath)}`);
        console.log('='.repeat(70));
        console.log(`🎯 结论: ${report.conclusion}`);

        return report;
    }
}

/**
 * 主执行函数
 */
async function main() {
    const testSuite = new ComprehensiveTDDTestSuite();
    return await testSuite.runComprehensiveTest();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, ComprehensiveTDDTestSuite };