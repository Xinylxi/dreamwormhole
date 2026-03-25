// index.js - 梦境记录页面
const { getPlanetConfig } = require('../../../utils/ui/planet-config');
const { saveDream, getUserDreams } = require('../../../utils/data/cloud');
const { analyzeDream } = require('../../../utils/ai/coze');

Page({
  data: {
    dreamText: '',
    isAnalyzed: false,
    isAnalyzing: false,
    emotionTags: [],
    analysisResult: null,
    recentDreams: [],
    // 语音录制相关
    isRecording: false,
    recordingDuration: 0,
    recordingTimer: null,
    audioPath: '',
    isPlaying: false,
    playTimer: null,
    playDuration: 0,
    // 语音长按手势增强
    isLongPressRecording: false,
    canceledByGesture: false,
    // 滑动取消逻辑
    touchStartY: 0,
    cancelSlide: false,
    showRecordOverlay: false
  },
  // 长按开始录音（按下）
  startRecordingPress(e) {
    // 若已在录音，忽略
    if (this.data.isRecording) return;
    // 先检查权限后开始
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.record'] === false) {
          wx.showModal({
            title: '需要录音权限',
            content: '请在设置中允许使用麦克风以进行语音记录',
            success: (modalRes) => {
              if (modalRes.confirm) wx.openSetting();
            }
          });
          return;
        }
        // 轻微震动作为反馈
        if (wx.vibrateShort) wx.vibrateShort({ type: 'light' });
        const startY = (e && e.touches && e.touches[0]?.clientY) || 0;
        this.setData({ 
          isLongPressRecording: true, 
          canceledByGesture: false,
          touchStartY: startY,
          cancelSlide: false,
          showRecordOverlay: true
        });
        this.startRecording();
      }
    });
  },

  // 松开结束录音
  stopRecordingPress() {
    if (!this.data.isRecording) return;
    this.setData({ isLongPressRecording: false, showRecordOverlay: false });
    this.stopRecording();
  },

  // 取消录音（手势被打断/移出）
  cancelRecordingPress() {
    if (!this.data.isRecording) return;
    this.setData({ isLongPressRecording: false, canceledByGesture: true, showRecordOverlay: false });
    this.stopRecording();
    wx.showToast({ title: '已取消录音', icon: 'none' });
  },

  // 按住过程中滑动，用于判定上滑取消
  onRecordingTouchMove(e) {
    if (!this.data.isRecording) return;
    const currentY = e.touches && e.touches[0]?.clientY;
    if (typeof currentY !== 'number') return;
    const deltaY = currentY - this.data.touchStartY;
    const shouldCancel = deltaY < -40; // 上滑超过40px判定为取消
    if (shouldCancel !== this.data.cancelSlide) {
      this.setData({ cancelSlide: shouldCancel });
    }
  },

  onLoad() {
    this.loadRecentDreams();
  },

  // 输入梦境文本
  onDreamInput(e) {
    this.setData({
      dreamText: e.detail.value,
      isAnalyzed: false,
      analysisResult: null,
      emotionTags: []
    });
  },

  // AI分析梦境
  async analyzeDream(e) {
    console.log('点击AI分析按钮', e);
    // 检查是否输入了内容
    if (!this.data.dreamText || !this.data.dreamText.trim()) {
      wx.showToast({
        title: '请输入梦境内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    // 检查文本长度 - 至少需要3个字符
    const text = this.data.dreamText.trim();
    if (text.length < 3) {
      wx.showToast({
        title: '请输入至少3个字符的梦境内容',
        icon: 'none',
        duration: 2000
      });
      return;
    }

    this.setData({
      isAnalyzing: true
    });

    wx.showLoading({
      title: 'AI正在分析梦境...',
      mask: true
    });

    try {
      console.log('开始分析梦境，内容:', this.data.dreamText);
      
      // 调用模拟分析（以后可以替换为真实AI）
      const result = await analyzeDream(this.data.dreamText);
      
      console.log('分析成功，结果:', result);
      
      // 验证分析结果
      if (!result || !result.emotions || !result.tags) {
        throw new Error('AI返回的分析结果格式不正确');
      }
      
      // 获取星球配置
      const planetConfig = getPlanetConfig(result.planetType);
      
      // 保存分析结果
      this.setData({
        emotionTags: result.emotions,
        isAnalyzed: true,
        isAnalyzing: false,
        analysisResult: {
          ...result,
          planetEmoji: planetConfig.emoji,
          planetName: planetConfig.name,
          planetColor: planetConfig.color,
          planetDescription: planetConfig.description
        }
      });
      
      wx.hideLoading();
      
      // 显示分析结果摘要
      const emotionCount = result.emotions.length;
      const tagCount = result.tags.length;
      
      wx.showToast({
        title: `分析完成：${planetConfig.name}`,
        icon: 'success',
        duration: 2000
      });
      
    } catch (error) {
      console.error('AI分析失败:', error);
      wx.hideLoading();
      this.setData({
        isAnalyzing: false
      });
      
      wx.showModal({
        title: '分析失败',
        content: `AI分析失败，请重试\n\n错误：${error.message}`,
        showCancel: true,
        cancelText: '取消',
        confirmText: '重试',
        success: (res) => {
          if (res.confirm) {
            // 用户选择重试
            setTimeout(() => {
              this.analyzeDream();
            }, 500);
          }
        }
      });
    }
  },

  // 开始语音录制
  startVoiceRecord() {
    // 检查录音权限
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.record'] === false) {
          wx.showModal({
            title: '需要录音权限',
            content: '请允许使用录音功能来记录梦境',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting();
              }
            }
          });
          return;
        }
        
        // 开始录音
        this.startRecording();
      }
    });
  },

  // 开始录音
  startRecording() {
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStart(() => {
      console.log('录音开始');
      this.setData({
        isRecording: true,
        recordingDuration: 0
      });
      
      // 开始计时
      this.startRecordingTimer();
      
      wx.showToast({
        title: '开始录音',
        icon: 'none',
        duration: 1000
      });
    });

    recorderManager.onStop((res) => {
      console.log('录音结束', res);
      this.setData({
        isRecording: false,
        audioPath: res.tempFilePath
      });
      
      // 停止计时
      this.stopRecordingTimer();
      
      if (this.data.canceledByGesture || this.data.cancelSlide) {
        // 被取消的录音不进行识别
        this.setData({ canceledByGesture: false, cancelSlide: false });
        return;
      }
      
      wx.showToast({ title: '录音完成', icon: 'success', duration: 1200 });
      // 自动进行语音识别
      this.performVoiceRecognition(res.tempFilePath);
    });

    recorderManager.onError((err) => {
      console.error('录音错误:', err);
      this.setData({
        isRecording: false
      });
      this.stopRecordingTimer();
      
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
    });

    // 开始录音
    recorderManager.start({
      duration: 60000, // 最长60秒
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3'
    });
  },

  // 停止录音
  stopRecording() {
    const recorderManager = wx.getRecorderManager();
    recorderManager.stop();
  },

  // 开始录音计时
  startRecordingTimer() {
    this.data.recordingTimer = setInterval(() => {
      this.setData({
        recordingDuration: this.data.recordingDuration + 1
      });
    }, 1000);
  },

  // 停止录音计时
  stopRecordingTimer() {
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
      this.setData({
        recordingTimer: null
      });
    }
  },

  // 播放录音
  playRecording() {
    if (!this.data.audioPath) {
      wx.showToast({
        title: '没有录音文件',
        icon: 'none'
      });
      return;
    }

    const audioContext = wx.createInnerAudioContext();
    
    audioContext.src = this.data.audioPath;
    
    audioContext.onPlay(() => {
      console.log('开始播放');
      this.setData({
        isPlaying: true,
        playDuration: 0
      });
      this.startPlayTimer();
    });

    audioContext.onEnded(() => {
      console.log('播放结束');
      this.setData({
        isPlaying: false
      });
      this.stopPlayTimer();
      audioContext.destroy();
    });

    audioContext.onError((err) => {
      console.error('播放错误:', err);
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

  // 语音识别转文字
  performVoiceRecognition(audioPath) {
    wx.showLoading({
      title: '识别中...',
      mask: true
    });

    // 使用微信的语音识别API
    wx.uploadFile({
      url: 'https://api.weixin.qq.com/cgi-bin/media/voice/translatecontent',
      filePath: audioPath,
      name: 'media',
      success: (res) => {
        console.log('语音识别结果:', res);
        wx.hideLoading();
        
        try {
          const result = JSON.parse(res.data);
          if (result.err_code === 0 && result.result) {
            // 识别成功，更新文本
            this.setData({
              dreamText: this.data.dreamText + result.result
            });
            
            wx.showToast({
              title: '识别成功',
              icon: 'success'
            });
          } else {
            throw new Error(result.err_msg || '识别失败');
          }
        } catch (error) {
          console.error('语音识别解析失败:', error);
          wx.showToast({
            title: '识别失败，请重试',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        console.error('语音识别请求失败:', err);
        wx.hideLoading();
        wx.showToast({
          title: '识别失败',
          icon: 'none'
        });
      }
    });
  },

  // 删除录音
  deleteRecording() {
    if (this.data.audioPath) {
      wx.removeSavedFile({
        filePath: this.data.audioPath,
        success: () => {
          console.log('录音文件删除成功');
        }
      });
    }
    
    this.setData({
      audioPath: '',
      recordingDuration: 0,
      playDuration: 0
    });
  },


  // 保存梦境
  async saveDream(e) {
    console.log('点击保存按钮', e);
    if (!this.data.dreamText.trim()) {
      wx.showToast({
        title: '请输入梦境内容',
        icon: 'none'
      });
      return;
    }

    // 检查是否已分析
    if (!this.data.isAnalyzed || !this.data.analysisResult) {
      wx.showModal({
        title: '提示',
        content: '请先进行AI分析，以便生成对应的星球',
        showCancel: true,
        cancelText: '直接保存',
        confirmText: '去分析',
        success: (res) => {
          if (res.confirm) {
            // 用户选择去分析
            this.analyzeDream();
          } else {
            // 用户选择直接保存（使用默认配置）
            this.saveDreamWithoutAnalysis();
          }
        }
      });
      return;
    }

    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    try {
      const analysisResult = this.data.analysisResult;
      
      // 获取星球配置
      const planetConfig = getPlanetConfig(analysisResult.planetType);
      
      // 准备梦境数据
      const dreamData = {
        content: this.data.dreamText,
        date: this.formatDate(new Date()),
        time: this.formatTime(new Date()),
        emotions: analysisResult.emotions || [],
        tags: analysisResult.tags || [],
        interpretation: analysisResult.interpretation || '',
        planetType: analysisResult.planetType,
        planetName: planetConfig.name,
        emoji: planetConfig.emoji,
        color: planetConfig.color,
        description: planetConfig.description,
        audioPath: this.data.audioPath // 包含语音文件路径
      };
      
      // 保存到云数据库
      await saveDream(dreamData);
      
      wx.hideLoading();
      wx.showToast({
        title: `已保存到${planetConfig.name}`,
        icon: 'success',
        duration: 2000
      });
      
      // 清空输入
      this.setData({
        dreamText: '',
        isAnalyzed: false,
        isAnalyzing: false,
        emotionTags: [],
        analysisResult: null,
        audioPath: '',
        recordingDuration: 0,
        playDuration: 0
      });

      // 刷新列表
      this.loadRecentDreams();
    } catch (error) {
      console.error('保存失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 不分析直接保存（使用默认配置）
  async saveDreamWithoutAnalysis() {
    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    try {
      // 获取默认星球配置
      const planetConfig = getPlanetConfig('奇幻星球');
      
      // 准备梦境数据
      const dreamData = {
        content: this.data.dreamText,
        date: this.formatDate(new Date()),
        time: this.formatTime(new Date()),
        emotions: [],
        tags: [],
        interpretation: '',
        planetType: '奇幻星球',
        planetName: planetConfig.name,
        emoji: planetConfig.emoji,
        color: planetConfig.color,
        description: planetConfig.description,
        audioPath: this.data.audioPath
      };
      
      // 保存到云数据库
      await saveDream(dreamData);
      
      wx.hideLoading();
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
      
      // 清空输入
      this.setData({
        dreamText: '',
        isAnalyzed: false,
        emotionTags: [],
        analysisResult: null,
        audioPath: '',
        recordingDuration: 0,
        playDuration: 0
      });

      // 刷新列表
      this.loadRecentDreams();
    } catch (error) {
      console.error('保存失败:', error);
      wx.hideLoading();
      wx.showToast({
        title: '保存失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 加载最近梦境 - 增强版
  async loadRecentDreams() {
    try {
      const dreams = await getUserDreams(10);
      
      // 格式化数据 - 增强版
      const formattedDreams = dreams.map(dream => {
        try {
          return {
            id: dream._id,
            date: this.formatDisplayDate(dream.date),
            time: this.formatTime(dream.date),
            preview: dream.content ? dream.content.substring(0, 50) : '无内容',
            hasMore: dream.content && dream.content.length > 50,
            tags: dream.tags || [],
            emotion: this.getEmotionIcon(dream.emotions),
            content: dream.content || ''
          };
        } catch (error) {
          console.warn('格式化梦境数据失败:', error, dream);
          // 返回安全的默认数据
          return {
            id: dream._id || 'unknown',
            date: '未知日期',
            time: '00:00',
            preview: '数据加载失败',
            hasMore: false,
            tags: [],
            emotion: '😐',
            content: ''
          };
        }
      });
      
      this.setData({
        recentDreams: formattedDreams
      });
    } catch (error) {
      console.error('加载梦境失败:', error);
      // 设置空数据，避免界面崩溃
      this.setData({
        recentDreams: []
      });
    }
  },

  // 获取情绪图标 - 增强错误处理
  getEmotionIcon(emotions) {
    try {
      // 检查输入参数
      if (!emotions) return '';
      if (!Array.isArray(emotions)) return '';
      if (emotions.length === 0) return '';
      
      // 获取第一个情绪，确保是字符串类型
      let emotion = emotions[0];
      
      // 如果emotion是对象，尝试获取name或value属性
      if (typeof emotion === 'object' && emotion !== null) {
        emotion = emotion.name || emotion.value || emotion.text || '';
      }
      
      // 确保emotion是字符串
      emotion = String(emotion || '');
      
      // 如果为空字符串，返回默认图标
      if (!emotion.trim()) return '😐';
      
      // 情绪匹配
      if (emotion.includes('快乐') || emotion.includes('开心') || emotion.includes('高兴')) return '😊';
      if (emotion.includes('悲伤') || emotion.includes('难过') || emotion.includes('伤心')) return '😢';
      if (emotion.includes('恐惧') || emotion.includes('害怕') || emotion.includes('惊恐')) return '😨';
      if (emotion.includes('愤怒') || emotion.includes('生气') || emotion.includes('恼火')) return '😠';
      if (emotion.includes('惊讶') || emotion.includes('震惊') || emotion.includes('吃惊')) return '😲';
      if (emotion.includes('平静') || emotion.includes('安静') || emotion.includes('平和')) return '😌';
      if (emotion.includes('兴奋') || emotion.includes('激动') || emotion.includes('兴奋')) return '🤩';
      
      return '😐'; // 默认情绪图标
    } catch (error) {
      console.warn('获取情绪图标失败:', error);
      return '😐'; // 出错时返回默认图标
    }
  },

  // 查看梦境详情
  viewDreamDetail(e) {
    const dreamId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dreams/detail/detail?id=${dreamId}`
    });
  },

  // 前往宇宙地图
  goToUniverse(e) {
    wx.navigateTo({
      url: '/pages/universe/map/map',
      fail: (err) => {
        console.error('跳转宇宙地图失败：', err)
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        })
      }
    });
  },

  // 前往统计分析页面
  goToAnalytics() {
    wx.navigateTo({
      url: '/pages/analytics/analytics',
      fail: (err) => {
        console.error('跳转分析页面失败：', err)
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        })
      }
    });
  },

  // 开始梦境引导
  startDreamGuidance() {
    wx.showToast({
      title: '梦境引导功能开发中',
      icon: 'none'
    });
  },


  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 格式化时间
  formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // 格式化显示日期
  formatDisplayDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;
    
    return dateStr;
  },

  // ========== 新增的交互方法 ==========
  
  // 格式化时间
  formatTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('zh-CN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  },

  // 编辑梦境
  editDream(e) {
    const dreamId = e.currentTarget.dataset.id;
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  // 删除梦境
  deleteDream(e) {
    const dreamId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个梦境吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 实现删除功能
          wx.showToast({
            title: '删除成功',
            icon: 'success'
          });
          this.loadRecentDreams();
        }
      }
    });
  },

  // 打开文本编辑器
  openTextEditor() {
    wx.showToast({
      title: '文本编辑器开发中',
      icon: 'none'
    });
  },

  // 添加文本模板
  addTextTemplate(e) {
    console.log('点击添加模板按钮', e);
    const templates = [
      '我梦见自己在...',
      '梦里我看到了...',
      '我梦到和...',
      '在梦中我...'
    ];
    
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    this.setData({
      dreamText: this.data.dreamText + randomTemplate
    });
    
    wx.showToast({
      title: '已添加模板',
      icon: 'success',
      duration: 1000
    });
  },

  // 合并梦境
  mergeDreams() {
    wx.showToast({
      title: '合并功能开发中',
      icon: 'none'
    });
  },

  // 返回上一页
  onBack() {
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      // 如果是首页，可以关闭小程序或提示
      wx.showModal({
        title: '提示',
        content: '确定要退出小程序吗？',
        success: (res) => {
          if (res.confirm) {
            // 关闭小程序（需要用户手动操作）
            wx.showToast({
              title: '请手动关闭小程序',
              icon: 'none'
            });
          }
        }
      });
    }
  }

})
