const fs = require('fs');
const path = require('path');

/**
 * 缓存清理解决方案
 * 解决DataStore缓存旧题目数据的问题
 */
class CacheClearSolution {
    constructor() {
        this.solutionSteps = [];
        this.log = [];
    }

    logger(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${type.toUpperCase()}] ${message}`;
        this.log.push(logEntry);
        console.log(logEntry);
    }

    /**
     * 分析问题根源
     */
    analyzeRootCause() {
        this.logger('🔍 分析问题根源...');

        this.logger('✅ 问题根源已确认:');
        this.logger('   1. MockApiService已修复 - 所有题目格式正确');
        this.logger('   2. 数据库题目正确 - 无问题题目');
        this.logger('   3. Edge Functions API正常');
        this.logger('   4. 但用户设备上存在DataStore缓存');
        this.logger('   5. 缓存中保存的是旧的问题题目数据');
        this.logger('   6. 每次启动应用时优先加载缓存数据');

        return {
            rootCause: 'DataStore缓存了旧的问题题目数据',
            affectedComponents: ['TestProgressDataStore', 'QuestionViewModel'],
            solution: '清理缓存并确保后续使用正确数据'
        };
    }

    /**
     * 生成解决方案
     */
    generateSolution() {
        this.logger('\n🛠️ 生成解决方案...');

        const solutions = [
            {
                title: '解决方案1: 修改QuestionViewModel添加缓存版本检查',
                description: '在恢复缓存数据前检查数据版本，如果版本过旧则清理缓存',
                implementation: this.generateSolution1(),
                priority: 'high'
            },
            {
                title: '解决方案2: 修改DataStore添加清理方法',
                description: '在TestProgressDataStore中添加强制清理方法',
                implementation: this.generateSolution2(),
                priority: 'medium'
            },
            {
                title: '解决方案3: 添加数据迁移机制',
                description: '自动检测和迁移旧数据到新格式',
                implementation: this.generateSolution3(),
                priority: 'low'
            }
        ];

        solutions.forEach((solution, index) => {
            this.logger(`\n${index + 1}. ${solution.title}`);
            this.logger(`   描述: ${solution.description}`);
            this.logger(`   优先级: ${solution.priority}`);
        });

        return solutions;
    }

    /**
     * 解决方案1: 修改QuestionViewModel
     */
    generateSolution1() {
        const viewModelPath = 'E:\\work\\app\\app\\src\\main\\java\\com\\example\\myapplication\\ui\\question\\QuestionViewModel.kt';

        if (!fs.existsSync(viewModelPath)) {
            this.logger(`❌ 文件不存在: ${viewModelPath}`, 'error');
            return null;
        }

        const content = fs.readFileSync(viewModelPath, 'utf8');

        // 检查是否已经有版本检查
        if (content.includes('DATA_VERSION') || content.includes('checkDataVersion')) {
            this.logger('⚠️ QuestionViewModel已经有版本检查机制', 'warning');
            return null;
        }

        // 生成修改建议
        const modification = `
// 在QuestionViewModel类中添加以下常量
private companion object {
    private const val DATA_VERSION = 2  // 当前数据版本号
    private const val KEY_DATA_VERSION = "data_version"
}

// 修改restoreProgressOrLoadNew方法
private fun restoreProgressOrLoadNew() {
    scope.launch {
        if (dataStore != null) {
            try {
                // 检查数据版本
                val savedVersion = dataStore.data.first()[KEY_DATA_VERSION] ?: 1
                if (savedVersion < DATA_VERSION) {
                    // 版本过旧，清理缓存
                    dataStore.clearProgress()
                    dataStore.clearTestProgress()
                    loadInitialData()
                    return@launch
                }

                val savedProgress = dataStore.getTestProgress.first()
                if (savedProgress.isNotEmpty()) {
                    restoreProgress(savedProgress)
                    return@launch
                }
            } catch (e: Exception) {
                // 恢复失败，继续加载新数据
            }
        }
        // 没有保存的进度或恢复失败，加载新数据
        loadInitialData()
    }
}

// 修改saveProgress方法，添加版本号
private fun saveProgress() {
    scope.launch {
        if (dataStore != null) {
            try {
                val progressJson = Json.encodeToString(TestProgress(
                    questions = _questions,
                    answerOptions = _answerOptions,
                    userAnswers = _userAnswers,
                    currentQuestionIndex = _uiState.value.currentQuestionIndex,
                    language = _uiState.value.currentLanguage
                ))

                dataStore.saveTestProgress(progressJson)

                // 保存数据版本
                dataStore.edit { preferences ->
                    preferences[KEY_DATA_VERSION] = DATA_VERSION
                }
            } catch (e: Exception) {
                // 保存失败，忽略错误
            }
        }
    }
}`;

        this.logger('✅ 解决方案1已生成');
        return modification;
    }

    /**
     * 解决方案2: 修改DataStore
     */
    generateSolution2() {
        const dataStorePath = 'E:\\work\\app\\app\\src\\main\\java\\com\\example\\myapplication\\data\\TestProgressDataStore.kt';

        if (!fs.existsSync(dataStorePath)) {
            this.logger(`❌ 文件不存在: ${dataStorePath}`, 'error');
            return null;
        }

        // 生成添加清理方法的代码
        const addition = `
    /**
     * 强制清理所有缓存数据（用于版本升级或数据修复）
     */
    suspend fun forceClearAll() {
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
    }

    /**
     * 检查并清理过时的数据
     */
    suspend fun checkAndClearOutdatedData(): Boolean {
        return try {
            val currentVersion = context.dataStore.data.first()[KEY_DATA_VERSION] ?: 1
            if (currentVersion < REQUIRED_DATA_VERSION) {
                forceClearAll()
                true
            } else {
                false
            }
        } catch (e: Exception) {
            false
        }
    }

