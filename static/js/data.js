/**
 * 静态数据配置文件
 * 包含所有测试问题、贝尔宾角色、职业建议等数据
 */

// 测试问题数据 (中文版)
const QUESTIONS_ZH = [
    // 开放性 (Openness) - 10题
    {id: 1, text: "我有很多想象力。", dimension: "openness"},
    {id: 6, text: "我喜欢尝试新事物。", dimension: "openness"},
    {id: 11, text: "我对艺术和美学有浓厚兴趣。", dimension: "openness"},
    {id: 16, text: "我喜欢思考抽象的概念。", dimension: "openness"},
    {id: 21, text: "我经常有创造性的想法。", dimension: "openness"},
    {id: 26, text: "我喜欢探索不同的文化。", dimension: "openness"},
    {id: 31, text: "我对哲学问题感兴趣。", dimension: "openness"},
    {id: 36, text: "我喜欢学习新技能。", dimension: "openness"},
    {id: 41, text: "我对未知事物充满好奇。", dimension: "openness"},
    {id: 46, text: "我喜欢挑战传统观念。", dimension: "openness"},
    
    // 尽责性 (Conscientiousness) - 10题
    {id: 2, text: "我总是准时完成任务。", dimension: "conscientiousness"},
    {id: 7, text: "我做事有条理。", dimension: "conscientiousness"},
    {id: 12, text: "我注重细节。", dimension: "conscientiousness"},
    {id: 17, text: "我坚持完成自己开始的工作。", dimension: "conscientiousness"},
    {id: 22, text: "我制定计划并按计划执行。", dimension: "conscientiousness"},
    {id: 27, text: "我很少拖延。", dimension: "conscientiousness"},
    {id: 32, text: "我总是做好充分准备。", dimension: "conscientiousness"},
    {id: 37, text: "我追求完美。", dimension: "conscientiousness"},
    {id: 42, text: "我能够自我约束。", dimension: "conscientiousness"},
    {id: 47, text: "我有很强的目标导向。", dimension: "conscientiousness"},
    
    // 外向性 (Extraversion) - 10题
    {id: 3, text: "我在社交场合中感到自在。", dimension: "extraversion"},
    {id: 8, text: "我喜欢成为关注的焦点。", dimension: "extraversion"},
    {id: 13, text: "我有很多朋友。", dimension: "extraversion"},
    {id: 18, text: "我喜欢参加聚会和活动。", dimension: "extraversion"},
    {id: 23, text: "我很容易与陌生人交谈。", dimension: "extraversion"},
    {id: 28, text: "我在团队中表现活跃。", dimension: "extraversion"},
    {id: 33, text: "我喜欢表达自己的观点。", dimension: "extraversion"},
    {id: 38, text: "我充满活力。", dimension: "extraversion"},
    {id: 43, text: "我喜欢热闹的环境。", dimension: "extraversion"},
    {id: 48, text: "我善于激励他人。", dimension: "extraversion"},
    
    // 宜人性 (Agreeableness) - 10题
    {id: 4, text: "我信任别人。", dimension: "agreeableness"},
    {id: 9, text: "我愿意帮助他人。", dimension: "agreeableness"},
    {id: 14, text: "我容易与人相处。", dimension: "agreeableness"},
    {id: 19, text: "我很少与人发生争执。", dimension: "agreeableness"},
    {id: 24, text: "我对人宽容。", dimension: "agreeableness"},
    {id: 29, text: "我体谅他人的感受。", dimension: "agreeableness"},
    {id: 34, text: "我愿意与他人合作。", dimension: "agreeableness"},
    {id: 39, text: "我关心他人的福祉。", dimension: "agreeableness"},
    {id: 44, text: "我容易相信他人。", dimension: "agreeableness"},
    {id: 49, text: "我尽量避免冲突。", dimension: "agreeableness"},
    
    // 神经质 (Neuroticism) - 10题
    {id: 5, text: "我经常感到焦虑。", dimension: "neuroticism"},
    {id: 10, text: "我容易感到沮丧。", dimension: "neuroticism"},
    {id: 15, text: "我经常感到紧张。", dimension: "neuroticism"},
    {id: 20, text: "我担心很多事情。", dimension: "neuroticism"},
    {id: 25, text: "我情绪波动较大。", dimension: "neuroticism"},
    {id: 30, text: "我容易感到压力。", dimension: "neuroticism"},
    {id: 35, text: "我经常感到不安。", dimension: "neuroticism"},
    {id: 40, text: "我对批评敏感。", dimension: "neuroticism"},
    {id: 45, text: "我容易感到愤怒。", dimension: "neuroticism"},
    {id: 50, text: "我经常感到孤独。", dimension: "neuroticism"}
];

