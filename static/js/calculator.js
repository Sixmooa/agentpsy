/**
 * 人格计算器模块
 * 包含大五人格到MBTI转换算法和贝尔宾角色映射
 */

class PersonalityCalculator {
    constructor() {
        this.midPoint = 3.0;
    }

    /**
     * 计算大五人格得分
     * @param {Object} answers - 用户答案 {questionId: answer}
     * @param {Array} questions - 问题列表
     * @returns {Object} 五个维度的得分
     */
    calculateBigFiveScores(answers, questions) {
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

        // 计算平均分
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

    /**
     * 根据大五人格得分计算MBTI类型（高级版本）
     * @param {Object} scores - 大五人格得分
     * @returns {Object} MBTI分析结果
     */
    calculateMBTI(scores) {
        const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores;

        // E/I (外向/内向) - 基于外向性得分
        const ei = extraversion > this.midPoint ? 'E' : 'I';
        
        // S/N (感觉/直觉) - 基于开放性得分
        const sn = openness >= this.midPoint ? 'N' : 'S';
        
        // T/F (思考/情感) - 基于宜人性得分
        const tf = agreeableness > this.midPoint ? 'F' : 'T';
        
        // J/P (判断/知觉) - 基于尽责性得分
        const jp = conscientiousness >= this.midPoint ? 'J' : 'P';
        
        // 情绪稳定性后缀 -A/-T
        const suffix = neuroticism > this.midPoint ? '-T' : '-A';
        
        const mbtiType = ei + sn + tf + jp + suffix;
        
        // 获取类型详细信息
        const typeInfo = MBTI_DETAILS[mbtiType] || {
            name: '未知类型',
            nameEn: 'Unknown Type',
            description: '基于您的大五人格得分计算得出的MBTI类型',
            descriptionEn: 'MBTI type calculated based on your Big Five personality scores',
            strengths: [],
            strengthsEn: [],
            challenges: [],
            challengesEn: []
        };

        return {
            type: mbtiType,
            typeCode: ei + sn + tf + jp,
            name: typeInfo.name,
            nameEn: typeInfo.nameEn,
            description: typeInfo.description,
            descriptionEn: typeInfo.descriptionEn,
            strengths: typeInfo.strengths,
            strengthsEn: typeInfo.strengthsEn,
            challenges: typeInfo.challenges,
            challengesEn: typeInfo.challengesEn,
            dimensions: {
                ei: { type: ei, score: extraversion },
                sn: { type: sn, score: openness },
                tf: { type: tf, score: agreeableness },
                jp: { type: jp, score: conscientiousness },
                suffix: { type: suffix, score: neuroticism }
            }
        };
    }

    /**
     * 根据MBTI类型映射贝尔宾角色
     * @param {string} mbtiType - MBTI类型代码（不含后缀）
     * @returns {Array} 贝尔宾角色列表
     */
    getBelbinRoles(mbtiType) {
        const roleMapping = {
            'INTJ': ['Monitor_Evaluator', 'Plant', 'Specialist'],
            'INTP': ['Plant', 'Monitor_Evaluator', 'Specialist'],
            'ENTJ': ['Shaper', 'Coordinator', 'Monitor_Evaluator'],
            'ENTP': ['Resource_Investigator', 'Plant', 'Shaper'],
            'INFJ': ['Plant', 'Coordinator', 'Completer_Finisher'],
            'INFP': ['Plant', 'Teamworker', 'Resource_Investigator'],
            'ENFJ': ['Coordinator', 'Resource_Investigator', 'Teamworker'],
            'ENFP': ['Resource_Investigator', 'Plant', 'Teamworker'],
            'ISTJ': ['Implementer', 'Completer_Finisher', 'Monitor_Evaluator'],
            'ISFJ': ['Teamworker', 'Implementer', 'Completer_Finisher'],
            'ESTJ': ['Coordinator', 'Implementer', 'Shaper'],
            'ESFJ': ['Coordinator', 'Teamworker', 'Resource_Investigator'],
            'ISTP': ['Specialist', 'Implementer', 'Monitor_Evaluator'],
            'ISFP': ['Teamworker', 'Plant', 'Specialist'],
            'ESTP': ['Shaper', 'Resource_Investigator', 'Implementer'],
            'ESFP': ['Resource_Investigator', 'Teamworker', 'Shaper']
        };

        const roleKeys = roleMapping[mbtiType] || ['Plant', 'Teamworker', 'Implementer'];
        
        return roleKeys.map(key => ({
            key: key,
            name: BELBIN_ROLES[key].name,
            nameEn: BELBIN_ROLES[key].nameEn,
            description: BELBIN_ROLES[key].description,
            descriptionEn: BELBIN_ROLES[key].descriptionEn,
            characteristics: BELBIN_ROLES[key].characteristics,
            characteristicsEn: BELBIN_ROLES[key].characteristicsEn,
            contribution: BELBIN_ROLES[key].contribution,
            contributionEn: BELBIN_ROLES[key].contributionEn,
            allowable_weaknesses: BELBIN_ROLES[key].allowable_weaknesses,
            allowable_weaknessesEn: BELBIN_ROLES[key].allowable_weaknessesEn
        }));
    }

    /**
     * 获取职业建议
     * @param {string} mbtiType - MBTI类型代码（不含后缀）
     * @param {string} language - 语言 ('zh' 或 'en')
     * @returns {Array} 职业建议列表
     */
    getCareerSuggestions(mbtiType, language = 'zh') {
        const suggestions = language === 'en' ? CAREER_SUGGESTIONS_EN : CAREER_SUGGESTIONS;
        return suggestions[mbtiType] || [];
    }

    /**
     * 生成完整的人格分析报告
     * @param {Object} answers - 用户答案
     * @param {Array} questions - 问题列表
     * @param {string} language - 语言
     * @returns {Object} 完整的分析报告
     */
    generateReport(answers, questions, language = 'zh') {
        // 计算大五人格得分
        const bigFiveScores = this.calculateBigFiveScores(answers, questions);
        
        // 计算MBTI类型
        const mbtiResult = this.calculateMBTI(bigFiveScores);
        
        // 获取贝尔宾角色
        const belbinRoles = this.getBelbinRoles(mbtiResult.typeCode);
        
        // 获取职业建议
        const careerSuggestions = this.getCareerSuggestions(mbtiResult.typeCode, language);
        
        return {
            bigFiveScores,
            mbtiResult,
            belbinRoles,
            careerSuggestions,
            timestamp: new Date().toISOString(),
            language
        };
    }

    /**
     * 验证答案完整性
     * @param {Object} answers - 用户答案
     * @param {Array} questions - 问题列表
     * @returns {boolean} 是否完整
     */
    validateAnswers(answers, questions) {
        if (!answers || typeof answers !== 'object') {
            return false;
        }

        for (const question of questions) {
            if (!answers.hasOwnProperty(question.id) || !answers[question.id]) {
                return false;
            }
            
            const answer = parseInt(answers[question.id]);
            if (isNaN(answer) || answer < 1 || answer > 5) {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取测试进度
     * @param {Object} answers - 用户答案
     * @param {Array} questions - 问题列表
     * @returns {Object} 进度信息
     */
    getProgress(answers, questions) {
        const totalQuestions = questions.length;
        const answeredQuestions = Object.keys(answers || {}).length;
        const percentage = Math.round((answeredQuestions / totalQuestions) * 100);
        
        return {
            answered: answeredQuestions,
            total: totalQuestions,
            percentage,
            isComplete: answeredQuestions === totalQuestions
        };
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.PersonalityCalculator = PersonalityCalculator;
} else if (typeof global !== 'undefined') {
    global.PersonalityCalculator = PersonalityCalculator;
}