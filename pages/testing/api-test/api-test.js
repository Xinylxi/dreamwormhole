// pages/testing/api-test/api-test.js - API测试页面
Page({
  data: {
    testResult: '',
    isLoading: false
  },

  // 测试新的API
  testNewAPI() {
    this.setData({ isLoading: true, testResult: '测试新的API...\n' });
    
    try {
      console.log('=== 测试新的API ===');
      
      // 测试 getDeviceInfo
      const deviceInfo = wx.getDeviceInfo();
      console.log('getDeviceInfo 结果:', deviceInfo);
      
      // 测试 getWindowInfo
      const windowInfo = wx.getWindowInfo();
      console.log('getWindowInfo 结果:', windowInfo);
      
      // 测试 getAppBaseInfo
      const appBaseInfo = wx.getAppBaseInfo();
      console.log('getAppBaseInfo 结果:', appBaseInfo);
      
      this.setData({
        testResult: this.data.testResult + 
          '✅ 新API测试成功！\n' +
          `设备平台: ${deviceInfo.platform}\n` +
          `窗口宽度: ${windowInfo.windowWidth}\n` +
          `应用版本: ${appBaseInfo.version}\n`
      });
      
    } catch (error) {
      console.error('新API测试失败:', error);
      
      this.setData({
        testResult: this.data.testResult + 
          '❌ 新API测试失败！\n' +
          `错误信息: ${error.message}\n`
      });
    }
    
    this.setData({ isLoading: false });
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