// 测试问题数据 (英文版)
const QUESTIONS_EN = [
    // Openness - 10 questions
    {id: 1, text: "I have a vivid imagination.", dimension: "openness"},
    {id: 6, text: "I like to try new things.", dimension: "openness"},
    {id: 11, text: "I have a strong interest in art and aesthetics.", dimension: "openness"},
    {id: 16, text: "I enjoy thinking about abstract concepts.", dimension: "openness"},
    {id: 21, text: "I often have creative ideas.", dimension: "openness"},
    {id: 26, text: "I like to explore different cultures.", dimension: "openness"},
    {id: 31, text: "I am interested in philosophical questions.", dimension: "openness"},
    {id: 36, text: "I enjoy learning new skills.", dimension: "openness"},
    {id: 41, text: "I am curious about unknown things.", dimension: "openness"},
    {id: 46, text: "I like to challenge traditional ideas.", dimension: "openness"},
    
    // Conscientiousness - 10 questions
    {id: 2, text: "I always complete tasks on time.", dimension: "conscientiousness"},
    {id: 7, text: "I do things in an organized manner.", dimension: "conscientiousness"},
    {id: 12, text: "I pay attention to details.", dimension: "conscientiousness"},
    {id: 17, text: "I persist in completing work I start.", dimension: "conscientiousness"},
    {id: 22, text: "I make plans and follow through with them.", dimension: "conscientiousness"},
    {id: 27, text: "I rarely procrastinate.", dimension: "conscientiousness"},
    {id: 32, text: "I always prepare thoroughly.", dimension: "conscientiousness"},
    {id: 37, text: "I pursue perfection.", dimension: "conscientiousness"},
    {id: 42, text: "I am able to exercise self-control.", dimension: "conscientiousness"},
    {id: 47, text: "I have strong goal orientation.", dimension: "conscientiousness"},
    
    // Extraversion - 10 questions
    {id: 3, text: "I feel comfortable in social situations.", dimension: "extraversion"},
    {id: 8, text: "I enjoy being the center of attention.", dimension: "extraversion"},
    {id: 13, text: "I have many friends.", dimension: "extraversion"},
    {id: 18, text: "I enjoy attending parties and events.", dimension: "extraversion"},
    {id: 23, text: "I find it easy to talk to strangers.", dimension: "extraversion"},
    {id: 28, text: "I am active in team settings.", dimension: "extraversion"},
    {id: 33, text: "I enjoy expressing my opinions.", dimension: "extraversion"},
    {id: 38, text: "I am full of energy.", dimension: "extraversion"},
    {id: 43, text: "I enjoy lively environments.", dimension: "extraversion"},
    {id: 48, text: "I am good at motivating others.", dimension: "extraversion"},
    
    // Agreeableness - 10 questions
    {id: 4, text: "I trust others.", dimension: "agreeableness"},
    {id: 9, text: "I am willing to help others.", dimension: "agreeableness"},
    {id: 14, text: "I am easy to get along with.", dimension: "agreeableness"},
    {id: 19, text: "I rarely argue with others.", dimension: "agreeableness"},
    {id: 24, text: "I am tolerant of others.", dimension: "agreeableness"},
    {id: 29, text: "I consider others' feelings.", dimension: "agreeableness"},
    {id: 34, text: "I am willing to cooperate with others.", dimension: "agreeableness"},
    {id: 39, text: "I care about others' well-being.", dimension: "agreeableness"},
    {id: 44, text: "I find it easy to trust others.", dimension: "agreeableness"},
    {id: 49, text: "I try to avoid conflicts.", dimension: "agreeableness"},
    
    // Neuroticism - 10 questions
    {id: 5, text: "I often feel anxious.", dimension: "neuroticism"},
    {id: 10, text: "I am easily discouraged.", dimension: "neuroticism"},
    {id: 15, text: "I often feel tense.", dimension: "neuroticism"},
    {id: 20, text: "I worry about many things.", dimension: "neuroticism"},
    {id: 25, text: "My emotions fluctuate greatly.", dimension: "neuroticism"},
    {id: 30, text: "I am easily stressed.", dimension: "neuroticism"},
    {id: 35, text: "I often feel uneasy.", dimension: "neuroticism"},
    {id: 40, text: "I am sensitive to criticism.", dimension: "neuroticism"},
    {id: 45, text: "I get angry easily.", dimension: "neuroticism"},
    {id: 50, text: "I often feel lonely.", dimension: "neuroticism"}
];

