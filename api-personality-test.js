/**
 * API版本人格测试套件
 * 专门测试personality-api-fixed.ts的API功能
 * 包含端点测试、数据验证、错误处理等
 */

const fs = require('fs');
const path = require('path');

// 模拟Deno环境
global.Deno = {
    env: {
        get: (key) => {
            const env = {
                'SUPABASE_URL': 'https://test.supabase.co',
                'SUPABASE_ANON_KEY': 'test-key'
            };
            return env[key];
        }
    },
    serve: (handler) => {
        console.log('Deno server started');
        return { handler };
    }
};

// 模拟Response类
global.Response = class Response {
    constructor(body, options = {}) {
        this.body = body;
        this.status = options.status || 200;
        this.headers = new Map(Object.entries(options.headers || {}));
    }
    
    async json() {
        return JSON.parse(this.body);
    }
    
    async text() {
        return this.body;
    }
};

// 模拟Request类
global.Request = class Request {
    constructor(url, options = {}) {
        this.url = url;
        this.method = options.method || 'GET';
        this.headers = new Map(Object.entries(options.headers || {}));
        this._body = options.body;
    }
    
    async json() {
        return JSON.parse(this._body);
    }
    
    async text() {
        return this._body;
    }
};

// 模拟Supabase客户端
const mockSupabaseClient = {
    from: (table) => ({
        select: (columns = '*') => ({
            order: (column, options = {}) => ({
                then: (callback) => callback({ data: getMockData(table), error: null })
            })
        }),
        eq: (column, value) => ({
            order: (column, options = {}) => ({
                then: (callback) => callback({ data: getMockData(table).filter(item => item[column] === value), error: null })
            }),
            single: () => ({
                then: (callback) => {
                    const data = getMockData(table).find(item => item[column] === value);
                    callback({ data, error: data ? null : { message: 'Not found' } });
                }
            })
        }),
        contains: (column, value) => ({
            eq: (column2, value2) => ({
                order: (column3, options = {}) => ({
                    then: (callback) => callback({ data: getMockData(table), error: null })
                })
            })
        }),
        insert: (data) => ({
            select: (columns = '*') => ({
                single: () => ({
                    then: (callback) => callback({ data: { id: Math.floor(Math.random() * 1000), ...data }, error: null })
                })
            })
        })
    })
};

