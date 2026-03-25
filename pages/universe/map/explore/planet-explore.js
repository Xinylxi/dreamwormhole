// planet-explore.js - 3D星球探索页面
const { getUserDreams } = require('../../../../utils/data/cloud');

Page({
  data: {
    planetId: '',
    planetName: '',
    planetColor: '',
    planetEmoji: '',
    planetDescription: '',
    dreams: [],
    dreamCount: 0,
    
    // 3D控制相关
    isRotating: true,
    rotationSpeed: 2,
    scale: 1,
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    
    // 交互状态
    isDragging: false,
    lastTouchX: 0,
    lastTouchY: 0,
    lastScale: 1,
    lastDistance: 0,
    
    // 动画相关
    animationFrame: null,
    autoRotateTimer: null,
    
    // 性能优化
    lastUpdateTime: 0,
    updateInterval: 16, // 60fps
    
    // 触觉反馈
    hapticEnabled: true
  },

  onLoad(options) {
    const { planetId, planetName, planetColor, planetEmoji } = options;
    
    this.setData({
      planetId: planetId || '',
      planetName: planetName || '未知星球',
      planetColor: planetColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      planetEmoji: planetEmoji || '🌍'
    });
    
    this.loadPlanetData();
    this.startAutoRotation();
  },

  onUnload() {
    this.stopAutoRotation();
    if (this.data.animationFrame) {
      cancelAnimationFrame(this.data.animationFrame);
    }
  },

  // 加载星球数据
  async loadPlanetData() {
    try {
      const dreams = await getUserDreams();
      const planetDreams = dreams.filter(dream => dream.planetType === this.data.planetId);
      
      this.setData({
        dreams: planetDreams,
        dreamCount: planetDreams.length,
        planetDescription: this.getPlanetDescription(this.data.planetId)
      });
    } catch (error) {
      console.error('加载星球数据失败:', error);
    }
  },

  // 开始自动旋转
  startAutoRotation() {
    if (this.data.isRotating) {
      const animate = (currentTime) => {
        if (currentTime - this.data.lastUpdateTime >= this.data.updateInterval) {
          this.setData({
            rotationY: (this.data.rotationY + this.data.rotationSpeed) % 360,
            lastUpdateTime: currentTime
          });
        }
        
        if (this.data.isRotating) {
          this.data.animationFrame = requestAnimationFrame(animate);
        }
      };
      
      this.data.animationFrame = requestAnimationFrame(animate);
    }
  },

  // 停止自动旋转
  stopAutoRotation() {
    if (this.data.animationFrame) {
      cancelAnimationFrame(this.data.animationFrame);
      this.data.animationFrame = null;
    }
  },

  // 切换旋转状态
  toggleRotation() {
    this.setData({
      isRotating: !this.data.isRotating
    });
    
    // 触觉反馈
    if (this.data.hapticEnabled) {
      wx.vibrateShort({
        type: 'light'
      });
    }
    
    if (this.data.isRotating) {
      this.startAutoRotation();
    } else {
      this.stopAutoRotation();
    }
  },

  // 重置视角
  resetView() {
    this.setData({
      scale: 1,
      rotationX: 0,
      rotationY: 0,
      rotationZ: 0
    });
  },

  // 放大星球
  zoomIn() {
    const newScale = Math.min(this.data.scale * 1.2, 3);
    this.setData({
      scale: newScale
    });
  },

  // 缩小星球
  zoomOut() {
    const newScale = Math.max(this.data.scale / 1.2, 0.5);
    this.setData({
      scale: newScale
    });
  },

  // 触摸开始
  onTouchStart(e) {
    if (e.touches.length === 1) {
      // 单指拖拽旋转
      this.setData({
        isDragging: true,
        lastTouchX: e.touches[0].clientX,
        lastTouchY: e.touches[0].clientY
      });
      this.stopAutoRotation();
    } else if (e.touches.length === 2) {
      // 双指缩放
      const distance = this.getDistance(e.touches[0], e.touches[1]);
      this.setData({
        lastScale: this.data.scale,
        lastDistance: distance
      });
    }
  },

  // 触摸移动
  onTouchMove(e) {
    if (e.touches.length === 1 && this.data.isDragging) {
      // 单指旋转 - 优化灵敏度
      const deltaX = e.touches[0].clientX - this.data.lastTouchX;
      const deltaY = e.touches[0].clientY - this.data.lastTouchY;
      
      this.setData({
        rotationY: (this.data.rotationY + deltaX * 0.8) % 360,
        rotationX: Math.max(-90, Math.min(90, this.data.rotationX - deltaY * 0.5)),
        lastTouchX: e.touches[0].clientX,
        lastTouchY: e.touches[0].clientY
      });
    } else if (e.touches.length === 2) {
      // 双指缩放 - 优化缩放体验
      const distance = this.getDistance(e.touches[0], e.touches[1]);
      const scale = this.data.lastScale * (distance / this.data.lastDistance);
      
      this.setData({
        scale: Math.max(0.2, Math.min(4, scale))
      });
      
      // 缩放时的触觉反馈
      if (this.data.hapticEnabled && Math.abs(scale - this.data.lastScale) > 0.1) {
        wx.vibrateShort({
          type: 'light'
        });
      }
    }
  },

  // 触摸结束
  onTouchEnd(e) {
    this.setData({
      isDragging: false
    });
    
    // 如果没有触摸了，重新开始自动旋转
    if (e.touches.length === 0 && this.data.isRotating) {
      setTimeout(() => {
        if (this.data.isRotating) {
          this.startAutoRotation();
        }
      }, 1000);
    }
  },

  // 计算两点间距离
  getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  },

  // 调整旋转速度
  adjustRotationSpeed(e) {
    const speed = parseFloat(e.detail.value);
    this.setData({
      rotationSpeed: speed
    });
  },

  // 查看梦境详情
  viewDreamDetail(e) {
    const dreamId = e.currentTarget.dataset.dreamId;
    wx.navigateTo({
      url: `/pages/dreams/detail/detail?id=${dreamId}`
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 返回星球详情（兼容旧方法）
  backToDetail() {
    this.onBack();
  },

  // 返回主界面
  goToHome() {
    wx.reLaunch({
      url: '/dream-wormhole-master/pages/dreams/record/record'
    });
  },

  // 获取星球描述
  getPlanetDescription(planetType) {
    const descriptions = {
      '飞翔星球': '自由翱翔的天空梦境，充满无限可能',
      '海洋星球': '深邃神秘的海洋世界，探索未知的深度',
      '森林星球': '生机勃勃的自然森林，与万物和谐共处',
      '迷宫星球': '错综复杂的迷宫世界，寻找内心的方向',
      '城市星球': '繁华喧嚣的都市生活，现代文明的缩影',
      '奇幻星球': '充满魔法的奇幻世界，超自然的力量',
      '恐怖星球': '黑暗恐惧的梦境领域，面对内心的恐惧',
      '童年星球': '纯真美好的童年回忆，无忧无虑的时光'
    };
    return descriptions[planetType] || '神秘未知的梦境星球';
  }
});
