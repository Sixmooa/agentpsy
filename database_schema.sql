-- WeMBTI 项目数据库表结构设计
-- 基于 static/js/data.js 和 static/content/*.html 的数据结构

-- 1. 题目表 (questions)
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_id INTEGER NOT NULL UNIQUE, -- 原始题目ID (1-50)
    text_zh TEXT NOT NULL, -- 中文题目内容
    text_en TEXT NOT NULL, -- 英文题目内容
    dimension VARCHAR(20) NOT NULL, -- 人格维度 (openness, conscientiousness, extraversion, agreeableness, neuroticism)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 答案选项表 (answer_options)
CREATE TABLE answer_options (
    id SERIAL PRIMARY KEY,
    value INTEGER NOT NULL, -- 选项值 (1-5)
    text_zh VARCHAR(50) NOT NULL, -- 中文选项文本
    text_en VARCHAR(50) NOT NULL, -- 英文选项文本
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. MBTI类型信息表 (mbti_types_info)
CREATE TABLE mbti_types_info (
    id SERIAL PRIMARY KEY,
    type_code VARCHAR(10) NOT NULL UNIQUE, -- MBTI类型代码 (如 INTJ-A, INTJ-T)
    name_zh VARCHAR(50) NOT NULL, -- 中文名称
    name_en VARCHAR(50) NOT NULL, -- 英文名称
    description_zh TEXT, -- 中文描述
    description_en TEXT, -- 英文描述
    content_html TEXT, -- 完整的HTML内容 (从content/*.html提取)
    strengths_zh TEXT[], -- 中文优势列表
    strengths_en TEXT[], -- 英文优势列表
    challenges_zh TEXT[], -- 中文挑战列表
    challenges_en TEXT[], -- 英文挑战列表
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 贝尔宾团队角色表 (belbin_roles)
CREATE TABLE belbin_roles (
    id SERIAL PRIMARY KEY,
    role_key VARCHAR(50) NOT NULL UNIQUE, -- 角色键名 (如 Plant, Resource_Investigator)
    name_zh VARCHAR(50) NOT NULL, -- 中文名称
    name_en VARCHAR(50) NOT NULL, -- 英文名称
    description_zh TEXT, -- 中文描述
    description_en TEXT, -- 英文描述
    characteristics_zh TEXT, -- 中文特征
    characteristics_en TEXT, -- 英文特征
    contribution_zh TEXT, -- 中文贡献
    contribution_en TEXT, -- 英文贡献
    allowable_weaknesses_zh TEXT, -- 中文允许的弱点
    allowable_weaknesses_en TEXT, -- 英文允许的弱点
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 职业建议表 (career_suggestions)
CREATE TABLE career_suggestions (
    id SERIAL PRIMARY KEY,
    mbti_type VARCHAR(10) NOT NULL, -- MBTI类型 (如 INTJ, INTP)
    career_zh VARCHAR(100) NOT NULL, -- 中文职业名称
    career_en VARCHAR(100) NOT NULL, -- 英文职业名称
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. 人格维度表 (personality_dimensions)
CREATE TABLE personality_dimensions (
    id SERIAL PRIMARY KEY,
    dimension_key VARCHAR(20) NOT NULL UNIQUE, -- 维度键名
    name_zh VARCHAR(50) NOT NULL, -- 中文名称
    name_en VARCHAR(50) NOT NULL, -- 英文名称
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. 测试结果表 (test_results)
CREATE TABLE test_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- 用户ID (可为空，支持匿名测试)
    session_id VARCHAR(100), -- 会话ID (用于匿名测试)
    mbti_type VARCHAR(10), -- 计算得出的MBTI类型
    openness_score DECIMAL(5,2), -- 开放性得分
    conscientiousness_score DECIMAL(5,2), -- 尽责性得分
    extraversion_score DECIMAL(5,2), -- 外向性得分
    agreeableness_score DECIMAL(5,2), -- 宜人性得分
    neuroticism_score DECIMAL(5,2), -- 神经质得分
    belbin_role VARCHAR(50), -- 贝尔宾角色
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. 用户答案表 (user_answers)
CREATE TABLE user_answers (
    id SERIAL PRIMARY KEY,
    test_result_id INTEGER REFERENCES test_results(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES questions(id),
    answer_value INTEGER NOT NULL, -- 用户选择的答案值 (1-5)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_questions_dimension ON questions(dimension);
CREATE INDEX idx_test_results_user_id ON test_results(user_id);
CREATE INDEX idx_test_results_session_id ON test_results(session_id);
CREATE INDEX idx_user_answers_test_result_id ON user_answers(test_result_id);
CREATE INDEX idx_career_suggestions_mbti_type ON career_suggestions(mbti_type);

-- 插入人格维度基础数据
INSERT INTO personality_dimensions (dimension_key, name_zh, name_en) VALUES
('openness', '开放性', 'Openness'),
('conscientiousness', '尽责性', 'Conscientiousness'),
('extraversion', '外向性', 'Extraversion'),
('agreeableness', '宜人性', 'Agreeableness'),
('neuroticism', '神经质', 'Neuroticism');

-- 插入答案选项基础数据
INSERT INTO answer_options (value, text_zh, text_en) VALUES
(1, '完全不同意', 'Strongly Disagree'),
(2, '不同意', 'Disagree'),
(3, '中立', 'Neutral'),
(4, '同意', 'Agree'),
(5, '完全同意', 'Strongly Agree');