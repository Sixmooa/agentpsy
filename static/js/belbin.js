function displayBelbinResults(belbinReport, styledReport) {
    // 显示贝尔宾结果容器
    document.getElementById('belbin-results').style.display = 'block';
    
    // 显示个性化介绍
    if (styledReport && styledReport.introduction) {
        let introHtml = `<div style="background-color: #f0f8ff; border-radius: 8px; padding: 20px; margin-bottom: 20px; border-left: 4px solid #3498db;">
            <p style="color: #555; font-size: 16px; margin: 0;">${styledReport.introduction}</p>
        </div>`;
        document.getElementById('belbin-roles-container').insertAdjacentHTML('beforebegin', introHtml);
    }
    
    // 显示贝尔宾角色
    if (belbinReport.belbin_roles && belbinReport.belbin_roles.length > 0) {
        let rolesHtml = '<h4 style="color: #3498db; margin-bottom: 15px;">您的主要团队角色：</h4><div class="belbin-roles-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">';
        
        belbinReport.belbin_roles.forEach(role => {
            rolesHtml += `
                <div class="belbin-role-card" style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); border-left: 4px solid #3498db;">
                    <h5 style="color: #2c3e50; margin-bottom: 10px;">${role.name} (${role.key})</h5>
                    <p style="color: #555; font-size: 14px; margin-bottom: 10px;">${role.description}</p>
                    <p style="color: #555; font-size: 14px; margin-bottom: 10px;"><strong>典型特征：</strong>${role.characteristics}</p>
                    <p style="color: #555; font-size: 14px; margin-bottom: 10px;"><strong>主要贡献：</strong>${role.contribution}</p>
                    <p style="color: #555; font-size: 14px;"><strong>允许的缺点：</strong>${role.allowable_weaknesses}</p>
                </div>
            `;
        });
        
        rolesHtml += '</div>';
        document.getElementById('belbin-roles-container').innerHTML = rolesHtml;
    }
    
    // 显示最佳伴侣匹配和详细描述
    if (belbinReport.compatibility && belbinReport.compatibility.length > 0) {
        let compatibilityHtml = '<h4 style="color: #3498db; margin-bottom: 15px;">爱情关系中的最佳伴侣类型：</h4><div style="background-color: #e8f4f8; border-radius: 8px; padding: 20px;">';
        compatibilityHtml += '<p style="color: #555; margin-bottom: 10px;">根据您的性格特征，以下MBTI类型可能与您形成良好的恋爱关系：</p>';
        
        // 显示兼容类型
        compatibilityHtml += '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">';
        belbinReport.compatibility.forEach(type => {
            compatibilityHtml += `<span style="background-color: #3498db; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">${type}</span>`;
        });
        compatibilityHtml += '</div>';
        
        // 显示详细描述
        if (belbinReport.compatibility_details) {
            compatibilityHtml += '<div style="margin-top: 15px;">';
            for (const [type, description] of Object.entries(belbinReport.compatibility_details.descriptions || {})) {
                compatibilityHtml += `<p style="color: #555; margin-bottom: 10px;"><strong>${type}类型：</strong>${description}</p>`;
            }
            // 显示未来展望
            if (belbinReport.compatibility_details.future_vision) {
                compatibilityHtml += `<p style="color: #555; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc;"><strong>美好展望：</strong>${belbinReport.compatibility_details.future_vision}</p>`;
            }
            compatibilityHtml += '</div>';
        }
        
        compatibilityHtml += '</div>';
        document.getElementById('compatibility-container').innerHTML = compatibilityHtml;
    }
    
    // 显示可能冲突的类型
    if (belbinReport.conflicts && belbinReport.conflicts.length > 0) {
        let conflictHtml = '<h4 style="color: #e74c3c; margin-bottom: 15px;">需要注意的人格类型：</h4><div style="background-color: #fdedec; border-radius: 8px; padding: 20px; border-left: 4px solid #e74c3c;">';
        conflictHtml += '<p style="color: #555; margin-bottom: 10px;">在与以下类型的人交往时，可能需要更多的理解与包容：</p>';
        conflictHtml += '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        
        belbinReport.conflicts.forEach(type => {
            conflictHtml += `<span style="background-color: #e74c3c; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">${type}</span>`;
        });
        
        conflictHtml += '</div></div>';
        // 在兼容性容器后添加冲突类型容器
        document.getElementById('compatibility-container').insertAdjacentHTML('afterend', 
            `<div id="conflict-container" style="margin-top: 20px;">${conflictHtml}</div>`);
    }
    
    // 显示职业建议
    if (belbinReport.careers && belbinReport.careers.length > 0) {
        let careerHtml = '<h4 style="color: #3498db; margin-bottom: 15px;">职业发展建议：</h4><div style="background-color: #fff3cd; border-radius: 8px; padding: 20px;">';
        careerHtml += '<p style="color: #555; margin-bottom: 10px;">根据您的性格特征，以下职业可能适合您：</p>';
        careerHtml += '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        
        belbinReport.careers.forEach(career => {
            careerHtml += `<span style="background-color: #ffc107; color: #856404; padding: 5px 15px; border-radius: 20px; font-size: 14px;">${career}</span>`;
        });
        
        careerHtml += '</div></div>';
        document.getElementById('career-container').innerHTML = careerHtml;
    }
    
    // 显示专业建议
    if (belbinReport.majors && belbinReport.majors.length > 0) {
        let majorHtml = '<h4 style="color: #27ae60; margin-bottom: 15px;">专业选择建议：</h4><div style="background-color: #f3fff6; border-radius: 8px; padding: 20px; border-left: 4px solid #27ae60;">';
        majorHtml += '<p style="color: #555; margin-bottom: 10px;">根据您的兴趣和能力，以下专业可能适合您：</p>';
        majorHtml += '<div style="display: flex; flex-wrap: wrap; gap: 10px;">';
        
        belbinReport.majors.forEach(major => {
            majorHtml += `<span style="background-color: #27ae60; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px;">${major}</span>`;
        });
        
        majorHtml += '</div></div>';
        // 在职业建议后添加专业建议
        document.getElementById('career-container').insertAdjacentHTML('afterend', 
            `<div id="major-container" style="margin-top: 20px;">${majorHtml}</div>`);
    }
    
    // 显示最佳团队组合和分工建议
    if (belbinReport.team_composition && belbinReport.team_composition.length > 0) {
        let teamHtml = '<h4 style="color: #3498db; margin-bottom: 15px;">最佳团队组合与分工建议：</h4><div style="background-color: #d1ecf1; border-radius: 8px; padding: 20px;">';
        teamHtml += '<p style="color: #555; margin-bottom: 10px;">为了构建高效的团队，您可以考虑与以下MBTI类型的人合作：</p>';
        teamHtml += '<div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 15px;">';
        
        belbinReport.team_composition.forEach(type => {
            teamHtml += `<span style="background-color: #0dcaf0; color: #055160; padding: 5px 15px; border-radius: 20px; font-size: 14px;">${type}</span>`;
        });
        
        teamHtml += '</div>';
        
        // 添加团队角色分工建议
        if (belbinReport.team_roles && belbinReport.team_roles.leadership) {
            teamHtml += `<p style="color: #555; margin-bottom: 5px;"><strong>您的团队定位：</strong>${belbinReport.team_roles.leadership}</p>`;
            teamHtml += `<p style="color: #555; margin-bottom: 5px;"><strong>核心优势：</strong>${belbinReport.team_roles.strengths}</p>`;
            if (belbinReport.team_roles.best_roles && belbinReport.team_roles.best_roles.length > 0) {
                teamHtml += '<p style="color: #555; margin-bottom: 5px;"><strong>最适合的团队角色：</strong>';
                teamHtml += belbinReport.team_roles.best_roles.join('、');
                teamHtml += '</p>';
            }
        }
        
        teamHtml += '</div>';
        document.getElementById('team-container').innerHTML = teamHtml;
    }
    
    // 显示社交建议
    if (styledReport && styledReport.social_advice) {
        let socialHtml = '<h4 style="color: #9b59b6; margin-bottom: 15px;">社交互动建议：</h4><div style="background-color: #f9f3ff; border-radius: 8px; padding: 20px; border-left: 4px solid #9b59b6;">';
        socialHtml += '<p style="color: #555; margin-bottom: 10px;">根据不同的人格类型，以下是与他人交往时的建议：</p>';
        socialHtml += `<p style="color: #555; margin-bottom: 10px;">${styledReport.social_advice}</p>`;
        socialHtml += '</div>';
        // 在团队建议后添加社交建议
        document.getElementById('team-container').insertAdjacentHTML('afterend', 
            `<div id="social-container" style="margin-top: 20px;">${socialHtml}</div>`);
    } else if (styledReport && styledReport.style_config) {
        let socialHtml = '<h4 style="color: #9b59b6; margin-bottom: 15px;">社交互动建议：</h4><div style="background-color: #f9f3ff; border-radius: 8px; padding: 20px; border-left: 4px solid #9b59b6;">';
        socialHtml += '<p style="color: #555; margin-bottom: 10px;">根据不同的人格类型，以下是与他人交往时的建议：</p>';
        socialHtml += `<p style="color: #555; margin-bottom: 10px;">作为<strong>${styledReport.style_config.title}</strong>，您在社交中倾向于<strong>${styledReport.style_config.tone}</strong>的表达方式，注重<strong>${styledReport.style_config.focus}</strong>。</p>`;
        socialHtml += '<p style="color: #555; margin-bottom: 0;">与不同类型的人交往时，保持开放和理解的态度，发挥您独特的社交优势。</p>';
        socialHtml += '</div>';
        // 在团队建议后添加社交建议
        document.getElementById('team-container').insertAdjacentHTML('afterend', 
            `<div id="social-container" style="margin-top: 20px;">${socialHtml}</div>`);
    }
}