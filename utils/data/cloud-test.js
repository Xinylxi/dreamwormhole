// utils/cloud-test.js - 云开发测试工具

const db = wx.cloud.database();

/**
 * 测试云开发连接
 */
async function testCloudConnection() {
  try {
    console.log('开始测试云开发连接...');
    
    // 测试数据库连接
    const result = await db.collection('dreams').limit(1).get();
    console.log('数据库连接测试成功:', result);
    
    return {
      success: true,
      message: '云开发连接正常',
      data: result
    };
  } catch (error) {
    console.error('云开发连接测试失败:', error);
    return {
      success: false,
      message: '云开发连接失败: ' + error.message,
      error: error
    };
  }
}

/**
 * 测试数据库写入
 */
async function testDatabaseWrite() {
  try {
    console.log('开始测试数据库写入...');
    
    const testData = {
      content: '测试梦境内容',
      date: '2024-01-15',
      time: '12:00',
      emotions: [{ name: '快乐', value: 50 }],
      tags: ['测试'],
      planetType: '奇幻星球',
      planetName: '奇幻星球',
      emoji: '✨',
      color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    };
    
    const result = await db.collection('dreams').add({
      data: testData
    });
    
    console.log('数据库写入测试成功:', result);
    
    // 删除测试数据
    await db.collection('dreams').doc(result._id).remove();
    console.log('测试数据已删除');
    
    return {
      success: true,
      message: '数据库写入测试成功',
      data: result
    };
  } catch (error) {
    console.error('数据库写入测试失败:', error);
    return {
      success: false,
      message: '数据库写入失败: ' + error.message,
      error: error
    };
  }
}

/**
 * 测试数据库读取
 */
async function testDatabaseRead() {
  try {
    console.log('开始测试数据库读取...');
    
    const result = await db.collection('dreams').limit(5).get();
    console.log('数据库读取测试成功:', result);
    
    return {
      success: true,
      message: '数据库读取测试成功',
      data: result
    };
  } catch (error) {
    console.error('数据库读取测试失败:', error);
    return {
      success: false,
      message: '数据库读取失败: ' + error.message,
      error: error
    };
  }
}

/**
 * 完整云开发测试
 */
async function runFullCloudTest() {
  console.log('=== 开始完整云开发测试 ===');
  
  const results = {
    connection: null,
    read: null,
    write: null
  };
  
  // 测试连接
  results.connection = await testCloudConnection();
  
  if (results.connection.success) {
    // 测试读取
    results.read = await testDatabaseRead();
    
    // 测试写入
    results.write = await testDatabaseWrite();
  }
  
  console.log('=== 云开发测试完成 ===');
  console.log('测试结果:', results);
  
  return results;
}

module.exports = {
  testCloudConnection,
  testDatabaseWrite,
  testDatabaseRead,
  runFullCloudTest
};
