// universe.js - 二维宇宙地图页面
const { getUserPlanets } = require('../../utils/cloud');
const { safePageInit, handleError } = require('../../utils/error-handler');

Page({
  // 页面路由信息
  route: 'pages/universe/universe',
  
  data: {
    planets: [],
    filteredPlanets: [],
    stars: [],
    connections: [],
    totalDreams: 0,
    planetCount: 0,
    selectedPlanet: null,
    centerPlanet: null,
    // 分类和搜索
    categories: ['全部', '快乐', '悲伤', '恐惧', '愤怒', '惊喜', '平静', '兴奋', '爱情', '冒险', '神秘', '未知'],
    selectedCategory: '全部',
    searchKeyword: '',
    showSearch: false,
    // 时间筛选
    timeFilter: '全部', // 全部、今天、本周、本月、更早// 
    sortBy: 'time', // time: 按时间, count: 按梦境数量

    // 宇宙地图拖拽平移
    panX: 0,
    panY: 0,
    isPanning: false,
    lastPanTouchX: 0,
    lastPanTouchY: 0
  },

  onLoad() {
    safePageInit(this, () => {
      this.generateStars();
      this.loadPlanets();
    });
  },
  onReady() {
    // 首次布局完成后计算拖拽边界
    this.updatePanBounds();
  },

 
  onShow() {
    if (this.data.planets.length > 0) {
      this.applyFilters(this.data.planets);
    } else {
      this.loadPlanets();
    }
  },

  // 生成星空背景
  generateStars() {
    const stars = [];
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 3
      });
    }
    this.setData({ stars });
  },

  // 加载星球数据
  async loadPlanets() {
    try {
      const planetsData = await getUserPlanets();
      const planets = this.formatPlanets(planetsData);
      
      // 计算总梦境数（所有星球的梦境数之和）
      const totalDreams = planets.reduce((sum, planet) => sum + (planet.dreamCount || 1), 0);
      
      this.setData({
        planets,
        totalDreams: totalDreams,
        planetCount: planets.length
      });
      
      // 应用筛选
      this.applyFilters(planets);
    } catch (error) {
      handleError(this, '加载星球数据失败', error);
    }
  },

  // 应用筛选和搜索
  applyFilters(planets) {
    let filtered = [...planets];
    
    // 分类筛选
    if (this.data.selectedCategory !== '全部') {
      const categoryMap = {
        '快乐': 'happy',
        '悲伤': 'sad',
        '恐惧': 'fear',
        '愤怒': 'anger',
        '惊喜': 'surprise',
        '平静': 'calm',
        '兴奋': 'excitement',
        '爱情': 'love',
        '冒险': 'adventure',
        '神秘': 'mystery',
        '未知': 'unknown'
      };
      const planetType = categoryMap[this.data.selectedCategory];
      if (planetType) {
        filtered = filtered.filter(p => {
          // 匹配 planetType 字段
          if (p.planetType === planetType) return true;
          // 兼容旧数据：匹配 id 字段
          if (p.id === planetType) return true;
          // 匹配标签中包含分类关键词的星球
          if (p.tags && p.tags.some(tag => tag && tag.toLowerCase().includes(this.data.selectedCategory.toLowerCase()))) return true;
          return false;
        });
      }
    }
    
    // 搜索关键词
    if (this.data.searchKeyword && this.data.searchKeyword.trim()) {
      const keyword = this.data.searchKeyword.trim().toLowerCase();
      
      // 支持中文主题名称搜索
      const categoryMap = {
        '快乐': 'happy',
        '悲伤': 'sad',
        '恐惧': 'fear',
        '愤怒': 'anger',
        '惊喜': 'surprise',
        '平静': 'calm',
        '兴奋': 'excitement',
        '爱情': 'love',
        '冒险': 'adventure',
        '神秘': 'mystery',
        '未知': 'unknown'
      };
      
      // 检查是否是主题名称
      const matchedType = categoryMap[keyword];
      
      filtered = filtered.filter(planet => {
        // 如果输入的是主题名称，直接匹配类型
        if (matchedType && planet.id === matchedType) {
          return true;
        }
        
        // 匹配星球名称
        if (planet.name && planet.name.toLowerCase().includes(keyword)) {
          return true;
        }
        
        // 匹配描述
        if (planet.description && planet.description.toLowerCase().includes(keyword)) {
          return true;
        }
        
        // 匹配标签
        if (planet.tags && planet.tags.some(tag => tag && tag.toLowerCase().includes(keyword))) {
          return true;
        }
        
        // 匹配主标签
        if (planet.mainTag && planet.mainTag.toLowerCase().includes(keyword)) {
          return true;
        }
        
        return false;
      });
    }
    
    // 时间筛选
    if (this.data.timeFilter !== '全部') {
      const now = new Date();
      filtered = filtered.filter(planet => {
        if (!planet.createTime) return false;
        const createDate = new Date(planet.createTime);
        const diffTime = now - createDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        switch (this.data.timeFilter) {
          case '今天':
            return diffDays === 0;
          case '本周':
            return diffDays <= 7;
          case '本月':
            return diffDays <= 30;
          case '更早':
            return diffDays > 30;
          default:
            return true;
        }
      });
    }
    
    // 排序
    if (this.data.sortBy === 'time') {
      filtered.sort((a, b) => {
        const timeA = new Date(a.createTime || 0);
        const timeB = new Date(b.createTime || 0);
        return timeB - timeA; // 最新的在前
      });
    } else if (this.data.sortBy === 'count') {
      filtered.sort((a, b) => b.dreamCount - a.dreamCount);
    }
    
    // 重新计算位置和连接
    // 如果用户已经手动拖拽过（planet.userMoved === true），则保留 x/y，不再按索引重排。
    filtered = filtered.map((planet, index) => {
      if (planet && planet.userMoved) {
        return planet;
      }
      const position = this.calculatePlanetPosition(index, filtered.length);
      return {
        ...planet,
        x: position.x,
        y: position.y
      };
    });
    
    const connections = this.generateConnections(filtered);
    
    // 确定要选中的星球
    let planetToSelect = null;
    if (this.data.searchKeyword && this.data.searchKeyword.trim()) {
      if (filtered.length === 1) {
        // 只有一个结果，自动选中并高亮
        planetToSelect = filtered[0];
      } else if (filtered.length > 1) {
        // 多个结果，选中第一个
        planetToSelect = filtered[0];
      }
      // 如果没有结果，planetToSelect 保持为 null
    }
    
    this.setData({
      filteredPlanets: filtered,
      connections,
      selectedPlanet: planetToSelect
    }, () => {
      // 当前位置固定在计算出的布局上；单个星球拖拽不依赖地图平移
      // 搜索后自动高亮匹配的星球
      if (planetToSelect) {
        setTimeout(() => {
          this.highlightPlanet(planetToSelect);
        }, 300);
      }
    });
  },

  // 星球拖拽：更新当前星球的 x/y（百分比坐标）并同步重算连接线
  onPlanetDragStart(e) {
    const planet = e.currentTarget && e.currentTarget.dataset && e.currentTarget.dataset.planet;
    if (!planet || !planet.id) return;

    const touch = e.touches && e.touches[0];
    if (!touch) return;

    // 运行时拖拽上下文：不用 setData，避免拖拽卡顿
    this._planetDrag = {
      id: planet.id,
      startTouchX: touch.clientX,
      startTouchY: touch.clientY,
      startPlanetX: Number(planet.x),
      startPlanetY: Number(planet.y),
      moved: false,
      lastUpdateTime: 0,
      containerRect: null
    };

    if (!Number.isFinite(this._planetDrag.startPlanetX)) this._planetDrag.startPlanetX = 50;
    if (!Number.isFinite(this._planetDrag.startPlanetY)) this._planetDrag.startPlanetY = 50;

    // 预先拿容器尺寸，用于 px -> 百分比换算
    const query = wx.createSelectorQuery();
    query.select('.universe-container').boundingClientRect();
    query.exec((res) => {
      if (this._planetDrag) {
        this._planetDrag.containerRect = res && res[0] ? res[0] : null;
      }
    });
  },

  onPlanetDragMove(e) {
    const ctx = this._planetDrag;
    if (!ctx || !ctx.id) return;
    const touch = e.touches && e.touches[0];
    if (!touch) return;

    const dx = touch.clientX - ctx.startTouchX;
    const dy = touch.clientY - ctx.startTouchY;

    // 轻微抖动不认为是拖拽，避免误触发点击逻辑
    if (!ctx.moved) {
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 36) return; // < 6px
      ctx.moved = true;
    }

    // 简单节流：避免 setData 过于频繁
    const now = Date.now();
    if (now - ctx.lastUpdateTime < 16) return;
    ctx.lastUpdateTime = now;

    const rect = ctx.containerRect;
    if (!rect || !rect.width || !rect.height) return;

    const deltaXPct = (dx / rect.width) * 100;
    const deltaYPct = (dy / rect.height) * 100;

    let nextX = ctx.startPlanetX + deltaXPct;
    let nextY = ctx.startPlanetY + deltaYPct;

    // “随意拖拽”：只做很宽松的夹取，防止出现极端 NaN/Infinity
    if (!Number.isFinite(nextX)) nextX = ctx.startPlanetX;
    if (!Number.isFinite(nextY)) nextY = ctx.startPlanetY;
    nextX = Math.max(-50, Math.min(150, nextX));
    nextY = Math.max(-50, Math.min(150, nextY));

    const updated = (this.data.filteredPlanets || []).map((p) => {
      if (p.id === ctx.id) return { ...p, x: nextX, y: nextY, userMoved: true };
      return p;
    });

    const connections = this.generateConnections(updated);

    // 同步更新源数据，确保下一次筛选/重新进入页面不会被自动重排覆盖
    const updatedAllPlanets = (this.data.planets || []).map((p) => {
      if (p.id === ctx.id) return { ...p, x: nextX, y: nextY, userMoved: true };
      return p;
    });

    this.setData({
      filteredPlanets: updated,
      connections,
      planets: updatedAllPlanets
    });
  },

  onPlanetDragEnd() {
    // 结束拖拽：清理上下文
    this._planetDrag = null;
  },

 // 地图触摸开始（拖拽平移）
 onMapTouchStart(e) {
  if (!e.touches || e.touches.length !== 1) return;
  const t = e.touches[0];
  this.setData({
    isPanning: true,
    lastPanTouchX: t.clientX,
    lastPanTouchY: t.clientY
  });
},

