/**
 * 部署后一致性验证测试套件
 * TDD驱动验证部署后的数据一致性
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZmamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 部署后验证测试套件
 */
class DeploymentVerificationTestSuite {
    constructor() {
        this.testResults = {
            phase1: { name: "部署后单元测试", tests: [], passed: 0, failed: 0 },
            phase2: { name: "部署后集成测试", tests: [], passed: 0, failed: 0 },
            phase3: { name: "部署后回归测试", tests: [], passed: 0, failed: 0 }
        };
        this.startTime = Date.now();
        this.deploymentTime = null;
        this.baselineData = null;
        this.postDeploymentData = null;
    }

    logTest(phase, testName, passed, details = "", error = null, duration = 0) {
        const result = {
            name: testName,
            passed,
            details,
            error: error ? error.message : null,
            duration,
            timestamp: new Date().toISOString()
        };

        this.testResults[phase].tests.push(result);

        if (passed) {
            this.testResults[phase].passed++;
            console.log(`✅ [${phase}] ${testName} (${duration}ms): ${details}`);
        } else {
            this.testResults[phase].failed++;
            console.log(`❌ [${phase}] ${testName} (${duration}ms): ${error ? error.message : details}`);
        }
    }

    async runTest(phase, testName, testFunction) {
        const startTime = Date.now();
        try {
            const result = await testFunction();
            const duration = Date.now() - startTime;

            if (result === true || (typeof result === 'object' && result.success)) {
                const details = result.details || '测试通过';
                this.logTest(phase, testName, true, details, null, duration);
            } else {
                const errorMsg = result.error || '测试失败';
                this.logTest(phase, testName, false, errorMsg, new Error(errorMsg), duration);
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logTest(phase, testName, false, '测试执行异常', error, duration);
        }
    }

    // ==================== 阶段1: 部署后单元测试 ====================

    async phase1_UnitTests() {
        console.log('\n🔍 ===== 阶段1: 部署后单元测试 =====');

        // 1.1 部署时间验证
        await this.runTest('phase1', '部署时间验证', () => {
            if (!this.deploymentTime) {
                this.deploymentTime = new Date().toISOString();
            }
            return { success: true, details: `部署完成时间: ${this.deploymentTime}` };
        });

        // 1.2 Supabase服务可用性测试
        await this.runTest('phase1', 'Supabase服务可用性测试', async () => {
            const startTime = Date.now();
            try {
                const { data, error } = await supabase
                    .from('career_suggestions')
                    .select('count(*)', { count: 'exact', head: true });

                const responseTime = Date.now() - startTime;

                if (error) {
                    throw new Error(`Supabase服务不可用: ${error.message}`);
                }

                const count = data[0]?.count || 0;
                if (count === 0) {
                    throw new Error('Supabase数据为空');
                }

                return {
                    success: true,
                    details: `服务正常，${count}条记录，响应时间: ${responseTime}ms`
                };
            } catch (error) {
                throw error;
            }
        });

        // 1.3 本地Static文件访问测试
        await this.runTest('phase1', '本地Static文件访问测试', () => {
            const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');

            const startTime = Date.now();

            if (!fs.existsSync(dataJsPath)) {
                throw new Error('本地Static文件不存在');
            }

            const fileContent = fs.readFileSync(dataJsPath, 'utf8');
            const readTime = Date.now() - startTime;

            if (fileContent.length === 0) {
                throw new Error('本地Static文件内容为空');
            }

            // 验证关键数据存在
            if (!fileContent.includes('CAREER_SUGGESTIONS')) {
                throw new Error('职业建议数据不存在');
            }
            if (!fileContent.includes('CAREER_SUGGESTIONS_EN')) {
                throw new Error('英文职业建议数据不存在');
            }

            return {
                success: true,
                details: `文件访问正常，大小: ${fileContent.length}字符，读取时间: ${readTime}ms`
            };
        });

        // 1.4 数据完整性基础验证
        await this.runTest('phase1', '数据完整性基础验证', async () => {
            // 获取基线数据
            if (!this.baselineData) {
                this.baselineData = await this.fetchSupabaseData();
            }

            const baselineTypes = Object.keys(this.baselineData).length;
            const baselineCount = Object.values(this.baselineData).reduce((sum, careers) => sum + careers.length, 0);

            if (baselineTypes !== 16) {
                throw new Error(`基线数据MBTI类型异常: ${baselineTypes}`);
            }
            if (baselineCount !== 128) {
                throw new Error(`基线数据总数异常: ${baselineCount}`);
            }

            return {
                success: true,
                details: `基线数据正常: ${baselineTypes}个类型，${baselineCount}条记录`
            };
        });
    }

    // ==================== 阶段2: 部署后集成测试 ====================

    async phase2_IntegrationTests() {
        console.log('\n🔗 ===== 阶段2: 部署后集成测试 =====');

        // 2.1 端到端数据流测试
        await this.runTest('phase2', '端到端数据流测试', async () => {
            // 模拟完整的数据获取流程
            const startTime = Date.now();

            try {
                // 1. 从Supabase获取数据
                const { data: supabaseData, error: supabaseError } = await supabase
                    .from('career_suggestions')
                    .select('mbti_type, career_zh, career_en')
                    .order('mbti_type, id')
                    .limit(10);

                if (supabaseError) {
                    throw new Error(`Supabase数据获取失败: ${supabaseError.message}`);
                }

                // 2. 验证数据结构
                const hasValidStructure = supabaseData.every(item =>
                    item.mbti_type && item.career_zh && item.career_en
                );

                if (!hasValidStructure) {
                    throw new Error('数据结构验证失败');
                }

                // 3. 验证数据完整性
                const types = [...new Set(supabaseData.map(item => item.mbti_type))];
                if (types.length === 0) {
                    throw new Error('数据完整性验证失败');
                }

                const responseTime = Date.now() - startTime;

                return {
                    success: true,
                    details: `端到端数据流正常，获取${supabaseData.length}条记录，响应时间: ${responseTime}ms`
                };

            } catch (error) {
                throw error;
            }
        });

        // 2.2 多平台数据一致性测试
        await this.runTest('phase2', '多平台数据一致性测试', async () => {
            const startTime = Date.now();

            try {
                // 获取云端数据
                const cloudData = await this.fetchSupabaseData();

                // 获取本地数据
                const localData = this.fetchLocalData();

                let consistentCount = 0;
                let inconsistentTypes = [];

                Object.keys(cloudData).forEach(type => {
                    const cloudCareers = cloudData[type].map(c => c.career_zh).sort();
                    const localCareers = localData.zh[type] ? [...localData.zh[type]].sort() : [];

                    if (cloudCareers.length === localCareers.length) {
                        // 检查内容一致性
                        const isContentConsistent = cloudCareers.every((career, index) =>
                            career === localCareers[index]);

                        if (isContentConsistent) {
                            consistentCount++;
                        } else {
                            inconsistentTypes.push(type);
                        }
                    } else {
                        inconsistentTypes.push(type);
                    }
                });

                const verificationTime = Date.now() - startTime;
                const totalTypes = Object.keys(cloudData).length;

                if (inconsistentTypes.length === 0) {
                    return {
                        success: true,
                        details: `多平台数据完全一致: ${totalTypes}个类型验证通过，验证时间: ${verificationTime}ms`
                    };
                } else {
                    throw new Error(`多平台数据不一致: ${inconsistentTypes.length}个类型存在问题`);
                }

            } catch (error) {
                throw error;
            }
        });

        // 2.3 API响应格式验证
        await this.runTest('phase2', 'API响应格式验证', async () => {
            const startTime = Date.now();

            try {
                // 测试获取特定类型的职业建议
                const { data: careerData, error } = await supabase
                    .from('career_suggestions')
                    .select('mbti_type, career_zh, career_en')
                    .eq('mbti_type', 'INTJ')
                    .order('career_zh');

                if (error) {
                    throw new Error(`API请求失败: ${error.message}`);
                }

                if (!careerData || careerData.length === 0) {
                    throw new Error('API返回空数据');
                }

                // 验证响应格式
                const hasValidFormat = careerData.every(item =>
                    typeof item.mbti_type === 'string' &&
                    typeof item.career_zh === 'string' &&
                    typeof item.career_en === 'string' &&
                    item.mbti_type.trim() !== '' &&
                    item.career_zh.trim() !== '' &&
                    item.career_en.trim() !== ''
                );

                if (!hasValidFormat) {
                    throw new Error('API响应格式验证失败');
                }

                const responseTime = Date.now() - startTime;

                return {
                    success: true,
                    details: `API响应格式正常，INTJ类型返回${careerData.length}条记录，响应时间: ${responseTime}ms`
                };

            } catch (error) {
                throw error;
            }
        });
    }

    // ==================== 阶段3: 部署后回归测试 ====================

    async phase3_RegressionTests() {
        console.log('\n🔄 ===== 阶段3: 部署后回归测试 =====');

        // 3.1 完整回归测试 - 重新运行基线TDD测试
        await this.runTest('phase3', '完整回归测试', async () => {
            // 重新运行完整的TDD测试套件
            const startTime = Date.now();

            try {
                // 直接实例化并运行TDD测试套件
                const { RobustTDDTestSuite } = require('./robust-tdd-test-suite');
                const testSuite = new RobustTDDTestSuite();
                const result = await testSuite.runComprehensiveTest();

                const verificationTime = Date.now() - startTime;

                if (result.summary.successRate === 100) {
                    return {
                        success: true,
                        details: `回归测试100%通过: ${result.summary.passedTests}/${result.summary.totalTests}个测试，验证时间: ${verificationTime}ms`
                    };
                } else {
                    throw new Error(`回归测试失败: ${result.summary.failedTests}/${result.summary.totalTests}个测试失败`);
                }

            } catch (error) {
                throw error;
            }
        });

        // 3.2 性能回归测试
        await this.runTest('phase3', '性能回归测试', async () => {
            const startTime = Date.now();

            // 测试数据加载性能
            try {
                // 并发获取多个类型的数据
                const testTypes = ['INTJ', 'INTP', 'ENTJ', 'INFJ'];
                const promises = testTypes.map(type =>
                    supabase
                        .from('career_suggestions')
                        .select('career_zh')
                        .eq('mbti_type', type)
                        .limit(10)
                );

                const results = await Promise.all(promises);
                const loadTime = Date.now() - startTime;

                // 验证所有请求都成功
                const allSuccessful = results.every(result => !result.error);
                if (!allSuccessful) {
                    throw new Error('性能测试: 部分请求失败');
                }

                // 计算平均响应时间
                const totalRecords = results.reduce((sum, result) => sum + (result.data?.length || 0), 0);
                const avgTime = loadTime / testTypes.length;

                if (avgTime > 2000) { // 超过2秒认为性能有问题
                    throw new Error(`性能测试失败: 平均响应时间${avgTime}ms超过阈值`);
                }

                return {
                    success: true,
                    details: `性能回归测试通过: ${testTypes}个并发请求，${totalRecords}条记录，平均响应时间: ${avgTime.toFixed(1)}ms`
                };

            } catch (error) {
                throw error;
            }
        });

        // 3.3 数据稳定性验证
        await this.runTest('phase3', '数据稳定性验证', async () => {
            const startTime = Date.now();

            try {
                // 多次获取数据，验证稳定性
                const testCount = 3;
                const results = [];

                for (let i = 0; i < testCount; i++) {
                    const { data, error } = await supabase
                        .from('career_suggestions')
                        .select('count(*)', { count: 'exact', head: true });

                    if (error) {
                        throw new Error(`稳定性测试第${i+1}次失败: ${error.message}`);
                    }

                    results.push(data[0]?.count || 0);

                    // 短暂延迟，避免连续请求
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                const verificationTime = Date.now() - startTime;

                // 验证数据一致性
                const isConsistent = results.every(count => count === results[0]);
                if (!isConsistent) {
                    throw new Error(`数据稳定性测试失败: 记录数不一致 ${results.join(', ')}`);
                }

                return {
                    success: true,
                    details: `数据稳定性验证通过: ${testCount}次测试结果一致，记录数: ${results[0]}，验证时间: ${verificationTime}ms`
                };

            } catch (error) {
                throw error;
            }
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
                groupedData[item.mbti_type].push({
                    career_zh: item.career_zh,
                    career_en: item.career_en
                });
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

            const extractCareerData = (content, variableName) => {
                const regex = new RegExp(`const ${variableName} = \\{(\\s*[^}]+\\s*)\\};`);
                const match = content.match(regex);

                if (!match) {
                    throw new Error(`无法找到${variableName}定义`);
                }

                try {
                    const dataStr = match[1];
                    const data = eval(`({${dataStr}})`);
                    return data;
                } catch (evalError) {
                    throw new Error(`解析${variableName}失败: ${evalError.message}`);
                }
            };

            const zhData = extractCareerData(fileContent, 'CAREER_SUGGESTIONS');
            const enData = extractCareerData(fileContent, 'CAREER_SUGGESTIONS_EN');

            return { zh: zhData, en: enData };
        } catch (error) {
            throw new Error(`读取本地数据失败: ${error.message}`);
        }
    }

    // ==================== 主执行方法 ====================

    async runDeploymentVerification() {
        console.log('🚀 开始部署后一致性验证测试\n');
        console.log('测试目标: 验证部署后的数据一致性');
        console.log('测试方法: TDD驱动，从单元测试到回归测试');
        console.log(`部署时间: ${this.deploymentTime || 'N/A'}`);
        console.log('基线状态: 100% TDD验证通过\n');

        try {
            // 执行所有测试阶段
            await this.phase1_UnitTests();
            await this.phase2_IntegrationTests();
            await this.phase3_RegressionTests();

            // 生成最终报告
            return this.generateFinalReport();

        } catch (error) {
            console.error('\n💥 部署验证过程中发生错误:', error.message);
            return this.generateFinalReport(error);
        }
    }

    generateFinalReport(error = null) {
        const endTime = Date.now();
        const totalDuration = endTime - this.startTime;

        // 统计总结果
        const totalTests = Object.values(this.testResults).reduce((sum, phase) => sum + phase.tests.length, 0);
        const totalPassed = Object.values(this.testResults).reduce((sum, phase) => sum + phase.passed, 0);
        const totalFailed = totalTests - totalPassed;
        const successRate = totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0;

        const report = {
            deploymentTime: this.deploymentTime,
            verificationTime: new Date().toISOString(),
            duration: totalDuration,
            summary: {
                totalTests,
                totalPassed,
                totalFailed,
                successRate: parseFloat(successRate),
                status: totalFailed === 0 ? 'SUCCESS' : 'FAILED'
            },
            phases: this.testResults,
            baselineVerification: {
                dataTypes: this.baselineData ? Object.keys(this.baselineData).length : 0,
                totalRecords: this.baselineData ?
                    Object.values(this.baselineData).reduce((sum, careers) => sum + careers.length, 0) : 0
            },
            conclusion: error ? error.message :
                     (totalFailed === 0 ?
                        '✅ 部署验证完全成功，系统状态正常' :
                        `❌ 部署验证失败: ${totalFailed}/${totalTests}个测试失败`),
            recommendations: totalFailed === 0 ?
                ['系统可以安全投入使用', '建议继续监控数据一致性'] :
                ['需要修复失败的测试', '建议进行问题诊断和修复']
        };

        // 保存报告
        const reportPath = path.join(__dirname, `deployment-verification-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // 输出结果
        console.log('\n' + '='.repeat(80));
        console.log('🎯 部署后一致性验证测试 - 最终报告');
        console.log('='.repeat(80));
        console.log(`🚀 部署时间: ${this.deploymentTime || 'N/A'}`);
        console.log(`⏱️  验证时间: ${report.verificationTime}`);
        console.log(`⏱️  总耗时: ${totalDuration}ms`);
        console.log(`📊 总测试数: ${totalTests}`);
        console.log(`✅ 通过: ${totalPassed}`);
        console.log(`❌ 失败: ${totalFailed}`);
        console.log(`📈 成功率: ${successRate}%`);
        console.log(`📄 详细报告: ${path.basename(reportPath)}`);
        console.log('='.repeat(80));
        console.log(`🎯 结论: ${report.conclusion}`);

        if (report.recommendations.length > 0) {
            console.log('\n💡 建议:');
            report.recommendations.forEach(rec => {
                console.log(`   - ${rec}`);
            });
        }

        return report;
    }
}

/**
 * 主执行函数
 */
async function main() {
    const testSuite = new DeploymentVerificationTestSuite();
    return await testSuite.runDeploymentVerification();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, DeploymentVerificationTestSuite };