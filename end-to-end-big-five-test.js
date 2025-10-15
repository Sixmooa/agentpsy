/**
 * 端到端大五人格分数验证测试
 * 验证Android提交答案后，Supabase云端返回和前端显示的完整性
 */

console.log('🔬 开始端到端大五人格分数验证测试\n');

// 模拟Supabase API响应（基于personality-api-final.ts的实际逻辑）
function simulateSupabaseAPIResponse(answers) {
    console.log('📤 模拟Android端提交的答案:', answers);

    // 模拟问题数据（每个维度5个问题）
    const questions = [];
    for (let i = 1; i <= 25; i++) {
        let dimension;
        if (i <= 5) dimension = 'openness';
        else if (i <= 10) dimension = 'conscientiousness';
        else if (i <= 15) dimension = 'extraversion';
        else if (i <= 20) dimension = 'agreeableness';
        else dimension = 'neuroticism';

        questions.push({ id: i, dimension: dimension });
    }

    // Supabase算法计算大五分数（1-5平均分）
    const scores = {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0
    };

    const counts = {
        openness: 0,
        conscientiousness: 0,
        extraversion: 0,
        agreeableness: 0,
        neuroticism: 0
    };

    // 计算各维度总分
    for (const [questionId, answer] of Object.entries(answers)) {
        const question = questions.find(q => q.id === parseInt(questionId));
        if (question && question.dimension) {
            scores[question.dimension] += parseInt(answer);
            counts[question.dimension]++;
        }
    }

    // 计算平均分，保留两位小数（Supabase实际逻辑）
    const bigFiveScores = {};
    for (const dimension in scores) {
        if (counts[dimension] > 0) {
            bigFiveScores[dimension] = Math.round((scores[dimension] / counts[dimension]) * 100) / 100;
        } else {
            bigFiveScores[dimension] = 0;
        }
    }

    // 计算MBTI类型
    const midPoint = 3.0;
    const ei = bigFiveScores.extraversion > midPoint ? 'E' : 'I';
    const sn = bigFiveScores.openness >= midPoint ? 'N' : 'S';
    const tf = bigFiveScores.agreeableness > midPoint ? 'F' : 'T';
    const jp = bigFiveScores.conscientiousness >= midPoint ? 'J' : 'P';
    const suffix = bigFiveScores.neuroticism > midPoint ? '-T' : '-A';
    const mbtiType = ei + sn + tf + jp + suffix;

    // 返回Supabase API响应格式
    return {
        success: true,
        report: {
            timestamp: new Date().toISOString(),
            language: 'zh',
            mbtiType: mbtiType,
            bigFiveScores: bigFiveScores,
            mbtiResult: {
                type: mbtiType,
                typeCode: ei + sn + tf + jp,
                dimensions: {
                    ei: { type: ei, score: bigFiveScores.extraversion },
                    sn: { type: sn, score: bigFiveScores.openness },
                    tf: { type: tf, score: bigFiveScores.agreeableness },
                    jp: { type: jp, score: bigFiveScores.conscientiousness },
                    suffix: { type: suffix, score: bigFiveScores.neuroticism }
                }
            },
            careerSuggestions: [],
            progress: {
                completed: true,
                percentage: 100,
                answeredQuestions: Object.keys(answers).length,
                totalQuestions: questions.length
            }
        }
    };
}

// 模拟Android前端UI显示逻辑（基于ResultScreen.kt的实际逻辑）
function simulateAndroidUIDisplay(bigFiveScores) {
    console.log('📱 模拟Android前端UI显示逻辑');

    const uiDisplay = {};

    for (const [dimension, score] of Object.entries(bigFiveScores)) {
        // 这里是关键问题：前端直接使用1-5的分数作为百分比显示
        const problematicDisplay = String.format("%.0f%%", score);
        uiDisplay[dimension] = problematicDisplay;

        console.log(`  ${dimension}: Supabase返回=${score}, UI显示="${problematicDisplay}"`);
    }

    return uiDisplay;
}

// 正确的UI显示逻辑（应该是将1-5转换为0-100%）
function correctUIDisplayLogic(bigFiveScores) {
    console.log('✅ 正确的UI显示逻辑应该是：');

    const correctDisplay = {};

    for (const [dimension, score] of Object.entries(bigFiveScores)) {
        // 将1-5范围转换为0-100百分比
        const percentage = ((score - 1) / 4) * 100;
        const correctDisplayText = String.format("%.0f%%", percentage);
        correctDisplay[dimension] = correctDisplayText;

        console.log(`  ${dimension}: Supabase返回=${score}, 应该显示="${correctDisplayText}" (${percentage.toFixed(1)}%)`);
    }

    return correctDisplay;
}

