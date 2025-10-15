/**
 * 简化的数据对比脚本
 * 直接手动定义本地数据进行对比
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

// 本地数据（从data.js文件提取）
const LOCAL_CAREER_SUGGESTIONS = {
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

const LOCAL_BELBIN_ROLES = [
    'Plant',
    'Resource_Investigator',
    'Coordinator',
    'Shaper',
    'Monitor_Evaluator',
    'Teamworker',
    'Implementer',
    'Completer_Finisher',
    'Specialist'
];

/**
 * 对比职业建议数据
 */
async function compareCareerData() {
    console.log('=== 职业建议数据对比 ===');

    try {
        // 获取云端数据
        const { data: careerData, error } = await supabase
            .from('career_suggestions')
            .select('*')
            .order('mbti_type');

        if (error) {
            console.error('获取云端数据失败:', error);
            return null;
        }

        // 按MBTI类型分组
        const supabaseCareerData = {};
        careerData.forEach(item => {
            if (!supabaseCareerData[item.mbti_type]) {
                supabaseCareerData[item.mbti_type] = [];
            }
            supabaseCareerData[item.mbti_type].push(item.career_zh);
        });

        console.log('本地MBTI类型:', Object.keys(LOCAL_CAREER_SUGGESTIONS).sort());
        console.log('云端MBTI类型:', Object.keys(supabaseCareerData).sort());

        const localTypes = Object.keys(LOCAL_CAREER_SUGGESTIONS);
        const supabaseTypes = Object.keys(supabaseCareerData);

        const missingInLocal = supabaseTypes.filter(type => !localTypes.includes(type));
        const missingInSupabase = localTypes.filter(type => !supabaseTypes.includes(type));

        if (missingInLocal.length > 0) {
            console.log('\n⚠️  云端有但本地没有的MBTI类型:', missingInLocal);
        }

        if (missingInSupabase.length > 0) {
            console.log('\n⚠️  本地有但云端没有的MBTI类型:', missingInSupabase);
        }

        // 详细对比每个MBTI类型
        const commonTypes = localTypes.filter(type => supabaseTypes.includes(type));
        let totalDifferences = 0;
        const differences = {};

        console.log(`\n详细对比 ${commonTypes.length} 个共同MBTI类型:`);

        commonTypes.forEach(type => {
            const localCareers = LOCAL_CAREER_SUGGESTIONS[type];
            const supabaseCareers = supabaseCareerData[type];

            const missingLocal = supabaseCareers.filter(career => !localCareers.includes(career));
            const missingSupabase = localCareers.filter(career => !supabaseCareers.includes(career));

            if (missingLocal.length > 0 || missingSupabase.length > 0) {
                differences[type] = {
                    missingInLocal: missingLocal,
                    missingInSupabase: missingSupabase,
                    localCount: localCareers.length,
                    supabaseCount: supabaseCareers.length
                };
                totalDifferences++;

                console.log(`\n🔍 ${type} 类型差异:`);
                console.log(`   本地 (${localCareers.length}): ${localCareers.join(', ')}`);
                console.log(`   云端 (${supabaseCareers.length}): ${supabaseCareers.join(', ')}`);
                if (missingLocal.length > 0) {
                    console.log(`   ❌ 云端有但本地没有: ${missingLocal.join(', ')}`);
                }
                if (missingSupabase.length > 0) {
                    console.log(`   ❌ 本地有但云端没有: ${missingSupabase.join(', ')}`);
                }
            } else {
                console.log(`✅ ${type}: 完全一致 (${localCareers.length}个职业)`);
            }
        });

        console.log(`\n=== 职业建议对比总结 ===`);
        console.log(`共同MBTI类型: ${commonTypes.length} 个`);
        console.log(`存在差异的类型: ${totalDifferences} 个`);
        console.log(`完全一致的类型: ${commonTypes.length - totalDifferences} 个`);

        return {
            missingInLocal,
            missingInSupabase,
            differences,
            totalDifferences,
            commonTypes: commonTypes.length
        };

    } catch (error) {
        console.error('职业建议对比失败:', error);
        return null;
    }
}

/**
 * 对比贝尔宾角色数据
 */
async function compareBelbinData() {
    console.log('\n=== 贝尔宾角色数据对比 ===');

    try {
        // 获取云端贝尔宾角色
        const { data: belbinData, error } = await supabase
            .from('belbin_roles')
            .select('role_key')
            .order('role_key');

        if (error) {
            console.error('获取云端贝尔宾角色失败:', error);
            return null;
        }

        const supabaseRoles = belbinData.map(role => role.role_key);
        const localRoles = LOCAL_BELBIN_ROLES;

        console.log('本地贝尔宾角色:', localRoles);
        console.log('云端贝尔宾角色:', supabaseRoles);

        const missingInLocal = supabaseRoles.filter(role => !localRoles.includes(role));
        const missingInSupabase = localRoles.filter(role => !supabaseRoles.includes(role));

        if (missingInLocal.length > 0) {
            console.log('\n⚠️  云端有但本地没有的贝尔宾角色:', missingInLocal);
        }

        if (missingInSupabase.length > 0) {
            console.log('\n⚠️  本地有但云端没有的贝尔宾角色:', missingInSupabase);
        }

        const isConsistent = missingInLocal.length === 0 && missingInSupabase.length === 0;

        if (isConsistent) {
            console.log('\n✅ 贝尔宾角色数据完全一致');
        }

        return {
            localCount: localRoles.length,
            supabaseCount: supabaseRoles.length,
            missingInLocal,
            missingInSupabase,
            consistent: isConsistent
        };

    } catch (error) {
        console.error('贝尔宾角色对比失败:', error);
        return null;
    }
}

/**
 * 主对比函数
 */
async function main() {
    console.log('开始对比本地Static与Supabase云端数据...\n');

    const careerResult = await compareCareerData();
    const belbinResult = await compareBelbinData();

    console.log('\n=== 最终总结 ===');

    if (careerResult) {
        console.log(`📊 职业建议一致性: ${careerResult.totalDifferences === 0 ? '✅ 完全一致' : `⚠️  ${careerResult.totalDifferences}个类型存在差异`}`);
    }

    if (belbinResult) {
        console.log(`👥 贝尔宾角色一致性: ${belbinResult.consistent ? '✅ 完全一致' : '⚠️  存在差异'}`);
    }

    // 生成简要报告
    const report = {
        timestamp: new Date().toISOString(),
        career: careerResult,
        belbin: belbinResult,
        overall: {
            careerConsistent: careerResult?.totalDifferences === 0,
            belbinConsistent: belbinResult?.consistent || false,
            fullyConsistent: careerResult?.totalDifferences === 0 && belbinResult?.consistent
        }
    };

    // 保存报告
    const fs = require('fs');
    fs.writeFileSync('data-consistency-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 详细报告已保存到: data-consistency-report.json');

    return report;
}

// 运行对比
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };