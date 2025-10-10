import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// 初始化Supabase客户端
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

// Big Five维度映射
const DIMENSIONS = {
  openness: 'openness',
  conscientiousness: 'conscientiousness',
  extraversion: 'extraversion',
  agreeableness: 'agreeableness',
  neuroticism: 'neuroticism'
};

/**
 * 创建标准API响应格式
 */
function createApiResponse(success: boolean, data: any = null, error: string | null = null) {
  return {
    success,
    data,
    error
  };
}

/**
 * 计算Big Five分数
 */
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
    const answer = answers[question.id];
    if (answer !== undefined && question.dimension) {
      const dimension = question.dimension.toLowerCase();
      if (scores.hasOwnProperty(dimension)) {
        const score = question.reverse ? (6 - answer) : answer;
        scores[dimension] += score;
        counts[dimension]++;
      }
    }
  });
  
  // 转换为0-100百分比
  Object.keys(scores).forEach(dimension => {
    if (counts[dimension] > 0) {
      scores[dimension] = (scores[dimension] / counts[dimension]) / 5 * 100;
    }
  });
  
  return scores;
}

/**
 * 计算MBTI类型
 */
function calculateMBTI(bigFiveScores) {
  const dimensions = {};
  const confidence = {};
  
  // E/I - 基于外向性
  const extraversionScore = bigFiveScores.extraversion;
  dimensions.EI = extraversionScore > 50 ? 'E' : 'I';
  confidence.EI = Math.abs(extraversionScore - 50) / 50;
  
  // S/N - 基于开放性
  const opennessScore = bigFiveScores.openness;
  dimensions.SN = opennessScore > 50 ? 'N' : 'S';
  confidence.SN = Math.abs(opennessScore - 50) / 50;
  
  // T/F - 基于宜人性
  const agreeablenessScore = bigFiveScores.agreeableness;
  dimensions.TF = agreeablenessScore > 50 ? 'F' : 'T';
  confidence.TF = Math.abs(agreeablenessScore - 50) / 50;
  
  // J/P - 基于尽责性
  const conscientiousnessScore = bigFiveScores.conscientiousness;
  dimensions.JP = conscientiousnessScore > 50 ? 'J' : 'P';
  confidence.JP = Math.abs(conscientiousnessScore - 50) / 50;
  
  const mbtiType = dimensions.EI + dimensions.SN + dimensions.TF + dimensions.JP;
  
  // 基于神经质性添加-A/-T后缀
  const neuroticismScore = bigFiveScores.neuroticism;
  const suffix = neuroticismScore < 30 ? '-A' : (neuroticismScore > 70 ? '-T' : '');
  
  return {
    type: mbtiType + suffix,
    dimensions,
    confidence
  };
}

/**
 * 验证答案完整性
 * 支持两种格式：
 * 1. 对象格式：{questionId: answerScore, ...}
 * 2. Android数组格式：[{questionId: number, answerScore: number}, ...]
 */
function validateAnswers(answers, questions) {
  // 检查是否为Android数组格式
  if (Array.isArray(answers)) {
    // Android格式验证
    if (answers.length !== questions.length) {
      return false;
    }
    
    // 检查每个答案对象的格式和值
    return answers.every(answerObj => {
      if (!answerObj || typeof answerObj !== 'object') {
        return false;
      }
      
      const { questionId, answerScore } = answerObj;
      
      // 验证字段存在性和类型
      if (typeof questionId !== 'number' || typeof answerScore !== 'number') {
        return false;
      }
      
      // 验证答案分数范围
      if (answerScore < 1 || answerScore > 5) {
        return false;
      }
      
      // 验证问题ID是否存在
      return questions.some(q => q.id === questionId);
    });
  } else {
    // 对象格式验证（原有逻辑）
    return questions.every(question => {
      const answer = answers[question.id];
      return answer !== undefined && answer >= 1 && answer <= 5;
    });
  }
}

/**
 * 将Android数组格式的答案转换为对象格式
 * @param {Array|Object} answers - 答案数据
 * @returns {Object} 对象格式的答案
 */
function normalizeAnswers(answers) {
  if (Array.isArray(answers)) {
    // 将Android数组格式转换为对象格式
    const normalizedAnswers = {};
    answers.forEach(answerObj => {
      normalizedAnswers[answerObj.questionId] = answerObj.answerScore;
    });
    return normalizedAnswers;
  }
  
  // 已经是对象格式，直接返回
  return answers;
}

/**
 * 获取问题列表
 */