// 测试用例1：中等分数测试
console.log('📋 测试用例1：中等分数测试');
const mediumAnswers = {};
for (let i = 1; i <= 25; i++) {
    mediumAnswers[i] = '3'; // 所有题目都选3（中间值）
}

const response1 = simulateSupabaseAPIResponse(mediumAnswers);
console.log('Supabase返回的大五分数:', response1.report.bigFiveScores);

const currentUIDisplay1 = simulateAndroidUIDisplay(response1.report.bigFiveScores);
const correctUIDisplay1 = correctUIDisplayLogic(response1.report.bigFiveScores);

console.log('\n❌ 问题发现：');
console.log('  当前UI显示:', currentUIDisplay1);
console.log('  正确应该显示:', correctUIDisplay1);
console.log('  是否一致:', JSON.stringify(currentUIDisplay1) === JSON.stringify(correctUIDisplay1) ? '✅' : '❌');

// 测试用例2：高分测试
console.log('\n📋 测试用例2：高分测试');
const highAnswers = {};
for (let i = 1; i <= 25; i++) {
    highAnswers[i] = i <= 12 ? '5' : '4'; // 前半部分选5，后半部分选4
}

const response2 = simulateSupabaseAPIResponse(highAnswers);
console.log('Supabase返回的大五分数:', response2.report.bigFiveScores);

const currentUIDisplay2 = simulateAndroidUIDisplay(response2.report.bigFiveScores);
const correctUIDisplay2 = correctUIDisplayLogic(response2.report.bigFiveScores);

console.log('\n❌ 问题发现：');
console.log('  当前UI显示:', currentUIDisplay2);
console.log('  正确应该显示:', correctUIDisplay2);
console.log('  是否一致:', JSON.stringify(currentUIDisplay2) === JSON.stringify(correctUIDisplay2) ? '✅' : '❌');

// 测试用例3：低分测试
console.log('\n📋 测试用例3：低分测试');
const lowAnswers = {};
for (let i = 1; i <= 25; i++) {
    lowAnswers[i] = i <= 12 ? '1' : '2'; // 前半部分选1，后半部分选2
}

const response3 = simulateSupabaseAPIResponse(lowAnswers);
console.log('Supabase返回的大五分数:', response3.report.bigFiveScores);

const currentUIDisplay3 = simulateAndroidUIDisplay(response3.report.bigFiveScores);
const correctUIDisplay3 = correctUIDisplayLogic(response3.report.bigFiveScores);

console.log('\n❌ 问题发现：');
console.log('  当前UI显示:', currentUIDisplay3);
console.log('  正确应该显示:', correctUIDisplay3);
console.log('  是否一致:', JSON.stringify(currentUIDisplay3) === JSON.stringify(correctUIDisplay3) ? '✅' : '❌');

// 总结报告
console.log('\n📊 测试总结报告');
console.log('=====================================');
console.log('🔍 发现的关键问题：');
console.log('1. Supabase云端返回的大五人格分数是1-5范围的原始平均分');
console.log('2. Android前端UI错误地将1-5分数直接当作百分比显示');
console.log('3. 例如：Supabase返回3.2，前端显示"3%"（应该是55%）');
console.log('');
console.log('🔧 修复方案：');
console.log('在ResultScreen.kt的EnhancedScoreItem函数中，需要将1-5范围的分数转换为0-100%的百分比');
console.log('');
console.log('转换公式：percentage = ((score - 1) / 4) * 100');
console.log('');
console.log('具体修改：');
console.log('// 错误的当前代码（第539行）');
console.log('String.format("%.0f%%", score)');
console.log('');
console.log('// 正确的修复代码');
console.log('val percentage = ((score - 1) / 4.0) * 100');
console.log('String.format("%.0f%%", percentage)');
console.log('');
console.log('📋 影响范围：');
console.log('- 所有五个维度的分数显示都有问题');
console.log('- 用户体验受到严重影响');
console.log('- 需要立即修复');
console.log('');
console.log('✅ 验证完成：发现问题，需要修复前端UI显示逻辑');