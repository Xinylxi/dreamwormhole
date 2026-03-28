// record-interactive.js - 梦境记录页面（带完整交互功能）
const { getPlanetConfig } = require('../../../utils/ui/planet-config');
const { saveDream, getUserDreams } = require('../../../utils/data/cloud');
const { analyzeDream } = require('../../../utils/ai/coze');
const { parseCozeResponse } = require('../../../utils/ai/coze-parser');

Page({
  data: {
    dreamText: '',
    isAnalyzed: false,
    isAnalyzing: false,
    emotionTags: [],
    analysisResult: null,
    recentDreams: [],
    
    // Coze 平行宇宙故事相关
    showCozeStory: false,
    optionInput: "",
    cozeStoryContent: '',
    storyData: null,          // 存储解析后的故事数据
    currentRound: 0,          // 当前轮数
    totalRounds: 10,          // 总轮数
    branchOptions: [],        // 分支选项列表
    isStoryCompleted: false,  // 故事是否完成
    selectedOption: null,     // 用户选择的选项
    
    // 会话ID（用于保持Coze对话上下文）
    conversationId: null,
    
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

  // AI分析梦境（第一轮）
  async analyzeDream(e) {
    console.log('点击AI分析按钮');
    
    // 检查是否输入了内容
    if (!this.data.dreamText || !this.data.dreamText.trim()) {
      wx.showToast({
        title: '请输入梦境内容',
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
      
      // 调用Coze分析（使用story模式获取完整故事）
      const result = await analyzeDream(this.data.dreamText, false, 'story');
      
      console.log('分析成功，结果:', result);
      
      // 获取星球配置
      const planetConfig = getPlanetConfig(result.planetType || 'unknown');
      
      // 保存分析结果
      this.setData({
        emotionTags: result.emotions || [],
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
      
      // 显示平行宇宙故事（解析Coze响应）
      this.displayCozeStory(result);
      
      wx.hideLoading();
      
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
            setTimeout(() => {
              this.analyzeDream();
            }, 500);
          }
        }
      });
    }
  },

  // 显示Coze平行宇宙故事
  displayCozeStory(result) {
    console.log('开始解析Coze响应...');
    
    try {
      // 如果result已经包含解析好的故事数据
      if (result.storyData) {
        this.setData({
          storyData: result.storyData,
          currentRound: result.storyData.currentRound || 1,
          branchOptions: result.storyData.branchOptions || [],
          isStoryCompleted: result.storyData.isCompleted || false,
          showCozeStory: true,
          cozeStoryContent: result.storyContent || result.interpretation || ''
        });
        return;
      }

      // 否则使用解析器解析
      if (result.rawCozeResponse) {
        const parsedStory = parseCozeResponse(result.rawCozeResponse, 'story');
        
        console.log('解析后的故事数据:', parsedStory);
        
        this.setData({
          storyData: parsedStory,
          currentRound: parsedStory.currentRound || 1,
          branchOptions: parsedStory.branchOptions || [],
          isStoryCompleted: parsedStory.isCompleted || false,
          showCozeStory: true,
          cozeStoryContent: parsedStory.storyContent || result.interpretation || ''
        });
      } else {
        console.warn('没有找到Coze响应内容');
        // 即使没有故事数据，也显示基础分析结果
        this.setData({
          showCozeStory: true,
          cozeStoryContent: result.interpretation || ''
        });
      }
    } catch (error) {
      console.error('解析故事失败:', error);
      // 即使解析失败，也显示基础分析结果
      this.setData({
        showCozeStory: true,
        cozeStoryContent: result.interpretation || ''
      });
    }
  },

  // 用户选择分支选项
  async selectBranchOption(e) {
    const index = e.currentTarget.dataset.index;
    const selectedOption = this.data.branchOptions[index];
    
    if (!selectedOption) {
      wx.showToast({
        title: '选项无效',
        icon: 'none'
      });
      return;
    }

    console.log('用户选择选项:', index, selectedOption);
    
    this.setData({
      selectedOption: selectedOption,
      isAnalyzing: true
    });

    wx.showLoading({
      title: '正在展开平行宇宙...',
      mask: true
    });

    try {
      // 构造用户选择的消息
      const userChoice = selectedOption.label || selectedOption.text || `选项${String.fromCharCode(65 + index)}`;
      
      console.log('发送用户选择到Coze:', userChoice);
      
      // 调用Coze API继续故事
      // 注意：这里需要保持会话上下文，使用相同的conversationId
      const nextResult = await analyzeDream(userChoice, false, 'story');
      
      console.log('获取到下一轮故事:', nextResult);
      
      // 更新故事显示
      this.displayCozeStory(nextResult);
      
      wx.hideLoading();
      
    } catch (error) {
      console.error('获取下一轮故事失败:', error);
      wx.hideLoading();
      this.setData({
        isAnalyzing: false
      });
      
      wx.showToast({
        title: '故事展开失败，请重试',
        icon: 'none'
      });
    }
  },

  // 隐藏Coze故事
  hideCozeStory() {
    this.setData({
      showCozeStory: false
    });
  },

  // 保存梦境
  async saveDream() {
    if (!this.data.isAnalyzed || !this.data.analysisResult) {
      wx.showToast({
        title: '请先分析梦境',
        icon: 'none'
      });
      return;
    }

    wx.showLoading({
      title: '保存中...',
      mask: true
    });

    try {
      const dreamData = {
        content: this.data.dreamText,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0].substring(0, 5),
        emotions: this.data.emotionTags,
        tags: this.data.analysisResult.tags || [],
        planetType: this.data.analysisResult.planetType || 'unknown',
        planetName: this.data.analysisResult.planetName,
        planetEmoji: this.data.analysisResult.planetEmoji,
        interpretation: this.data.analysisResult.interpretation || '',
        // 保存平行宇宙故事数据
        storyData: this.data.storyData,
        conversationId: this.data.conversationId
      };

      // 保存到云数据库
      await saveDream(dreamData);

      wx.hideLoading();
      
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        duration: 2000
      });

      // 刷新最近梦境列表
      setTimeout(() => {
        this.loadRecentDreams();
      }, 500);

    } catch (error) {
      console.error('保存失败:', error);
      wx.hideLoading();
      
      wx.showModal({
        title: '保存失败',
        content: `保存失败：${error.message}`,
        showCancel: false
      });
    }
  },

  // 加载最近梦境
  async loadRecentDreams() {
    try {
      const dreams = await getUserDreams(5); // 获取最近5条
      
      this.setData({
        recentDreams: dreams.map(dream => ({
          _id: dream._id,
          date: dream.date,
          time: dream.time,
          emotion: dream.planetEmoji || '🌙',
          preview: dream.content.substring(0, 50),
          tags: dream.tags || [],
          planetType: dream.planetType
        }))
      });
    } catch (error) {
      console.error('加载最近梦境失败:', error);
    }
  },

  // 查看梦境详情
  viewDream(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/dreams/detail/detail?id=${id}`
    });
  },

  // 跳转到宇宙地图
  goToMap() {
    wx.navigateTo({
      url: '/pages/universe/map/map'
    });
  },

  // 跳转到统计页面
  goToAnalytics() {
    wx.navigateTo({
      url: '/pages/analytics/analytics'
    });
  },

  // 语音录制相关方法（保持原有实现）
  startRecordingPress(e) {
    if (this.data.isRecording) return;
    
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

  stopRecordingPress() {
    if (!this.data.isRecording) return;
    this.setData({ isLongPressRecording: false, showRecordOverlay: false });
    this.stopRecording();
  },

  onRecordingTouchMove(e) {
    if (!this.data.isRecording) return;
    const currentY = e.touches && e.touches[0]?.clientY;
    if (typeof currentY !== 'number') return;
    
    const deltaY = currentY - this.data.touchStartY;
    const shouldCancel = deltaY < -40;
    
    if (shouldCancel !== this.data.cancelSlide) {
      this.setData({ cancelSlide: shouldCancel });
    }
  },

  startRecording() {
    const recorderManager = wx.getRecorderManager();
    
    recorderManager.onStart(() => {
      console.log('录音开始');
      this.setData({
        isRecording: true,
        recordingDuration: 0
      });
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
      this.stopRecordingTimer();
      
      if (this.data.canceledByGesture || this.data.cancelSlide) {
        this.setData({ canceledByGesture: false, cancelSlide: false });
        return;
      }
      
      wx.showToast({ title: '录音完成', icon: 'success', duration: 1200 });
      this.performVoiceRecognition(res.tempFilePath);
    });

    recorderManager.onError((err) => {
      console.error('录音错误:', err);
      this.setData({ isRecording: false });
      this.stopRecordingTimer();
      wx.showToast({
        title: '录音失败',
        icon: 'none'
      });
    });

    recorderManager.start({
      duration: 60000,
      sampleRate: 16000,
      numberOfChannels: 1,
      encodeBitRate: 96000,
      format: 'mp3'
    });

    this.recorderManager = recorderManager;
  },

  stopRecording() {
    if (this.recorderManager) {
      this.recorderManager.stop();
    }
  },

  startRecordingTimer() {
    this.data.recordingTimer = setInterval(() => {
      this.setData({
        recordingDuration: this.data.recordingDuration + 1
      });
    }, 1000);
  },

  stopRecordingTimer() {
    if (this.data.recordingTimer) {
      clearInterval(this.data.recordingTimer);
      this.data.recordingTimer = null;
    }
  },

  async performVoiceRecognition(filePath) {
    wx.showLoading({
      title: '识别中...',
      mask: true
    });

    try {
      const result = await wx.cloud.getTempFileURL({
        fileList: [filePath]
      });

      if (result.fileList && result.fileList[0]) {
        const tempFileURL = result.fileList[0].tempFileURL;
        console.log('语音文件URL:', tempFileURL);
        
        wx.cloud.callFunction({
          name: 'speechRecognition',
          data: {
            fileUrl: tempFileURL
          },
          success: (res) => {
            console.log('语音识别结果:', res);
            wx.hideLoading();
            
            if (res.result && res.result.text) {
              this.setData({
                dreamText: this.data.dreamText + (this.data.dreamText ? '\n' : '') + res.result.text
              });
              
              wx.showToast({
                title: '识别成功',
                icon: 'success',
                duration: 1500
              });
            }
          },
          fail: (err) => {
            console.error('语音识别失败:', err);
            wx.hideLoading();
            wx.showToast({
              title: '识别失败',
              icon: 'none'
            });
          }
        });
      }
    } catch (error) {
      console.error('语音识别错误:', error);
      wx.hideLoading();
      wx.showToast({
        title: '识别失败',
        icon: 'none'
      });
    }
  },

  togglePlay() {
    if (this.data.isPlaying) {
      this.stopPlayAudio();
    } else {
      this.playAudio();
    }
  },

  playAudio() {
    if (!this.data.audioPath) return;
    
    const innerAudioContext = wx.createInnerAudioContext();
    innerAudioContext.src = this.data.audioPath;
    
    innerAudioContext.onPlay(() => {
      console.log('音频播放开始');
      this.setData({ isPlaying: true });
    });
    
    innerAudioContext.onEnded(() => {
      console.log('音频播放结束');
      this.setData({ isPlaying: false });
    });
    
    innerAudioContext.onError((err) => {
      console.error('音频播放错误:', err);
      this.setData({ isPlaying: false });
      wx.showToast({
        title: '播放失败',
        icon: 'none'
      });
    });
    
    innerAudioContext.play();
    this.audioContext = innerAudioContext;
  },

  stopPlayAudio() {
    if (this.audioContext) {
      this.audioContext.stop();
      this.audioContext.destroy();
      this.audioContext = null;
    }
    this.setData({ isPlaying: false });
  },

  deleteRecording() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这段录音吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            audioPath: '',
            isPlaying: false,
            recordingDuration: 0
          });
          
          wx.showToast({
            title: '已删除',
            icon: 'success'
          });
        }
      }
    });
  },

// 手动输入选项 - 处理输入
onOptionInput(e) {
  const inputValue = e.detail.value.trim().toUpperCase();
  console.log('用户输入选项:', inputValue);
  
  // 验证输入是否为有效的选项（A/B/C/D）
  const validOptions = ['A', 'B', 'C', 'D'];
  const isValid = validOptions.includes(inputValue);
  
  if (!isValid && inputValue) {
    console.warn('无效的选项输入:', inputValue);
    // 可以添加震动反馈
    wx.vibrateShort({
      type: 'light'
    });
  }
  
  this.setData({
    optionInput: inputValue
  });
},

// 手动输入选项 - 提交
submitOption() {
  const optionInput = this.data.optionInput ? this.data.optionInput.trim().toUpperCase() : '';
  
  if (!optionInput) {
    console.warn('选项输入为空');
    wx.showToast({
      title: '请输入选项（A/B/C/D）',
      icon: 'none'
    });
    return;
  }
  
  // 验证输入是否为有效的选项
  const validOptions = ['A', 'B', 'C', 'D'];
  if (!validOptions.includes(optionInput)) {
    console.warn('无效的选项:', optionInput);
    wx.showToast({
      title: '请输入有效选项（A/B/C/D）',
      icon: 'none'
    });
    return;
  }
  
  console.log('用户提交选项:', optionInput);
  
  // 清空输入框
  this.setData({
    optionInput: ''
  });
  
  // 继续故事
  this.continueCozeStory(optionInput);
}
,

// 选择分支选项
selectCozeOption(e) {
  const selectedIndex = e.currentTarget.dataset.index;
  const selectedOption = this.data.cozeOptions[selectedIndex];
  const selectedLabel = selectedOption.label;
  
  console.log('用户选择了选项:', selectedLabel, selectedOption);
  
  // 显示加载状态
  wx.showLoading({
    title: '正在穿越平行宇宙...',
    mask: true
  });
  
  // 添加到对话历史
  const conversationHistory = this.data.cozeConversationHistory || [];
  conversationHistory.push({
    role: 'user',
    content: selectedLabel
  });
  
  this.setData({
    cozeConversationHistory: conversationHistory
  });
  
  // 继续故事
  this.continueCozeStory(selectedLabel);
},

// 继续平行宇宙故事
async continueCozeStory(selection) {
  try {
    console.log('继续平行宇宙故事，选择:', selection);
    
    // 调用Coze API继续故事
    const result = await analyzeDream(
      selection,
      false, // 不是首次分析
      'story', // 故事模式
      this.data.cozeConversationHistory || []
    );
    
    console.log('继续故事返回结果:', result);
    
    // 解析新的响应
    const parsedResponse = parseCozeResponse(result.rawCozeResponse || '', 'story');
    
    console.log('解析后的响应:', parsedResponse);
    
    // 构建新的分支选项
    let newOptions = [];
    if (parsedResponse && parsedResponse.branchOptions && parsedResponse.branchOptions.length > 0) {
      newOptions = parsedResponse.branchOptions.map(opt => ({
        label: opt.label,
        text: opt.text,
        icon: opt.icon || '✨'
      }));
    }
    
    console.log('新的分支选项:', newOptions);
    
    // 添加到对话历史
    const conversationHistory = this.data.cozeConversationHistory || [];
    conversationHistory.push({
      role: 'user',
      content: selection
    });
    conversationHistory.push({
      role: 'assistant',
      content: result.rawCozeResponse || ''
    });
    
    // 更新页面数据
    this.setData({
      cozeStoryContent: parsedResponse?.storyContent || result.rawCozeResponse || '',
      cozeOptions: newOptions,
      currentRound: (parsedResponse?.roundInfo?.current || this.data.currentRound || 0) + 1,
      totalRounds: parsedResponse?.roundInfo?.total || this.data.totalRounds || 5,
      hasBranchOptions: newOptions.length > 0,
      isFinalRound: parsedResponse?.isCompleted || false,
      cozeConversationHistory: conversationHistory
    });
    
    wx.hideLoading();
    
    // 滚动到底部
    wx.pageScrollTo({
      scrollTop: 9999,
      duration: 300
    });
    
  } catch (error) {
    console.error('继续故事失败:', error);
    wx.hideLoading();
    wx.showToast({
      title: '平行宇宙连接失败',
      icon: 'none'
    });
  }
},


  addTemplate() {
    wx.showActionSheet({
      itemList: [
        '飞翔梦境',
        '海洋梦境',
        '森林梦境',
        '迷宫梦境'
      ],
      success: (res) => {
        const templates = [
          '梦见自己在天空中自由飞翔，周围是彩色的云朵，风从耳边呼啸而过。',
          '梦见自己在深海中游泳，周围是各种美丽的鱼群，海水清澈透明。',
          '梦见自己在茂密的森林中漫步，阳光透过树叶洒下斑驳的光影。',
          '梦见在一个巨大的迷宫中寻找出口，感到焦虑和困惑。'
        ];
        
        this.setData({
          dreamText: templates[res.tapIndex]
        });
      }
    });
  }
});
