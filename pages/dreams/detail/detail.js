// dream-detail.js - 梦境详情页面
const { getDreamDetail, deleteDream, toggleDreamFavorite, getAudioDownloadUrl } = require('../../../utils/data/cloud');

Page({
  data: {
    dreamDetail: {},
    similarDreams: [],
    // 语音相关
    hasAudio: false,
    audioPath: '',
    isPlaying: false,
    playDuration: 0,
    playTimer: null
  },

  async onLoad(options) {
    const dreamId = options.id;
    if (dreamId) {
      await this.loadDreamDetail(dreamId);
    }
  },

  // 加载梦境详情
  async loadDreamDetail(dreamId) {
    wx.showLoading({
      title: '加载中...'
    });
    
    try {
      const dream = await getDreamDetail(dreamId);
      
      // 处理语音文件
      let audioPath = '';
      if (dream.hasAudio && dream.audioFileId) {
        try {
          audioPath = await getAudioDownloadUrl(dream.audioFileId);
        } catch (error) {
          console.error('获取语音文件失败:', error);
        }
      }

      this.setData({
        dreamDetail: {
          id: dream._id,
          date: this.formatFullDate(dream.date),
          time: dream.time,
          content: dream.content,
          emotions: dream.emotions || [],
          tags: dream.tags || [],
          interpretation: dream.interpretation || '',
          isFavorite: dream.isFavorite || false
        },
        hasAudio: !!audioPath,
        audioPath: audioPath
      });
      
      wx.hideLoading();
    } catch (error) {
      console.error('加载梦境详情失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      });
    }
  },

  // 切换收藏状态
  async toggleFavorite() {
    const dreamId = this.data.dreamDetail.id;
    const currentStatus = this.data.dreamDetail.isFavorite;
    
    wx.showLoading({
      title: currentStatus ? '取消收藏中...' : '收藏中...'
    });
    
    try {
      await toggleDreamFavorite(dreamId, !currentStatus);
      
      this.setData({
        'dreamDetail.isFavorite': !currentStatus
      });
      
      wx.hideLoading();
      wx.showToast({
        title: !currentStatus ? '收藏成功' : '取消收藏',
        icon: 'success'
      });
    } catch (error) {
      console.error('收藏操作失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '操作失败',
        icon: 'none'
      });
    }
  },

  // 分享梦境
  shareDream() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },

  // 删除梦境
  async deleteDream() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个梦境吗？删除后无法恢复。',
      success: async (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...'
          });
          
          try {
            await deleteDream(this.data.dreamDetail.id);
            
            wx.hideLoading();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          } catch (error) {
            console.error('删除梦境失败:', error);
            wx.hideLoading();
            wx.showToast({
              title: '删除失败',
              icon: 'none'
            });
          }
        }
      }
    });
  },

  // 查看相似梦境
  viewSimilarDream(e) {
    const dreamId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dreams/detail/detail?id=${dreamId}`
    });
  },

  // 播放梦境语音
  playDreamAudio() {
    if (!this.data.audioPath) {
      wx.showToast({
        title: '没有语音记录',
        icon: 'none'
      });
      return;
    }

    const audioContext = wx.createInnerAudioContext();
    audioContext.src = this.data.audioPath;
    
    audioContext.onPlay(() => {
      console.log('开始播放梦境语音');
      this.setData({
        isPlaying: true,
        playDuration: 0
      });
      this.startPlayTimer();
    });

    audioContext.onEnded(() => {
      console.log('梦境语音播放结束');
      this.setData({
        isPlaying: false
      });
      this.stopPlayTimer();
      audioContext.destroy();
    });

    audioContext.onError((err) => {
      console.error('播放梦境语音失败:', err);
      this.setData({
        isPlaying: false
      });
      this.stopPlayTimer();
      audioContext.destroy();
      
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      });
    });

    audioContext.play();
  },

  // 停止播放
  stopPlayback() {
    const audioContext = wx.createInnerAudioContext();
    audioContext.stop();
    audioContext.destroy();
    
    this.setData({
      isPlaying: false
    });
    this.stopPlayTimer();
  },

  // 开始播放计时
  startPlayTimer() {
    this.data.playTimer = setInterval(() => {
      this.setData({
        playDuration: this.data.playDuration + 1
      });
    }, 1000);
  },

  // 停止播放计时
  stopPlayTimer() {
    if (this.data.playTimer) {
      clearInterval(this.data.playTimer);
      this.setData({
        playTimer: null
      });
    }
  },

  // 格式化完整日期
  formatFullDate(dateStr) {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}年${month}月${day}日`;
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  }
})