async function getQuestions(language = 'en') {
  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .order('id');
    
    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
    
    // 映射为 Android 模型期望的字段：Question
    // 同时提供集成测试期望的通用字段 text（按语言选择）
    const processedQuestions = questions.map(q => ({
      id: q.id,
      question_text_zh: q.text_zh,
      question_text_en: q.text_en,
      // 兼容集成测试的数据验证：提供 text 字段
      text: language === 'zh' ? q.text_zh : q.text_en,
      dimension: q.dimension,
      reverse: !!q.reverse,
      created_at: q.created_at
    }));
    
    return processedQuestions || [];
  } catch (error) {
    console.error('Error in getQuestions:', error);
    throw error;
  }
}

/**
 * 获取答题选项
 */
async function getAnswerOptions(language = 'en') {
  try {
    const { data: options, error } = await supabase
      .from('answer_options')
      .select('*')
      .order('value');
    
    if (error) {
      console.error('Error fetching answer options:', error);
      throw error;
    }
    
    // 映射为 Android 模型期望的字段：AnswerOption
    // 同时提供集成测试期望的通用字段 value、text
    const processedOptions = options.map(option => ({
      id: option.value,
      value: option.value,
      option_text_zh: option.text_zh,
      option_text_en: option.text_en,
      text: language === 'zh' ? option.text_zh : option.text_en,
      score: option.value
    }));
    
    return processedOptions || [];
  } catch (error) {
    console.error('Error in getAnswerOptions:', error);
    throw error;
  }
}

/**
 * 获取贝尔宾角色
 */
async function getBelbinRoles(mbtiType, language = 'en') {
  const cleanType = mbtiType.replace(/-[AT]$/, '');
  
  try {
    const { data: roles, error } = await supabase
      .from('belbin_roles')
      .select('*')
      .contains('mbti_types', [cleanType])
      .eq('language', language)
      .order('priority');
    
    if (error) {
      console.error('Error fetching Belbin roles:', error);
      return [];
    }
    
    return roles || [];
  } catch (error) {
    console.error('Error in getBelbinRoles:', error);
    return [];
  }
}

/**
 * 获取职业建议
 */
async function getCareerSuggestions(mbtiType, language = 'en') {
  const cleanType = mbtiType.replace(/-[AT]$/, '');
  
  try {
    const { data: careers, error } = await supabase
      .from('career_suggestions')
      .select('*')
      .eq('mbti_type', cleanType)
      .eq('language', language)
      .order('category');
    
    if (error) {
      console.error('Error fetching career suggestions:', error);
      return [];
    }
    
    return careers || [];
  } catch (error) {
    console.error('Error in getCareerSuggestions:', error);
    return [];
  }
}

/**
 * 获取MBTI类型详细信息
 */
async function getMBTITypeInfo(mbtiType, language = 'en') {
  const cleanType = mbtiType.replace(/-[AT]$/, '');
  
  try {
    const { data: typeInfo, error } = await supabase
      .from('mbti_types_info')
      .select('*')
      .eq('type', cleanType)
      .eq('language', language)
      .single();
    
    if (error) {
      console.error('Error fetching MBTI type info:', error);
      return null;
    }
    
    return typeInfo;
  } catch (error) {
    console.error('Error in getMBTITypeInfo:', error);
    return null;
  }
}

