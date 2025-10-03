/**
 * 主应用程序模块
 * 协调各个模块，处理用户交互和页面渲染
 */

class PersonalityTestApp {
    constructor() {
        this.calculator = new PersonalityCalculator();
        this.storage = new StorageManager();
        this.imageGenerator = new ImageGenerator();
        
        this.currentLanguage = 'en';
        this.answers = {};
        this.currentResult = null;
        
        this.init();
    }

    /**
     * 初始化应用
     */
    init() {
        // 加载用户设置
        this.loadSettings();
        
        // 渲染问题
        this.renderQuestions();
        
        // 绑定事件
        this.bindEvents();
        
        // 更新进度
        this.updateProgress();
        
        // 检查是否有保存的答案
        this.loadSavedAnswers();
    }

    /**
     * 加载用户设置
     */
    loadSettings() {
        const settings = this.storage.getSettings();
        this.currentLanguage = settings.language || 'en';
        this.updateLanguage();
    }

    /**
     * 渲染测试问题
     */
    renderQuestions() {
        const questions = this.getCurrentQuestions();
        const container = document.getElementById('questions-container');
        const answerOptions = ANSWER_OPTIONS[this.currentLanguage];
        
        container.innerHTML = '';
        
        questions.forEach(question => {
            const questionDiv = document.createElement('div');
            questionDiv.className = 'question-card';
            questionDiv.innerHTML = `
                <div class="question-number">${this.currentLanguage === 'en' ? 'Question' : '问题'} ${question.id}</div>
                <div class="question-text">${question.text}</div>
                <div class="answer-options">
                    ${answerOptions.map(option => `
                        <div class="answer-option">
                            <input type="radio" id="q${question.id}_${option.value}" 
                                   name="q${question.id}" value="${option.value}"
                                   data-question-id="${question.id}">
                            <label for="q${question.id}_${option.value}">${option.text}</label>
                        </div>
                    `).join('')}
                </div>
            `;
            
            container.appendChild(questionDiv);
        });
    }

    /**
     * 获取当前语言的问题列表
     * @returns {Array} 问题列表
     */
    getCurrentQuestions() {
        return this.currentLanguage === 'en' ? QUESTIONS_EN : QUESTIONS_ZH;
    }

    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 提交按钮
        const submitBtn = document.getElementById('submit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitTest());
        }

