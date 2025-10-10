import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// 初始化Supabase客户端
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 计算Big Five分数 - 完全匹配静态版本算法
 * 修复版本：使用1-5平均分，移除reverse scoring
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

  // 遍历答案，计算每个维度的总分和题目数量
  for (const [questionId, answer] of Object.entries(answers)) {
    const question = questions.find(q => q.id === parseInt(questionId));
    if (question && question.dimension) {
      scores[question.dimension] += parseInt(answer);
      counts[question.dimension]++;
    }
  }

  // 计算平均分，保留两位小数，完全匹配静态版本
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
 * 计算MBTI类型 - 完全匹配静态版本算法
 * 修复版本：使用 >= 3.0 判断，3.0中点神经质性判断
 */
function calculateMBTI(bigFiveScores) {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFiveScores;
  const midPoint = 3.0;

  // E/I (外向/内向) - 基于外向性得分，严格匹配静态版本
  const ei = extraversion > midPoint ? 'E' : 'I';

  // S/N (感觉/直觉) - 基于开放性得分，关键修复：使用 >= (边界测试)
  const sn = openness >= midPoint ? 'N' : 'S';

  // T/F (思考/情感) - 基于宜人性得分
  const tf = agreeableness > midPoint ? 'F' : 'T';

  // J/P (判断/知觉) - 基于尽责性得分，关键修复：使用 >= (边界测试)
  const jp = conscientiousness >= midPoint ? 'J' : 'P';

  // 情绪稳定性后缀 -A/-T，严格匹配静态版本逻辑：3.0中点判断
  const suffix = neuroticism > midPoint ? '-T' : '-A';

  const mbtiType = ei + sn + tf + jp + suffix;

  // 为了向后兼容，保留原有的dimensions和confidence格式
  const dimensions = {
    EI: ei,
    SN: sn,
    TF: tf,
    JP: jp
  };

  const confidence = {
    EI: Math.abs(extraversion - midPoint) / 2.0,
    SN: Math.abs(openness - midPoint) / 2.0,
    TF: Math.abs(agreeableness - midPoint) / 2.0,
    JP: Math.abs(conscientiousness - midPoint) / 2.0
  };

  return {
    type: mbtiType,
    typeCode: ei + sn + tf + jp,
    dimensions,
    confidence,
    // 添加详细的维度信息，匹配静态版本格式
    detailedDimensions: {
      ei: { type: ei, score: extraversion },
      sn: { type: sn, score: openness },
      tf: { type: tf, score: agreeableness },
      jp: { type: jp, score: conscientiousness },
      suffix: { type: suffix, score: neuroticism }
    }
  };
}

/**
 * 验证答案完整性
 */
function validateAnswers(answers, questions) {
  return questions.every(question => {
    const answer = answers[question.id];
    return answer !== undefined && answer >= 1 && answer <= 5;
  });
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

    // 根据语言选择对应的文本字段
    const processedQuestions = questions.map(q => ({
      ...q,
      text: language === 'zh' ? q.text_zh : q.text_en
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

    // 根据语言选择对应的文本字段
    const processedOptions = options.map(option => ({
      ...option,
      text: language === 'zh' ? option.text_zh : option.text_en
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
  const path = url.pathname;
  const method = req.method;

  try {
    // 路由处理 - 使用完整路径
    if (method === 'GET' && path === '/personality-api/questions') {
      const language = url.searchParams.get('language') || 'en';
      const questions = await getQuestions(language);

      return new Response(JSON.stringify({ questions }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (method === 'GET' && path === '/personality-api/answer-options') {
      const language = url.searchParams.get('language') || 'en';
      const options = await getAnswerOptions(language);

      return new Response(JSON.stringify({ options }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (method === 'POST' && path === '/personality-api/submit-test') {
      const { answers, language = 'en', userId, saveResult = false } = await req.json();

      if (!answers || typeof answers !== 'object') {
        return new Response(JSON.stringify({ error: 'Invalid answers format' }), {
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
        return new Response(JSON.stringify({ error: 'No questions found' }), {
          status: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 验证答案完整性
      if (!validateAnswers(answers, questions)) {
        return new Response(JSON.stringify({ error: 'Incomplete or invalid answers' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        });
      }

      // 计算Big Five分数 (使用修复后的算法 - 1-5平均分)
      const bigFiveScores = calculateBigFiveScores(answers, questions);

      // 计算MBTI类型 (使用修复后的算法 - >= 3.0边界处理)
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
          version: '2.1', // 修复版本号
          source: 'supabase-backend',
          calculationMethod: 'big-five-to-mbti-fixed',
          algorithmFixed: true,
          staticVersionCompatible: true,
          fixesApplied: [
            'big-five-average-score',
            'mbti-boundary-handling',
            'neuroticism-midpoint'
          ],
          deployedAt: new Date().toISOString()
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

      return new Response(JSON.stringify({
        success: true,
        report,
        saveResult: saveResultInfo
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // 未找到路由
    return new Response(JSON.stringify({
      error: 'Not found',
      debug: {
        method,
        path,
        url: req.url
      }
    }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});