Deno.serve(async (req) => {
  // 处理CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    });
  }
  
  const url = new URL(req.url);
  // 兼容多种调用形式：/functions/v1/personality-api/xxx 或 /personality-api/xxx 或 /xxx
  const fullPath = url.pathname;
  const segments = fullPath.split('/').filter(Boolean);
  const idxApi = segments.indexOf('personality-api');
  const rest = idxApi >= 0 ? segments.slice(idxApi + 1) : segments;
  let path = '/';
  if (rest[0] === 'mbti-type' && rest[1]) {
    path = `/mbti-type/${rest[1]}`;
  } else if (rest[0]) {
    path = `/${rest[0]}`;
  }
  const method = req.method;
  
  try {
    // 路由处理 - 使用完整路径，返回Android兼容的ApiResponse格式
    if (method === 'GET' && path === '/questions') {
      const language = url.searchParams.get('language') || 'en';
      const questions = await getQuestions(language);
      const countParam = parseInt(url.searchParams.get('count') || '0', 10);
      let payload = questions;
      if (Number.isFinite(countParam) && countParam > 0 && questions.length > 0) {
        // 随机抽取 countParam 个题目（不重复），若 count 超过长度则返回全部
        const indices = Array.from({ length: questions.length }, (_, i) => i);
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }
        const picked = indices.slice(0, Math.min(countParam, indices.length));
        payload = picked.map(i => questions[i]);
      }
      
      return new Response(JSON.stringify(createApiResponse(true, payload)), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    if (method === 'GET' && path === '/answer-options') {
      const language = url.searchParams.get('language') || 'en';
      const options = await getAnswerOptions(language);
      
      return new Response(JSON.stringify(createApiResponse(true, options)), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    if (method === 'GET' && path.startsWith('/mbti-type/')) {
      const segments = path.split('/').filter(Boolean);
      const typeCode = segments[segments.length - 1];
      const language = url.searchParams.get('language') || 'en';
      const typeInfo = await getMBTITypeInfo(typeCode, language);
      return new Response(JSON.stringify(createApiResponse(true, typeInfo)), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    if (method === 'GET' && path === '/career-suggestions') {
      const mbtiType = url.searchParams.get('mbti_type');
      const language = url.searchParams.get('language') || 'en';
      
      if (!mbtiType) {
        return new Response(JSON.stringify(createApiResponse(false, null, 'MBTI type is required')), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      const suggestions = await getCareerSuggestions(mbtiType, language);
      
      return new Response(JSON.stringify(createApiResponse(true, suggestions)), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    if (method === 'POST' && path === '/submit-test') {
      const { answers, language = 'en', userId, saveResult = false } = await req.json();
      
      // 验证答案格式：支持对象格式和Android数组格式
      if (!answers || (typeof answers !== 'object' && !Array.isArray(answers))) {
        return new Response(JSON.stringify(createApiResponse(false, null, 'Invalid answers format')), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // 获取问题列表
      const questions = await getQuestions(language);
      if (!questions || questions.length === 0) {
        return new Response(JSON.stringify(createApiResponse(false, null, 'No questions found')), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // 验证答案完整性（支持两种格式）
      if (!validateAnswers(answers, questions)) {
        return new Response(JSON.stringify(createApiResponse(false, null, 'Incomplete or invalid answers')), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }
      
      // 标准化答案格式为对象格式
      const normalizedAnswers = normalizeAnswers(answers);
      
      // 计算Big Five分数
      const bigFiveScores = calculateBigFiveScores(normalizedAnswers, questions);
      
      // 计算MBTI类型
      const mbtiResult = calculateMBTI(bigFiveScores);
      
      // 获取详细信息
      const [mbtiTypeInfo, belbinRoles, careerSuggestions] = await Promise.all([
        getMBTITypeInfo(mbtiResult.type, language),
        getBelbinRoles(mbtiResult.type, language),
        getCareerSuggestions(mbtiResult.type, language)
      ]);
      
      // 生成完整报告
      const report = {
        timestamp: new Date().toISOString(),
        language,
        mbtiType: mbtiResult.type,
        mbtiResult,
        bigFiveScores,
        mbtiTypeInfo,
        belbinRoles,
        careerSuggestions,
        progress: {
          completed: true,
          percentage: 100,
          answeredQuestions: Object.keys(answers).length,
          totalQuestions: questions.length
        },
        statistics: {
          averageConfidence: Object.values(mbtiResult.confidence).reduce((a, b) => a + b, 0) / 4,
          strongestDimension: Object.entries(mbtiResult.confidence).reduce((a, b) => a[1] > b[1] ? a : b)[0],
          bigFiveAverage: Object.values(bigFiveScores).reduce((a, b) => a + b, 0) / 5
        },
        metadata: {
          version: '2.0',
          source: 'supabase-backend',
          calculationMethod: 'big-five-to-mbti'
        }
      };
      
      // 如果需要保存结果
      let saveResultInfo = null;
      if (saveResult) {
        try {
          const { data: testResult, error: testError } = await supabase
            .from('test_results')
            .insert({
              user_id: userId || null,
              mbti_type: mbtiResult.type,
              big_five_scores: bigFiveScores,
              confidence_scores: mbtiResult.confidence,
              language: language,
              test_date: report.timestamp,
              is_anonymous: !userId
            })
            .select()
            .single();
          
          if (!testError && testResult) {
            const answerRecords = Object.entries(answers).map(([questionId, answerValue]) => ({
              test_result_id: testResult.id,
              question_id: parseInt(questionId),
              answer_value: answerValue,
              answered_at: report.timestamp
            }));
            
            await supabase.from('user_answers').insert(answerRecords);
            
            saveResultInfo = {
              success: true,
              testResultId: testResult.id,
              message: 'Test result saved successfully'
            };
          }
        } catch (saveError) {
          console.error('Error saving test result:', saveError);
          saveResultInfo = {
            success: false,
            error: saveError.message,
            message: 'Failed to save test result'
          };
        }
      }
      
      // 返回Android兼容的TestSubmissionResponse格式
      const testSubmissionResponse = {
        success: true,
        report,
        saveResult: saveResultInfo?.success || false
      };
      
      return new Response(JSON.stringify(testSubmissionResponse), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // 未找到路由
    return new Response(JSON.stringify(createApiResponse(false, null, 'Not found')), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify(createApiResponse(false, null, `Internal server error: ${error.message}`)), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});