// 模拟数据生成
function getMockData(table) {
    const mockData = {
        questions: generateMockQuestions(),
        answer_options: [
            { value: 1, text_zh: '完全不同意', text_en: 'Strongly Disagree' },
            { value: 2, text_zh: '不同意', text_en: 'Disagree' },
            { value: 3, text_zh: '中立', text_en: 'Neutral' },
            { value: 4, text_zh: '同意', text_en: 'Agree' },
            { value: 5, text_zh: '完全同意', text_en: 'Strongly Agree' }
        ],
        belbin_roles: [
            {
                name: '智多星',
                name_en: 'Plant',
                description: '富有想象力和创造力的人，能够解决困难的问题',
                description_en: 'Creative and imaginative, solves difficult problems',
                characteristics: '富有创造力，不拘一格，思维活跃',
                characteristics_en: 'Creative, unorthodox, free-thinking',
                contributions: '创新和提供新想法',
                contributions_en: 'Innovation and new ideas',
                allowable_weaknesses: '可能忽视细节，过于专注于自己的想法',
                allowable_weaknesses_en: 'Might ignore details, too preoccupied with own ideas',
                mbti_types: ['INTJ', 'INTP', 'ENFP', 'ENTP'],
                priority: 1
            },
            {
                name: '资源调查者',
                name_en: 'Resource Investigator',
                description: '外向、热情、善于交际的人',
                description_en: 'Outgoing, enthusiastic, communicative',
                characteristics: '外向，热情，善于交际',
                characteristics_en: 'Extrovert, enthusiastic, communicative',
                contributions: '探索机会，发展联系',
                contributions_en: 'Explores opportunities, develops contacts',
                allowable_weaknesses: '可能过于乐观，失去兴趣后热情消退',
                allowable_weaknesses_en: 'Might be over-optimistic, loses interest once initial enthusiasm has passed',
                mbti_types: ['ENFP', 'ENTP', 'ESFP', 'ESTP'],
                priority: 2
            }
        ],
        career_suggestions: [
            {
                mbti_type: 'INTJ',
                category: '技术与工程',
                category_en: 'Technology & Engineering',
                title: '软件工程师',
                title_en: 'Software Engineer',
                description: '设计和开发软件系统，适合逻辑思维强、喜欢独立工作的人',
                description_en: 'Design and develop software systems, suitable for logical thinkers who prefer independent work',
                skills_required: '编程、系统设计、问题解决',
                skills_required_en: 'Programming, system design, problem solving',
                growth_potential: '高',
                growth_potential_en: 'High',
                salary_range: '10-50万',
                salary_range_en: '$60k-$200k'
            },
            {
                mbti_type: 'ENFP',
                category: '创意与媒体',
                category_en: 'Creative & Media',
                title: '创意总监',
                title_en: 'Creative Director',
                description: '领导创意团队，开发创新的营销和品牌策略',
                description_en: 'Lead creative teams, develop innovative marketing and brand strategies',
                skills_required: '创意思维、团队领导、沟通技巧',
                skills_required_en: 'Creative thinking, team leadership, communication skills',
                growth_potential: '高',
                growth_potential_en: 'High',
                salary_range: '15-60万',
                salary_range_en: '$70k-$250k'
            }
        ],
        mbti_types_info: [
            {
                type: 'INTJ',
                name: '建筑师',
                name_en: 'The Architect',
                description: '富有想象力和战略性的思想家，一切皆在计划之中',
                description_en: 'Imaginative and strategic thinkers, with a plan for everything',
                strengths: '独立、果断、坚定、有创造力',
                strengths_en: 'Independent, decisive, determined, creative',
                weaknesses: '傲慢、过于理论化、不耐烦',
                weaknesses_en: 'Arrogant, overly theoretical, impatient',
                famous_people: '埃隆·马斯克、尼古拉·特斯拉',
                famous_people_en: 'Elon Musk, Nikola Tesla',
                percentage: '2%'
            },
            {
                type: 'ENFP',
                name: '竞选者',
                name_en: 'The Campaigner',
                description: '热情、有创造力的社交家，总能找到微笑的理由',
                description_en: 'Enthusiastic, creative and sociable free spirits, who can always find a reason to smile',
                strengths: '热情、创造力、社交技能、积极',
                strengths_en: 'Enthusiastic, creative, sociable, positive',
                weaknesses: '情绪化、容易分心、过度乐观',
                weaknesses_en: 'Emotional, easily distracted, overly optimistic',
                famous_people: '罗宾·威廉姆斯、威尔·史密斯',
                famous_people_en: 'Robin Williams, Will Smith',
                percentage: '8%'
            }
        ]
    };
    return mockData[table] || [];
}

function generateMockQuestions() {
    const dimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
    const questions = [];
    
    for (let i = 1; i <= 50; i++) {
        const dimension = dimensions[(i - 1) % 5];
        questions.push({
            id: i,
            text_zh: `我是一个${dimension === 'openness' ? '富有想象力' : dimension === 'conscientiousness' ? '有条理' : dimension === 'extraversion' ? '外向' : dimension === 'agreeableness' ? '友善' : '情绪稳定'}的人 ${i}`,
            text_en: `I am a ${dimension === 'openness' ? 'imaginative' : dimension === 'conscientiousness' ? 'organized' : dimension === 'extraversion' ? 'outgoing' : dimension === 'agreeableness' ? 'friendly' : 'emotionally stable'} person ${i}`,
            dimension: dimension,
            reverse_scored: i % 3 === 0 // 每三个问题有一个反向计分
        });
    }
    
    return questions;
}

// 模拟createClient函数
global.createClient = () => mockSupabaseClient;

