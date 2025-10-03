/**
 * 数据迁移脚本
 * 从 static/js/data.js 提取数据并生成 SQL 插入语句
 */

const fs = require('fs');
const path = require('path');

// 读取 data.js 文件
const dataJsPath = path.join(__dirname, 'static', 'js', 'data.js');
const dataJsContent = fs.readFileSync(dataJsPath, 'utf8');

// 使用 eval 来执行 data.js 中的代码（在 Node.js 环境中）
global.window = undefined;
eval(dataJsContent);

// 现在可以访问全局变量
const {
    QUESTIONS_ZH,
    QUESTIONS_EN,
    BELBIN_ROLES,
    MBTI_DETAILS,
    CAREER_SUGGESTIONS,
    CAREER_SUGGESTIONS_EN,
    DIMENSIONS,
    ANSWER_OPTIONS,
    TEXTS
} = global;

// 生成 SQL 插入语句
function generateSQL() {
    let sql = '';
    
    // 1. 插入题目数据
    sql += '-- 插入题目数据\n';
    sql += 'INSERT INTO questions (id, text_zh, text_en, dimension) VALUES\n';
    
    const questionValues = [];
    for (let i = 0; i < QUESTIONS_ZH.length; i++) {
        const zhQuestion = QUESTIONS_ZH[i];
        const enQuestion = QUESTIONS_EN[i];
        
        questionValues.push(
            `(${zhQuestion.id}, '${zhQuestion.text.replace(/'/g, "''")}', '${enQuestion.text.replace(/'/g, "''")}', '${zhQuestion.dimension}')`
        );
    }
    
    sql += questionValues.join(',\n') + ';\n\n';
    
    // 2. 插入 MBTI 类型详细信息
    sql += '-- 插入 MBTI 类型详细信息\n';
    sql += 'INSERT INTO mbti_types_info (type_code, name_zh, name_en, description_zh, description_en, strengths_zh, strengths_en, challenges_zh, challenges_en) VALUES\n';
    
    const mbtiValues = [];
    for (const [typeCode, details] of Object.entries(MBTI_DETAILS)) {
        const strengthsZh = JSON.stringify(details.strengths);
        const strengthsEn = JSON.stringify(details.strengthsEn);
        const challengesZh = JSON.stringify(details.challenges);
        const challengesEn = JSON.stringify(details.challengesEn);
        
        mbtiValues.push(
            `('${typeCode}', '${details.name}', '${details.nameEn}', '${details.description.replace(/'/g, "''")}', '${details.descriptionEn.replace(/'/g, "''")}', '${strengthsZh.replace(/'/g, "''")}', '${strengthsEn.replace(/'/g, "''")}', '${challengesZh.replace(/'/g, "''")}', '${challengesEn.replace(/'/g, "''")}')`
        );
    }
    
    sql += mbtiValues.join(',\n') + ';\n\n';
    
    // 3. 插入贝尔宾角色数据
    sql += '-- 插入贝尔宾角色数据\n';
    sql += 'INSERT INTO belbin_roles (role_key, name_zh, name_en, description_zh, description_en, characteristics_zh, characteristics_en, contribution_zh, contribution_en, allowable_weaknesses_zh, allowable_weaknesses_en) VALUES\n';
    
    const belbinValues = [];
    for (const [roleKey, role] of Object.entries(BELBIN_ROLES)) {
        belbinValues.push(
            `('${roleKey}', '${role.name}', '${role.nameEn}', '${role.description.replace(/'/g, "''")}', '${role.descriptionEn.replace(/'/g, "''")}', '${role.characteristics.replace(/'/g, "''")}', '${role.characteristicsEn.replace(/'/g, "''")}', '${role.contribution.replace(/'/g, "''")}', '${role.contributionEn.replace(/'/g, "''")}', '${role.allowable_weaknesses.replace(/'/g, "''")}', '${role.allowable_weaknessesEn.replace(/'/g, "''")}')`
        );
    }
    
    sql += belbinValues.join(',\n') + ';\n\n';
    
    // 4. 插入职业建议数据
    sql += '-- 插入职业建议数据\n';
    sql += 'INSERT INTO career_suggestions (mbti_type, careers_zh, careers_en) VALUES\n';
    
    const careerValues = [];
    for (const [mbtiType, careersZh] of Object.entries(CAREER_SUGGESTIONS)) {
        const careersEn = CAREER_SUGGESTIONS_EN[mbtiType] || [];
        const careersZhJson = JSON.stringify(careersZh);
        const careersEnJson = JSON.stringify(careersEn);
        
        careerValues.push(
            `('${mbtiType}', '${careersZhJson.replace(/'/g, "''")}', '${careersEnJson.replace(/'/g, "''")}')`
        );
    }
    
    sql += careerValues.join(',\n') + ';\n\n';
    
    return sql;
}

// 生成 SQL 并写入文件
const sqlContent = generateSQL();
const outputPath = path.join(__dirname, 'data_migration.sql');
fs.writeFileSync(outputPath, sqlContent, 'utf8');

console.log('数据迁移 SQL 文件已生成:', outputPath);
console.log('包含的数据:');
console.log(`- 题目数量: ${QUESTIONS_ZH.length}`);
console.log(`- MBTI 类型数量: ${Object.keys(MBTI_DETAILS).length}`);
console.log(`- 贝尔宾角色数量: ${Object.keys(BELBIN_ROLES).length}`);
console.log(`- 职业建议类型数量: ${Object.keys(CAREER_SUGGESTIONS).length}`);