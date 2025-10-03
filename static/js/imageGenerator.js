/**
 * 图片生成模块
 * 使用Canvas API生成测试结果分享图片
 */

class ImageGenerator {
    constructor() {
        this.canvas = document.getElementById('result-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 800;
        this.height = 1300; // 增加高度以适应新的底部内容
        
        // 设置画布尺寸
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        
        // 颜色配置
        this.colors = {
            primary: '#3498db',
            secondary: '#2c3e50',
            success: '#27ae60',
            warning: '#f39c12',
            danger: '#e74c3c',
            light: '#ecf0f1',
            dark: '#34495e',
            white: '#ffffff',
            text: '#2c3e50'
        };
    }

    /**
     * 生成测试结果图片
     * @param {Object} result - 测试结果
     * @param {string} language - 语言
     * @returns {string} Base64图片数据
     */
    generateResultImage(result, language = 'zh') {
        // 清空画布
        this.clearCanvas();
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制标题
        this.drawTitle(language);
        
        // 绘制MBTI结果
        this.drawMBTIResult(result.mbtiResult, language, 120);
        
        // 绘制大五人格得分
        this.drawBigFiveScores(result.bigFiveScores, language, 320);
        
        // 绘制贝尔宾角色
        this.drawBelbinRoles(result.belbinRoles, language, 650);
        
        // 绘制职业建议
        this.drawCareerSuggestions(result.careerSuggestions, language, 950);
        
        // 绘制底部信息
        this.drawFooter(language);
        
        // 返回图片数据
        return this.canvas.toDataURL('image/png', 0.9);
    }

    /**
     * 清空画布
     */
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }

    /**
     * 绘制背景
     */
    drawBackground() {
        // 绘制渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#f8f9fa');
        gradient.addColorStop(1, '#e9ecef');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 绘制装饰性图案
        this.drawDecorationPattern();
    }

    /**
     * 绘制装饰图案
     */
    drawDecorationPattern() {
        this.ctx.save();
        this.ctx.globalAlpha = 0.1;
        this.ctx.fillStyle = this.colors.primary;
        
        // 绘制圆形装饰
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * this.width;
            const y = Math.random() * this.height;
            const radius = Math.random() * 30 + 10;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, radius, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }

    /**
     * 绘制标题
     * @param {string} language - 语言
     */
    drawTitle(language) {
        const title = language === 'en' ? 'Big Five Personality Test' : '大五人格测试';
        const subtitle = language === 'en' ? 'Personality Analysis Report' : '性格分析报告';
        
        // 主标题
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(title, this.width / 2, 50);
        
        // 副标题
        this.ctx.fillStyle = this.colors.secondary;
        this.ctx.font = '24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.fillText(subtitle, this.width / 2, 85);
    }

    /**
     * 绘制MBTI结果
     * @param {Object} mbtiResult - MBTI结果
     * @param {string} language - 语言
     * @param {number} y - Y坐标
     */
    drawMBTIResult(mbtiResult, language, y) {
        // 绘制背景卡片
        this.drawCard(50, y, this.width - 100, 160, this.colors.primary);
        
        // MBTI类型
        this.ctx.fillStyle = this.colors.white;
        this.ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(mbtiResult.typeCode, this.width / 2, y + 60);
        
        // 类型名称
        const typeName = language === 'en' ? mbtiResult.nameEn : mbtiResult.name;
        this.ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.fillText(typeName, this.width / 2, y + 100);
        
        // 描述
        const description = language === 'en' ? mbtiResult.descriptionEn : mbtiResult.description;
        this.ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.drawWrappedText(description, this.width / 2, y + 130, this.width - 120);
    }

    /**
     * 绘制大五人格得分
     * @param {Object} scores - 得分
     * @param {string} language - 语言
     * @param {number} y - Y坐标
     */
    drawBigFiveScores(scores, language, y) {
        const title = language === 'en' ? 'Big Five Dimensions' : '五大人格维度';
        
        // 标题
        this.ctx.fillStyle = this.colors.secondary;
        this.ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, 70, y);
        
