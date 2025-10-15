/**
 * 数据同步修复工具
 * TDD Green阶段：修复本地static数据与云端数据的不一致
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 数据同步修复器
 */
class DataSyncFixer {
    constructor() {
        this.fixReport = {
            timestamp: new Date().toISOString(),
            actions: [],
            errors: [],
            summary: {}
        };
    }

    /**
     * 记录修复动作
     */
    logAction(action, details) {
        this.fixReport.actions.push({
            timestamp: new Date().toISOString(),
            action,
            details
        });
        console.log(`🔧 ${action}: ${details}`);
    }

    /**
     * 记录错误
     */
    logError(error, context) {
        this.fixReport.errors.push({
            timestamp: new Date().toISOString(),
            error: error.message,
            context
        });
        console.error(`❌ 错误 ${context}: ${error.message}`);
    }

    /**
     * 从Supabase获取所有职业建议数据
     */
    async fetchAllCareerData() {
        try {
            this.logAction('获取云端数据', '从Supabase获取所有职业建议数据');

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
                groupedData[item.mbti_type].push({
                    id: item.id,
                    careerZh: item.career_zh,
                    careerEn: item.career_en
                });
            });

            console.log(`📊 获取到 ${Object.keys(groupedData).length} 个MBTI类型，${data.length} 条职业建议`);
            return groupedData;
        } catch (error) {
            this.logError(error, '获取云端职业数据');
            return null;
        }
    }

    /**
     * 生成更新后的职业建议JavaScript代码
     */
    generateUpdatedCareerJS(groupedData) {
        this.logAction('生成新数据', '基于云端数据生成新的职业建议映射');

        let careerZhJS = '// 职业建议映射 (基于Supabase云端数据同步更新)\n';
        careerZhJS += 'const CAREER_SUGGESTIONS = {\n';

        let careerEnJS = '// 职业建议映射 (英文版，基于Supabase云端数据同步更新)\n';
        careerEnJS += 'const CAREER_SUGGESTIONS_EN = {\n';

        const mbtiTypes = Object.keys(groupedData).sort();

        mbtiTypes.forEach((type, index) => {
            const careers = groupedData[type];
            const zhCareers = careers.map(c => `"${c.careerZh}"`);
            const enCareers = careers.map(c => `"${c.careerEn}"`);

            careerZhJS += `    '${type}': [${zhCareers.join(', ')}]`;
            careerEnJS += `    '${type}': [${enCareers.join(', ')}]`;

            if (index < mbtiTypes.length - 1) {
                careerZhJS += ',';
                careerEnJS += ',';
            }
            careerZhJS += '\n';
            careerEnJS += '\n';
        });

        careerZhJS += '};\n';
        careerEnJS += '};\n';

        return { careerZhJS, careerEnJS };
    }

    /**
     * 备份原始data.js文件
     */
    backupOriginalFile() {
        try {
            const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');
            const backupPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', `data.backup.${Date.now()}.js`);

            if (fs.existsSync(dataJsPath)) {
                fs.copyFileSync(dataJsPath, backupPath);
                this.logAction('备份文件', `原始文件已备份到: ${path.basename(backupPath)}`);
                return backupPath;
            } else {
                throw new Error('原始data.js文件不存在');
            }
        } catch (error) {
            this.logError(error, '备份原始文件');
            return null;
        }
    }

    /**
     * 更新本地static数据文件
     */
    async updateStaticDataFile(groupedData) {
        try {
            this.logAction('更新静态数据', '开始更新本地data.js文件');

            const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');

            // 备份原始文件
            const backupPath = this.backupOriginalFile();
            if (!backupPath) {
                throw new Error('备份失败，停止更新');
            }

            // 读取原始文件
            const originalContent = fs.readFileSync(dataJsPath, 'utf8');

            // 生成新的职业建议代码
            const { careerZhJS, careerEnJS } = this.generateUpdatedCareerJS(groupedData);

            // 找到并替换职业建议部分
            const careerZhStart = originalContent.indexOf('// 职业建议映射');
            const careerZhEnd = originalContent.indexOf('\n// 职业建议映射 (英文版)');

            const careerEnStart = originalContent.indexOf('// 职业建议映射 (英文版)');
            const careerEnEnd = originalContent.indexOf('\n// 维度名称映射');

            if (careerZhStart === -1 || careerEnStart === -1) {
                throw new Error('无法找到职业建议数据的起始位置');
            }

            // 构建新文件内容
            const beforeCareerZh = originalContent.substring(0, careerZhStart);
            const betweenCareerSections = originalContent.substring(careerEnEnd, careerEnStart);
            const afterCareerEn = originalContent.substring(careerEnEnd);

            const newContent = beforeCareerZh +
                             careerZhJS +
                             '\n' +
                             careerEnJS +
                             afterCareerEn;

            // 写入新内容
            fs.writeFileSync(dataJsPath, newContent, 'utf8');

            this.logAction('文件更新', 'data.js文件已成功更新');
            return true;
        } catch (error) {
            this.logError(error, '更新静态数据文件');
            return false;
        }
    }

    /**
     * 验证修复结果
     */
    async verifyFix(groupedData) {
        try {
            this.logAction('验证修复', '检查数据是否正确同步');

            // 重新读取更新后的数据
            const updatedData = await this.fetchUpdatedLocalData();

            if (!updatedData) {
                throw new Error('无法读取更新后的本地数据');
            }

            // 对比数据一致性
            const inconsistencies = [];
            const allTypes = Object.keys(groupedData);

            allTypes.forEach(type => {
                const expectedCareers = groupedData[type].map(c => c.careerZh);
                const actualCareers = updatedData[type] || [];

                const missing = expectedCareers.filter(c => !actualCareers.includes(c));
                const extra = actualCareers.filter(c => !expectedCareers.includes(c));

                if (missing.length > 0 || extra.length > 0) {
                    inconsistencies.push({
                        type,
                        missing,
                        extra,
                        expected: expectedCareers,
                        actual: actualCareers
                    });
                }
            });

            if (inconsistencies.length === 0) {
                this.logAction('验证成功', `所有${allTypes.length}个MBTI类型数据完全一致`);
                return true;
            } else {
                console.log(`⚠️  发现 ${inconsistencies.length} 个类型仍有不一致`);
                inconsistencies.forEach(inc => {
                    console.log(`   ${inc.type}: 缺失${inc.missing.length}个, 多余${inc.extra.length}个`);
                });
                return false;
            }
        } catch (error) {
            this.logError(error, '验证修复结果');
            return false;
        }
    }

    /**
     * 获取更新后的本地数据（用于验证）
     */
    async fetchUpdatedLocalData() {
        try {
            // 读取更新后的data.js文件
            const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');
            const fileContent = fs.readFileSync(dataJsPath, 'utf8');

            // 提取CAREER_SUGGESTIONS数据
            const careerMatch = fileContent.match(/const CAREER_SUGGESTIONS = \{[\s\S]*?\};/);
            if (!careerMatch) {
                throw new Error('无法找到CAREER_SUGGESTIONS定义');
            }

            // 安全评估职业建议数据
            const careerDataStr = careerMatch[0].replace('const CAREER_SUGGESTIONS = ', '');
            const careerData = eval(`(${careerDataStr})`);

            return careerData;
        } catch (error) {
            this.logError(error, '获取更新后本地数据');
            return null;
        }
    }

    /**
     * 生成修复报告
     */
    generateFixReport(success) {
        this.fixReport.summary = {
            success,
            totalActions: this.fixReport.actions.length,
            totalErrors: this.fixReport.errors.length,
            completionTime: new Date().toISOString()
        };

        const reportPath = path.join(__dirname, 'data-sync-fix-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(this.fixReport, null, 2));

        console.log('\n📄 修复报告已保存到: data-sync-fix-report.json');
        return reportPath;
    }

    /**
     * 执行完整的修复流程
     */
    async executeFix() {
        console.log('🚀 开始执行数据同步修复流程...\n');

        try {
            // 1. 获取云端数据
            const groupedData = await this.fetchAllCareerData();
            if (!groupedData) {
                throw new Error('无法获取云端数据');
            }

            // 2. 更新本地数据文件
            const updateSuccess = await this.updateStaticDataFile(groupedData);
            if (!updateSuccess) {
                throw new Error('本地数据文件更新失败');
            }

            // 3. 验证修复结果
            const verificationSuccess = await this.verifyFix(groupedData);
            if (!verificationSuccess) {
                console.log('⚠️  修复验证失败，可能需要手动检查');
            }

            // 4. 生成报告
            const reportPath = this.generateFixReport(verificationSuccess);

            console.log('\n' + '='.repeat(60));
            console.log('🎯 数据同步修复完成');
            console.log('='.repeat(60));
            console.log(`✅ 修复成功: ${verificationSuccess ? '是' : '否'}`);
            console.log(`📊 总操作数: ${this.fixReport.actions.length}`);
            console.log(`❌ 错误数: ${this.fixReport.errors.length}`);
            console.log(`📄 报告位置: ${reportPath}`);

            if (verificationSuccess) {
                console.log('\n🎉 TDD Green阶段完成：数据同步修复成功！');
                console.log('💡 下一步：运行回归测试验证修复效果');
            }

            return verificationSuccess;

        } catch (error) {
            this.logError(error, '执行修复流程');
            this.generateFixReport(false);

            console.log('\n❌ 修复流程失败');
            console.log(`💥 错误: ${error.message}`);
            console.log('📄 详细错误信息请查看修复报告');

            return false;
        }
    }
}

/**
 * 主执行函数
 */
async function main() {
    const fixer = new DataSyncFixer();
    return await fixer.executeFix();
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main, DataSyncFixer };