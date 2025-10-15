/**
 * 本地static数据分析脚本
 * 用于分析本地静态数据并与Supabase云端数据进行对比
 */

// 读取本地static数据
const path = require('path');
const fs = require('fs');

/**
 * 读取并解析本地data.js文件
 */
function parseLocalDataFile() {
    console.log('=== 分析本地Static数据 ===');

    try {
        const dataJsPath = path.join(__dirname, 'worktrees', 'supabase-app', 'static', 'js', 'data.js');
        const fileContent = fs.readFileSync(dataJsPath, 'utf8');

        // 提取CAREER_SUGGESTIONS数据
        const careerMatch = fileContent.match(/const CAREER_SUGGESTIONS = \{[\s\S]*?\};/);
        if (careerMatch) {
            const careerData = eval(`(${careerMatch[0].replace('const CAREER_SUGGESTIONS = ', '')})`);
            console.log('本地职业建议数据 (中文):', Object.keys(careerData));
            console.log('本地职业建议数据示例:', careerData);
        }

        // 提取CAREER_SUGGESTIONS_EN数据
        const careerEnMatch = fileContent.match(/const CAREER_SUGGESTIONS_EN = \{[\s\S]*?\};/);
        if (careerEnMatch) {
            const careerEnData = eval(`(${careerEnMatch[0].replace('const CAREER_SUGGESTIONS_EN = ', '')})`);
            console.log('本地职业建议数据 (英文):', Object.keys(careerEnData));
        }

        // 提取BELBIN_ROLES数据
        const belbinMatch = fileContent.match(/const BELBIN_ROLES = \{[\s\S]*?\};/);
        if (belbinMatch) {
            const belbinData = eval(`(${belbinMatch[0].replace('const BELBIN_ROLES = ', '')})`);
            console.log('本地贝尔宾角色数据:', Object.keys(belbinData));
            console.log('本地贝尔宾角色数量:', Object.keys(belbinData).length);
        }

        // 提取MBTI_DETAILS数据
        const mbtiMatch = fileContent.match(/const MBTI_DETAILS = \{[\s\S]*?\};/);
        if (mbtiMatch) {
            const mbtiData = eval(`(${mbtiMatch[0].replace('const MBTI_DETAILS = ', '')})`);
            console.log('本地MBTI详细信息数据:', Object.keys(mbtiData));
            console.log('本地MBTI类型数量:', Object.keys(mbtiData).length);
        }

        return {
            careerZh: careerMatch ? eval(`(${careerMatch[0].replace('const CAREER_SUGGESTIONS = ', '')})`) : {},
            careerEn: careerEnMatch ? eval(`(${careerEnMatch[0].replace('const CAREER_SUGGESTIONS_EN = ', '')})`) : {},
            belbin: belbinMatch ? eval(`(${belbinMatch[0].replace('const BELBIN_ROLES = ', '')})`) : {},
            mbti: mbtiMatch ? eval(`(${mbtiMatch[0].replace('const MBTI_DETAILS = ', '')})`) : {}
        };
    } catch (error) {
        console.error('读取本地数据文件失败:', error);
        return null;
    }
}

/**
 * 分析数据差异
 */
function analyzeDifferences(localData, supabaseData) {
    console.log('\n=== 数据差异分析 ===');

    // 分析职业建议差异
    console.log('\n1. 职业建议数据对比:');

    const localMBTITypes = Object.keys(localData.careerZh);
    const supabaseMBTITypes = Object.keys(supabaseData.careers.groupedData);

    console.log('本地MBTI类型数量:', localMBTITypes.length);
    console.log('云端MBTI类型数量:', supabaseMBTITypes.length);

    const missingInLocal = supabaseMBTITypes.filter(type => !localMBTITypes.includes(type));
    const missingInSupabase = localMBTITypes.filter(type => !supabaseMBTITypes.includes(type));

    if (missingInLocal.length > 0) {
        console.log('云端有但本地没有的MBTI类型:', missingInLocal);
    }

    if (missingInSupabase.length > 0) {
        console.log('本地有但云端没有的MBTI类型:', missingInSupabase);
    }

    // 对比具体职业建议
    const commonTypes = localMBTITypes.filter(type => supabaseMBTITypes.includes(type));
    console.log('共同拥有的MBTI类型数量:', commonTypes.length);

    let careerDifferences = {};
    commonTypes.forEach(type => {
        const localCareers = localData.careerZh[type] || [];
        const supabaseCareers = supabaseData.careers.groupedData[type].map(item => item.career_zh);

        const missingLocalCareers = supabaseCareers.filter(career => !localCareers.includes(career));
        const missingSupabaseCareers = localCareers.filter(career => !supabaseCareers.includes(career));

        if (missingLocalCareers.length > 0 || missingSupabaseCareers.length > 0) {
            careerDifferences[type] = {
                missingInLocal: missingLocalCareers,
                missingInSupabase: missingSupabaseCareers
            };
        }
    });

    if (Object.keys(careerDifferences).length > 0) {
        console.log('职业建议存在差异的MBTI类型:', Object.keys(careerDifferences));
        console.log('具体差异详情:', careerDifferences);
    } else {
        console.log('✓ 所有共同MBTI类型的职业建议完全一致');
    }

    // 分析贝尔宾角色差异
    console.log('\n2. 贝尔宾角色数据对比:');
    const localBelbinRoles = Object.keys(localData.belbin);
    const supabaseBelbinRoles = supabaseData.belbin.map(role => role.role_key);

    console.log('本地贝尔宾角色数量:', localBelbinRoles.length);
    console.log('云端贝尔宾角色数量:', supabaseBelbinRoles.length);

    const missingBelbinInLocal = supabaseBelbinRoles.filter(role => !localBelbinRoles.includes(role));
    const missingBelbinInSupabase = localBelbinRoles.filter(role => !supabaseBelbinRoles.includes(role));

    if (missingBelbinInLocal.length > 0) {
        console.log('云端有但本地没有的贝尔宾角色:', missingBelbinInLocal);
    }

    if (missingBelbinInSupabase.length > 0) {
        console.log('本地有但云端没有的贝尔宾角色:', missingBelbinInSupabase);
    }

    if (localBelbinRoles.length === supabaseBelbinRoles.length &&
        localBelbinRoles.every(role => supabaseBelbinRoles.includes(role))) {
        console.log('✓ 贝尔宾角色类型完全一致');
    }

    // 分析MBTI详细信息差异
    console.log('\n3. MBTI详细信息数据对比:');
    const localMBTIDetails = Object.keys(localData.mbti);
    console.log('本地MBTI详细信息类型数量:', localMBTIDetails.length);
    console.log('本地MBTI详细信息类型示例:', localMBTIDetails.slice(0, 5));

    return {
        careerDifferences,
        belbinConsistent: localBelbinRoles.length === supabaseBelbinRoles.length &&
                         localBelbinRoles.every(role => supabaseBelbinRoles.includes(role)),
        missingTypes: {
            local: missingInSupabase,
            supabase: missingInLocal
        }
    };
}

/**
 * 主分析函数
 */
function main(localData, supabaseData) {
    console.log('开始分析本地Static数据...');

    const localStaticData = parseLocalDataFile();
    if (!localStaticData) {
        return null;
    }

    const differences = analyzeDifferences(localStaticData, supabaseData);

    console.log('\n=== 本地Static数据分析完成 ===');

    return {
        localData: localStaticData,
        differences
    };
}

// 导出函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        parseLocalDataFile,
        analyzeDifferences,
        main
    };
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}