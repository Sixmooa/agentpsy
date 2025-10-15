/**
 * 数据对比脚本 - 本地static vs Supabase云端
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 获取本地static数据
 */
function getLocalData() {
    console.log('=== 获取本地Static数据 ===');

    try {
        const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');
        const fileContent = fs.readFileSync(dataJsPath, 'utf8');

        // 提取职业建议数据
        const careerMatch = fileContent.match(/const CAREER_SUGGESTIONS = \{[\s\S]*?\};/);
        const careerEnMatch = fileContent.match(/const CAREER_SUGGESTIONS_EN = \{[\s\S]*?\};/);

        // 提取贝尔宾角色数据
        const belbinMatch = fileContent.match(/const BELBIN_ROLES = \{[\s\S]*?\};/);

        // 提取MBTI详细信息
        const mbtiMatch = fileContent.match(/const MBTI_DETAILS = \{[\s\S]*?\};/);

        const localData = {
            careerZh: careerMatch ? eval('(' + careerMatch[0].replace('const CAREER_SUGGESTIONS = ', '') + ')') : {},
            careerEn: careerEnMatch ? eval('(' + careerEnMatch[0].replace('const CAREER_SUGGESTIONS_EN = ', '') + ')') : {},
            belbin: belbinMatch ? eval('(' + belbinMatch[0].replace('const BELBIN_ROLES = ', '') + ')') : {},
            mbti: mbtiMatch ? eval('(' + mbtiMatch[0].replace('const MBTI_DETAILS = ', '') + ')') : {}
        };

        console.log('本地数据获取成功:');
        console.log('- 职业建议类型数量:', Object.keys(localData.careerZh).length);
        console.log('- 贝尔宾角色数量:', Object.keys(localData.belbin).length);
        console.log('- MBTI详细信息类型数量:', Object.keys(localData.mbti).length);

        return localData;
    } catch (error) {
        console.error('获取本地数据失败:', error);
        return null;
    }
}

/**
 * 获取Supabase云端数据
 */
async function getSupabaseData() {
    console.log('\n=== 获取Supabase云端数据 ===');

    try {
        // 获取职业建议
        const { data: careerData, error: careerError } = await supabase
            .from('career_suggestions')
            .select('*')
            .order('mbti_type');

        if (careerError) {
            console.error('获取职业建议失败:', careerError);
            return null;
        }

        // 按MBTI类型分组
        const groupedCareerData = {};
        careerData.forEach(item => {
            if (!groupedCareerData[item.mbti_type]) {
                groupedCareerData[item.mbti_type] = [];
            }
            groupedCareerData[item.mbti_type].push(item);
        });

        // 获取贝尔宾角色
        const { data: belbinData, error: belbinError } = await supabase
            .from('belbin_roles')
            .select('*');

        if (belbinError) {
            console.error('获取贝尔宾角色失败:', belbinError);
            return null;
        }

        console.log('云端数据获取成功:');
        console.log('- 职业建议类型数量:', Object.keys(groupedCareerData).length);
        console.log('- 贝尔宾角色数量:', belbinData.length);
        console.log('- 总职业建议记录数:', careerData.length);

        return {
            careers: {
                fullData: careerData,
                groupedData: groupedCareerData
            },
            belbin: belbinData
        };
    } catch (error) {
        console.error('获取云端数据失败:', error);
        return null;
    }
}

/**
 * 对比职业建议数据
 */
