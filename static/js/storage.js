/**
 * 本地存储管理模块
 * 处理测试结果的保存、读取和管理
 */

class StorageManager {
    constructor() {
        this.storageKey = 'personality_test_results';
        this.settingsKey = 'personality_test_settings';
    }

    /**
     * 检查本地存储是否可用
     * @returns {boolean}
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 保存测试结果
     * @param {Object} result - 测试结果
     * @returns {boolean} 是否保存成功
     */
    saveResult(result) {
        if (!this.isStorageAvailable()) {
            console.warn('Local storage is not available');
            return false;
        }

        try {
            const results = this.getAllResults();
            const newResult = {
                id: this.generateId(),
                ...result,
                savedAt: new Date().toISOString()
            };
            
            results.push(newResult);
            
            // 限制保存的结果数量（最多保存50个）
            if (results.length > 50) {
                results.splice(0, results.length - 50);
            }
            
            localStorage.setItem(this.storageKey, JSON.stringify(results));
            return true;
        } catch (error) {
            console.error('Failed to save result:', error);
            return false;
        }
    }

    /**
     * 获取所有测试结果
     * @returns {Array} 测试结果列表
     */
    getAllResults() {
        if (!this.isStorageAvailable()) {
            return [];
        }

        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load results:', error);
            return [];
        }
    }

    /**
     * 根据ID获取特定测试结果
     * @param {string} id - 结果ID
     * @returns {Object|null} 测试结果
     */
    getResultById(id) {
        const results = this.getAllResults();
        return results.find(result => result.id === id) || null;
    }

    /**
     * 删除特定测试结果
     * @param {string} id - 结果ID
     * @returns {boolean} 是否删除成功
     */
    deleteResult(id) {
        if (!this.isStorageAvailable()) {
            return false;
        }

        try {
            const results = this.getAllResults();
            const filteredResults = results.filter(result => result.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filteredResults));
            return true;
        } catch (error) {
            console.error('Failed to delete result:', error);
            return false;
        }
    }

    /**
     * 清空所有测试结果
     * @returns {boolean} 是否清空成功
     */
    clearAllResults() {
        if (!this.isStorageAvailable()) {
            return false;
        }

        try {
            localStorage.removeItem(this.storageKey);
            return true;
        } catch (error) {
            console.error('Failed to clear results:', error);
            return false;
        }
    }

    /**
     * 获取测试历史统计信息
     * @returns {Object} 统计信息
     */
    getStatistics() {
        const results = this.getAllResults();
        
        if (results.length === 0) {
            return {
                totalTests: 0,
                mostCommonType: null,
                typeDistribution: {},
                averageScores: null
            };
        }

        // 统计MBTI类型分布
        const typeDistribution = {};
        const scoreSum = {
            openness: 0,
            conscientiousness: 0,
            extraversion: 0,
            agreeableness: 0,
            neuroticism: 0
        };

        results.forEach(result => {
            const mbtiType = result.mbtiResult?.typeCode || result.mbtiResult?.type;
            if (mbtiType) {
                typeDistribution[mbtiType] = (typeDistribution[mbtiType] || 0) + 1;
            }

            // 累加分数
            if (result.bigFiveScores) {
                Object.keys(scoreSum).forEach(dimension => {
                    scoreSum[dimension] += result.bigFiveScores[dimension] || 0;
                });
            }
        });

        // 找出最常见的类型
        const mostCommonType = Object.keys(typeDistribution).reduce((a, b) => 
            typeDistribution[a] > typeDistribution[b] ? a : b
        );

        // 计算平均分数
        const averageScores = {};
        Object.keys(scoreSum).forEach(dimension => {
            averageScores[dimension] = Math.round((scoreSum[dimension] / results.length) * 100) / 100;
        });

        return {
            totalTests: results.length,
            mostCommonType,
            typeDistribution,
            averageScores
        };
    }

    /**
     * 保存用户设置
     * @param {Object} settings - 用户设置
     * @returns {boolean} 是否保存成功
     */
    saveSettings(settings) {
        if (!this.isStorageAvailable()) {
            return false;
        }

        try {
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Failed to save settings:', error);
            return false;
        }
    }

    /**
     * 获取用户设置
     * @returns {Object} 用户设置
     */
    getSettings() {
        if (!this.isStorageAvailable()) {
            return this.getDefaultSettings();
        }

        try {
            const data = localStorage.getItem(this.settingsKey);
            return data ? { ...this.getDefaultSettings(), ...JSON.parse(data) } : this.getDefaultSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            return this.getDefaultSettings();
        }
    }

    /**
     * 获取默认设置
     * @returns {Object} 默认设置
     */
    getDefaultSettings() {
        return {
            language: 'en',
            theme: 'light',
            autoSave: true,
            showProgress: true
        };
    }

    /**
     * 导出数据为JSON
     * @returns {string} JSON字符串
     */
    exportData() {
        const results = this.getAllResults();
        const settings = this.getSettings();
        
        return JSON.stringify({
            results,
            settings,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        }, null, 2);
    }

    /**
     * 从JSON导入数据
     * @param {string} jsonData - JSON数据
     * @returns {boolean} 是否导入成功
     */
    importData(jsonData) {
        if (!this.isStorageAvailable()) {
            return false;
        }

        try {
            const data = JSON.parse(jsonData);
            
            if (data.results && Array.isArray(data.results)) {
                localStorage.setItem(this.storageKey, JSON.stringify(data.results));
            }
            
            if (data.settings && typeof data.settings === 'object') {
                localStorage.setItem(this.settingsKey, JSON.stringify(data.settings));
            }
            
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }

    /**
     * 生成唯一ID
     * @returns {string} 唯一ID
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * 获取存储使用情况
     * @returns {Object} 存储信息
     */
    getStorageInfo() {
        if (!this.isStorageAvailable()) {
            return {
                available: false,
                used: 0,
                total: 0,
                percentage: 0
            };
        }

        try {
            let used = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    used += localStorage[key].length;
                }
            }

            // 估算总容量（通常为5MB，但可能因浏览器而异）
            const total = 5 * 1024 * 1024; // 5MB in bytes
            const percentage = Math.round((used / total) * 100);

            return {
                available: true,
                used,
                total,
                percentage
            };
        } catch (error) {
            console.error('Failed to get storage info:', error);
            return {
                available: false,
                used: 0,
                total: 0,
                percentage: 0
            };
        }
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
} else if (typeof global !== 'undefined') {
    global.StorageManager = StorageManager;
}