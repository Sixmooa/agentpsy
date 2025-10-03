// 简单的语法检查和基本测试
console.log('检查JavaScript文件语法和基本功能...\n');

// 检查数据文件
console.log('1. 检查 data.js...');
try {
    const fs = require('fs');
    const dataContent = fs.readFileSync('./js/data.js', 'utf8');
    
    // 检查是否包含必要的数据结构
    if (dataContent.includes('QUESTIONS_ZH') && dataContent.includes('QUESTIONS_EN')) {
        console.log('✅ data.js 包含问题数据');
    } else {
        console.log('❌ data.js 缺少问题数据');
    }
    
    if (dataContent.includes('BELBIN_ROLES')) {
        console.log('✅ data.js 包含贝尔宾角色数据');
    } else {
        console.log('❌ data.js 缺少贝尔宾角色数据');
    }
    
    if (dataContent.includes('MBTI_DETAILS')) {
        console.log('✅ data.js 包含MBTI详情数据');
    } else {
        console.log('❌ data.js 缺少MBTI详情数据');
    }
    
} catch (error) {
    console.log('❌ data.js 读取失败:', error.message);
}

// 检查计算器文件
console.log('\n2. 检查 calculator.js...');
try {
    const fs = require('fs');
    const calcContent = fs.readFileSync('./js/calculator.js', 'utf8');
    
    if (calcContent.includes('class PersonalityCalculator')) {
        console.log('✅ calculator.js 包含PersonalityCalculator类');
    } else {
        console.log('❌ calculator.js 缺少PersonalityCalculator类');
    }
    
    if (calcContent.includes('calculateBigFiveScores') && calcContent.includes('calculateMBTI')) {
        console.log('✅ calculator.js 包含核心计算方法');
    } else {
        console.log('❌ calculator.js 缺少核心计算方法');
    }
    
} catch (error) {
    console.log('❌ calculator.js 读取失败:', error.message);
}

// 检查存储文件
console.log('\n3. 检查 storage.js...');
try {
    const fs = require('fs');
    const storageContent = fs.readFileSync('./js/storage.js', 'utf8');
    
    if (storageContent.includes('class StorageManager')) {
        console.log('✅ storage.js 包含StorageManager类');
    } else {
        console.log('❌ storage.js 缺少StorageManager类');
    }
    
} catch (error) {
    console.log('❌ storage.js 读取失败:', error.message);
}

// 检查主应用文件
console.log('\n4. 检查 app.js...');
try {
    const fs = require('fs');
    const appContent = fs.readFileSync('./js/app.js', 'utf8');
    
    if (appContent.includes('class PersonalityTestApp')) {
        console.log('✅ app.js 包含PersonalityTestApp类');
    } else {
        console.log('❌ app.js 缺少PersonalityTestApp类');
    }
    
    if (appContent.includes('DOMContentLoaded')) {
        console.log('✅ app.js 包含DOM初始化代码');
    } else {
        console.log('❌ app.js 缺少DOM初始化代码');
    }
    
} catch (error) {
    console.log('❌ app.js 读取失败:', error.message);
}

// 检查HTML文件
console.log('\n5. 检查 index.html...');
try {
    const fs = require('fs');
    const htmlContent = fs.readFileSync('./index.html', 'utf8');
    
    if (htmlContent.includes('<script src="js/data.js">') && 
        htmlContent.includes('<script src="js/calculator.js">') &&
        htmlContent.includes('<script src="js/app.js">')) {
        console.log('✅ index.html 正确引用了JavaScript文件');
    } else {
        console.log('❌ index.html 缺少JavaScript文件引用');
    }
    
    if (htmlContent.includes('questions-container') && htmlContent.includes('results-section')) {
        console.log('✅ index.html 包含必要的DOM元素');
    } else {
        console.log('❌ index.html 缺少必要的DOM元素');
    }
    
} catch (error) {
    console.log('❌ index.html 读取失败:', error.message);
}

console.log('\n✅ 基本文件结构检查完成！');
console.log('💡 请在浏览器中打开 index.html 进行完整功能测试');