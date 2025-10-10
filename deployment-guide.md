# Supabase算法部署指南

## 🚀 部署修复后的算法到Supabase云端

### 方法1: 使用Supabase CLI (推荐)

#### 1. 安装和登录
```bash
# 安装Supabase CLI (如果未安装)
npm install -g supabase

# 登录Supabase
npx supabase login
# 按提示输入你的访问令牌
```

#### 2. 获取访问令牌
- 访问 [Supabase Dashboard](https://supabase.com/dashboard)
- 进入 Account Settings → Access Tokens
- 复制你的 `supabase_access_token`

#### 3. 链接项目
```bash
# 链接到你的项目
npx supabase link --project-ref fmjcjcpfcosvukgkgliz

# 或者手动指定项目ID
npx supabase link --project-ref <你的项目ID>
```

#### 4. 部署函数
```bash
# 部署更新后的函数
npx supabase functions deploy personality-api

# 部署时不验证JWT (如果需要)
npx supabase functions deploy personality-api --no-verify-jwt
```

#### 5. 验证部署
```bash
# 检查函数状态
npx supabase functions list

# 测试API响应
curl -X POST https://fmjcjcpfcosvukgkgliz.supabase.co/functions/v1/personality-api/submit-test \
  -H "Authorization: Bearer 你的API密钥" \
  -H "Content-Type: application/json" \
  -d '{"answers": {"1": 3, "2": 3, "3": 3}, "language": "en"}'
```

---

### 方法2: 使用Supabase Dashboard (手动部署)

#### 1. 访问Dashboard
- 进入 [Supabase Dashboard](https://supabase.com/dashboard)
- 选择你的项目

#### 2. 导航到Edge Functions
- 左侧菜单 → Edge Functions
- 点击 `personality-api` 函数

#### 3. 更新代码
- 复制 `personality-api-fixed.ts` 的完整内容
- 替换编辑器中的现有代码
- 点击 Save 或 Deploy

#### 4. 复制修复后的代码
以下是完整的修复代码，可直接复制使用：

```typescript
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

// 初始化Supabase客户端
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 计算Big Five分数 - 匹配静态版本算法
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

  // 计算平均分，保留两位小数
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
 */
function calculateMBTI(bigFiveScores) {
  const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = bigFiveScores;
  const midPoint = 3.0;

  // E/I (外向/内向) - 基于外向性得分，严格匹配静态版本
  const ei = extraversion > midPoint ? 'E' : 'I';

  // S/N (感觉/直觉) - 基于开放性得分，注意使用 >= (关键差异!)
  const sn = openness >= midPoint ? 'N' : 'S';

  // T/F (思考/情感) - 基于宜人性得分
  const tf = agreeableness > midPoint ? 'F' : 'T';

  // J/P (判断/知觉) - 基于尽责性得分，注意使用 >= (关键差异!)
  const jp = conscientiousness >= midPoint ? 'J' : 'P';

  // 情绪稳定性后缀 -A/-T，严格匹配静态版本逻辑
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

      // 计算Big Five分数 (使用修复后的算法)
      const bigFiveScores = calculateBigFiveScores(answers, questions);

      // 计算MBTI类型 (使用修复后的算法)
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
          version: '2.1',
          source: 'supabase-backend',
          calculationMethod: 'big-five-to-mbti',
          algorithmFixed: true,
          staticVersionCompatible: true
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
```

---

### 方法3: 使用环境变量部署

设置环境变量并使用Docker部署：

```bash
# 设置环境变量
export SUPABASE_ACCESS_TOKEN=你的访问令牌
export SUPABASE_PROJECT_ID=fmjcjcpfcosvukgkgliz

# 部署
npx supabase functions deploy personality-api
```

---

## 🧪 部署后验证

### 1. 运行验证测试
```bash
# 验证API响应
node simple-api-test.js

# 运行完整对比测试
node score-comparison-test.js
```

### 2. 检查响应格式
预期修复后的响应应该包含：
```json
{
  "success": true,
  "report": {
    "bigFiveScores": {
      "openness": 3,
      "conscientiousness": 3,
      "extraversion": 3,
      "agreeableness": 3,
      "neuroticism": 3
    },
    "mbtiType": "INTJ-A",
    "metadata": {
      "algorithmFixed": true,
      "staticVersionCompatible": true
    }
  }
}
```

### 3. 成功指标
- Big Five分数应该为1-5范围，而不是百分比
- MBTI类型应与静态版本完全一致
- 一致性测试应达到100%

---

## 🚨 故障排除

### 常见问题
1. **认证失败**: 确保访问令牌正确且未过期
2. **部署错误**: 检查函数语法和依赖项
3. **权限错误**: 确保有项目部署权限

### 重置部署
如果需要重置：
```bash
npx supabase functions delete personality-api
npx supabase functions deploy personality-api
```

部署完成后，你的算法将与静态版本完全一致！