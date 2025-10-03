// 全局变量存储图片数据
let currentImageBase64 = null;

// 初始化分享功能
function initShareFunctionality() {
    // 生成图片按钮事件
    const generateBtn = document.getElementById('generate-image-btn');
    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            // 获取结果数据
            const mbtiType = document.getElementById('mbti-type').textContent;
            
            // 显示加载状态
            this.textContent = '生成中...';
            this.disabled = true;
            
            // 发送请求重新生成图片（实际项目中可能需要传递当前结果数据）
            fetch('/generate_image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'generate',
                    mbti_type: mbtiType
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.image_base64) {
                    // 保存图片数据
                    currentImageBase64 = data.image_base64;
                    
                    // 显示图片
                    const imageContainer = document.getElementById('image-container');
                    const resultImage = document.getElementById('result-image');
                    resultImage.src = 'data:image/png;base64,' + data.image_base64;
                    imageContainer.style.display = 'block';
                    
                    // 显示下载和分享按钮
                    document.getElementById('download-image-btn').style.display = 'inline-block';
                    document.getElementById('share-wechat-btn').style.display = 'inline-block';
                    
                    // 显示登录引导
                    const loginPrompt = document.getElementById('login-prompt');
                    if (loginPrompt) {
                        loginPrompt.style.display = 'block';
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('生成图片失败，请重试');
            })
            .finally(() => {
                // 恢复按钮状态
                this.textContent = '生成分享图片';
                this.disabled = false;
            });
        });
    }
    
    // 下载图片按钮事件
    const downloadBtn = document.getElementById('download-image-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (!currentImageBase64) {
                alert('请先生成图片');
                return;
            }
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = '人格测试结果.png';
            link.href = 'data:image/png;base64,' + currentImageBase64;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        });
    }
    
    // 微信分享按钮事件
    const shareBtn = document.getElementById('share-wechat-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', function() {
            if (!currentImageBase64) {
                alert('请先生成图片');
                return;
            }
            
            // 在实际应用中，这里需要调用微信JS-SDK进行分享
            // 由于这是一个简化示例，我们只显示提示信息
            alert('在微信中分享图片，请在手机上打开此页面并使用微信内置浏览器');
            
            // 模拟微信分享功能（实际项目中需要微信JS-SDK）
            /*
            if (typeof WeixinJSBridge !== "undefined") {
                // 微信浏览器中调用原生分享
                WeixinJSBridge.invoke('shareTimeline', {
                    "img_url": "data:image/png;base64," + currentImageBase64,
                    "img_width": "300",
                    "img_height": "300",
                    "link": window.location.href,
                    "desc": "我的人格测试结果",
                    "title": "人格测试结果"
                });
            } else {
                alert('请在微信中打开此页面进行分享');
            }
            */
        });
    }
}

// 页面加载完成后初始化分享功能
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareFunctionality);
} else {
    // DOM已经加载完成
    initShareFunctionality();
}