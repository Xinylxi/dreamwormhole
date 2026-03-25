// 云函数入口文件
const cloud = require('wx-server-sdk')

// 初始化云函数
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    // 获取用户的openid
    const { OPENID } = cloud.getWXContext()

    return {
      openid: OPENID,
      success: true
    }
  } catch (error) {
    console.error('获取openid失败:', error)
    return {
      success: false,
      error: error.message
    }
  }
}