function compareCareerData(localData, supabaseData) {
    console.log('\n=== 职业建议数据对比 ===');

    const localTypes = Object.keys(localData.careerZh);
    const supabaseTypes = Object.keys(supabaseData.careers.groupedData);

    console.log('本地MBTI类型:', localTypes);
    console.log('云端MBTI类型:', supabaseTypes);

    const missingInLocal = supabaseTypes.filter(type => !localTypes.includes(type));
    const missingInSupabase = localTypes.filter(type => !supabaseTypes.includes(type));

    if (missingInLocal.length > 0) {
        console.log('⚠️  云端有但本地没有的MBTI类型:', missingInLocal);
    }

    if (missingInSupabase.length > 0) {
        console.log('⚠️  本地有但云端没有的MBTI类型:', missingInSupabase);
    }

    // 对比共同类型的职业建议
    const commonTypes = localTypes.filter(type => supabaseTypes.includes(type));
    console.log('\n共同拥有的MBTI类型数量:', commonTypes.length);

    let totalDifferences = 0;
    let detailedDifferences = {};

    commonTypes.forEach(type => {
        const localCareers = localData.careerZh[type] || [];
        const supabaseCareers = supabaseData.careers.groupedData[type].map(item => item.career_zh);

        const missingLocal = supabaseCareers.filter(career => !localCareers.includes(career));
        const missingSupabase = localCareers.filter(career => !supabaseCareers.includes(career));

        if (missingLocal.length > 0 || missingSupabase.length > 0) {
            detailedDifferences[type] = {
                missingInLocal: missingLocal,
                missingInSupabase: missingSupabase,
                localCount: localCareers.length,
                supabaseCount: supabaseCareers.length
            };
            totalDifferences++;
        }
    });

    if (totalDifferences > 0) {
        console.log(`\n⚠️  发现 ${totalDifferences} 个MBTI类型存在职业建议差异:`);
        Object.entries(detailedDifferences).forEach(([type, diff]) => {
            console.log(`\n${type} 类型:`);
            console.log(`  本地数量: ${diff.localCount}, 云端数量: ${diff.supabaseCount}`);
            if (diff.missingInLocal.length > 0) {
                console.log(`  云端有但本地没有: ${diff.missingInLocal.join(', ')}`);
            }
            if (diff.missingInSupabase.length > 0) {
                console.log(`  本地有但云端没有: ${diff.missingInSupabase.join(', ')}`);
            }
        });
    } else {
        console.log('\n✅ 所有共同MBTI类型的职业建议完全一致');
    }

    return {
        missingInLocal,
        missingInSupabase,
        detailedDifferences,
        totalDifferences
    };
}

/**
 * 对比贝尔宾角色数据
 */
function compareBelbinData(localData, supabaseData) {
    console.log('\n=== 贝尔宾角色数据对比 ===');

    const localRoles = Object.keys(localData.belbin);
    const supabaseRoles = supabaseData.belbin.map(role => role.role_key);

    console.log('本地贝尔宾角色:', localRoles);
    console.log('云端贝尔宾角色:', supabaseRoles);

    const missingInLocal = supabaseRoles.filter(role => !localRoles.includes(role));
    const missingInSupabase = localRoles.filter(role => !supabaseRoles.includes(role));

    if (missingInLocal.length > 0) {
        console.log('⚠️  云端有但本地没有的贝尔宾角色:', missingInLocal);
    }

    if (missingInSupabase.length > 0) {
        console.log('⚠️  本地有但云端没有的贝尔宾角色:', missingInSupabase);
    }

    if (missingInLocal.length === 0 && missingInSupabase.length === 0) {
        console.log('✅ 贝尔宾角色数据完全一致');
    }

    return {
        missingInLocal,
        missingInSupabase,
        consistent: missingInLocal.length === 0 && missingInSupabase.length === 0
    };
}

/**
 * 主对比函数
 */
async function main() {
    console.log('开始对比本地Static与Supabase云端数据...\n');

    // 获取数据
    const localData = getLocalData();
    const supabaseData = await getSupabaseData();

    if (!localData || !supabaseData) {
        console.error('数据获取失败，无法进行对比');
        return;
    }

    // 对比数据
    const careerComparison = compareCareerData(localData, supabaseData);
    const belbinComparison = compareBelbinData(localData, supabaseData);

    // 总结
    console.log('\n=== 数据一致性总结 ===');
    console.log(`职业建议一致性: ${careerComparison.totalDifferences === 0 ? '✅ 完全一致' : '⚠️  存在差异'}`);
    console.log(`贝尔宾角色一致性: ${belbinComparison.consistent ? '✅ 完全一致' : '⚠️  存在差异'}`);

    return {
        careerComparison,
        belbinComparison
    };
}

// 运行对比
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main };