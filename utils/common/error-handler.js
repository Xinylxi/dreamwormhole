// utils/error-handler.js - 错误处理工具

/**
 * 全局错误处理
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 */
function handleError(error, context = 'Unknown') {
  console.error(`[${context}] 错误:`, error);
  
  // 显示用户友好的错误信息
  wx.showToast({
    title: '操作失败，请重试',
    icon: 'none',
    duration: 2000
  });
}

/**
 * 异步操作包装器
 * @param {Function} asyncFn - 异步函数
 * @param {string} context - 上下文
 * @returns {Promise} 包装后的Promise
 */
function safeAsync(asyncFn, context = 'Async') {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      handleError(error, context);
      throw error;
    }
  };
}

/**
 * 页面初始化包装器
 * @param {Function} initFn - 初始化函数
 * @param {string} pageName - 页面名称
 */
function safePageInit(initFn, pageName) {
  return async function() {
    try {
      // 确保页面完全加载
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await initFn.call(this);
    } catch (error) {
      handleError(error, `${pageName} 页面初始化`);
    }
  };
}

module.exports = {
  handleError,
  safeAsync,
  safePageInit
};