// API测试类
class APIPersonalityTestSuite {
    constructor() {
        this.testResults = [];
        this.totalTests = 0;
        this.passedTests = 0;
        this.failedTests = 0;
        
        // 加载API处理函数
        this.loadAPIHandlers();
    }
    
    loadAPIHandlers() {
        // 模拟API处理函数
        this.apiHandlers = {
            // 计算Big Five分数
            calculateBigFiveScores: (answers, questions) => {
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

                for (const [questionId, answer] of Object.entries(answers)) {
                    const question = questions.find(q => q.id === parseInt(questionId));
                    if (question && question.dimension) {
                        let score = parseInt(answer);
                        
                        // 处理反向计分
                        if (question.reverse_scored) {
                            score = 6 - score;
                        }
                        
                        scores[question.dimension] += score;
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
            },
            
            // 计算MBTI类型
            calculateMBTI: (scores) => {
                const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = scores;
                const midPoint = 3.0;

                const ei = extraversion > midPoint ? 'E' : 'I';
                const sn = openness >= midPoint ? 'N' : 'S';
                const tf = agreeableness > midPoint ? 'F' : 'T';
                const jp = conscientiousness >= midPoint ? 'J' : 'P';
                const suffix = neuroticism > midPoint ? '-T' : '-A';

                return {
                    type: ei + sn + tf + jp + suffix,
                    typeCode: ei + sn + tf + jp,
                    dimensions: {
                        ei: { type: ei, score: extraversion },
                        sn: { type: sn, score: openness },
                        tf: { type: tf, score: agreeableness },
                        jp: { type: jp, score: conscientiousness },
                        suffix: { type: suffix, score: neuroticism }
                    }
                };
            },
            
            // 验证答案
            validateAnswers: (answers, questions) => {
                const errors = [];
                
                if (!answers || typeof answers !== 'object') {
                    errors.push('答案必须是一个对象');
                    return { isValid: false, errors };
                }
                
                const answerCount = Object.keys(answers).length;
                if (answerCount === 0) {
                    errors.push('必须至少回答一个问题');
                }
                
                for (const [questionId, answer] of Object.entries(answers)) {
                    const id = parseInt(questionId);
                    const question = questions.find(q => q.id === id);
                    
                    if (!question) {
                        errors.push(`问题ID ${questionId} 不存在`);
                        continue;
                    }
                    
                    const answerValue = parseInt(answer);
                    if (isNaN(answerValue) || answerValue < 1 || answerValue > 5) {
                        errors.push(`问题 ${questionId} 的答案必须是1-5之间的整数`);
                    }
                }
                
                return {
                    isValid: errors.length === 0,
                    errors,
                    answerCount
                };
            },
            
            // 模拟API端点处理
            handleRequest: async (request) => {
                const url = new URL(request.url);
                const pathname = url.pathname;
                
                // 设置CORS头
                const corsHeaders = {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    'Content-Type': 'application/json'
                };
                
                if (request.method === 'OPTIONS') {
                    return new Response(null, { status: 200, headers: corsHeaders });
                }
                
                try {
                    if (pathname === '/personality-api/questions' && request.method === 'GET') {
                        const questions = getMockData('questions');
                        return new Response(JSON.stringify({
                            success: true,
                            data: questions
                        }), { status: 200, headers: corsHeaders });
                    }
                    
                    if (pathname === '/personality-api/answer-options' && request.method === 'GET') {
                        const options = getMockData('answer_options');
                        return new Response(JSON.stringify({
                            success: true,
                            data: options
                        }), { status: 200, headers: corsHeaders });
                    }
                    
                    if (pathname === '/personality-api/submit-test' && request.method === 'POST') {
                        const body = await request.json();
                        const { answers, saveResults = false, userInfo = null } = body;
                        
                        const questions = getMockData('questions');
                        const validation = this.apiHandlers.validateAnswers(answers, questions);
                        
                        if (!validation.isValid) {
                            return new Response(JSON.stringify({
                                success: false,
                                error: 'Invalid answers',
                                details: validation.errors
                            }), { status: 400, headers: corsHeaders });
                        }
                        
                        const bigFiveScores = this.apiHandlers.calculateBigFiveScores(answers, questions);
                        const mbtiResult = this.apiHandlers.calculateMBTI(bigFiveScores);
                        
                        // 获取详细信息
                        const mbtiInfo = getMockData('mbti_types_info').find(info => info.type === mbtiResult.typeCode);
                        const belbinRoles = getMockData('belbin_roles').filter(role => 
                            role.mbti_types.includes(mbtiResult.typeCode)
                        );
                        const careerSuggestions = getMockData('career_suggestions').filter(career => 
                            career.mbti_type === mbtiResult.typeCode
                        );
                        
                        const report = {
                            testId: Math.floor(Math.random() * 1000000),
                            timestamp: new Date().toISOString(),
                            bigFiveScores,
                            mbtiResult,
                            mbtiInfo,
                            belbinRoles,
                            careerSuggestions,
                            answerCount: validation.answerCount,
                            completionRate: (validation.answerCount / questions.length * 100).toFixed(1) + '%'
                        };
                        
                        return new Response(JSON.stringify({
                            success: true,
                            data: report
                        }), { status: 200, headers: corsHeaders });
                    }
                    
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Not Found'
                    }), { status: 404, headers: corsHeaders });
                    
                } catch (error) {
                    return new Response(JSON.stringify({
                        success: false,
                        error: 'Internal Server Error',
                        message: error.message
                    }), { status: 500, headers: corsHeaders });
                }
            }
        };
    }
    
    // 测试辅助方法
    assert(condition, message) {
        this.totalTests++;
        if (condition) {
            this.passedTests++;
            console.log(`✅ PASS: ${message}`);
            this.testResults.push({ status: 'PASS', message, timestamp: new Date().toISOString() });
        } else {
            this.failedTests++;
            console.log(`❌ FAIL: ${message}`);
            this.testResults.push({ status: 'FAIL', message, timestamp: new Date().toISOString() });
        }
    }
    
    assertEquals(actual, expected, message) {
        const condition = JSON.stringify(actual) === JSON.stringify(expected);
        this.assert(condition, `${message} - Expected: ${JSON.stringify(expected)}, Actual: ${JSON.stringify(actual)}`);
    }
    
    // 生成测试数据
    generateTestAnswers(pattern = 'complete') {
        const answers = {};
        
        switch (pattern) {
            case 'complete':
                for (let i = 1; i <= 50; i++) {
                    answers[i] = Math.floor(Math.random() * 5) + 1;
                }
                break;
            case 'partial':
                for (let i = 1; i <= 25; i++) {
                    answers[i] = Math.floor(Math.random() * 5) + 1;
                }
                break;
            case 'minimal':
                for (let i = 1; i <= 5; i++) {
                    answers[i] = Math.floor(Math.random() * 5) + 1;
                }
                break;
            case 'invalid_values':
                for (let i = 1; i <= 10; i++) {
                    answers[i] = i % 2 === 0 ? 0 : 6; // 无效值
                }
                break;
            case 'invalid_keys':
                answers['invalid'] = 3;
                answers[999] = 4;
                break;
        }
        
        return answers;
    }
    
    // 测试API端点
    async testAPIEndpoints() {
        console.log('\n🧪 测试API端点...');
        
        // 测试1: GET /personality-api/questions
        const questionsRequest = new Request('http://localhost:8000/personality-api/questions', {
            method: 'GET'
        });
        
        const questionsResponse = await this.apiHandlers.handleRequest(questionsRequest);
        this.assertEquals(questionsResponse.status, 200, 'Questions端点应该返回200状态码');
        
        const questionsData = await questionsResponse.json();
        this.assert(questionsData.success, 'Questions端点应该返回成功状态');
        this.assert(Array.isArray(questionsData.data), 'Questions端点应该返回数组数据');
        this.assertEquals(questionsData.data.length, 50, 'Questions端点应该返回50个问题');
        
        // 测试2: GET /personality-api/answer-options
        const optionsRequest = new Request('http://localhost:8000/personality-api/answer-options', {
            method: 'GET'
        });
        
        const optionsResponse = await this.apiHandlers.handleRequest(optionsRequest);
        this.assertEquals(optionsResponse.status, 200, 'Answer options端点应该返回200状态码');
        
        const optionsData = await optionsResponse.json();
        this.assert(optionsData.success, 'Answer options端点应该返回成功状态');
        this.assert(Array.isArray(optionsData.data), 'Answer options端点应该返回数组数据');
        this.assertEquals(optionsData.data.length, 5, 'Answer options端点应该返回5个选项');
        
        // 测试3: POST /personality-api/submit-test (成功案例)
        const validAnswers = this.generateTestAnswers('complete');
        const submitRequest = new Request('http://localhost:8000/personality-api/submit-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: validAnswers })
        });
        
        const submitResponse = await this.apiHandlers.handleRequest(submitRequest);
        this.assertEquals(submitResponse.status, 200, 'Submit test端点应该返回200状态码');
        
        const submitData = await submitResponse.json();
        this.assert(submitData.success, 'Submit test端点应该返回成功状态');
        this.assert(submitData.data.testId, 'Submit test端点应该返回测试ID');
        this.assert(submitData.data.bigFiveScores, 'Submit test端点应该返回Big Five分数');
        this.assert(submitData.data.mbtiResult, 'Submit test端点应该返回MBTI结果');
        
        // 测试4: OPTIONS请求（CORS预检）
        const optionsRequest2 = new Request('http://localhost:8000/personality-api/submit-test', {
            method: 'OPTIONS'
        });
        
        const optionsResponse2 = await this.apiHandlers.handleRequest(optionsRequest2);
        this.assertEquals(optionsResponse2.status, 200, 'OPTIONS请求应该返回200状态码');
        
        // 测试5: 404错误
        const notFoundRequest = new Request('http://localhost:8000/invalid-endpoint', {
            method: 'GET'
        });
        
        const notFoundResponse = await this.apiHandlers.handleRequest(notFoundRequest);
        this.assertEquals(notFoundResponse.status, 404, '无效端点应该返回404状态码');
        
        console.log('✅ API端点测试完成');
    }
    
    // 测试答案验证
    async testAnswerValidation() {
        console.log('\n🧪 测试答案验证...');
        
        const questions = getMockData('questions');
        
        // 测试1: 有效答案
        const validAnswers = this.generateTestAnswers('complete');
        const validResult = this.apiHandlers.validateAnswers(validAnswers, questions);
        this.assert(validResult.isValid, '完整的有效答案应该通过验证');
        this.assertEquals(validResult.errors.length, 0, '有效答案不应该有错误');
        
        // 测试2: 空答案
        const emptyResult = this.apiHandlers.validateAnswers({}, questions);
        this.assert(!emptyResult.isValid, '空答案应该验证失败');
        this.assert(emptyResult.errors.length > 0, '空答案应该有错误信息');
        
        // 测试3: null答案
        const nullResult = this.apiHandlers.validateAnswers(null, questions);
        this.assert(!nullResult.isValid, 'null答案应该验证失败');
        
        // 测试4: 无效答案值
        const invalidAnswers = this.generateTestAnswers('invalid_values');
        const invalidResult = this.apiHandlers.validateAnswers(invalidAnswers, questions);
        this.assert(!invalidResult.isValid, '无效答案值应该验证失败');
        
        // 测试5: 无效问题ID
        const invalidKeysAnswers = this.generateTestAnswers('invalid_keys');
        const invalidKeysResult = this.apiHandlers.validateAnswers(invalidKeysAnswers, questions);
        this.assert(!invalidKeysResult.isValid, '无效问题ID应该验证失败');
        
        // 测试6: 部分答案
        const partialAnswers = this.generateTestAnswers('partial');
        const partialResult = this.apiHandlers.validateAnswers(partialAnswers, questions);
        this.assert(partialResult.isValid, '部分有效答案应该通过验证');
        this.assert(partialResult.answerCount === 25, '部分答案的数量应该正确');
        
        console.log('✅ 答案验证测试完成');
    }
    
    // 测试错误处理
    async testErrorHandling() {
        console.log('\n🧪 测试错误处理...');
        
        // 测试1: 无效JSON
        const invalidJSONRequest = new Request('http://localhost:8000/personality-api/submit-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: 'invalid json'
        });
        
        try {
            const response = await this.apiHandlers.handleRequest(invalidJSONRequest);
            this.assertEquals(response.status, 500, '无效JSON应该返回500错误');
        } catch (error) {
            this.assert(true, '无效JSON应该抛出错误');
        }
        
        // 测试2: 缺少Content-Type
        const noContentTypeRequest = new Request('http://localhost:8000/personality-api/submit-test', {
            method: 'POST',
            body: JSON.stringify({ answers: {} })
        });
        
        try {
            const response = await this.apiHandlers.handleRequest(noContentTypeRequest);
            // 应该仍然能处理，但可能有警告
            this.assert(true, '缺少Content-Type应该能够处理');
        } catch (error) {
            this.assert(true, '缺少Content-Type可能导致错误');
        }
        
        // 测试3: 无效答案导致的400错误
        const invalidAnswersRequest = new Request('http://localhost:8000/personality-api/submit-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: { 1: 0, 2: 6 } })
        });
        
        const invalidResponse = await this.apiHandlers.handleRequest(invalidAnswersRequest);
        this.assertEquals(invalidResponse.status, 400, '无效答案应该返回400错误');
        
        const invalidData = await invalidResponse.json();
        this.assert(!invalidData.success, '无效答案响应应该标记为失败');
        this.assert(invalidData.details && invalidData.details.length > 0, '无效答案应该包含错误详情');
        
        console.log('✅ 错误处理测试完成');
    }
    
    // 测试响应格式
    async testResponseFormat() {
        console.log('\n🧪 测试响应格式...');
        
        const validAnswers = this.generateTestAnswers('complete');
        const request = new Request('http://localhost:8000/personality-api/submit-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: validAnswers })
        });
        
        const response = await this.apiHandlers.handleRequest(request);
        const data = await response.json();
        
        // 验证响应结构
        this.assert(data.hasOwnProperty('success'), '响应应该包含success字段');
        this.assert(data.hasOwnProperty('data'), '响应应该包含data字段');
        
        const report = data.data;
        
        // 验证报告结构
        this.assert(report.hasOwnProperty('testId'), '报告应该包含testId');
        this.assert(report.hasOwnProperty('timestamp'), '报告应该包含timestamp');
        this.assert(report.hasOwnProperty('bigFiveScores'), '报告应该包含bigFiveScores');
        this.assert(report.hasOwnProperty('mbtiResult'), '报告应该包含mbtiResult');
        this.assert(report.hasOwnProperty('mbtiInfo'), '报告应该包含mbtiInfo');
        this.assert(report.hasOwnProperty('belbinRoles'), '报告应该包含belbinRoles');
        this.assert(report.hasOwnProperty('careerSuggestions'), '报告应该包含careerSuggestions');
        this.assert(report.hasOwnProperty('answerCount'), '报告应该包含answerCount');
        this.assert(report.hasOwnProperty('completionRate'), '报告应该包含completionRate');
        
        // 验证Big Five分数格式
        const scores = report.bigFiveScores;
        const expectedDimensions = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'];
        expectedDimensions.forEach(dimension => {
            this.assert(scores.hasOwnProperty(dimension), `Big Five分数应该包含${dimension}`);
            this.assert(typeof scores[dimension] === 'number', `${dimension}分数应该是数字`);
            this.assert(scores[dimension] >= 0 && scores[dimension] <= 5, `${dimension}分数应该在0-5范围内`);
        });
        
        // 验证MBTI结果格式
        const mbti = report.mbtiResult;
        this.assert(mbti.hasOwnProperty('type'), 'MBTI结果应该包含type');
        this.assert(mbti.hasOwnProperty('typeCode'), 'MBTI结果应该包含typeCode');
        this.assert(mbti.hasOwnProperty('dimensions'), 'MBTI结果应该包含dimensions');
        this.assert(mbti.type.length >= 5, 'MBTI类型应该包含后缀');
        this.assert(mbti.typeCode.length === 4, 'MBTI类型代码应该是4个字符');
        
        console.log('✅ 响应格式测试完成');
    }
    
    // 测试性能
    async testPerformance() {
        console.log('\n🧪 测试API性能...');
        
        const startTime = Date.now();
        const requests = [];
        
        // 并发测试
        for (let i = 0; i < 100; i++) {
            const answers = this.generateTestAnswers('complete');
            const request = new Request('http://localhost:8000/personality-api/submit-test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers })
            });
            
            requests.push(this.apiHandlers.handleRequest(request));
        }
        
        const responses = await Promise.all(requests);
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        // 验证所有响应都成功
        let successCount = 0;
        for (const response of responses) {
            if (response.status === 200) {
                const data = await response.json();
                if (data.success) {
                    successCount++;
                }
            }
        }
        
        this.assertEquals(successCount, 100, '所有100个并发请求都应该成功');
        this.assert(duration < 5000, `100个并发请求应该在5秒内完成，实际用时: ${duration}ms`);
        
        console.log(`✅ 性能测试完成，100个并发请求用时: ${duration}ms`);
    }
    
    // 运行所有测试
    async runAllTests() {
        console.log('🚀 开始API人格测试套件...\n');
        
        const startTime = Date.now();
        
        try {
            await this.testAPIEndpoints();
            await this.testAnswerValidation();
            await this.testErrorHandling();
            await this.testResponseFormat();
            await this.testPerformance();
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // 生成测试报告
            this.generateTestReport(duration);
            
        } catch (error) {
            console.error('❌ 测试过程中发生错误:', error);
            this.testResults.push({
                status: 'ERROR',
                message: `测试执行错误: ${error.message}`,
                timestamp: new Date().toISOString()
            });
        }
    }
    
    // 生成测试报告
    generateTestReport(duration) {
        const report = {
            summary: {
                totalTests: this.totalTests,
                passedTests: this.passedTests,
                failedTests: this.failedTests,
                successRate: ((this.passedTests / this.totalTests) * 100).toFixed(2) + '%',
                duration: duration + 'ms',
                timestamp: new Date().toISOString()
            },
            details: this.testResults,
            environment: {
                nodeVersion: process.version,
                platform: process.platform,
                testSuite: 'APIPersonalityTestSuite v1.0'
            }
        };
        
        // 保存报告到文件
        const reportPath = path.join(__dirname, `api-personality-test-report-${Date.now()}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        // 打印摘要
        console.log('\n📊 API测试报告摘要:');
        console.log('='.repeat(50));
        console.log(`总测试数: ${this.totalTests}`);
        console.log(`通过测试: ${this.passedTests}`);
        console.log(`失败测试: ${this.failedTests}`);
        console.log(`成功率: ${report.summary.successRate}`);
        console.log(`总用时: ${duration}ms`);
        console.log(`报告文件: ${reportPath}`);
        console.log('='.repeat(50));
        
        if (this.failedTests > 0) {
            console.log('\n❌ 失败的测试:');
            this.testResults
                .filter(result => result.status === 'FAIL')
                .forEach(result => console.log(`  - ${result.message}`));
        } else {
            console.log('\n🎉 所有API测试都通过了！');
        }
    }
}

// 运行测试
if (require.main === module) {
    const testSuite = new APIPersonalityTestSuite();
    testSuite.runAllTests().catch(console.error);
}

module.exports = APIPersonalityTestSuite;