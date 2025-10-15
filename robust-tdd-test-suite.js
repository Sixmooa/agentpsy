/**
 * 稳健的TDD数据一致性验证测试套件
 * 专注于解决数据解析和连接问题
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 稳健的TDD测试套件
 */
class RobustTDDTestSuite {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
        this.data = {
            supabase: null,
            local: null
        };
    }

    logTest(name, passed, details = "", error = null) {
        const result = {
            name,
            passed,
            details,
            error: error ? error.message : null,
            timestamp: new Date().toISOString()
        };

        this.testResults.push(result);

        if (passed) {
            console.log(`✅ ${name}: ${details}`);
        } else {
            console.log(`❌ ${name}: ${error ? error.message : details}`);
        }
    }

    // ==================== 基础连接和数据获取 ====================

    async testSupabaseConnection() {
        try {
            console.log('🔗 测试Supabase连接...');

            // 先测试简单查询
            const { data, error } = await supabase
                .from('career_suggestions')
                .select('id, mbti_type, career_zh, career_en')
                .limit(1);

            if (error) {
                throw new Error(`Supabase查询失败: ${error.message}`);
            }

            if (!data || data.length === 0) {
                throw new Error('Supabase返回空数据');
            }

            // 获取完整数据
            const { data: allData, error: allError } = await supabase
                .from('career_suggestions')
                .select('id, mbti_type, career_zh, career_en')
                .order('mbti_type, id');

            if (allError) {
                throw new Error(`获取完整数据失败: ${allError.message}`);
            }

            // 按类型分组
            const groupedData = {};
            allData.forEach(item => {
                if (!groupedData[item.mbti_type]) {
                    groupedData[item.mbti_type] = [];
                }
                groupedData[item.mbti_type].push({
                    career_zh: item.career_zh,
                    career_en: item.career_en
                });
            });

            this.data.supabase = groupedData;

            this.logTest('Supabase连接测试', true,
                `成功连接，获取${Object.keys(groupedData).length}个MBTI类型，${allData.length}条记录`);

        } catch (error) {
            this.logTest('Supabase连接测试', false, '', error);
            throw error;
        }
    }

    async testLocalDataParsing() {
        try {
            console.log('📖 测试本地数据解析...');

            const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');

            if (!fs.existsSync(dataJsPath)) {
                throw new Error(`本地文件不存在: ${dataJsPath}`);
            }

            const fileContent = fs.readFileSync(dataJsPath, 'utf8');

            // 更安全的数据提取方法
            const extractCareerData = (content, variableName) => {
                const regex = new RegExp(`const ${variableName} = \\{(\\s*[^}]+\\s*)\\};`);
                const match = content.match(regex);

                if (!match) {
                    throw new Error(`无法找到${variableName}定义`);
                }

                try {
                    // 移除const关键字，然后eval
                    const dataStr = match[1];
                    const data = eval(`({${dataStr}})`);
                    return data;
                } catch (evalError) {
                    throw new Error(`解析${variableName}失败: ${evalError.message}`);
                }
            };

            const zhData = extractCareerData(fileContent, 'CAREER_SUGGESTIONS');
            const enData = extractCareerData(fileContent, 'CAREER_SUGGESTIONS_EN');

            this.data.local = { zh: zhData, en: enData };

            const zhTypes = Object.keys(zhData);
            const enTypes = Object.keys(enData);

            this.logTest('本地数据解析测试', true,
                `解析成功 - 中文:${zhTypes.length}类型, 英文:${enTypes.length}类型`);

        } catch (error) {
            this.logTest('本地数据解析测试', false, '', error);
            throw error;
        }
    }

    // ==================== 详细对比测试 ====================

    testMBTICoverage() {
        console.log('🔍 测试MBTI类型覆盖...');

        const expectedTypes = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
                               'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];

        const supabaseTypes = Object.keys(this.data.supabase).sort();
        const localTypes = Object.keys(this.data.local.zh).sort();

        // 检查云端覆盖
        const missingInSupabase = expectedTypes.filter(type => !supabaseTypes.includes(type));
        const extraInSupabase = supabaseTypes.filter(type => !expectedTypes.includes(type));

        if (missingInSupabase.length > 0) {
            this.logTest('云端MBTI覆盖', false, `缺少类型: ${missingInSupabase.join(', ')}`);
        } else if (extraInSupabase.length > 0) {
            this.logTest('云端MBTI覆盖', false, `多余类型: ${extraInSupabase.join(', ')}`);
        } else {
            this.logTest('云端MBTI覆盖', true, '16个类型完全覆盖');
        }

        // 检查本地覆盖
        const missingInLocal = expectedTypes.filter(type => !localTypes.includes(type));
        const extraInLocal = localTypes.filter(type => !expectedTypes.includes(type));

        if (missingInLocal.length > 0) {
            this.logTest('本地MBTI覆盖', false, `缺少类型: ${missingInLocal.join(', ')}`);
        } else if (extraInLocal.length > 0) {
            this.logTest('本地MBTI覆盖', false, `多余类型: ${extraInLocal.join(', ')}`);
        } else {
            this.logTest('本地MBTI覆盖', true, '16个类型完全覆盖');
        }
    }

    testCareerCountConsistency() {
        console.log('📊 测试职业建议数量一致性...');

        let totalCountConsistent = true;
        let typeConsistency = {};

        Object.keys(this.data.supabase).forEach(type => {
            const supabaseCount = this.data.supabase[type].length;
            const localCount = this.data.local.zh[type] ? this.data.local.zh[type].length : 0;

            if (supabaseCount !== localCount) {
                totalCountConsistent = false;
                typeConsistency[type] = {
                    supabase: supabaseCount,
                    local: localCount,
                    consistent: false
                };
                this.logTest(`${type}数量一致性`, false,
                    `云端:${supabaseCount}, 本地:${localCount}`);
            } else {
                typeConsistency[type] = {
                    supabase: supabaseCount,
                    local: localCount,
                    consistent: true
                };
                this.logTest(`${type}数量一致性`, true, `${supabaseCount}个职业`);
            }
        });

        const consistentTypes = Object.values(typeConsistency).filter(t => t.consistent).length;
        const totalTypes = Object.keys(typeConsistency).length;

        if (totalCountConsistent) {
            this.logTest('总体数量一致性', true, `所有${totalTypes}个类型数量一致`);
        } else {
            this.logTest('总体数量一致性', false,
                `${consistentTypes}/${totalTypes}个类型数量一致`);
        }
    }

    testCareerContentConsistency() {
        console.log('🔍 测试职业建议内容一致性...');

        let allContentConsistent = true;
        let contentDifferences = {};

        Object.keys(this.data.supabase).forEach(type => {
            const supabaseCareers = this.data.supabase[type].map(c => c.career_zh).sort();
            const localCareers = this.data.local.zh[type] ? [...this.data.local.zh[type]].sort() : [];

            const missingInLocal = supabaseCareers.filter(career => !localCareers.includes(career));
            const missingInSupabase = localCareers.filter(career => !supabaseCareers.includes(career));

            if (missingInLocal.length > 0 || missingInSupabase.length > 0) {
                allContentConsistent = false;
                contentDifferences[type] = {
                    missingInLocal,
                    missingInSupabase,
                    consistent: false
                };

                let details = [];
                if (missingInLocal.length > 0) {
                    details.push(`本地缺少:${missingInLocal.join(', ')}`);
                }
                if (missingInSupabase.length > 0) {
                    details.push(`本地多余:${missingInSupabase.join(', ')}`);
                }

                this.logTest(`${type}内容一致性`, false, details.join('; '));
            } else {
                contentDifferences[type] = {
                    missingInLocal: [],
                    missingInSupabase: [],
                    consistent: true
                };
                this.logTest(`${type}内容一致性`, true, '内容完全一致');
            }
        });

        const consistentTypes = Object.values(contentDifferences).filter(d => d.consistent).length;
        const totalTypes = Object.keys(contentDifferences).length;

        if (allContentConsistent) {
            this.logTest('总体内容一致性', true, `所有${totalTypes}个类型内容100%一致`);
        } else {
            this.logTest('总体内容一致性', false,
                `${consistentTypes}/${totalTypes}个类型内容一致`);
        }
    }

    testEnglishDataConsistency() {
        console.log('🌐 测试英文数据一致性...');

        let englishConsistent = true;
        let englishIssues = {};

        Object.keys(this.data.supabase).forEach(type => {
            const supabaseCareers = this.data.supabase[type].map(c => c.career_en).sort();
            const localCareers = this.data.local.en[type] ? [...this.data.local.en[type]].sort() : [];

            const missingInLocal = supabaseCareers.filter(career => !localCareers.includes(career));
            const missingInSupabase = localCareers.filter(career => !supabaseCareers.includes(career));

            if (missingInLocal.length > 0 || missingInSupabase.length > 0) {
                englishConsistent = false;
                englishIssues[type] = {
                    missingInLocal,
                    missingInSupabase,
                    consistent: false
                };

                let details = [];
                if (missingInLocal.length > 0) {
                    details.push(`本地缺少:${missingInLocal.slice(0, 3).join(', ')}...`);
                }
                if (missingInSupabase.length > 0) {
                    details.push(`本地多余:${missingInSupabase.slice(0, 3).join(', ')}...`);
                }

                this.logTest(`${type}英文一致性`, false, details.join('; '));
            } else {
                this.logTest(`${type}英文一致性`, true, '英文内容一致');
            }
        });

        const consistentTypes = Object.keys(englishIssues).filter(type => englishIssues[type].consistent).length;
        const totalTypes = Object.keys(this.data.supabase).length;

        if (englishConsistent) {
            this.logTest('总体英文一致性', true, `所有${totalTypes}个类型英文数据一致`);
        } else {
            this.logTest('总体英文一致性', false,
                `${totalTypes - consistentTypes}个类型英文数据不一致`);
        }
    }

    // ==================== 边界和完整性测试 ====================

    testDataIntegrity() {
        console.log('🔍 测试数据完整性...');

        // 检查空值
        let hasEmptyValues = false;
        let totalCareers = 0;
        let emptyCount = 0;

        Object.values(this.data.local.zh).forEach(careers => {
            careers.forEach(career => {
                totalCareers++;
                if (!career || career.trim() === '') {
                    emptyCount++;
                    hasEmptyValues = true;
                }
            });
        });

        if (hasEmptyValues) {
            this.logTest('空值检查', false, `发现${emptyCount}/${totalCareers}个空值`);
        } else {
            this.logTest('空值检查', true, `所有${totalCareers}个职业名称非空`);
        }

        // 检查重复
        let hasDuplicates = false;
        let duplicateCount = 0;

        Object.keys(this.data.local.zh).forEach(type => {
            const careers = this.data.local.zh[type];
            const unique = new Set(careers);
            if (unique.size !== careers.length) {
                hasDuplicates = true;
                duplicateCount += (careers.length - unique.size);
            }
        });

        if (hasDuplicates) {
            this.logTest('重复检查', false, `发现${duplicateCount}个重复职业`);
        } else {
            this.logTest('重复检查', true, '无重复职业');
        }
    }

    // ==================== 主执行方法 ====================

    async runComprehensiveTest() {
        console.log('🚀 开始稳健的TDD数据一致性验证测试\n');
        console.log('测试目标: 验证Supabase云端与本地static数据的100%一致性');
        console.log('测试方法: 单元测试 → 集成测试 → 完整性测试\n');

        try {
            // 基础数据获取
            await this.testSupabaseConnection();
            await this.testLocalDataParsing();

            // 详细对比测试
            this.testMBTICoverage();
            this.testCareerCountConsistency();
            this.testCareerContentConsistency();
            this.testEnglishDataConsistency();

            // 完整性测试
            this.testDataIntegrity();

            // 生成最终报告
            return this.generateFinalReport();

        } catch (error) {
            console.error('\n💥 测试执行失败:', error.message);
            return this.generateFinalReport(error);
        }
    }

    generateFinalReport(error = null) {
        const endTime = Date.now();
        const duration = endTime - this.startTime;

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.passed).length;
        const failedTests = totalTests - passedTests;
        const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;

        const report = {
            timestamp: new Date().toISOString(),
            duration,
            summary: {
                totalTests,
                passedTests,
                failedTests,
                successRate: parseFloat(successRate),
                status: failedTests === 0 ? 'SUCCESS' : 'FAILED'
            },
            dataSummary: {
                supabaseTypes: this.data.supabase ? Object.keys(this.data.supabase).length : 0,
                localTypes: this.data.local ? Object.keys(this.data.local.zh).length : 0,
                totalCareers: this.data.supabase ?
                    Object.values(this.data.supabase).reduce((sum, careers) => sum + careers.length, 0) : 0
            },
            testResults: this.testResults,
            conclusion: error ? error.message :
                     (failedTests === 0 ? '✅ 所有测试通过，数据一致性验证成功' : '❌ 部分测试失败，存在数据不一致问题')
        };

        // 保存报告
        const reportPath = path.join(__dirname, `robust-tdd-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        // 输出结果
        console.log('\n' + '='.repeat(70));
        console.log('🎯 稳健TDD数据一致性验证测试 - 最终报告');
        console.log('='.repeat(70));
        console.log(`⏱️  测试耗时: ${duration}ms`);
        console.log(`📊 总测试数: ${totalTests}`);
        console.log(`✅ 通过: ${passedTests}`);
        console.log(`❌ 失败: ${failedTests}`);
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
    const testSuite = new RobustTDDTestSuite();
    return await testSuite.runComprehensiveTest();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, RobustTDDTestSuite };