        const dimensions = Object.keys(scores);
        const itemHeight = 50;
        
        dimensions.forEach((dimension, index) => {
            const itemY = y + 40 + (index * itemHeight);
            const score = scores[dimension];
            const dimensionName = DIMENSIONS[language][dimension];
            
            // 维度名称
            this.ctx.fillStyle = this.colors.text;
            this.ctx.font = '18px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            this.ctx.fillText(`${dimensionName}: ${score.toFixed(1)}`, 70, itemY);
            
            // 进度条背景
            const barX = 300;
            const barY = itemY - 15;
            const barWidth = 400;
            const barHeight = 20;
            
            this.ctx.fillStyle = '#e9ecef';
            this.ctx.fillRect(barX, barY, barWidth, barHeight);
            
            // 进度条填充
            const fillWidth = (score / 5) * barWidth;
            const gradient = this.ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
            gradient.addColorStop(0, this.colors.primary);
            gradient.addColorStop(1, this.colors.success);
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(barX, barY, fillWidth, barHeight);
        });
    }

    /**
     * 绘制贝尔宾角色
     * @param {Array} roles - 贝尔宾角色
     * @param {string} language - 语言
     * @param {number} y - Y坐标
     */
    drawBelbinRoles(roles, language, y) {
        const title = language === 'en' ? 'Belbin Team Roles' : '贝尔宾团队角色';
        
        // 标题
        this.ctx.fillStyle = this.colors.secondary;
        this.ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, 70, y);
        
        roles.slice(0, 3).forEach((role, index) => {
            const itemY = y + 40 + (index * 80);
            
            // 角色卡片
            this.drawCard(70, itemY - 30, this.width - 140, 70, this.colors.light);
            
            // 角色名称
            const roleName = language === 'en' ? role.nameEn : role.name;
            this.ctx.fillStyle = this.colors.secondary;
            this.ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            this.ctx.fillText(roleName, 90, itemY - 5);
            
            // 角色描述
            const roleDesc = language === 'en' ? role.descriptionEn : role.description;
            this.ctx.fillStyle = this.colors.text;
            this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            this.drawWrappedText(roleDesc, 90, itemY + 20, this.width - 180);
        });
    }

    /**
     * 绘制职业建议
     * @param {Array} careers - 职业建议
     * @param {string} language - 语言
     * @param {number} y - Y坐标
     */
    drawCareerSuggestions(careers, language, y) {
        const title = language === 'en' ? 'Career Suggestions' : '职业建议';
        
        // 标题
        this.ctx.fillStyle = this.colors.secondary;
        this.ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(title, 70, y);
        
        // 职业标签
        const itemsPerRow = 3;
        const itemWidth = 200;
        const itemHeight = 40;
        const startX = 70;
        
        careers.slice(0, 9).forEach((career, index) => {
            const row = Math.floor(index / itemsPerRow);
            const col = index % itemsPerRow;
            const x = startX + (col * (itemWidth + 20));
            const itemY = y + 40 + (row * (itemHeight + 10));
            
            // 职业标签背景
            this.ctx.fillStyle = this.colors.warning;
            this.ctx.fillRect(x, itemY - 25, itemWidth, 30);
            
            // 职业文本
            this.ctx.fillStyle = this.colors.white;
            this.ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(career, x + itemWidth / 2, itemY - 5);
        });
    }

    /**
     * 绘制底部信息
     * @param {string} language - 语言
     */
    drawFooter(language) {
        const y = this.height - 80;
        
        // AgentPsy.com AI人格实验室说明
        const agentPsyText = language === 'en' ? 
            'AgentPsy.com AI Personality Lab' : 
            'AgentPsy.com AI人格实验室';
            
        const questionText = language === 'en' ? 
            'Want to know the LLM that best matches you and generate the most suitable Agent for you?' : 
            '想知道最匹配你的LLM和生成最适合您的Agent吗？';
            
        const websiteText = 'Visit: AgentPsy.com';
        
        this.ctx.fillStyle = this.colors.primary;
        this.ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(agentPsyText, this.width / 2, y);
        
        this.ctx.fillStyle = this.colors.secondary;
        this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.fillText(questionText, this.width / 2, y + 25);
        
        this.ctx.fillStyle = this.colors.success;
        this.ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.fillText(websiteText, this.width / 2, y + 45);
        
        // 分隔线
        this.ctx.strokeStyle = this.colors.border || '#dee2e6';
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(50, y + 60);
        this.ctx.lineTo(this.width - 50, y + 60);
        this.ctx.stroke();
        
        // 时间戳和原始生成信息
        const footerY = y + 80;
        const generatedText = language === 'en' ? 
            'Generated by Big Five Personality Test' : 
            '由大五人格测试生成';
            
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
        this.ctx.fillText(generatedText, this.width / 2, footerY);
        
        const timestamp = new Date().toLocaleDateString(language === 'en' ? 'en-US' : 'zh-CN');
        this.ctx.fillText(timestamp, this.width / 2, footerY + 15);
    }

    /**
     * 绘制卡片背景
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {string} color - 颜色
     */
    drawCard(x, y, width, height, color) {
        this.ctx.save();
        
        // 阴影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowOffsetY = 5;
        
        // 圆角矩形（兼容性实现）
        this.ctx.fillStyle = color;
        this.drawRoundedRect(x, y, width, height, 8);
        
        this.ctx.restore();
    }

    /**
     * 绘制换行文本
     * @param {string} text - 文本
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} maxWidth - 最大宽度
     */
    drawWrappedText(text, x, y, maxWidth) {
        const words = text.split('');
        let line = '';
        let currentY = y;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n];
            const metrics = this.ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                this.ctx.textAlign = 'center';
                this.ctx.fillText(line, x, currentY);
                line = words[n];
                currentY += 25;
            } else {
                line = testLine;
            }
        }
        
        this.ctx.textAlign = 'center';
        this.ctx.fillText(line, x, currentY);
    }

    /**
     * 下载图片
     * @param {string} dataUrl - 图片数据URL
     * @param {string} filename - 文件名
     */
    downloadImage(dataUrl, filename = 'personality-test-result.png') {
        const link = document.createElement('a');
        link.download = filename;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * 分享到社交媒体（如果支持Web Share API）
     * @param {string} dataUrl - 图片数据URL
     */
    async shareImage(dataUrl) {
        if (!navigator.share) {
            // 如果不支持Web Share API，则复制到剪贴板
            try {
                const blob = await this.dataURLToBlob(dataUrl);
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                alert('图片已复制到剪贴板');
            } catch (error) {
                console.error('Failed to copy image:', error);
                // 降级到下载
                this.downloadImage(dataUrl);
            }
            return;
        }

        try {
            const blob = await this.dataURLToBlob(dataUrl);
            const file = new File([blob], 'personality-test-result.png', { type: 'image/png' });
            
            await navigator.share({
                files: [file],
                title: '我的人格测试结果',
                text: '看看我的人格分析结果！'
            });
        } catch (error) {
            console.error('Failed to share:', error);
            this.downloadImage(dataUrl);
        }
    }

    /**
     * 绘制圆角矩形（兼容性实现）
     * @param {number} x - X坐标
     * @param {number} y - Y坐标
     * @param {number} width - 宽度
     * @param {number} height - 高度
     * @param {number} radius - 圆角半径
     */
    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * 将DataURL转换为Blob
     * @param {string} dataUrl - 数据URL
     * @returns {Promise<Blob>}
     */
    async dataURLToBlob(dataUrl) {
        const response = await fetch(dataUrl);
        return response.blob();
    }
}

// 导出到全局
if (typeof window !== 'undefined') {
    window.ImageGenerator = ImageGenerator;
} else if (typeof global !== 'undefined') {
    global.ImageGenerator = ImageGenerator;
}