        // 语言切换按钮
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) {
            langBtn.addEventListener('click', () => this.switchLanguage());
        }

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.submitTest();
            }
        });

        // 页面离开前保存答案
        window.addEventListener('beforeunload', () => {
            this.saveAnswersToLocal();
        });

        // 绑定答案选择事件
        this.bindAnswerEvents();
    }

    /**
     * 绑定答案选择事件
     */
    bindAnswerEvents() {
        // 使用事件委托处理radio按钮变化
        document.addEventListener('change', (e) => {
            if (e.target.type === 'radio' && e.target.dataset.questionId) {
                const questionId = parseInt(e.target.dataset.questionId);
                const answer = parseInt(e.target.value);
                this.onAnswerChange(questionId, answer);
            }
        });
    }

    /**
     * 答案改变事件处理
     * @param {number} questionId - 问题ID
     * @param {number} answer - 答案值
     */
    onAnswerChange(questionId, answer) {
        this.answers[questionId] = answer;
        this.updateProgress();
        this.saveAnswersToLocal();
    }

    /**
     * 更新进度显示
     */
    updateProgress() {
        const questions = this.getCurrentQuestions();
        const progress = this.calculator.getProgress(this.answers, questions);
        
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        const submitBtn = document.getElementById('submit-btn');
        
        if (progressFill) {
            progressFill.style.width = `${progress.percentage}%`;
        }
        
        if (progressText) {
            const text = this.currentLanguage === 'en' ? 
                `Progress: ${progress.answered}/${progress.total}` : 
                `进度: ${progress.answered}/${progress.total}`;
            progressText.textContent = text;
        }
        
        if (submitBtn) {
            submitBtn.disabled = !progress.isComplete;
        }
    }

    /**
     * 提交测试
     */
    async submitTest() {
        const questions = this.getCurrentQuestions();
        
        // 验证答案完整性
        if (!this.calculator.validateAnswers(this.answers, questions)) {
            alert(this.currentLanguage === 'en' ? 
                'Please answer all questions before submitting.' : 
                '请回答所有问题后再提交。');
            return;
        }

        // 显示加载动画
        this.showLoading();

        try {
            // 模拟处理时间
            await this.delay(2000);
            
            // 生成分析报告
            const result = this.calculator.generateReport(this.answers, questions, this.currentLanguage);
            this.currentResult = result;
            
            // 保存结果
            if (this.storage.getSettings().autoSave) {
                this.storage.saveResult(result);
            }
            
            // 显示结果
            this.showResults(result);
            
        } catch (error) {
            console.error('Failed to submit test:', error);
            alert(this.currentLanguage === 'en' ? 
                'An error occurred while processing your test. Please try again.' : 
                '处理测试时发生错误，请重试。');
        } finally {
            this.hideLoading();
        }
    }

    /**
     * 显示加载动画
     */
    showLoading() {
        document.getElementById('test-section').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';
        document.getElementById('loading-section').style.display = 'block';
    }

    /**
     * 隐藏加载动画
     */
    hideLoading() {
        document.getElementById('loading-section').style.display = 'none';
    }

    /**
     * 显示测试结果
     * @param {Object} result - 测试结果
     */
    showResults(result) {
        // 隐藏测试部分
        document.getElementById('test-section').style.display = 'none';
        document.getElementById('progress-container').style.display = 'none';
        
        // 显示结果部分
        document.getElementById('results-section').style.display = 'block';
        
        // 渲染MBTI结果
        this.renderMBTIResult(result.mbtiResult);
        
        // 渲染MBTI类型网格
        this.renderMBTITypeGrid(result.mbtiResult.typeCode);
        
        // 渲染大五人格得分
        this.renderBigFiveScores(result.bigFiveScores);
        
        // 渲染贝尔宾角色
        this.renderBelbinRoles(result.belbinRoles);
        
        // 渲染职业建议
        this.renderCareerSuggestions(result.careerSuggestions);
        
        // 滚动到结果区域
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * 渲染MBTI结果
     * @param {Object} mbtiResult - MBTI结果
     */
    renderMBTIResult(mbtiResult) {
        const typeElement = document.getElementById('mbti-type');
        const nameElement = document.getElementById('mbti-name');
        const descElement = document.getElementById('mbti-description');
        
        if (typeElement) typeElement.textContent = mbtiResult.typeCode;
        if (nameElement) {
            const name = this.currentLanguage === 'en' ? mbtiResult.nameEn : mbtiResult.name;
            nameElement.innerHTML = `${name} <a href="mbti-type.html?type=${mbtiResult.typeCode}" style="color: #fff; text-decoration: underline; margin-left: 10px;">${this.currentLanguage === 'en' ? 'Learn More' : '了解更多'}</a>`;
        }
        if (descElement) {
            const desc = this.currentLanguage === 'en' ? mbtiResult.descriptionEn : mbtiResult.description;
            descElement.textContent = desc;
        }
    }

    /**
     * 渲染MBTI类型网格
     * @param {string} currentType - 当前用户的MBTI类型
     */
    renderMBTITypeGrid(currentType = null) {
        const container = document.getElementById('mbti-type-grid');
        if (!container) return;

        container.innerHTML = '';
        
        // Get all unique base types (without -A/-T)
        const allTypes = Object.keys(MBTI_DETAILS);
        const baseTypes = [...new Set(allTypes.map(type => type.split('-')[0]))];
        
        baseTypes.forEach(baseType => {
            const button = document.createElement('a');
            button.className = 'mbti-type-button';
            button.href = `mbti-type.html?type=${baseType}-A`;
            button.textContent = baseType;
            
            // Highlight current user's type
            if (currentType && currentType.startsWith(baseType)) {
                button.classList.add('current');
            }
            
            container.appendChild(button);
        });
    }

    /**
     * 渲染大五人格得分
     * @param {Object} scores - 得分
     */
    renderBigFiveScores(scores) {
        const container = document.getElementById('dimension-scores');
        if (!container) return;
        
        const dimensions = DIMENSIONS[this.currentLanguage];
        container.innerHTML = '';
        
        Object.entries(scores).forEach(([dimension, score]) => {
            const dimensionDiv = document.createElement('div');
            dimensionDiv.className = 'dimension-item';
            
            const percentage = (score / 5) * 100;
            
            dimensionDiv.innerHTML = `
                <div class="dimension-name">${dimensions[dimension]}</div>
                <div class="dimension-score-bar">
                    <div class="dimension-score-fill" style="width: ${percentage}%"></div>
                </div>
                <div class="dimension-description">${score.toFixed(1)} / 5.0</div>
            `;
            
            container.appendChild(dimensionDiv);
        });
    }

    /**
     * 渲染贝尔宾角色
     * @param {Array} roles - 贝尔宾角色
     */
    renderBelbinRoles(roles) {
        const container = document.getElementById('belbin-roles');
        if (!container) return;
        
        container.innerHTML = '';
        
        roles.forEach(role => {
            const roleDiv = document.createElement('div');
            roleDiv.className = 'belbin-role';
            
            const name = this.currentLanguage === 'en' ? role.nameEn : role.name;
            const description = this.currentLanguage === 'en' ? role.descriptionEn : role.description;
            const characteristics = this.currentLanguage === 'en' ? role.characteristicsEn : role.characteristics;
            
            roleDiv.innerHTML = `
                <h4>${name}</h4>
                <p><strong>${this.currentLanguage === 'en' ? 'Description:' : '描述：'}</strong> ${description}</p>
                <p><strong>${this.currentLanguage === 'en' ? 'Characteristics:' : '特征：'}</strong> ${characteristics}</p>
            `;
            
            container.appendChild(roleDiv);
        });
    }

    /**
     * 渲染职业建议
     * @param {Array} careers - 职业建议
     */
    renderCareerSuggestions(careers) {
        const container = document.getElementById('career-suggestions');
        if (!container) return;
        
        container.innerHTML = `
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
                ${careers.map(career => `
                    <span style="background-color: var(--warning-color); color: white; 
                                 padding: 8px 16px; border-radius: 20px; font-size: 14px;">
                        ${career}
                    </span>
                `).join('')}
            </div>
        `;
    }

    /**
     * 切换语言
     */
    switchLanguage() {
        this.currentLanguage = this.currentLanguage === 'zh' ? 'en' : 'zh';
        
        // 保存语言设置
        const settings = this.storage.getSettings();
        settings.language = this.currentLanguage;
        this.storage.saveSettings(settings);
        
        // 更新界面
        this.updateLanguage();
        this.renderQuestions();
        this.restoreAnswers();
        this.updateProgress();
        
        // 更新按钮文本
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) {
            langBtn.textContent = this.currentLanguage === 'en' ? '中文' : 'English';
        }
    }

    /**
     * 更新语言界面
     */
    updateLanguage() {
        const texts = TEXTS[this.currentLanguage];
        
        // 更新文本
        const elements = {
            'main-title': texts.title,
            'main-subtitle': texts.subtitle,
            'submit-text': texts.submitBtn,
            'loading-text': texts.loadingText,
            'dimensions-title': texts.dimensionsTitle,
            'belbin-title': texts.belbinTitle,
            'career-title': texts.careerTitle,
            'generate-img-btn': texts.generateImgBtn,
            'save-result-btn': texts.saveResultBtn,
            'restart-btn': texts.restartBtn
        };
        
        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });
        
        // 单独更新语言按钮文本
        const langBtn = document.getElementById('lang-btn');
        if (langBtn) {
            langBtn.textContent = this.currentLanguage === 'en' ? '中文' : 'English';
        }
    }

    /**
     * 生成分享图片
     */
    async generateImage() {
        if (!this.currentResult) {
            alert(this.currentLanguage === 'en' ? 
                'No test result available.' : 
                '没有可用的测试结果。');
            return;
        }

        try {
            const imageData = this.imageGenerator.generateResultImage(this.currentResult, this.currentLanguage);
            
            // 显示预览或下载选项
            const action = confirm(this.currentLanguage === 'en' ? 
                'Image generated successfully! Click OK to download, Cancel to share.' : 
                '图片生成成功！点击确定下载，取消分享。');
            
            if (action) {
                this.imageGenerator.downloadImage(imageData);
            } else {
                await this.imageGenerator.shareImage(imageData);
            }
        } catch (error) {
            console.error('Failed to generate image:', error);
            alert(this.currentLanguage === 'en' ? 
                'Failed to generate image. Please try again.' : 
                '生成图片失败，请重试。');
        }
    }

    /**
     * 保存测试结果
     */
    saveResult() {
        if (!this.currentResult) {
            alert(this.currentLanguage === 'en' ? 
                'No test result to save.' : 
                '没有要保存的测试结果。');
            return;
        }

        const success = this.storage.saveResult(this.currentResult);
        
        if (success) {
            alert(this.currentLanguage === 'en' ? 
                'Result saved successfully!' : 
                '结果保存成功！');
        } else {
            alert(this.currentLanguage === 'en' ? 
                'Failed to save result. Storage may not be available.' : 
                '保存结果失败，存储可能不可用。');
        }
    }

    /**
     * 重新开始测试
     */
    restartTest() {
        const confirm = window.confirm(this.currentLanguage === 'en' ? 
            'Are you sure you want to restart the test? All current answers will be lost.' : 
            '确定要重新开始测试吗？当前所有答案将丢失。');
        
        if (confirm) {
            // 清空答案
            this.answers = {};
            this.currentResult = null;
            
            // 清空本地保存的答案
            this.clearSavedAnswers();
            
            // 重置界面
            document.getElementById('results-section').style.display = 'none';
            document.getElementById('test-section').style.display = 'block';
            document.getElementById('progress-container').style.display = 'block';
            
            // 清空选择
            document.querySelectorAll('input[type="radio"]').forEach(input => {
                input.checked = false;
            });
            
            // 更新进度
            this.updateProgress();
            
            // 滚动到顶部
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    /**
     * 保存答案到本地存储
     */
    saveAnswersToLocal() {
        try {
            localStorage.setItem('personality_test_current_answers', JSON.stringify(this.answers));
        } catch (error) {
            console.warn('Failed to save answers to local storage:', error);
        }
    }

    /**
     * 加载保存的答案
     */
    loadSavedAnswers() {
        try {
            const saved = localStorage.getItem('personality_test_current_answers');
            if (saved) {
                this.answers = JSON.parse(saved);
                this.restoreAnswers();
                this.updateProgress();
            }
        } catch (error) {
            console.warn('Failed to load saved answers:', error);
        }
    }

    /**
     * 恢复答案到界面
     */
    restoreAnswers() {
        Object.entries(this.answers).forEach(([questionId, answer]) => {
            const input = document.querySelector(`input[name="q${questionId}"][value="${answer}"]`);
            if (input) {
                input.checked = true;
            }
        });
    }

    /**
     * 清空保存的答案
     */
    clearSavedAnswers() {
        try {
            localStorage.removeItem('personality_test_current_answers');
        } catch (error) {
            console.warn('Failed to clear saved answers:', error);
        }
    }

    /**
     * 延迟函数
     * @param {number} ms - 毫秒数
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 获取测试历史
     * @returns {Array} 历史记录
     */
    getTestHistory() {
        return this.storage.getAllResults();
    }

    /**
     * 获取统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        return this.storage.getStatistics();
    }
}

// 全局变量和函数
let app;

// 页面加载完成后初始化应用
document.addEventListener('DOMContentLoaded', () => {
    app = new PersonalityTestApp();
});

// 全局函数（供HTML调用）
function switchLanguage() {
    if (app) app.switchLanguage();
}

function generateImage() {
    if (app) app.generateImage();
}

function saveResult() {
    if (app) app.saveResult();
}

function restartTest() {
    if (app) app.restartTest();
}

function submitTest() {
    if (app) app.submitTest();
}