// 贝尔宾团队角色数据
const BELBIN_ROLES = {
    "Plant": {
        name: "智多星",
        nameEn: "Plant",
        description: "富有想象力和创造力，善于解决复杂问题，提供创新想法",
        descriptionEn: "Creative, imaginative, free-thinking. Generates ideas and solves difficult problems.",
        characteristics: "聪明、好奇、独立思考、非传统",
        characteristicsEn: "Creative, imaginative, unorthodox",
        contribution: "提供创新解决方案，解决复杂技术问题",
        contributionEn: "Generates ideas, solves difficult problems",
        allowable_weaknesses: "忽视细节、不善于沟通、过于专注自己的想法",
        allowable_weaknessesEn: "Might ignore incidentals, too preoccupied to communicate effectively"
    },
    "Resource_Investigator": {
        name: "资源调查者",
        nameEn: "Resource Investigator",
        description: "善于发现和探索机会，外向且充满好奇心",
        descriptionEn: "Outgoing, enthusiastic. Explores opportunities and develops contacts.",
        characteristics: "外向、热情、好奇、沟通能力强",
        characteristicsEn: "Extrovert, enthusiastic, communicative",
        contribution: "拓展人脉、获取资源、探索新机会",
        contributionEn: "Explores opportunities, develops contacts",
        allowable_weaknesses: "容易失去兴趣、缺乏深度跟进",
        allowable_weaknessesEn: "Might be over-optimistic, can lose interest once the initial enthusiasm has passed"
    },
    "Coordinator": {
        name: "协调者",
        nameEn: "Coordinator",
        description: "成熟的领导者，能引导团队向目标前进",
        descriptionEn: "Mature, confident, identifies talent. Clarifies goals. Delegates effectively.",
        characteristics: "自信、有威望、善于识别他人优势",
        characteristicsEn: "Mature, confident, good chairperson",
        contribution: "明确目标、分配任务、促进团队合作",
        contributionEn: "Clarifies goals, promotes decision-making, delegates well",
        allowable_weaknesses: "可能操控他人、缺乏激情",
        allowable_weaknessesEn: "Can be seen as manipulative, might offload their own share of the work"
    },
    "Shaper": {
        name: "推进者",
        nameEn: "Shaper",
        description: "充满活力和挑战精神，推动团队克服困难",
        descriptionEn: "Challenging, dynamic, thrives on pressure. Has the drive and courage to overcome obstacles.",
        characteristics: "有干劲、竞争性强、意志坚定",
        characteristicsEn: "Challenging, dynamic, thrives on pressure",
        contribution: "激发动力、推动进展、挑战低效",
        contributionEn: "Shapes the way team effort is applied, directs attention generally to the setting of objectives and priorities",
        allowable_weaknesses: "易冲动、可能伤害他人感受",
        allowable_weaknessesEn: "Can be seen as aggressive, might offend people's feelings"
    },
    "Monitor_Evaluator": {
        name: "监督者",
        nameEn: "Monitor Evaluator",
        description: "冷静分析和判断，权衡利弊做出正确决策",
        descriptionEn: "Sober, strategic and discerning. Sees all options and judges accurately.",
        characteristics: "冷静、有判断力、谨慎、逻辑性强",
        characteristicsEn: "Sober, strategic, discerning",
        contribution: "评估方案、识别风险、做出明智决策",
        contributionEn: "Judges accurately, weighs up the team's options in a dispassionate way",
        allowable_weaknesses: "缺乏激励他人能力、可能过于批判",
        allowable_weaknessesEn: "Lacks drive and ability to inspire others, can be overly critical"
    },
    "Teamworker": {
        name: "团队工作者",
        nameEn: "Teamworker",
        description: "支持团队，温和、敏感且灵活",
        descriptionEn: "Co-operative, perceptive and diplomatic. Listens and averts friction.",
        characteristics: "合作、适应性强、温和、有感知力",
        characteristicsEn: "Co-operative, mild, perceptive, diplomatic",
        contribution: "维护团队和谐、缓解冲突、支持他人",
        contributionEn: "Listens, builds, averts friction",
        allowable_weaknesses: "在危机中犹豫不决、难以抉择",
        allowable_weaknessesEn: "Indecisive in crunch situations, can be easily influenced"
    },
    "Implementer": {
        name: "执行者",
        nameEn: "Implementer",
        description: "将想法转化为实际行动，纪律性强且高效",
        descriptionEn: "Practical, reliable, efficient. Turns ideas into actions and organises work that needs to be done.",
        characteristics: "纪律性、可靠、高效、保守",
        characteristicsEn: "Disciplined, reliable, conservative, efficient",
        contribution: "组织工作、实施计划、确保质量",
        contributionEn: "Turns ideas into practical actions",
        allowable_weaknesses: "缺乏灵活性、可能阻碍变革",
        allowable_weaknessesEn: "Somewhat inflexible, slow to respond to new possibilities"
    },
    "Completer_Finisher": {
        name: "完成者",
        nameEn: "Completer Finisher",
        description: "注重细节，确保任务按时高质量完成",
        descriptionEn: "Painstaking, conscientious, anxious. Searches out errors. Polishes and perfects.",
        characteristics: "注重细节、焦虑、追求完美、有责任感",
        characteristicsEn: "Painstaking, conscientious, anxious",
        contribution: "发现错误、确保质量、按时完成任务",
        contributionEn: "Searches out errors and omissions, delivers on time",
        allowable_weaknesses: "担心过多、可能悲观、完美主义",
        allowable_weaknessesEn: "Inclined to worry unduly, reluctant to delegate"
    },
    "Specialist": {
        name: "专家",
        nameEn: "Specialist",
        description: "提供专业知识和技能，专注于特定领域",
        descriptionEn: "Single-minded, self-starting, dedicated. Provides knowledge and skills in rare supply.",
        characteristics: "专注、自我驱动、追求专业技能",
        characteristicsEn: "Single-minded, self-starting, dedicated",
        contribution: "提供专业知识、维护技术标准",
        contributionEn: "Provides knowledge and skills in rare supply",
        allowable_weaknesses: "视野狭窄、难以参与其他领域工作",
        allowable_weaknessesEn: "Contributes only on a narrow front, dwells on technicalities"
    }
};

