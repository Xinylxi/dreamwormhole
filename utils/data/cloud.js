// utils/cloud.js - 云数据库工具

const db = wx.cloud.database();

/**
 * 获取当前用户的openid
 * @returns {Promise} 返回包含openid的对象
 */
async function getCurrentUserOpenId() {
  try {
    // 临时方案：返回测试用的openid，待云函数部署后恢复
    // const { result } = await wx.cloud.callFunction({
    //   name: 'getOpenId'
    // });
    // return result;
    
    // 临时返回固定openid用于测试
    return { openid: 'test_openid_12345' };
  } catch (error) {
    console.error('获取用户openid失败', error);
    throw error;
  }
}

/**
 * 保存梦境到云数据库
 * @param {Object} dreamData - 梦境数据
 * @returns {Promise} 返回梦境ID
 */
async function saveDream(dreamData) {
  try {
    let audioFileId = null;
    
    // 1. 如果有语音文件，先上传到云存储
    if (dreamData.audioPath) {
      audioFileId = await uploadAudioFile(dreamData.audioPath);
    }
    
    // 2. 保存梦境记录
    const result = await db.collection('dreams').add({
      data: {
        content: dreamData.content,
        date: dreamData.date,
        time: dreamData.time,
        emotions: dreamData.emotions || [],
        tags: dreamData.tags || [],
        interpretation: dreamData.interpretation || '',
        planetType: dreamData.planetType,
        planetName: dreamData.planetName,
        emoji: dreamData.emoji,
        color: dreamData.color,
        position: dreamData.position || { x: 50, y: 50 },
        audioFileId: audioFileId, // 语音文件ID
        hasAudio: !!audioFileId, // 是否有语音
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
    
    const dreamId = result._id;
    
    // 3. 更新或创建星球
    await updatePlanet(dreamData, dreamId);
    
    return dreamId;
  } catch (error) {
    console.error('保存梦境失败', error);
    throw error;
  }
}

/**
 * 上传语音文件到云存储
 * @param {string} audioPath - 本地语音文件路径
 * @returns {Promise} 返回云存储文件ID
 */
async function uploadAudioFile(audioPath) {
  try {
    const timestamp = Date.now();
    const fileName = `dream-audio-${timestamp}.mp3`;
    
    const result = await wx.cloud.uploadFile({
      cloudPath: `dream-audios/${fileName}`,
      filePath: audioPath
    });
    
    console.log('语音文件上传成功:', result.fileID);
    return result.fileID;
  } catch (error) {
    console.error('上传语音文件失败:', error);
    throw error;
  }
}

/**
 * 获取语音文件下载链接
 * @param {string} fileId - 云存储文件ID
 * @returns {Promise} 返回下载链接
 */
async function getAudioDownloadUrl(fileId) {
  try {
    const result = await wx.cloud.getTempFileURL({
      fileList: [fileId]
    });
    
    if (result.fileList && result.fileList.length > 0) {
      return result.fileList[0].tempFileURL;
    }
    
    throw new Error('获取语音文件链接失败');
  } catch (error) {
    console.error('获取语音文件链接失败:', error);
    throw error;
  }
}

/**
 * 为每个梦境创建独立的星球
 */
async function updatePlanet(dreamData, dreamId) {
  try {
    // 导入星球位置生成函数
    const { generatePlanetPosition } = require('./planet-config');
    
    // 为每个梦境生成唯一的星球名称（基于星球类型和时间）
    const timeStr = new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const planetName = `${dreamData.planetName}·${timeStr}`;
    const planetId = `planet-${dreamId}`;
    
    // 为每个梦境创建独立的星球
    await db.collection('planets').add({
      data: {
        id: planetId,
        name: planetName,
        emoji: dreamData.emoji,
        color: dreamData.color,
        description: dreamData.description || '',
        planetType: dreamData.planetType || 'unknown',
        position: dreamData.position || generatePlanetPosition(),
        dreamIds: [dreamId],
        dreamCount: 1,
        tags: dreamData.tags || [],
        keywords: dreamData.tags || [],
        representativeDream: dreamData.content.substring(0, 50), // 只保存前50个字符
        createTime: dreamData.date,
        lastDreamDate: dreamData.date,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    });
    
    console.log(`为梦境 ${dreamId} 创建了独立星球: ${planetName}`);
  } catch (error) {
    console.error('创建星球失败', error);
    throw error;
  }
}

/**
 * 生成随机星球位置
 */
function generatePlanetPosition() {
  return {
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10
  };
}

/**
 * 获取用户的梦境列表
 * @param {number} limit - 限制数量
 * @returns {Promise} 返回梦境列表
 */
async function getUserDreams(limit = 10) {
  try {
    // 临时方案：不按openid过滤，获取所有梦境用于测试
    // const { openid } = await getCurrentUserOpenId();
    
    const result = await db.collection('dreams')
      // .where({
      //   _openid: openid
      // })
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return result.data;
  } catch (error) {
    console.error('获取梦境列表失败', error);
    throw error;
  }
}

/**
 * 获取用户的星球列表
 * @returns {Promise} 返回星球列表
 */
async function getUserPlanets() {
  try {
    // 临时方案：不按openid过滤，获取所有星球用于测试
    // const { openid } = await getCurrentUserOpenId();

    const result = await db.collection('planets')
      // .where({
      //   _openid: openid
      // })
      .get();

    return result.data;
  } catch (error) {
    console.error('获取星球列表失败', error);
    throw error;
  }
}

/**
 * 获取单个梦境详情
 * @param {string} dreamId - 梦境ID
 * @returns {Promise} 返回梦境详情
 */
async function getDreamDetail(dreamId) {
  try {
    const result = await db.collection('dreams')
      .doc(dreamId)
      .get();
    
    return result.data;
  } catch (error) {
    console.error('获取梦境详情失败', error);
    throw error;
  }
}

/**
 * 删除梦境
 * @param {string} dreamId - 梦境ID
 */
async function deleteDream(dreamId) {
  try {
    // 1. 删除梦境记录
    await db.collection('dreams').doc(dreamId).remove();
    
    // 2. 更新星球数据
    const planetResult = await db.collection('planets')
      .where({
        dreamIds: db.command.in([dreamId])
      })
      .get();
    
    if (planetResult.data.length > 0) {
      const planet = planetResult.data[0];
      
      // 更新星球梦境列表
      await db.collection('planets').doc(planet._id).update({
        data: {
          dreamIds: db.command.pull(dreamId),
          dreamCount: db.command.inc(-1)
        }
      });
      
      // 如果星球没有梦境了，删除星球
      if (planet.dreamCount === 1) {
        await db.collection('planets').doc(planet._id).remove();
      }
    }
  } catch (error) {
    console.error('删除梦境失败', error);
    throw error;
  }
}

module.exports = {
  saveDream,
  getUserDreams,
  getUserPlanets,
  getDreamDetail,
  deleteDream,
  uploadAudioFile,
  getAudioDownloadUrl
};

