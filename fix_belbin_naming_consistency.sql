-- 修复贝尔宾角色命名差异 SQL 脚本
-- 将数据库中的中文名称更新为与静态文件 data.js 中的名称一致
-- 执行日期: 2025-01-04

-- 开始事务
BEGIN;

-- 更新贝尔宾角色的中文名称，使其与静态文件保持一致
UPDATE belbin_roles 
SET name_zh = CASE role_key
    WHEN 'PL' THEN '智多星'        -- 原: 创新者 -> 新: 智多星
    WHEN 'RI' THEN '资源调查者'     -- 原: 资源调查员 -> 新: 资源调查者
    WHEN 'CO' THEN '协调者'        -- 原: 协调员 -> 新: 协调者
    WHEN 'SH' THEN '推进者'        -- 原: 塑造者 -> 新: 推进者
    WHEN 'ME' THEN '监督者'        -- 原: 监控评估者 -> 新: 监督者
    WHEN 'TW' THEN '团队工作者'     -- 原: 团队合作者 -> 新: 团队工作者
    WHEN 'IMP' THEN '执行者'       -- 原: 实干家 -> 新: 执行者
    WHEN 'CF' THEN '完成者'        -- 原: 完美主义者 -> 新: 完成者
    WHEN 'SP' THEN '专家'          -- 原: 专业师 -> 新: 专家
    ELSE name_zh  -- 保持其他未匹配的值不变
END,
updated_at = NOW()
WHERE role_key IN ('PL', 'RI', 'CO', 'SH', 'ME', 'TW', 'IMP', 'CF', 'SP');

-- 验证更新结果
SELECT 
    role_key,
    name_zh AS "更新后中文名称",
    name_en AS "英文名称"
FROM belbin_roles 
ORDER BY 
    CASE role_key
        WHEN 'PL' THEN 1
        WHEN 'RI' THEN 2
        WHEN 'CO' THEN 3
        WHEN 'SH' THEN 4
        WHEN 'ME' THEN 5
        WHEN 'TW' THEN 6
        WHEN 'IMP' THEN 7
        WHEN 'CF' THEN 8
        WHEN 'SP' THEN 9
        ELSE 10
    END;

-- 提交事务
COMMIT;

-- 脚本执行完成
-- 所有贝尔宾角色的中文名称已更新为与静态文件 data.js 保持一致