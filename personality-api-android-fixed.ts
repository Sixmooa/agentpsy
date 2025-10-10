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
function createApiResponse(success, data = null, error = null) {
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

  questions.forEach((question) => {
    const answer = answers[question.id];
    if (answer !== undefined && question.dimension) {
      const dimension = String(question.dimension).toLowerCase();
      if (scores.hasOwnProperty(dimension)) {
        const score = question.reverse ? 6 - answer : answer;
        scores[dimension] += score;
        counts[dimension]++;
      }
    }
  });

  // 转换为0-100百分比
  Object.keys(scores).forEach((dimension) => {
    if (counts[dimension] > 0) {
      scores[dimension] = scores[dimension] / counts[dimension] / 5 * 100;
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
  const suffix = neuroticismScore < 30 ? '-A' : neuroticismScore > 70 ? '-T' : '';

  return {
    type: mbtiType + suffix,
    dimensions,
    confidence
  };
}

/**
 * 将Android数组格式的答案转换为对象格式
 * Android格式: [{questionId: 1, answerScore: 3}, ...]
 * 对象格式: {"1": 3, "2": 4, ...}
 */
function normalizeAnswers(answers) {
  // 如果已经是对象格式，直接返回
  if (!Array.isArray(answers)) {
    return answers;
  }

  // 转换Android数组格式为对象格式
  const normalizedAnswers = {};
  for (const answer of answers) {
    if (answer && typeof answer === 'object' && 
        'questionId' in answer && 'answerScore' in answer) {
      normalizedAnswers[answer.questionId] = answer.answerScore;
    }
  }
  
  return normalizedAnswers;
}

/**
 * 校验答案格式并转换为标准格式
 */
function validateAndNormalizeAnswers(answers, questions) {
  // 先标准化答案格式
  const normalizedAnswers = normalizeAnswers(answers);
  
  // 检查是否为空
  if (!normalizedAnswers || typeof normalizedAnswers !== 'object' || 
      Object.keys(normalizedAnswers).length === 0) {
    return { valid: false, answers: null, error: 'Invalid answers format' };
  }

  // 校验答案有效性
  const questionIdSet = new Set(questions.map(q => q.id));
  const isValid = Object.entries(normalizedAnswers).every(([qidStr, answer]) => {
    const qid = Number(qidStr);
    return questionIdSet.has(qid) && Number.isFinite(answer) && answer >= 1 && answer <= 5;
  });

  if (!isValid) {
    return { valid: false, answers: null, error: 'Incomplete or invalid answers' };
  }

  return { valid: true, answers: normalizedAnswers, error: null };
}

/**
 * 获取指定ID集合的问题列表（并映射为Android模型字段）
 */
async function getQuestionsByIds(ids, language = 'en') {
  if (!ids || ids.length === 0) return [];

  try {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .in('id', ids)
      .order('id');

    if (error) {
      console.error('Error fetching questions by ids:', error);
      throw error;
    }

    const processedQuestions = (questions || []).map(q => ({
      id: q.id,
      question_text_zh: q.text_zh,
      question_text_en: q.text_en,
      text: language === 'zh' ? q.text_zh : q.text_en,
      dimension: q.dimension,
      reverse: !!q.reverse,
      created_at: q.created_at
    }));

    return processedQuestions;
  } catch (error) {
    console.error('Error in getQuestionsByIds:', error);
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

    const processedOptions = (options || []).map(option => ({
      id: option.value,
      value: option.value,
      option_text_zh: option.text_zh,
      option_text_en: option.text_en,
      text: language === 'zh' ? option.text_zh : option.text_en,
      score: option.value
    }));

    return processedOptions;
  } catch (error) {
    console.error('Error in getAnswerOptions:', error);
    throw error;
  }
}

/** 获取贝尔宾角色 */
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

/** 获取职业建议 */
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

/** 获取MBTI类型详细信息 */
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
    // GET /questions：返回ApiResponse<List<Question>>，支持随机抽题count
    if (method === 'GET' && path === '/questions') {
      const language = url.searchParams.get('language') || 'en';
      const countParam = parseInt(url.searchParams.get('count') || '0', 10);

      // 拉取全部ID，再随机抽取（避免把抽题逻辑放在DB层导致排序不可控）
      const { data: allQuestions, error } = await supabase
        .from('questions')
        .select('id')
        .order('id');

      if (error) throw error;

      const ids = (allQuestions || []).map(q => q.id);
      let pickedIds = ids;

      if (Number.isFinite(countParam) && countParam > 0 && ids.length > 0) {
        const shuffled = [...ids];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        pickedIds = shuffled.slice(0, Math.min(countParam, shuffled.length));
      }

      const languageFinal = language || 'en';
      const questions = await getQuestionsByIds(pickedIds, languageFinal);

      return new Response(JSON.stringify(createApiResponse(true, questions)), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // GET /answer-options
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

    // GET /mbti-type/:code
    if (method === 'GET' && path.startsWith('/mbti-type/')) {
      const segs = path.split('/').filter(Boolean);
      const typeCode = segs[segs.length - 1];
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

    // GET /career-suggestions
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

    // POST /submit-test：支持Android数组格式和原有对象格式
    if (method === 'POST' && path === '/submit-test') {
      const body = await req.json().catch(() => ({}));
      const { answers, language = 'en', userId, saveResult = false } = body || {};

      if (!answers) {
        return new Response(JSON.stringify(createApiResponse(false, null, 'Answers are required')), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 先获取答案中涉及的问题ID
      let answerIds = [];
      if (Array.isArray(answers)) {
        // Android数组格式
        answerIds = answers
          .filter(answer => answer && typeof answer === 'object' && 'questionId' in answer)
          .map(answer => answer.questionId)
          .filter(id => Number.isFinite(id));
      } else if (typeof answers === 'object') {
        // 对象格式
        answerIds = Object.keys(answers)
          .map(id => parseInt(id, 10))
          .filter(id => Number.isFinite(id));
      }

      if (answerIds.length === 0) {
        return new Response(JSON.stringify(createApiResponse(false, null, 'No valid answers found')), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 获取相关问题
      const questions = await getQuestionsByIds(answerIds, language);

      if (!questions || questions.length === 0) {
        return new Response(JSON.stringify(createApiResponse(false, null, 'No questions found for submitted answers')), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 验证并标准化答案格式
      const validation = validateAndNormalizeAnswers(answers, questions);
      if (!validation.valid) {
        return new Response(JSON.stringify(createApiResponse(false, null, validation.error)), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      const normalizedAnswers = validation.answers;

      // 计算Big Five & MBTI
      const bigFiveScores = calculateBigFiveScores(normalizedAnswers, questions);
      const mbtiResult = calculateMBTI(bigFiveScores);

      const [mbtiTypeInfo, belbinRoles, careerSuggestions] = await Promise.all([
        getMBTITypeInfo(mbtiResult.type, language),
        getBelbinRoles(mbtiResult.type, language),
        getCareerSuggestions(mbtiResult.type, language)
      ]);

      // 构建报告
      const timestamp = new Date().toISOString();
      const report = {
        timestamp,
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
          answeredQuestions: Object.keys(normalizedAnswers).length,
          totalQuestions: Object.keys(normalizedAnswers).length
        },
        statistics: {
          averageConfidence: Object.values(mbtiResult.confidence).reduce((a, b) => a + b, 0) / 4,
          strongestDimension: Object.entries(mbtiResult.confidence).reduce((a, b) => a[1] > b[1] ? a : b)[0],
          bigFiveAverage: Object.values(bigFiveScores).reduce((a, b) => a + b, 0) / 5
        },
        metadata: {
          version: '2.2',
          source: 'supabase-backend',
          calculationMethod: 'big-five-to-mbti',
          androidCompatible: true
        }
      };

      // 可选保存结果
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
              test_date: timestamp,
              is_anonymous: !userId
            })
            .select()
            .single();

          if (!testError && testResult) {
            const answerRecords = Object.entries(normalizedAnswers).map(([questionId, answerValue]) => ({
              test_result_id: testResult.id,
              question_id: parseInt(questionId),
              answer_value: answerValue,
              answered_at: timestamp
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
            error: saveError?.message,
            message: 'Failed to save test result'
          };
        }
      }

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
    return new Response(JSON.stringify(createApiResponse(false, null, `Internal server error: ${error?.message}`)), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});