// MBTI类型详细信息
const MBTI_DETAILS = {
    'INTJ-A': {
        name: '建筑师',
        nameEn: 'Architect',
        description: '富有想像力和战略性思想，冷静自信且具有批判性',
        descriptionEn: 'Imaginative and strategic thinkers, with a plan for everything.',
        strengths: ['独立思考', '战略性规划', '逻辑分析'],
        strengthsEn: ['Independent thinking', 'Strategic planning', 'Logical analysis'],
        challenges: ['过度批判', '忽视情感因素'],
        challengesEn: ['Overly critical', 'Ignoring emotional factors']
    },
    'INTJ-T': {
        name: '建筑师',
        nameEn: 'Architect',
        description: '富有想像力和战略性思想，具有强烈的完美主义倾向',
        descriptionEn: 'Imaginative and strategic thinkers, with strong perfectionist tendencies.',
        strengths: ['深度思考', '追求卓越', '独立性强'],
        strengthsEn: ['Deep thinking', 'Pursuing excellence', 'Strong independence'],
        challenges: ['过度焦虑', '难以表达情感'],
        challengesEn: ['Excessive anxiety', 'Difficulty expressing emotions']
    },
    'INTP-A': {
        name: '逻辑学家',
        nameEn: 'Logician',
        description: '具有创造力的思想家，喜欢独立思考和探索概念',
        descriptionEn: 'Innovative inventors with an unquenchable thirst for knowledge.',
        strengths: ['分析能力强', '好奇心强', '独立思考'],
        strengthsEn: ['Strong analytical ability', 'Strong curiosity', 'Independent thinking'],
        challenges: ['缺乏执行力', '忽视实际应用'],
        challengesEn: ['Lack of execution', 'Ignoring practical applications']
    },
    'INTP-T': {
        name: '逻辑学家',
        nameEn: 'Logician',
        description: '具有创造力的思想家，对知识和理解有强烈的渴望',
        descriptionEn: 'Innovative inventors with strong desire for knowledge and understanding.',
        strengths: ['深度思考', '创新思维', '逻辑分析'],
        strengthsEn: ['Deep thinking', 'Innovative thinking', 'Logical analysis'],
        challenges: ['过度分析', '社交回避'],
        challengesEn: ['Over-analysis', 'Social avoidance']
    },
    // 继续添加其他MBTI类型...
    'ENTJ-A': {
        name: '指挥官',
        nameEn: 'Commander',
        description: '天生的领导者，具有强大的组织和决策能力',
        descriptionEn: 'Bold, imaginative and strong-willed leaders.',
        strengths: ['领导力强', '决策果断', '目标导向'],
        strengthsEn: ['Strong leadership', 'Decisive', 'Goal-oriented'],
        challenges: ['缺乏耐心', '忽视他人感受'],
        challengesEn: ['Lack of patience', 'Ignoring others\' feelings']
    },
    'ENTJ-T': {
        name: '指挥官',
        nameEn: 'Commander',
        description: '天生的领导者，但对失败和批评较为敏感',
        descriptionEn: 'Bold, imaginative leaders, but sensitive to failure and criticism.',
        strengths: ['战略思维', '执行力强', '自信果断'],
        strengthsEn: ['Strategic thinking', 'Strong execution', 'Confident and decisive'],
        challenges: ['过度批判', '难以放松'],
        challengesEn: ['Overly critical', 'Difficulty relaxing']
    },
    'ENTP-A': {
        name: '辩论家',
        nameEn: 'Debater',
        description: '聪明好奇，喜欢挑战和新想法，充满创新精神',
        descriptionEn: 'Smart and curious thinkers who cannot resist an intellectual challenge.',
        strengths: ['创新思维', '沟通能力强', '适应性强'],
        strengthsEn: ['Innovative thinking', 'Strong communication', 'Highly adaptable'],
        challenges: ['缺乏专注', '忽视细节'],
        challengesEn: ['Lack of focus', 'Ignoring details']
    },
    'ENTP-T': {
        name: '辩论家',
        nameEn: 'Debater',
        description: '聪明好奇，但容易质疑自己和周围的世界',
        descriptionEn: 'Smart and curious thinkers, but prone to self-doubt.',
        strengths: ['创造力强', '思维敏捷', '善于辩论'],
        strengthsEn: ['Strong creativity', 'Quick thinking', 'Good at debating'],
        challenges: ['过度思考', '难以坚持'],
        challengesEn: ['Overthinking', 'Difficulty persisting']
    },
    'INFJ-A': {
        name: '倡导者',
        nameEn: 'Advocate',
        description: '理想主义且有洞察力，既有爱心又有决心',
        descriptionEn: 'Creative and insightful, inspired and independent.',
        strengths: ['洞察力强', '有同理心', '坚持价值观'],
        strengthsEn: ['Strong insight', 'Empathetic', 'Values-driven'],
        challenges: ['过度敏感', '完美主义'],
        challengesEn: ['Overly sensitive', 'Perfectionist']
    },
    'INFJ-T': {
        name: '倡导者',
        nameEn: 'Advocate',
        description: '理想主义且有洞察力，但容易受到压力和批评的影响',
        descriptionEn: 'Creative and insightful, but sensitive to stress and criticism.',
        strengths: ['深度洞察', '富有同情心', '有创造力'],
        strengthsEn: ['Deep insight', 'Compassionate', 'Creative'],
        challenges: ['过度焦虑', '难以表达需求'],
        challengesEn: ['Excessive anxiety', 'Difficulty expressing needs']
    },
    'INFP-A': {
        name: '调停者',
        nameEn: 'Mediator',
        description: '理想主义且有同情心，追求个人成长和意义',
        descriptionEn: 'Quiet, open-minded, imaginative, and caring.',
        strengths: ['有创造力', '有同理心', '忠诚'],
        strengthsEn: ['Creative', 'Empathetic', 'Loyal'],
        challenges: ['不切实际', '难以做出决定'],
        challengesEn: ['Unrealistic', 'Difficulty making decisions']
    },
    'INFP-T': {
        name: '调停者',
        nameEn: 'Mediator',
        description: '理想主义且有同情心，但容易自我怀疑和情绪波动',
        descriptionEn: 'Quiet, open-minded, but prone to self-doubt and mood swings.',
        strengths: ['富有同情心', '创造力强', '忠诚'],
        strengthsEn: ['Compassionate', 'Creative', 'Loyal'],
        challenges: ['过度敏感', '逃避冲突'],
        challengesEn: ['Overly sensitive', 'Conflict avoidance']
    },
    'ENFJ-A': {
        name: '主人公',
        nameEn: 'Protagonist',
        description: '热情且有魅力，关心他人且具有领导力',
        descriptionEn: 'Charismatic and inspiring leaders, able to mesmerize listeners.',
        strengths: ['领导力强', '有同理心', '沟通能力强'],
        strengthsEn: ['Strong leadership', 'Empathetic', 'Excellent communication'],
        challenges: ['过度关注他人', '忽视自己需求'],
        challengesEn: ['Over-focus on others', 'Neglecting own needs']
    },
    'ENFJ-T': {
        name: '主人公',
        nameEn: 'Protagonist',
        description: '热情且有魅力，但容易受到他人情绪和批评的影响',
        descriptionEn: 'Charismatic and inspiring, but sensitive to others\' emotions and criticism.',
        strengths: ['激励他人', '有同理心', '善于沟通'],
        strengthsEn: ['Inspiring others', 'Empathetic', 'Good communicator'],
        challenges: ['过度敏感', '难以拒绝'],
        challengesEn: ['Overly sensitive', 'Difficulty saying no']
    },
    'ENFP-A': {
        name: '竞选者',
        nameEn: 'Campaigner',
        description: '热情且有创造力，善于交际且充满活力',
        descriptionEn: 'Enthusiastic, creative and sociable free spirits.',
        strengths: ['创造力强', '善于交际', '适应性强'],
        strengthsEn: ['Creative', 'Sociable', 'Adaptable'],
        challenges: ['缺乏专注', '难以坚持'],
        challengesEn: ['Lack of focus', 'Difficulty following through']
    },
    'ENFP-T': {
        name: '竞选者',
        nameEn: 'Campaigner',
        description: '热情且有创造力，但容易自我怀疑和情绪波动',
        descriptionEn: 'Enthusiastic and creative, but prone to self-doubt and emotional fluctuations.',
        strengths: ['富有想象力', '善于交际', '灵活'],
        strengthsEn: ['Imaginative', 'Sociable', 'Flexible'],
        challenges: ['过度焦虑', '难以完成任务'],
        challengesEn: ['Excessive anxiety', 'Difficulty completing tasks']
    },
    'ISTJ-A': {
        name: '物流师',
        nameEn: 'Logistician',
        description: '实际可靠，注重事实且有责任心',
        descriptionEn: 'Practical and fact-minded, reliable and responsible.',
        strengths: ['有责任心', '注重细节', '可靠'],
        strengthsEn: ['Responsible', 'Detail-oriented', 'Reliable'],
        challenges: ['过于僵化', '难以适应变化'],
        challengesEn: ['Too rigid', 'Difficulty adapting to change']
    },
    'ISTJ-T': {
        name: '物流师',
        nameEn: 'Logistician',
        description: '实际可靠，但容易担心和自我怀疑',
        descriptionEn: 'Practical and reliable, but prone to worry and self-doubt.',
        strengths: ['有组织性', '负责任', '注重细节'],
        strengthsEn: ['Organized', 'Responsible', 'Detail-oriented'],
        challenges: ['过度焦虑', '难以放松'],
        challengesEn: ['Excessive anxiety', 'Difficulty relaxing']
    },
    'ISFJ-A': {
        name: '守护者',
        nameEn: 'Defender',
        description: '温暖且有责任心，关心他人且有奉献精神',
        descriptionEn: 'Very dedicated and warm protectors, always ready to defend loved ones.',
        strengths: ['有同理心', '负责任', '忠诚'],
        strengthsEn: ['Empathetic', 'Responsible', 'Loyal'],
        challenges: ['过度牺牲', '难以表达需求'],
        challengesEn: ['Self-sacrifice', 'Difficulty expressing needs']
    },
    'ISFJ-T': {
        name: '守护者',
        nameEn: 'Defender',
        description: '温暖且有责任心，但容易担心和自我怀疑',
        descriptionEn: 'Very dedicated and warm, but prone to worry and self-doubt.',
        strengths: ['有同理心', '负责任', '细致'],
        strengthsEn: ['Empathetic', 'Responsible', 'Thorough'],
        challenges: ['过度焦虑', '难以拒绝'],
        challengesEn: ['Excessive anxiety', 'Difficulty saying no']
    },
    'ESTJ-A': {
        name: '执行官',
        nameEn: 'Executive',
        description: '实际且有责任心，喜欢组织和管理',
        descriptionEn: 'Excellent administrators, unsurpassed at managing things or people.',
        strengths: ['领导力强', '有组织性', '果断'],
        strengthsEn: ['Strong leadership', 'Organized', 'Decisive'],
        challenges: ['过于控制', '忽视情感因素'],
        challengesEn: ['Too controlling', 'Ignoring emotional factors']
    },
    'ESTJ-T': {
        name: '执行官',
        nameEn: 'Executive',
        description: '实际且有责任心，但容易担心和自我怀疑',
        descriptionEn: 'Excellent administrators, but prone to worry and self-doubt.',
        strengths: ['组织能力强', '负责任', '果断'],
        strengthsEn: ['Strong organizational skills', 'Responsible', 'Decisive'],
        challenges: ['过度焦虑', '难以放松'],
        challengesEn: ['Excessive anxiety', 'Difficulty relaxing']
    },
    'ESFJ-A': {
        name: '执政官',
        nameEn: 'Consul',
        description: '热心且有责任心，关心他人且善于合作',
        descriptionEn: 'Extraordinarily caring, social and popular people, always eager to help.',
        strengths: ['有同理心', '善于合作', '负责任'],
        strengthsEn: ['Empathetic', 'Cooperative', 'Responsible'],
        challenges: ['过度迎合', '忽视自己需求'],
        challengesEn: ['People-pleasing', 'Neglecting own needs']
    },
    'ESFJ-T': {
        name: '执政官',
        nameEn: 'Consul',
        description: '热心且有责任心，但容易担心和自我怀疑',
        descriptionEn: 'Extraordinarily caring and social, but prone to worry and self-doubt.',
        strengths: ['有同理心', '善于合作', '负责任'],
        strengthsEn: ['Empathetic', 'Cooperative', 'Responsible'],
        challenges: ['过度焦虑', '难以拒绝'],
        challengesEn: ['Excessive anxiety', 'Difficulty saying no']
    },
    'ISTP-A': {
        name: '鉴赏家',
        nameEn: 'Virtuoso',
        description: '灵活且实用，喜欢动手操作和解决问题',
        descriptionEn: 'Bold and practical experimenters, masters of all kinds of tools.',
        strengths: ['实践能力强', '适应性强', '独立'],
        strengthsEn: ['Practical skills', 'Adaptable', 'Independent'],
        challenges: ['缺乏计划性', '难以表达情感'],
        challengesEn: ['Lack of planning', 'Difficulty expressing emotions']
    },
    'ISTP-T': {
        name: '鉴赏家',
        nameEn: 'Virtuoso',
        description: '灵活且实用，但容易焦虑和自我怀疑',
        descriptionEn: 'Bold and practical, but prone to anxiety and self-doubt.',
        strengths: ['实践能力强', '适应性强', '独立'],
        strengthsEn: ['Practical skills', 'Adaptable', 'Independent'],
        challenges: ['过度焦虑', '难以坚持'],
        challengesEn: ['Excessive anxiety', 'Difficulty persisting']
    },
    'ISFP-A': {
        name: '探险家',
        nameEn: 'Adventurer',
        description: '温和且有艺术性，喜欢享受当下和表达自我',
        descriptionEn: 'Flexible and charming artists, always ready to explore new possibilities.',
        strengths: ['有创造力', '有同理心', '适应性强'],
        strengthsEn: ['Creative', 'Empathetic', 'Adaptable'],
        challenges: ['缺乏自信', '难以规划未来'],
        challengesEn: ['Lack of confidence', 'Difficulty planning ahead']
    },
    'ISFP-T': {
        name: '探险家',
        nameEn: 'Adventurer',
        description: '温和且有艺术性，但容易焦虑和自我怀疑',
        descriptionEn: 'Flexible and charming, but prone to anxiety and self-doubt.',
        strengths: ['有创造力', '有同理心', '敏感'],
        strengthsEn: ['Creative', 'Empathetic', 'Sensitive'],
        challenges: ['过度敏感', '难以拒绝'],
        challengesEn: ['Overly sensitive', 'Difficulty saying no']
    },
    'ESTP-A': {
        name: '企业家',
        nameEn: 'Entrepreneur',
        description: '精力充沛且现实，喜欢行动和冒险',
        descriptionEn: 'Smart, energetic and very perceptive people, truly enjoy living on the edge.',
        strengths: ['行动力强', '适应性强', '善于交际'],
        strengthsEn: ['Action-oriented', 'Adaptable', 'Sociable'],
        challenges: ['缺乏计划性', '忽视后果'],
        challengesEn: ['Lack of planning', 'Ignoring consequences']
    },
    'ESTP-T': {
        name: '企业家',
        nameEn: 'Entrepreneur',
        description: '精力充沛且现实，但容易焦虑和冲动',
        descriptionEn: 'Smart and energetic, but prone to anxiety and impulsiveness.',
        strengths: ['行动力强', '适应性强', '现实'],
        strengthsEn: ['Action-oriented', 'Adaptable', 'Realistic'],
        challenges: ['过度焦虑', '难以坚持'],
        challengesEn: ['Excessive anxiety', 'Difficulty persisting']
    },
    'ESFP-A': {
        name: '表演者',
        nameEn: 'Entertainer',
        description: '热情且有魅力，喜欢享受当下和与人交往',
        descriptionEn: 'Spontaneous, energetic and enthusiastic people – life is never boring.',
        strengths: ['善于交际', '有创造力', '适应性强'],
        strengthsEn: ['Sociable', 'Creative', 'Adaptable'],
        challenges: ['缺乏计划性', '难以独处'],
        challengesEn: ['Lack of planning', 'Difficulty being alone']
    },
    'ESFP-T': {
        name: '表演者',
        nameEn: 'Entertainer',
        description: '热情且有魅力，但容易焦虑和情绪波动',
        descriptionEn: 'Spontaneous and enthusiastic, but prone to anxiety and emotional fluctuations.',
        strengths: ['善于交际', '有创造力', '热情'],
        strengthsEn: ['Sociable', 'Creative', 'Enthusiastic'],
        challenges: ['过度敏感', '难以坚持'],
        challengesEn: ['Overly sensitive', 'Difficulty persisting']
    }
};

