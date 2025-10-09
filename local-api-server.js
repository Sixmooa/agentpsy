const express = require('express');
const cors = require('cors');
const path = require('path');

// 导入数据
require('./worktrees/supabase-app/static/js/data.js');
const { QUESTIONS_ZH, QUESTIONS_EN, ANSWER_OPTIONS, MBTI_DETAILS, CAREER_SUGGESTIONS, CAREER_SUGGESTIONS_EN } = global;

const app = express();
const PORT = 3001; // 使用不同的端口避免冲突

// 中间件
app.use(cors());
app.use(express.json());

// 日志中间件
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// 转换数据格式以匹配Android期望的格式
function convertQuestionToAndroidFormat(question, language = 'zh') {
    return {
        id: question.id,
        question_text_zh: question.text,
        question_text_en: QUESTIONS_EN.find(q => q.id === question.id)?.text || question.text,
        dimension: question.dimension,
        reverse: false,
        created_at: new Date().toISOString()
    };
}

// 创建API响应格式
function createApiResponse(success, data, error = null) {
    return {
        success,
        data,
        error
    };
}

// 计算大五人格得分
function calculateBigFiveScores(answers, questions) {
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
    
    questions.forEach(question => {
        const answer = answers.find(a => a.questionId === question.id);
        if (answer && answer.score >= 1 && answer.score <= 5) {
            scores[question.dimension] += answer.score;
            counts[question.dimension]++;
        }
    });
    
    // 计算平均分并转换为百分比
    Object.keys(scores).forEach(dimension => {
        if (counts[dimension] > 0) {
            scores[dimension] = Math.round((scores[dimension] / counts[dimension] / 5) * 100);
        }
    });
    
    return scores;
}

// 根据大五人格得分推断MBTI类型
function inferMBTIType(bigFiveScores) {
    // 简化的MBTI推断逻辑
    const e_i = bigFiveScores.extraversion > 50 ? 'E' : 'I';
    const s_n = bigFiveScores.openness > 50 ? 'N' : 'S';
    const t_f = bigFiveScores.agreeableness > 50 ? 'F' : 'T';
    const j_p = bigFiveScores.conscientiousness > 50 ? 'J' : 'P';
    
    return `${e_i}${s_n}${t_f}${j_p}-A`; // 默认添加-A
}

// API路由

// GET /functions/v1/personality-api/questions
app.get('/functions/v1/personality-api/questions', (req, res) => {
    try {
        const { count = 50, language = 'zh' } = req.query;
        const questionsData = language === 'en' ? QUESTIONS_EN : QUESTIONS_ZH;
        
        let selectedQuestions = questionsData;
        
        // 如果指定了数量，随机选择
        if (count && count < questionsData.length) {
            const shuffled = [...questionsData].sort(() => 0.5 - Math.random());
            selectedQuestions = shuffled.slice(0, parseInt(count));
        }
        
        // 转换为Android期望的格式
        const androidQuestions = selectedQuestions.map(q => convertQuestionToAndroidFormat(q, language));
        
        res.json(createApiResponse(true, androidQuestions));
    } catch (error) {
        console.error('Error in /questions:', error);
        res.status(500).json(createApiResponse(false, null, 'Internal server error'));
    }
});

// GET /functions/v1/personality-api/answer-options
app.get('/functions/v1/personality-api/answer-options', (req, res) => {
    try {
        const { language = 'zh' } = req.query;
        const options = ANSWER_OPTIONS[language] || ANSWER_OPTIONS.zh;
        
        res.json(createApiResponse(true, options));
    } catch (error) {
        console.error('Error in /answer-options:', error);
        res.status(500).json(createApiResponse(false, null, 'Internal server error'));
    }
});

