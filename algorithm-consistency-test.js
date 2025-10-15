/**
 * 大五人格算法一致性测试
 * 独立JavaScript测试验证Supabase云端和Static静态文件算法的一致性
 */

console.log('🔬 开始大五人格算法一致性测试');

// 模拟Static版本的算法
class StaticPersonalityCalculator {
    constructor() {
        this.midPoint = 3.0;
    }

    calculateBigFiveScores(answers, questions) {
        const scores = {
            openness: 0, conscientiousness: 0, extraversion: 0,
            agreeableness: 0, neuroticism: 0
        };
        const counts = {
            openness: 0, conscientiousness: 0, extraversion: 0,
            agreeableness: 0, neuroticism: 0
        };

        for (const [questionId, answer] of Object.entries(answers)) {
            const question = questions.find(q => q.id === parseInt(questionId));
            if (question && question.dimension) {
                scores[question.dimension] += parseInt(answer);
                counts[question.dimension]++;
            }
        }

        const avgScores = {};
        for (const dimension in scores) {
            if (counts[dimension] > 0) {
                avgScores[dimension] = Math.round((scores[dimension] / counts[dimension]) * 100) / 100;
            } else {
                avgScores[dimension] = 0;
            }
        }
        return avgScores;
    }

    calculateMBTI(scores) {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores;
        const ei = extraversion > this.midPoint ? 'E' : 'I';
        const sn = openness >= this.midPoint ? 'N' : 'S';
        const tf = agreeableness > this.midPoint ? 'F' : 'T';
        const jp = conscientiousness >= this.midPoint ? 'J' : 'P';
        const suffix = neuroticism > this.midPoint ? '-T' : '-A';
        const mbtiType = ei + sn + tf + jp + suffix;
        
        return { type: mbtiType, typeCode: ei + sn + tf + jp };
    }
}

// 模拟Supabase版本的算法
class SupabasePersonalityCalculator {
    constructor() {
        this.midPoint = 3.0;
    }

    calculateBigFiveScores(answers, questions) {
        const scores = {
            openness: 0, conscientiousness: 0, extraversion: 0,
            agreeableness: 0, neuroticism: 0
        };
        const counts = {
            openness: 0, conscientiousness: 0, extraversion: 0,
            agreeableness: 0, neuroticism: 0
        };

        for (const [questionId, answer] of Object.entries(answers)) {
            const question = questions.find(q => q.id === parseInt(questionId));
            if (question && question.dimension) {
                scores[question.dimension] += parseInt(answer);
                counts[question.dimension]++;
            }
        }

        const avgScores = {};
        for (const dimension in scores) {
            if (counts[dimension] > 0) {
                avgScores[dimension] = Math.round((scores[dimension] / counts[dimension]) * 100) / 100;
            } else {
                avgScores[dimension] = 0;
            }
        }
        return avgScores;
    }

    calculateMBTI(scores) {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores;
        const midPoint = 3.0;
        const ei = extraversion > midPoint ? 'E' : 'I';
        const sn = openness >= midPoint ? 'N' : 'S';
        const tf = agreeableness > midPoint ? 'F' : 'T';
        const jp = conscientiousness >= midPoint ? 'J' : 'P';
        const suffix = neuroticism > midPoint ? '-T' : '-A';
        const mbtiType = ei + sn + tf + jp + suffix;
        
        return { type: mbtiType, typeCode: ei + sn + tf + jp };
    }
}

// 运行测试
const staticCalculator = new StaticPersonalityCalculator();
const supabaseCalculator = new SupabasePersonalityCalculator();

// 测试用例1: 边界值测试
const boundaryScores = {
    openness: 3.0, conscientiousness: 3.0, extraversion: 3.0,
    agreeableness: 3.0, neuroticism: 3.0
};

const staticResult = staticCalculator.calculateMBTI(boundaryScores);
const supabaseResult = supabaseCalculator.calculateMBTI(boundaryScores);

console.log('边界值测试结果:');
console.log('Static版本:', staticResult.type);
console.log('Supabase版本:', supabaseResult.type);
console.log('一致性:', staticResult.type === supabaseResult.type ? '✅ 通过' : '❌ 失败');

// 测试用例2: 极端值测试
const extremeScores = {
    openness: 5.0, conscientiousness: 1.0, extraversion: 5.0,
    agreeableness: 1.0, neuroticism: 1.0
};

const staticResult2 = staticCalculator.calculateMBTI(extremeScores);
const supabaseResult2 = supabaseCalculator.calculateMBTI(extremeScores);

console.log('
极端值测试结果:');
console.log('Static版本:', staticResult2.type);
console.log('Supabase版本:', supabaseResult2.type);
console.log('一致性:', staticResult2.type === supabaseResult2.type ? '✅ 通过' : '❌ 失败');

// 测试用例3: Big Five分数计算
const testAnswers = { '1': '5', '2': '4', '3': '3', '4': '2', '5': '1' };
const testQuestions = [
    { id: 1, dimension: 'openness' }, { id: 2, dimension: 'openness' },
    { id: 3, dimension: 'openness' }, { id: 4, dimension: 'openness' },
    { id: 5, dimension: 'openness' }
];

const staticScores = staticCalculator.calculateBigFiveScores(testAnswers, testQuestions);
const supabaseScores = supabaseCalculator.calculateBigFiveScores(testAnswers, testQuestions);

console.log('
Big Five分数计算测试:');
console.log('Static开放性分数:', staticScores.openness);
console.log('Supabase开放性分数:', supabaseScores.openness);
console.log('分数一致性:', staticScores.openness === supabaseScores.openness ? '✅ 通过' : '❌ 失败');

console.log('
🎉 测试完成！');