// 职业建议映射
const CAREER_SUGGESTIONS = {
    'INTJ': ['科学家', '工程师', '战略顾问', '研究员', '系统分析师', '软件工程师'],
    'INTP': ['研究员', '科学家', '哲学家', '软件工程师', '大学教授', '技术专家'],
    'ENTJ': ['企业高管', '项目经理', '律师', '企业家', '管理顾问'],
    'ENTP': ['企业家', '市场营销', '公关专家', '创新顾问', '咨询师'],
    'INFJ': ['心理咨询师', '教师', '作家', '人力资源', '社会工作者'],
    'INFP': ['作家', '心理咨询师', '艺术家', '社会工作者', '培训师'],
    'ENFJ': ['教师', '培训师', '人力资源经理', '公关经理', '心理咨询师'],
    'ENFP': ['记者', '演员', '创意总监', '市场营销', '培训师'],
    'ISTJ': ['会计师', '审计师', '行政主管', '质量控制', '运营经理'],
    'ISFJ': ['护士', '教师', '人力资源', '客户服务经理', '社会工作者'],
    'ESTJ': ['管理者', '军官', '项目经理', '运营经理', '行政主管'],
    'ESFJ': ['人力资源', '护士', '教师', '客户服务', '活动策划'],
    'ISTP': ['技术专家', '工程师', '外科医生', '机械师', '程序员'],
    'ISFP': ['设计师', '艺术家', '音乐家', '兽医', '心理咨询师'],
    'ESTP': ['销售代表', '警察', '运动员', '企业家', '急救医生'],
    'ESFP': ['演员', '活动策划', '销售代表', '教师', '社会工作者']
};