// POST /functions/v1/personality-api/submit-test
app.post('/functions/v1/personality-api/submit-test', (req, res) => {
    try {
        const { answers, language = 'zh', saveResult = false } = req.body;
        
        console.log('Received test submission:', { 
            answersCount: answers?.length, 
            language, 
            saveResult 
        });
        
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json(createApiResponse(false, null, 'Invalid answers format'));
        }
        
        // 获取所有问题用于计算
        const allQuestions = language === 'en' ? QUESTIONS_EN : QUESTIONS_ZH;
        
        // 计算大五人格得分
        const bigFiveScores = calculateBigFiveScores(answers, allQuestions);
        
        // 推断MBTI类型
        const mbtiType = inferMBTIType(bigFiveScores);
        
        // 获取MBTI详细信息
        const mbtiTypeInfo = MBTI_DETAILS[mbtiType] || MBTI_DETAILS['INTJ-A'];
        
        // 获取职业建议
        const baseType = mbtiType.split('-')[0]; // 移除-A或-T后缀
        const careerSuggestions = language === 'en' 
            ? (CAREER_SUGGESTIONS_EN[baseType] || [])
            : (CAREER_SUGGESTIONS[baseType] || []);
        
        const careerSuggestionsFormatted = careerSuggestions.map((career, index) => ({
            id: index + 1,
            title: career,
            description: `适合${mbtiTypeInfo.name}类型的职业选择`,
            match_percentage: Math.floor(Math.random() * 20) + 80 // 80-99%的匹配度
        }));
        
        // 构建测试报告
        const report = {
            timestamp: new Date().toISOString(),
            language,
            mbtiType,
            bigFiveScores,
            mbtiTypeInfo,
            careerSuggestions: careerSuggestionsFormatted
        };
        
        // 构建响应
        const response = {
            success: true,
            report,
            saveResult: false // 本地测试不保存
        };
        
        console.log('Test submission successful:', {
            mbtiType,
            bigFiveScores,
            careerSuggestionsCount: careerSuggestionsFormatted.length
        });
        
        res.json(response);
    } catch (error) {
        console.error('Error in /submit-test:', error);
        res.status(500).json(createApiResponse(false, null, 'Internal server error'));
    }
});

// GET /functions/v1/personality-api/mbti-type/:typeCode
app.get('/functions/v1/personality-api/mbti-type/:typeCode', (req, res) => {
    try {
        const { typeCode } = req.params;
        const { language = 'zh' } = req.query;
        
        const mbtiInfo = MBTI_DETAILS[typeCode];
        if (!mbtiInfo) {
            return res.status(404).json(createApiResponse(false, null, 'MBTI type not found'));
        }
        
        res.json(createApiResponse(true, mbtiInfo));
    } catch (error) {
        console.error('Error in /mbti-type:', error);
        res.status(500).json(createApiResponse(false, null, 'Internal server error'));
    }
});

// GET /functions/v1/personality-api/career-suggestions
app.get('/functions/v1/personality-api/career-suggestions', (req, res) => {
    try {
        const { mbti_type, language = 'zh' } = req.query;
        
        if (!mbti_type) {
            return res.status(400).json(createApiResponse(false, null, 'MBTI type is required'));
        }
        
        const baseType = mbti_type.split('-')[0];
        const suggestions = language === 'en' 
            ? (CAREER_SUGGESTIONS_EN[baseType] || [])
            : (CAREER_SUGGESTIONS[baseType] || []);
        
        const formattedSuggestions = suggestions.map((career, index) => ({
            id: index + 1,
            title: career,
            description: `适合${baseType}类型的职业选择`,
            match_percentage: Math.floor(Math.random() * 20) + 80
        }));
        
        res.json(createApiResponse(true, formattedSuggestions));
    } catch (error) {
        console.error('Error in /career-suggestions:', error);
        res.status(500).json(createApiResponse(false, null, 'Internal server error'));
    }
});

// 健康检查端点
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 本地API服务器启动成功！`);
    console.log(`📍 服务地址: http://localhost:${PORT}`);
    console.log(`🔗 API端点:`);
    console.log(`   - GET  /functions/v1/personality-api/questions`);
    console.log(`   - GET  /functions/v1/personality-api/answer-options`);
    console.log(`   - POST /functions/v1/personality-api/submit-test`);
    console.log(`   - GET  /functions/v1/personality-api/mbti-type/:typeCode`);
    console.log(`   - GET  /functions/v1/personality-api/career-suggestions`);
    console.log(`   - GET  /health`);
    console.log(`\n💡 现在可以修改Android应用配置指向此服务器`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭服务器...');
    process.exit(0);
});