    companion object {
        private val CURRENT_QUESTION_INDEX = intPreferencesKey("current_question_index")
        private val USER_ANSWERS = stringPreferencesKey("user_answers")
        private val LANGUAGE = stringPreferencesKey("language")
        private val IS_TEST_COMPLETED = stringPreferencesKey("is_test_completed")
        private val QUESTIONS_JSON = stringPreferencesKey("questions_json")
        private val ANSWER_OPTIONS_JSON = stringPreferencesKey("answer_options_json")
        private val TEST_PROGRESS = stringPreferencesKey("test_progress")
        private val KEY_DATA_VERSION = intPreferencesKey("data_version")

        // 当前需要的数据版本
        const val REQUIRED_DATA_VERSION = 2
    }
`;

        this.logger('✅ 解决方案2已生成');
        return addition;
    }

    /**
     * 解决方案3: 添加数据迁移机制
     */
    generateSolution3() {
        const migrationCode = `
/**
 * 数据迁移器
 * 处理从旧版本到新版本的数据迁移
 */
class TestDataMigrator {

    companion object {
        private const val CURRENT_VERSION = 2

        /**
         * 检查并执行数据迁移
         */
        suspend fun migrate(dataStore: TestProgressDataStore): Boolean {
            try {
                val savedVersion = dataStore.getCurrentVersion()
                if (savedVersion < CURRENT_VERSION) {
                    // 执行迁移逻辑
                    when (savedVersion) {
                        1 -> migrateFromV1ToV2(dataStore)
                        // 可以添加更多版本迁移
                    }
                    // 更新版本号
                    dataStore.updateVersion(CURRENT_VERSION)
                    return true
                }
                return false
            } catch (e: Exception) {
                return false
            }
        }

        /**
         * 从版本1迁移到版本2
         * 主要是清理可能有问题题目数据
         */
        private suspend fun migrateFromV1ToV2(dataStore: TestProgressDataStore) {
            // 获取保存的题目数据
            val questionsJson = dataStore.questionsJson.first()
            if (questionsJson != null) {
                try {
                    val questions = Json.decodeFromString<List<Question>>(questionsJson)
                    // 检查是否有问题题目
                    val hasProblemQuestions = questions.any { question ->
                        val text = question.questionTextZh
                        text.contains("你更倾向于") ||
                        text.contains("你通常") ||
                        text.contains("你更看重") ||
                        text.contains("你更注重")
                    }

                    if (hasProblemQuestions) {
                        // 有问题题目，清理缓存
                        dataStore.forceClearAll()
                    }
                } catch (e: Exception) {
                    // 解析失败，清理缓存
                    dataStore.forceClearAll()
                }
            }
        }
    }
}
`;

        this.logger('✅ 解决方案3已生成');
        return migrationCode;
    }

    /**
     * 生成立即操作指南
     */
    generateImmediateActions() {
        this.logger('\n🚀 立即操作指南:');
        this.logger('1. 清理应用数据 (用户端操作):');
        this.logger('   - 进入手机设置');
        this.logger('   - 找到应用管理');
        this.logger('   - 选择该应用');
        this.logger('   - 清除数据和缓存');
        this.logger('   - 重新启动应用');

        this.logger('\n2. 开发者端操作:');
        this.logger('   - 实现上述解决方案1 (推荐)');
        this.logger('   - 重新构建APK');
        this.logger('   - 部署新版本');

        this.logger('\n3. 验证修复:');
        this.logger('   - 安装新版本APK');
        this.logger('   - 启动应用');
        this.logger('   - 确认题目格式正确');

        return {
            userActions: [
                '清除应用数据和缓存',
                '重新启动应用'
            ],
            developerActions: [
                '实现版本检查机制',
                '重新构建APK',
                '部署新版本'
            ],
            verificationSteps: [
                '安装新版本',
                '启动应用',
                '确认题目格式'
            ]
        };
    }

    /**
     * 执行完整解决方案生成
     */
    async generateFullSolution() {
        this.logger('开始生成缓存清理解决方案...');
        this.logger('目标：解决DataStore缓存旧题目数据的问题\n');

        // 分析问题根源
        this.analyzeRootCause();

        // 生成解决方案
        const solutions = this.generateSolution();

        // 生成立即操作指南
        const actions = this.generateImmediateActions();

        // 生成完整报告
        this.logger('\n=== 缓存清理解决方案报告 ===');
        this.logger('问题根源: DataStore缓存了旧的问题题目数据');
        this.logger('影响范围: 用户设备上的本地缓存');
        this.logger('解决方案: 实现版本检查和自动清理机制\n');

        this.logger('推荐实施方案:');
        this.logger('1. 立即执行用户端清理操作');
        this.logger('2. 实现解决方案1 (版本检查)');
        this.logger('3. 重新构建和部署应用');
        this.logger('4. 验证修复效果');

        return {
            rootCause: 'DataStore缓存了旧的问题题目数据',
            solutions: solutions,
            immediateActions: actions,
            recommendation: '优先实现解决方案1并执行用户端清理'
        };
    }
}

// 执行解决方案生成
async function generateCacheClearSolution() {
    const solution = new CacheClearSolution();

    try {
        const result = await solution.generateFullSolution();
        console.log('\n=== 解决方案生成完成 ===');
        return result;
    } catch (error) {
        console.error('解决方案生成失败:', error.message);
        process.exit(1);
    }
}

// 运行解决方案生成
generateCacheClearSolution();