// 职业建议映射 (英文版)
const CAREER_SUGGESTIONS_EN = {
    'INTJ': ['Scientist', 'Engineer', 'Strategic Consultant', 'Researcher', 'Systems Analyst', 'Software Engineer'],
    'INTP': ['Researcher', 'Scientist', 'Philosopher', 'Software Developer', 'University Professor', 'Technical Specialist'],
    'ENTJ': ['Executive', 'Project Manager', 'Lawyer', 'Entrepreneur', 'Management Consultant'],
    'ENTP': ['Entrepreneur', 'Marketing Specialist', 'Public Relations', 'Innovation Consultant', 'Consultant'],
    'INFJ': ['Psychologist', 'Teacher', 'Writer', 'Human Resources', 'Social Worker'],
    'INFP': ['Writer', 'Counselor', 'Artist', 'Social Worker', 'Trainer'],
    'ENFJ': ['Teacher', 'Trainer', 'HR Manager', 'Public Relations Manager', 'Counselor'],
    'ENFP': ['Journalist', 'Actor', 'Creative Director', 'Marketing', 'Trainer'],
    'ISTJ': ['Accountant', 'Auditor', 'Administrative Manager', 'Quality Control', 'Operations Manager'],
    'ISFJ': ['Nurse', 'Teacher', 'Human Resources', 'Customer Service Manager', 'Social Worker'],
    'ESTJ': ['Manager', 'Military Officer', 'Project Manager', 'Operations Manager', 'Administrator'],
    'ESFJ': ['Human Resources', 'Nurse', 'Teacher', 'Customer Service', 'Event Planner'],
    'ISTP': ['Technical Specialist', 'Engineer', 'Surgeon', 'Mechanic', 'Programmer'],
    'ISFP': ['Designer', 'Artist', 'Musician', 'Veterinarian', 'Counselor'],
    'ESTP': ['Sales Representative', 'Police Officer', 'Athlete', 'Entrepreneur', 'Emergency Doctor'],
    'ESFP': ['Actor', 'Event Planner', 'Sales Representative', 'Teacher', 'Social Worker']
};