// 地图触摸移动（拖拽平移 + 边界限制）
onMapTouchMove(e) {
  if (!this.data.isPanning || !e.touches || e.touches.length !== 1) return;

  const touch = e.touches[0];
  const dx = touch.clientX - this.data.lastPanTouchX;
  const dy = touch.clientY - this.data.lastPanTouchY;

  const nextX = this.data.panX + dx;
  const nextY = this.data.panY + dy;

  this.setData({
    panX: nextX,
    panY: nextY,
    lastPanTouchX: touch.clientX,
    lastPanTouchY: touch.clientY
  });
},
// 地图触摸结束
onMapTouchEnd() {
  if (!this.data.isPanning) return;
  this.setData({
    isPanning: false,
    panX: this.data.panX,
    panY: this.data.panY
  });
},


/**
 * 计算拖拽边界：确保“所有星球”都能被拖到可视区域内
 * - 以 `.universe-container` 为坐标系
 * - 预留顶部工具栏/底部信息面板的遮挡安全区
 */
updatePanBounds(alsoClamp = false) {
  const planets = this.data.filteredPlanets || [];

  const query = wx.createSelectorQuery();
  query.select('.universe-container').boundingClientRect();
  query.select('.toolbar').boundingClientRect();
  query.select('.info-panel').boundingClientRect();
  query.exec((res) => {
    const containerRect = res && res[0];
    if (!containerRect) return;

    const toolbarRect = res && res[1];
    const infoRect = res && res[2];

    // 顶部/底部安全区（留一点手感空间）
    const safeTop = (toolbarRect ? toolbarRect.height : 0) + 12;
    const safeBottom = (infoRect ? infoRect.height : 0) + 12;
    const safeLeft = 12;
    const safeRight = 12;

    // 没有星球时，直接把边界设为 0
    if (planets.length === 0) {
      this._panBounds = { minX: 0, maxX: 0, minY: 0, maxY: 0 };
      if (alsoClamp) {
        this.setData({ panX: 0, panY: 0 });
      }
      return;
    }

    // 计算星球包围盒（使用百分比坐标映射到像素）
    let minXP = 100, maxXP = 0, minYP = 100, maxYP = 0;
    planets.forEach(p => {
      const x = typeof p.x === 'number' ? p.x : parseFloat(p.x);
      const y = typeof p.y === 'number' ? p.y : parseFloat(p.y);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      minXP = Math.min(minXP, x);
      maxXP = Math.max(maxXP, x);
      minYP = Math.min(minYP, y);
      maxYP = Math.max(maxYP, y);
    });

    // 星球可视尺寸冗余：把星球半径/文字/光晕粗略算进来
    const planetPadding = 70;

    const minX = (minXP / 100) * containerRect.width - planetPadding;
    const maxX = (maxXP / 100) * containerRect.width + planetPadding;
    const minY = (minYP / 100) * containerRect.height - planetPadding;
    const maxY = (maxYP / 100) * containerRect.height + planetPadding;

    // 将包围盒约束到“可视区域”（扣掉遮挡安全区）
    const viewLeft = safeLeft;
    const viewRight = containerRect.width - safeRight;
    const viewTop = safeTop;
    const viewBottom = containerRect.height - safeBottom;

    // 需要满足：minX + panX >= viewLeft 且 maxX + panX <= viewRight
    // => panX >= viewLeft - minX  且 panX <= viewRight - maxX
    const boundMinX = viewLeft - minX;
    const boundMaxX = viewRight - maxX;
    const boundMinY = viewTop - minY;
    const boundMaxY = viewBottom - maxY;

     // 允许额外拖出一段距离，进一步扩大拖拽活动范围
     const extraX = containerRect.width * 0.6;
     const extraY = containerRect.height * 0.6;
     boundMinX -= extraX;
     boundMaxX += extraX;
     boundMinY -= extraY;
     boundMaxY += extraY;
     
    // 若内容比视窗还小，会出现 min > max；此时锁定在中间
    const normalized = {
      minX: Math.min(boundMinX, boundMaxX),
      maxX: Math.max(boundMinX, boundMaxX),
      minY: Math.min(boundMinY, boundMaxY),
      maxY: Math.max(boundMinY, boundMaxY)
    };

    this._panBounds = normalized;

    if (alsoClamp) {
      const clamped = this.clampPan(this.data.panX, this.data.panY);
      this.setData({ panX: clamped.x, panY: clamped.y });
    }
  });
},

