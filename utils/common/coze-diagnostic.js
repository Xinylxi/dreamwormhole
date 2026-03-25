// utils/coze-diagnostic.js - Coze连接诊断工具

const COZE_API_KEY = 'cztei_qc9edB4DWNu0Sqa0fFAl0vV7zjvITN9DfSDXgEIckPGN7W3tAvu4b6PjqEBb6PHtJ';
const COZE_BOT_ID = '7555475919377367075';
const COZE_API_URL = 'https://api.coze.cn/open_api/v2/chat';

/**
 * 诊断Coze连接
 */
async function diagnoseCoze() {
  console.log('🔍 开始诊断 Coze 连接...');
  const results = {
    apiKeyValid: false,
    botIdValid: false,
    networkReachable: false,
    apiEndpointReachable: false,
    responseFormatValid: false,
    errors: []
  };

  try {
    // 1. 检查API Key格式
    console.log('1️⃣ 检查 API Key 格式...');
    if (COZE_API_KEY && COZE_API_KEY.length > 10) {
      results.apiKeyValid = true;
      console.log('✅ API Key 格式正确');
    } else {
      results.errors.push('API Key 格式不正确');
      console.error('❌ API Key 格式不正确');
    }

    // 2. 检查Bot ID格式
    console.log('2️⃣ 检查 Bot ID 格式...');
    if (COZE_BOT_ID && COZE_BOT_ID.length > 5) {
      results.botIdValid = true;
      console.log('✅ Bot ID 格式正确');
    } else {
      results.errors.push('Bot ID 格式不正确');
      console.error('❌ Bot ID 格式不正确');
    }

    // 3. 测试网络连接
    console.log('3️⃣ 测试网络连接...');
    try {
      const testResponse = await testNetworkConnection();
      results.networkReachable = testResponse.success;
      if (!testResponse.success) {
        results.errors.push('网络连接失败: ' + testResponse.error);
      }
    } catch (error) {
      console.error('网络测试失败:', error);
      results.errors.push('网络测试失败: ' + error.message);
    }

    // 4. 测试API端点
    console.log('4️⃣ 测试 Coze API 端点...');
    try {
      const apiResponse = await testCozeApiEndpoint();
      results.apiEndpointReachable = apiResponse.success;
      results.responseFormatValid = apiResponse.formatValid;
      
      if (apiResponse.error) {
        results.errors.push('API 调用失败: ' + apiResponse.error);
      }
      
      console.log('API 响应状态:', apiResponse);
    } catch (error) {
      console.error('API端点测试失败:', error);
      results.errors.push('API端点测试失败: ' + error.message);
    }

    // 5. 检查云函数
    console.log('5️⃣ 检查云函数...');
    try {
      const cloudFunctionStatus = await testCloudFunction();
      console.log('云函数状态:', cloudFunctionStatus);
      if (!cloudFunctionStatus.success) {
        results.errors.push('云函数问题: ' + cloudFunctionStatus.error);
      }
    } catch (error) {
      console.error('云函数检查失败:', error);
      results.errors.push('云函数检查失败: ' + error.message);
    }

    // 生成诊断报告
    console.log('📊 诊断完成:', results);
    return results;

  } catch (error) {
    console.error('诊断过程出错:', error);
    results.errors.push('诊断过程出错: ' + error.message);
    return results;
  }
}

/**
 * 测试网络连接
 */
function testNetworkConnection() {
  return new Promise((resolve) => {
    console.log('🌐 测试基本网络连接...');
    wx.request({
      url: 'https://api.weixin.qq.com',
      method: 'GET',
      timeout: 5000,
      success: (res) => {
        console.log('✅ 网络连接正常');
        resolve({ success: true });
      },
      fail: (err) => {
        console.error('❌ 网络连接失败:', err);
        resolve({ success: false, error: err.errMsg });
      }
    });
  });
}

/**
 * 测试Coze API端点
 */
function testCozeApiEndpoint() {
  return new Promise((resolve, reject) => {
    console.log('🚀 发送测试请求到 Coze API...');
    
    wx.request({
      url: COZE_API_URL,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${COZE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      data: {
        conversation_id: 'test-' + Date.now(),
        bot_id: COZE_BOT_ID,
        user: 'test-user',
        query: '你好',
        stream: false
      },
      timeout: 10000,
      success: (res) => {
        console.log('✅ Coze API 响应成功');
        console.log('状态码:', res.statusCode);
        console.log('响应数据:', res.data);
        
        // 检查响应格式
        let formatValid = false;
        if (res.statusCode === 200 && res.data) {
          // 检查常见的响应格式
          if (res.data.messages || res.data.content || res.data.data || res.data.response) {
            formatValid = true;
          }
        }
        
        resolve({
          success: true,
          statusCode: res.statusCode,
          data: res.data,
          formatValid
        });
      },
      fail: (err) => {
        console.error('❌ Coze API 请求失败:', err);
        resolve({
          success: false,
          error: err.errMsg || '请求失败',
          statusCode: err.statusCode
        });
      }
    });
  });
}

/**
 * 测试云函数
 */
function testCloudFunction() {
  return new Promise((resolve, reject) => {
    console.log('☁️ 测试云函数 coze-proxy...');
    
    wx.cloud.callFunction({
      name: 'coze-proxy',
      data: {
        message: '测试连接',
        conversationId: 'test-' + Date.now()
      },
      timeout: 10000,
      success: (res) => {
        console.log('✅ 云函数调用成功');
        console.log('云函数响应:', res);
        
        if (res.result && res.result.success) {
          resolve({ success: true, data: res.result });
        } else {
          resolve({
            success: false,
            error: '云函数返回失败',
            data: res.result
          });
        }
      },
      fail: (err) => {
        console.error('❌ 云函数调用失败:', err);
        resolve({
          success: false,
          error: err.errMsg || '云函数调用失败',
          err
        });
      }
    });
  });
}

/**
 * 生成诊断报告文本
 */
function generateDiagnosticReport(results) {
  let report = '📋 Coze 连接诊断报告\n\n';
  
  report += `✅ API Key 格式: ${results.apiKeyValid ? '正确' : '❌ 错误'}\n`;
  report += `✅ Bot ID 格式: ${results.botIdValid ? '正确' : '❌ 错误'}\n`;
  report += `✅ 网络连接: ${results.networkReachable ? '正常' : '❌ 失败'}\n`;
  report += `✅ API 端点: ${results.apiEndpointReachable ? '可达' : '❌ 不可达'}\n`;
  report += `✅ 响应格式: ${results.responseFormatValid ? '正确' : '❌ 错误'}\n\n`;
  
  if (results.errors.length > 0) {
    report += '❌ 发现问题:\n';
    results.errors.forEach((error, index) => {
      report += `${index + 1}. ${error}\n`;
    });
  } else {
    report += '✅ 所有检查通过！\n';
  }
  
  return report;
}

module.exports = {
  diagnoseCoze,
  generateDiagnosticReport
};