// 维度名称映射
const DIMENSIONS = {
    zh: {
        openness: '开放性',
        conscientiousness: '尽责性',
        extraversion: '外向性',
        agreeableness: '宜人性',
        neuroticism: '神经质'
    },
    en: {
        openness: 'Openness',
        conscientiousness: 'Conscientiousness',
        extraversion: 'Extraversion',
        agreeableness: 'Agreeableness',
        neuroticism: 'Neuroticism'
    }
};

// 答案选项
const ANSWER_OPTIONS = {
    zh: [
        { value: 1, text: '完全不同意' },
        { value: 2, text: '不同意' },
        { value: 3, text: '中立' },
        { value: 4, text: '同意' },
        { value: 5, text: '完全同意' }
    ],
    en: [
        { value: 1, text: 'Strongly Disagree' },
        { value: 2, text: 'Disagree' },
        { value: 3, text: 'Neutral' },
        { value: 4, text: 'Agree' },
        { value: 5, text: 'Strongly Agree' }
    ]
};

// 语言文本
const TEXTS = {
    zh: {
        title: '大五人格测试',
        subtitle: '基于科学的心理学模型，深度了解您的性格特征',
        progress: '进度',
        submitBtn: '完成测试',
        loadingText: '正在分析您的性格特征...',
        dimensionsTitle: '五大人格维度得分',
        belbinTitle: '贝尔宾团队角色',
        careerTitle: '职业建议',
        generateImgBtn: '生成分享图片',
        saveResultBtn: '保存结果',
        restartBtn: '重新测试',
        langBtn: 'English'
    },
    en: {
        title: 'Big Five Personality Test',
        subtitle: 'Based on scientific psychological models, deeply understand your personality traits',
        progress: 'Progress',
        submitBtn: 'Complete Test',
        loadingText: 'Analyzing your personality traits...',
        dimensionsTitle: 'Big Five Personality Dimensions',
        belbinTitle: 'Belbin Team Roles',
        careerTitle: 'Career Suggestions',
        generateImgBtn: 'Generate Share Image',
        saveResultBtn: 'Save Result',
        restartBtn: 'Restart Test',
        langBtn: '中文'
    }
};

