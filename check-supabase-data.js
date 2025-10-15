/**
 * Supabase云端数据检查脚本
 * 用于检查贝尔宾角色职业推荐数据与本地static数据的一致性
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase配置
const supabaseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtamNqY3BmY29zdnVrZ2tnbGl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0ODQ0NTcsImV4cCI6MjA3NTA2MDQ1N30.OLBfFHvJ5S13rYYO7a-xYO1WuP4FBQREOZJC2gggAhI';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 检查Supabase数据库中的表结构
 */
async function checkDatabaseSchema() {
    console.log('=== 检查Supabase数据库表结构 ===');

    try {
        // 检查career_suggestions表
        console.log('\n1. 检查career_suggestions表结构...');
        const { data: careerData, error: careerError } = await supabase
            .from('career_suggestions')
            .select('*')
            .limit(5);

        if (careerError) {
            console.error('Career suggestions表错误:', careerError);
        } else {
            console.log('Career suggestions表示例数据:', careerData);
            if (careerData.length > 0) {
                console.log('Career suggestions表字段:', Object.keys(careerData[0]));
            }
        }

        // 检查mbti_types_info表
        console.log('\n2. 检查mbti_types_info表结构...');
        const { data: mbtiData, error: mbtiError } = await supabase
            .from('mbti_types_info')
            .select('*')
            .limit(5);

        if (mbtiError) {
            console.error('MBTI types表错误:', mbtiError);
        } else {
            console.log('MBTI types表示例数据:', mbtiData);
            if (mbtiData.length > 0) {
                console.log('MBTI types表字段:', Object.keys(mbtiData[0]));
            }
        }

        // 检查belbin_roles表（如果存在）
        console.log('\n3. 检查belbin_roles表结构...');
        const { data: belbinData, error: belbinError } = await supabase
            .from('belbin_roles')
            .select('*')
            .limit(5);

        if (belbinError) {
            console.error('Belbin roles表错误:', belbinError);
        } else {
            console.log('Belbin roles表示例数据:', belbinData);
            if (belbinData.length > 0) {
                console.log('Belbin roles表字段:', Object.keys(belbinData[0]));
            }
        }

        return {
            careerSuggestions: careerData || [],
            mbtiTypes: mbtiData || [],
            belbinRoles: belbinData || []
        };
    } catch (error) {
        console.error('数据库检查失败:', error);
        return null;
    }
}

/**
 * 获取完整的职业建议数据
 */
async function getFullCareerSuggestions() {
    console.log('\n=== 获取完整职业建议数据 ===');

    try {
        const { data, error } = await supabase
            .from('career_suggestions')
            .select('*')
            .order('mbti_type');

        if (error) {
            console.error('获取职业建议失败:', error);
            return null;
        }

        console.log(`找到 ${data.length} 条职业建议记录`);

        // 按MBTI类型分组
        const groupedData = {};
        data.forEach(item => {
            if (!groupedData[item.mbti_type]) {
                groupedData[item.mbti_type] = [];
            }
            groupedData[item.mbti_type].push(item);
        });

        console.log('按MBTI类型分组的职业建议:', Object.keys(groupedData));
        return { fullData: data, groupedData };
    } catch (error) {
        console.error('获取职业建议数据失败:', error);
        return null;
    }
}

/**
 * 获取完整的贝尔宾角色数据
 */
async function getFullBelbinRoles() {
    console.log('\n=== 获取完整贝尔宾角色数据 ===');

    try {
        const { data, error } = await supabase
            .from('belbin_roles')
            .select('*')
            .order('role_key');

        if (error) {
            console.error('获取贝尔宾角色失败:', error);
            return null;
        }

        console.log(`找到 ${data.length} 个贝尔宾角色`);
        return data;
    } catch (error) {
        console.error('获取贝尔宾角色数据失败:', error);
        return null;
    }
}

/**
 * 检查API端点是否正常工作
 */
async function checkApiEndpoints() {
    console.log('\n=== 检查API端点 ===');

    const baseUrl = 'https://fmjcjcpfcosvukgkgliz.supabase.co/functions/v1';

    try {
        // 测试获取职业建议的API
        console.log('\n1. 测试获取职业建议API...');
        const careerResponse = await fetch(`${baseUrl}/personality-api/career-suggestions?mbti_type=INTJ&language=zh`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (careerResponse.ok) {
            const careerData = await careerResponse.json();
            console.log('职业建议API响应成功:', careerData);
        } else {
            console.error('职业建议API响应失败:', careerResponse.status, careerResponse.statusText);
        }

        // 测试获取MBTI类型信息的API
        console.log('\n2. 测试获取MBTI类型信息API...');
        const mbtiResponse = await fetch(`${baseUrl}/personality-api/mbti-type/INTJ?language=zh`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (mbtiResponse.ok) {
            const mbtiData = await mbtiResponse.json();
            console.log('MBTI类型信息API响应成功:', mbtiData);
        } else {
            console.error('MBTI类型信息API响应失败:', mbtiResponse.status, mbtiResponse.statusText);
        }

    } catch (error) {
        console.error('API端点检查失败:', error);
    }
}

/**
 * 主检查函数
 */
async function main() {
    console.log('开始检查Supabase云端数据...');

    // 1. 检查数据库结构
    const schemaData = await checkDatabaseSchema();

    // 2. 获取完整数据
    const careerData = await getFullCareerSuggestions();
    const belbinData = await getFullBelbinRoles();

    // 3. 检查API端点
    await checkApiEndpoints();

    console.log('\n=== 检查完成 ===');

    return {
        schema: schemaData,
        careers: careerData,
        belbin: belbinData
    };
}

// 导出函数以便测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        checkDatabaseSchema,
        getFullCareerSuggestions,
        getFullBelbinRoles,
        checkApiEndpoints,
        main
    };
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(console.error);
}