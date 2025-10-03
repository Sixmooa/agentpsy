// 用户相关功能的JavaScript代码

// 页面加载时检查用户状态
window.onload = function() {
    checkUserStatus();
    loadAnsweredQuestions();
};

// 检查用户状态
function checkUserStatus() {
    // 向后端发送请求检查用户登录状态
    fetch('/user/status')
    .then(response => response.json())
    .then(data => {
        if (data.logged_in) {
            document.getElementById('user-status').textContent = '已登录用户';
            document.getElementById('history-btn').style.display = 'inline-block';
        } else {
            document.getElementById('user-status').textContent = '临时用户';
            document.getElementById('history-btn').style.display = 'none';
        }
    })
    .catch(error => {
        console.error('检查用户状态失败:', error);
    });
}

// 加载已回答的问题
function loadAnsweredQuestions() {
    // 向后端发送请求获取已回答的问题
    fetch('/user/answered_questions')
    .then(response => response.json())
    .then(data => {
        if (data.success && data.answers) {
            for (const [questionId, answer] of Object.entries(data.answers)) {
                const radio = document.querySelector(`input[name="q${questionId}"][value="${answer}"]`);
                if (radio) {
                    radio.checked = true;
                }
            }
        }
    })
    .catch(error => {
        console.error('加载已回答问题失败:', error);
    });
}

// 登录按钮事件
document.getElementById('login-btn').addEventListener('click', function() {
    document.getElementById('login-modal').style.display = 'block';
});

// 关闭登录模态框
document.getElementById('close-login-modal').addEventListener('click', function() {
    document.getElementById('login-modal').style.display = 'none';
});

// 微信登录按钮事件
document.getElementById('wechat-login-btn').addEventListener('click', function() {
    // 实际项目中需要调用微信SDK进行授权
    alert('微信登录功能已触发，请在微信中完成授权');
    
    // 显示微信授权引导
    alert('为了方便您下次查看测试结果和历史记录，请授权登录');
});

// 手机号登录按钮事件
document.getElementById('phone-login-btn').addEventListener('click', function() {
    const phone = document.getElementById('phone-input').value;
    if (!phone) {
        alert('请输入手机号');
        return;
    }
    
    // 向后端发送请求进行手机号登录
    fetch('/user/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({type: 'phone', phone: phone})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            document.getElementById('login-modal').style.display = 'none';
            checkUserStatus();
            alert('登录成功');
        } else {
            alert('登录失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('登录失败:', error);
        alert('登录失败，请重试');
    });
});

// 手机号注册按钮事件
document.getElementById('phone-register-btn').addEventListener('click', function() {
    const phone = document.getElementById('phone-input').value;
    if (!phone) {
        alert('请输入手机号');
        return;
    }
    
    // 向后端发送请求进行手机号注册
    fetch('/user/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({phone: phone})
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('网络响应错误');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            document.getElementById('login-modal').style.display = 'none';
            checkUserStatus();
            alert('注册成功并已自动登录');
        } else {
            alert('注册失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('注册失败:', error);
        alert('注册失败，请重试');
    });
});

// 历史记录按钮事件
document.getElementById('history-btn').addEventListener('click', function() {
    loadHistory();
    document.getElementById('history-modal').style.display = 'block';
});

// 关闭历史记录模态框
document.getElementById('close-history-modal').addEventListener('click', function() {
    document.getElementById('history-modal').style.display = 'none';
});

// 加载历史记录
function loadHistory() {
    // 向后端发送请求获取历史记录
    fetch('/user/history')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const historyList = document.getElementById('history-list');
            historyList.innerHTML = '';
            
            data.history.forEach(item => {
                const div = document.createElement('div');
                div.style.padding = '10px';
                div.style.borderBottom = '1px solid #eee';
                div.innerHTML = `
                    <div><strong>类型:</strong> ${item.mbti_type}</div>
                    <div><strong>时间:</strong> ${item.created_at}</div>
                    <button onclick="viewResult(${item.id})" style="margin-top: 5px; background-color: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">查看结果</button>
                `;
                historyList.appendChild(div);
            });
        } else {
            alert('获取历史记录失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('获取历史记录失败:', error);
        alert('获取历史记录失败，请重试');
    });
}

// 查看历史结果
function viewResult(resultId) {
    // 向后端发送请求获取历史结果
    fetch(`/user/result/${resultId}`)
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // 显示历史结果
            displayResults(data.result);
            document.getElementById('history-modal').style.display = 'none';
        } else {
            alert('获取结果失败: ' + data.message);
        }
    })
    .catch(error => {
        console.error('获取结果失败:', error);
        alert('获取结果失败，请重试');
    });
}