// 导出全局变量
if (typeof window !== 'undefined') {
    window.QUESTIONS_ZH = QUESTIONS_ZH;
    window.QUESTIONS_EN = QUESTIONS_EN;
    window.BELBIN_ROLES = BELBIN_ROLES;
    window.MBTI_DETAILS = MBTI_DETAILS;
    window.CAREER_SUGGESTIONS = CAREER_SUGGESTIONS;
    window.CAREER_SUGGESTIONS_EN = CAREER_SUGGESTIONS_EN;
    window.DIMENSIONS = DIMENSIONS;
    window.ANSWER_OPTIONS = ANSWER_OPTIONS;
    window.TEXTS = TEXTS;
} else if (typeof global !== 'undefined') {
    global.QUESTIONS_ZH = QUESTIONS_ZH;
    global.QUESTIONS_EN = QUESTIONS_EN;
    global.BELBIN_ROLES = BELBIN_ROLES;
    global.MBTI_DETAILS = MBTI_DETAILS;
    global.CAREER_SUGGESTIONS = CAREER_SUGGESTIONS;
    global.CAREER_SUGGESTIONS_EN = CAREER_SUGGESTIONS_EN;
    global.DIMENSIONS = DIMENSIONS;
    global.ANSWER_OPTIONS = ANSWER_OPTIONS;
    global.TEXTS = TEXTS;
}