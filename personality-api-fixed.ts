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
      
      // 计算Big Five分数
      const bigFiveScores = calculateBigFiveScores(answers, questions);
      
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