// Node.js环境下的快速功能测试
const fs = require('fs');
const path = require('path');

// 模拟浏览器环境
global.window = {};
global.document = {
    getElementById: () => ({ 
        getContext: () => ({
            clearRect: () => {},
            fillRect: () => {},
            fillText: () => {},
            measureText: () => ({ width: 100 }),
            createLinearGradient: () => ({ addColorStop: () => {} }),
            beginPath: () => {},
            moveTo: () => {},
            lineTo: () => {},
            quadraticCurveTo: () => {},
            closePath: () => {},
            fill: () => {},
            getImageData: () => ({ data: new Array(400).fill(0) })
        }),
        width: 800,
        height: 1200,
        toDataURL: () => 'data:image/png;base64,test'
    })
};
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};
global.crypto = {
    randomUUID: () => 'test-uuid-' + Date.now()
};

console.log('🚀 开始Node.js环境功能测试...\n');

try {
    // 加载数据模块
    eval(fs.readFileSync(path.join(__dirname, 'js/data.js'), 'utf8'));
    console.log('✅ 数据模块加载成功');
    
    // 验证数据完整性
    if (global.QUESTIONS_ZH && global.QUESTIONS_ZH.length === 50) {
        console.log('✅ 中文问题数据完整 (50题)');
    } else {
        console.log('❌ 中文问题数据不完整');
    }
    
    if (global.QUESTIONS_EN && global.QUESTIONS_EN.length === 50) {
        console.log('✅ 英文问题数据完整 (50题)');
    } else {
        console.log('❌ 英文问题数据不完整');
    }
    
    if (global.BELBIN_ROLES && Object.keys(global.BELBIN_ROLES).length === 9) {
        console.log('✅ 贝尔宾角色数据完整 (9种角色)');
    } else {
        console.log('❌ 贝尔宾角色数据不完整');
    }
    
    const mbtiCount = global.MBTI_DETAILS ? Object.keys(global.MBTI_DETAILS).length : 0;
    console.log(`✅ MBTI详情数据: ${mbtiCount}种类型`);
    
} catch (error) {
    console.log('❌ 数据模块加载失败:', error.message);
}

try {
    // 加载计算器模块
    eval(fs.readFileSync(path.join(__dirname, 'js/calculator.js'), 'utf8'));
    console.log('✅ 计算器模块加载成功');
    
    // 测试计算器功能
    const calculator = new global.PersonalityCalculator();
    console.log('✅ PersonalityCalculator实例化成功');
    
    // 生成测试答案
    const testAnswers = {};
    global.QUESTIONS_ZH.forEach(q => {
        testAnswers[q.id] = Math.floor(Math.random() * 5) + 1;
    });
    
    // 测试大五人格计算
    const scores = calculator.calculateBigFiveScores(testAnswers, global.QUESTIONS_ZH);
    console.log('✅ 大五人格得分计算成功:', Object.keys(scores).map(k => `${k}:${scores[k].toFixed(1)}`).join(', '));
    
    // 测试MBTI计算
    const mbtiResult = calculator.calculateMBTI(scores);
    console.log('✅ MBTI类型计算成功:', mbtiResult.type, '-', mbtiResult.name);
    
    // 测试贝尔宾角色获取
    const belbinRoles = calculator.getBelbinRoles(mbtiResult.typeCode);
    console.log('✅ 贝尔宾角色获取成功:', belbinRoles.map(r => r.name).join(', '));
    
    // 测试完整报告生成
    const report = calculator.generateReport(testAnswers, global.QUESTIONS_ZH, 'zh');
    console.log('✅ 完整报告生成成功');
    
} catch (error) {
    console.log('❌ 计算器模块测试失败:', error.message);
}

try {
    // 加载存储模块
    eval(fs.readFileSync(path.join(__dirname, 'js/storage.js'), 'utf8'));
    console.log('✅ 存储模块加载成功');
    
    // 测试存储管理器
    const storage = new global.StorageManager();
    console.log('✅ StorageManager实例化成功');
    
    const settings = storage.getDefaultSettings();
    console.log('✅ 默认设置获取成功:', JSON.stringify(settings));
    
} catch (error) {
    console.log('❌ 存储模块测试失败:', error.message);
}

try {
    // 加载图片生成模块
    eval(fs.readFileSync(path.join(__dirname, 'js/imageGenerator.js'), 'utf8'));
    console.log('✅ 图片生成模块加载成功');
    
    // 注意：在Node.js环境下无法完全测试Canvas功能
    console.log('ℹ️  图片生成功能需要浏览器环境测试');
    
} catch (error) {
    console.log('❌ 图片生成模块测试失败:', error.message);
}

console.log('\n🎉 Node.js环境测试完成！');
console.log('💡 建议在浏览器中访问 quick-test.html 进行完整测试');