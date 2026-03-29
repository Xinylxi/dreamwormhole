// utils/coze.js - 通过云托管服务器调用Coze API（OAuth JWT授权）

/**
 * 配置区域
 */
const CONFIG = {
  // 你的云托管服务器地址
  SERVER_URL: 'https://express-i1p1-203367-6-1383035998.sh.run.tcloudbase.com',
  // 你的机器人ID
  BOT_ID: '7555475919377367075'
};

/**
 * 调用云托管服务器进行对话
 * @param {string} message - 用户消息
 * @param {string} [userId] - 用户ID（可选）
 * @returns {Promise} 返回AI响应
 */
function chatWithCoze(message, userId = null) {
  return new Promise((resolve, reject) => {
    console.log('☁️ 调用云托管服务器...');
    console.log('📝 消息:', message.substring(0, 50));
    
    // 获取或生成用户ID
    const finalUserId = userId || wx.getStorageSync('user_id') || 'user_' + Date.now();
    
    wx.request({
      url: `${CONFIG.SERVER_URL}/api/coze/chat`,
      method: 'POST',
      header: {
        'content-type': 'application/json'
      },
      data: {
        botId: CONFIG.BOT_ID,
        message: message,
        userId: finalUserId
      },
      success: (res) => {
        console.log('✅ 服务器调用成功');
        console.log('📦 服务器响应:', res);
        
        if (res.statusCode === 200 && res.data) {
          if (res.data.success) {
            // 返回回复内容
            resolve({ content: res.data.reply });
          } else {
            // 服务器返回错误
            const errorMsg = res.data.error || '服务器返回错误';
            console.error('❌ 服务器错误:', errorMsg);
            reject(new Error(errorMsg));
          }
        } else {
          console.error('❌ HTTP请求失败:', res.statusCode);
          reject(new Error(`HTTP错误: ${res.statusCode}`));
        }
      },
      fail: (err) => {
        console.error('❌ 网络请求失败');
        reject(new Error('网络请求失败: ' + (err.errMsg || JSON.stringify(err))));
      }
    });
  });
}

/**
 * 分析梦境内容（支持会话ID和故事模式）
 * @param {string} dreamContent - 梦境内容或用户选择
 * @param {boolean} [isShort=false] - 是否为短句分析
 * @param {string} [mode='analysis'] - 模式（'analysis'普通分析，'story'平行宇宙故事）
 * @param {Array} [conversationHistory=[]] - 对话历史（可选）
 * @param {string} [conversationId=null] - 会话ID（用于保持对话上下文）
 * @returns {Promise} 返回分析结果
 */
async function analyzeDream(dreamContent, isShort = false, mode = 'analysis', conversationHistory = [], conversationId = null) {
  try {
    console.log('开始分析梦境:', dreamContent);
    console.log('📝 模式:', mode);
    console.log('📝 会话ID:', conversationId);
    console.log('📝 对话历史长度:', conversationHistory.length);
    
    // 根据模式构建不同的消息
    let message;
    if (mode === 'story') {
      // 故事模式：传递完整的对话历史以保持上下文
      if (conversationHistory.length > 0) {
        // 如果有对话历史，构建上下文消息
        const historyText = conversationHistory.map(msg => {
          return `${msg.role === 'user' ? '用户' : 'AI'}: ${msg.content}`;
        }).join('\n\n');
        
        message = `对话历史：\n${historyText}\n\n用户最新选择：${dreamContent}`;
      } else {
        // 第一轮：直接传递梦境内容
        message = `梦境内容：${dreamContent}`;
      }
    } else {
      // 普通分析模式
      message = `梦境内容：${dreamContent}`;
    }
    
    const response = await chatWithCoze(message, conversationId);
    console.log('收到Coze分析响应:', response);
    
    if (!response || !response.content) {
      throw new Error('AI返回内容为空');
    }
    
    const contentText = response.content || '';
    console.log('原始响应内容:', contentText);
    
    // 检查是否为"暂无回复"等无意义内容
    if (contentText === '暂无回复' || contentText.trim() === '') {
      throw new Error('Coze机器人暂无回复，请检查机器人配置');
    }
    
    // 解析AI返回的JSON
    let content = contentText;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      content = jsonMatch[0];
      console.log('提取到JSON:', content);
    } else {
      // 如果没有找到JSON格式，返回原始文本的默认结构
      console.log('⚠️ 未找到JSON格式，使用默认结构');
      return {
        emotions: [
          { name: '分析中', value: 50 }
        ],
        tags: ['暂无标签'],
        planetType: '未知星球',
        interpretation: contentText,
        rawResponse: contentText // 保存原始响应用于调试
      };
    }
    
    const result = JSON.parse(content);
    
    // 验证返回格式
    if (!result.emotions && !result.tags && !result.planetType && !result.interpretation) {
      throw new Error('AI返回数据格式不正确');
    }
    
    console.log('梦境分析成功:', result);
    return result;
  } catch (error) {
    console.error('分析梦境失败:', error);
    throw error;
  }
}

/**
 * 仅获取梦境分类（轻量级）
 * @param {string} dreamContent - 梦境内容
 * @returns {Promise} 返回分类结果
 */
async function classifyDream(dreamContent) {
  try {
    const prompt = `请将以下梦境分类到以下类型之一（只返回类型名称，不要其他内容）：
- 飞翔星球
- 海洋星球
- 森林星球
- 迷宫星球
- 城市星球
- 奇幻星球
- 恐怖星球
- 童年星球

梦境内容：${dreamContent}`;

    const response = await chatWithCoze(prompt);
    const planetType = response.content.trim();
    
    return { planetType };
  } catch (error) {
    console.error('分类梦境失败:', error);
    throw error;
  }
}

module.exports = {
  chatWithCoze,
  analyzeDream,
  classifyDream
};