// 把平移值夹在边界内
clampPan(x, y) {
  const b = this._panBounds;
  if (!b) return { x, y };
  const cx = Math.max(b.minX, Math.min(b.maxX, x));
  const cy = Math.max(b.minY, Math.min(b.maxY, y));
  return { x: cx, y: cy };
},

  // 高亮显示星球
  highlightPlanet(planet) {
    if (!planet) return;
    
    // 添加震动反馈
    wx.vibrateShort();
    
    // 显示提示
    wx.showToast({
      title: `找到：${planet.name}`,
      icon: 'success',
      duration: 1500
    });
  },

  // 格式化星球数据 - 每个星球独立显示
  formatPlanets(planets) {
    // 直接使用星球数据，每个星球都是独立的
    return planets.map((planet) => {
      return {
        id: planet.id || planet._id,
        name: planet.name || '未知星球',
        emoji: planet.emoji || '🌌',
        color: planet.color || this.getPlanetColor('unknown'),
        description: planet.description || '等待探索的梦境星球',
        dreamCount: planet.dreamCount || 1,
        tags: planet.tags || planet.keywords || [],
        mainTag: (planet.tags && planet.tags.length > 0) ? planet.tags[0] : (planet.keywords && planet.keywords.length > 0 ? planet.keywords[0] : '未知'),
        createTime: planet.createTime || planet.lastDreamDate || planet.createdAt || new Date().toISOString(),
        scale: this.calculatePlanetScale(planet.dreamCount || 1),
        surface: true,
        atmosphere: (planet.dreamCount || 1) > 5,
        glow: (planet.dreamCount || 1) > 10,
        planetType: planet.planetType || 'unknown'
      };
    });
  },

  // 计算星球位置（椭圆布局）
  calculatePlanetPosition(index, total) {
    const centerX = 50;
    const centerY = 50;
    const radiusX = 35;
    const radiusY = 25;
    
    const angle = (index / total) * 2 * Math.PI;
    const x = centerX + radiusX * Math.cos(angle);
    const y = centerY + radiusY * Math.sin(angle);
    
    return { x: Math.max(10, Math.min(90, x)), y: Math.max(15, Math.min(85, y)) };
  },

  // 计算星球大小
  calculatePlanetScale(dreamCount) {
    if (dreamCount >= 20) return 1.5;
    if (dreamCount >= 10) return 1.3;
    if (dreamCount >= 5) return 1.1;
    return 1;
  },

  // 生成连接线
  generateConnections(planets) {
    const connections = [];
    
    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const planet1 = planets[i];
        const planet2 = planets[j];
        
        // 计算连接强度（基于共同标签和主题相似度）
        const commonTags = planet1.tags.filter(tag => planet2.tags.includes(tag));
        const themeSimilar = this.calculateThemeSimilarity(planet1, planet2);
        
        // 如果有共同标签或主题相似，则连接
        if (commonTags.length > 0 || themeSimilar > 0.3) {
          const dx = planet2.x - planet1.x;
          const dy = planet2.y - planet1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          // 连接强度 = 共同标签数 + 主题相似度
          const strength = commonTags.length + themeSimilar;
          
          connections.push({
            fromX: planet1.x,
            fromY: planet1.y,
            toX: planet2.x,
            toY: planet2.y,
            length: distance,
            angle: angle,
            strength: strength,
            commonTags: commonTags
          });
        }
      }
    }
    
    return connections;
  },

  // 计算主题相似度
  calculateThemeSimilarity(planet1, planet2) {
    // 基于星球类型和描述计算相似度
    let similarity = 0;
    
    // 相同类型
    if (planet1.id === planet2.id) {
      similarity += 0.5;
    }
    
    // 描述相似度（简单关键词匹配）
    const desc1 = (planet1.description || '').toLowerCase();
    const desc2 = (planet2.description || '').toLowerCase();
    const keywords1 = desc1.split(/[\s，,。.]+/);
    const keywords2 = desc2.split(/[\s，,。.]+/);
    const commonKeywords = keywords1.filter(k => keywords2.includes(k) && k.length > 1);
    similarity += commonKeywords.length * 0.1;
    
    return Math.min(similarity, 1);
  },

  // 星球点击事件
  onPlanetClick(e) {
    // 拖拽时不要触发点击选中（避免“拖一下就选中/卡顿提示”）
    if (this._planetDrag && this._planetDrag.moved) return;

    const planet = e.currentTarget.dataset.planet;
    this.setData({
      selectedPlanet: planet
    });
    
    // 添加点击反馈
    wx.vibrateShort();
    
    // 显示星球信息
    wx.showToast({
      title: `选中${planet.name}`,
      icon: 'success',
      duration: 1000
    });
  },

  // 探索星球
  explorePlanet(e) {
    const planet = e.currentTarget.dataset.planet;
    
    // 跳转到星球详情页面
    wx.navigateTo({
      url: `/dream-wormhole-master/pages/planet-detail/planet-detail?planetId=${planet.id}&planetName=${planet.name}`
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 返回主界面
  goToHome() {
    wx.reLaunch({
      url: '/dream-wormhole-master/pages/index/index'
    });
  },

  // 切换分类
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category;
    this.setData({
      selectedCategory: category
    });
    this.applyFilters(this.data.planets);
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    });
    this.applyFilters(this.data.planets);
  },

  // 清除搜索
  onClearSearch() {
    this.setData({
      searchKeyword: ''
    });
    this.applyFilters(this.data.planets);
  },

  // 切换搜索显示
  onToggleSearch() {
    console.log('点击搜索按钮，当前状态:', this.data.showSearch);
    const newState = !this.data.showSearch;
    this.setData({
      showSearch: newState
    });
    console.log('搜索框状态已切换为:', newState);
    
    // 如果打开搜索框，清除之前的搜索关键词
    if (newState && this.data.searchKeyword) {
      // 保持搜索关键词，用户可以继续搜索
    }
  },

  // 时间筛选
  onTimeFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({
      timeFilter: filter
    });
    this.applyFilters(this.data.planets);
  },

  // 排序方式
  onSortChange(e) {
    const sortBy = e.currentTarget.dataset.sort;
    this.setData({
      sortBy: sortBy
    });
    this.applyFilters(this.data.planets);
  },

  // 滚动到星球位置
  scrollToPlanet(planet) {
    if (!planet) return;
    
    // 计算星球在页面中的位置
    const query = wx.createSelectorQuery();
    query.select('.universe-container').boundingClientRect();
    query.select(`.planet-item[data-id="${planet.id}"]`).boundingClientRect();
    query.exec((res) => {
      if (res && res[1]) {
        const planetRect = res[1];
        if (planetRect) {
          wx.pageScrollTo({
            scrollTop: planetRect.top - 200,
            duration: 500
          });
        }
      }
    });
  },

  // 获取星球名称
  getPlanetName(planetType) {
    const names = {
      'happy': '快乐星球',
      'sad': '悲伤星球',
      'fear': '恐惧星球',
      'anger': '愤怒星球',
      'surprise': '惊喜星球',
      'calm': '平静星球',
      'excitement': '兴奋星球',
      'love': '爱情星球',
      'adventure': '冒险星球',
      'mystery': '神秘星球',
      'unknown': '未知星球'
    };
    return names[planetType] || '神秘星球';
  },

  // 获取星球表情
  getPlanetEmoji(planetType) {
    const emojis = {
      'happy': '😊',
      'sad': '😢',
      'fear': '😨',
      'anger': '😠',
      'surprise': '😲',
      'calm': '😌',
      'excitement': '🤩',
      'love': '💕',
      'adventure': '🗺️',
      'mystery': '🔮',
      'unknown': '🌌'
    };
    return emojis[planetType] || '🌌';
  },

  // 获取星球颜色
  getPlanetColor(planetType) {
    const colors = {
      'happy': 'linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)',
      'sad': 'linear-gradient(135deg, #4a90e2 0%, #7bb3f0 100%)',
      'fear': 'linear-gradient(135deg, #8b0000 0%, #dc143c 100%)',
      'anger': 'linear-gradient(135deg, #ff4500 0%, #ff6347 100%)',
      'surprise': 'linear-gradient(135deg, #ff69b4 0%, #ffb6c1 100%)',
      'calm': 'linear-gradient(135deg, #87ceeb 0%, #b0e0e6 100%)',
      'excitement': 'linear-gradient(135deg, #ff1493 0%, #ff69b4 100%)',
      'love': 'linear-gradient(135deg, #ff69b4 0%, #ff1493 100%)',
      'adventure': 'linear-gradient(135deg, #32cd32 0%, #90ee90 100%)',
      'mystery': 'linear-gradient(135deg, #9370db 0%, #ba55d3 100%)',
      'unknown': 'linear-gradient(135deg, #696969 0%, #a9a9a9 100%)'
    };
    return colors[planetType] || colors['unknown'];
  },

  // 获取星球描述
  getPlanetDescription(planetType) {
    const descriptions = {
      'happy': '充满欢乐与正能量的梦境世界',
      'sad': '承载着情感与回忆的梦境空间',
      'fear': '探索内心恐惧的梦境领域',
      'anger': '释放情绪与力量的梦境世界',
      'surprise': '充满意外与惊喜的梦境空间',
      'calm': '宁静平和的梦境港湾',
      'excitement': '充满激情与活力的梦境世界',
      'love': '温暖浪漫的梦境空间',
      'adventure': '充满冒险与探索的梦境世界',
      'mystery': '神秘莫测的梦境领域',
      'unknown': '等待探索的神秘梦境空间'
    };
    return descriptions[planetType] || descriptions['unknown'];
  }
});