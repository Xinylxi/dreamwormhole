// pages/testing/test/test.js - AI分析测试页面
const { analyzeDream } = require('../../../utils/ai/coze');
const { mockAnalyzeDream } = require('../../../utils/ai/mock-analyze');
const { runFullCloudTest } = require('../../../utils/data/cloud-test');

Page({
  data: {
    testResult: '',
    isLoading: false
  },

  // 测试云开发
  async testCloud() {
    this.setData({ isLoading: true, testResult: '开始测试云开发...\n' });
    
    try {
      console.log('=== 开始测试云开发 ===');
      
      const results = await runFullCloudTest();
      
      let resultText = '';
      
      // 连接测试结果
      if (results.connection.success) {
        resultText += '✅ 云开发连接测试成功！\n';
      } else {
        resultText += '❌ 云开发连接测试失败！\n';
        resultText += `错误: ${results.connection.message}\n`;
      }
      
      // 读取测试结果
      if (results.read && results.read.success) {
        resultText += '✅ 数据库读取测试成功！\n';
        resultText += `读取到 ${results.read.data.data.length} 条记录\n`;
      } else if (results.read) {
        resultText += '❌ 数据库读取测试失败！\n';
        resultText += `错误: ${results.read.message}\n`;
      }
      
      // 写入测试结果
      if (results.write && results.write.success) {
        resultText += '✅ 数据库写入测试成功！\n';
      } else if (results.write) {
        resultText += '❌ 数据库写入测试失败！\n';
        resultText += `错误: ${results.write.message}\n`;
      }
      
      this.setData({
        testResult: this.data.testResult + resultText
      });
      
    } catch (error) {
      console.error('云开发测试失败:', error);
      
      this.setData({
        testResult: this.data.testResult + 
          '❌ 云开发测试失败！\n' +
          `错误信息: ${error.message}\n`
      });
    }
    
    this.setData({ isLoading: false });
  },

  // 测试 Coze API
  async testCozeAPI() {
    this.setData({ isLoading: true, testResult: '开始测试 Coze API...\n' });
    
    try {
      console.log('=== 开始测试 Coze API ===');
      
      const testDream = '梦见自己在天空中自由飞翔，周围是彩色的云朵';
      console.log('测试梦境内容:', testDream);
      
      const result = await analyzeDream(testDream);
      console.log('测试成功，结果:', result);
      
      this.setData({
        testResult: this.data.testResult + 
          '✅ Coze API 测试成功！\n' +
          `星球类型: ${result.planetType}\n` +
          `标签: ${result.tags.join(', ')}\n` +
          `情绪: ${JSON.stringify(result.emotions)}\n` +
          `解析: ${result.interpretation}\n`
      });
      
    } catch (error) {
      console.error('Coze API 测试失败:', error);
      
      this.setData({
        testResult: this.data.testResult + 
          '❌ Coze API 测试失败！\n' +
          `错误类型: ${error.name}\n` +
          `错误信息: ${error.message}\n` +
          `错误堆栈: ${error.stack}\n`
      });
    }
    
    this.setData({ isLoading: false });
  },

  // 测试模拟分析
  async testMockAnalyze() {
    this.setData({ isLoading: true, testResult: '开始测试模拟分析...\n' });
    
    try {
      console.log('=== 开始测试模拟分析 ===');
      
      const testDream = '梦见自己在天空中自由飞翔，周围是彩色的云朵';
      console.log('测试梦境内容:', testDream);
      
      const result = await mockAnalyzeDream(testDream);
      console.log('模拟分析成功，结果:', result);
      
      this.setData({
        testResult: this.data.testResult + 
          '✅ 模拟分析测试成功！\n' +
          `星球类型: ${result.planetType}\n` +
          `标签: ${result.tags.join(', ')}\n` +
          `情绪: ${JSON.stringify(result.emotions)}\n` +
          `解析: ${result.interpretation}\n`
      });
      
    } catch (error) {
      console.error('模拟分析测试失败:', error);
      
      this.setData({
        testResult: this.data.testResult + 
          '❌ 模拟分析测试失败！\n' +
          `错误信息: ${error.message}\n`
      });
    }
    
    this.setData({ isLoading: false });
  },

  // 测试网络连接
  testNetwork() {
    this.setData({ isLoading: true, testResult: '测试网络连接...\n' });
    
    wx.request({
      url: 'https://api.coze.cn/v1/chat',
      method: 'POST',
      header: {
        'Authorization': 'Bearer cztei_qc9edB4DWNu0Sqa0fFAl0vV7zjvITN9DfSDXgEIckPGN7W3tAvu4b6PjqEBb6PHtJ',
        'Content-Type': 'application/json'
      },
      data: {
        bot_id: '7555475919377367075',
        user_id: 'test-user',
        query: '你好'
      },
      success: (res) => {
        console.log('网络测试响应:', res);
        this.setData({
          testResult: this.data.testResult + 
            `✅ 网络连接正常！\n` +
            `状态码: ${res.statusCode}\n` +
            `响应数据: ${JSON.stringify(res.data)}\n`
        });
      },
      fail: (err) => {
        console.error('网络测试失败:', err);
        this.setData({
          testResult: this.data.testResult + 
            `❌ 网络连接失败！\n` +
            `错误信息: ${err.errMsg}\n`
        });
      },
      complete: () => {
        this.setData({ isLoading: false });
      }
    });
  },

  // 清空结果
  clearResult() {
    this.setData({ testResult: '' });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
})
