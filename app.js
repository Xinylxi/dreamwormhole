// app.js
App({
  onLaunch() {
    console.log('App onLaunch 开始');
    
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      console.log('开始初始化云开发...');
      
      try {
        wx.cloud.init({
          env: 'cloud1-3gnjpjyef6a35ef0', // 你的云环境ID
          traceUser: true
        });
        
        console.log('云开发初始化成功');
        
      } catch (error) {
        console.error('云开发初始化失败:', error);
      }
    }
    
    console.log('App onLaunch 完成');
  }
})
