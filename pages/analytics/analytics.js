// analytics.js - 梦境统计分析页面
const { getUserDreams } = require('../../../utils/data/cloud');

Page({
  data: {
    // 统计数据
    totalDreams: 0,
    totalPlanets: 0,
    thisWeekDreams: 0,
    thisMonthDreams: 0,

    // 图表数据
    emotionChart: [],
    planetChart: [],
    timeChart: [],

    // 趋势数据
    dreamTrend: [],
    planetTrend: [],

    // 详细统计
    emotionStats: [],
    planetStats: [],
    tagStats: [],

    // 时间筛选
    timeFilter: 'all', // all, week, month, year
    selectedPeriod: '全部时间',

    // 加载状态
    isLoading: true
  },

  onLoad() {
    this.loadAnalyticsData();
  },

  // 加载统计数据
  async loadAnalyticsData() {
    this.setData({ isLoading: true });

    try {
      // 获取所有梦境数据
      const dreams = await getUserDreams(1000); // 获取更多数据用于统计

      if (!dreams || dreams.length === 0) {
        this.setData({
          isLoading: false,
          totalDreams: 0,
          totalPlanets: 0
        });
        return;
      }

      // 计算基础统计
      const stats = this.calculateBasicStats(dreams);

      // 计算图表数据
      const charts = this.calculateChartData(dreams);

      // 计算趋势数据
      const trends = this.calculateTrendData(dreams);

      // 计算详细统计
      const details = this.calculateDetailedStats(dreams);

      this.setData({
        ...stats,
        ...charts,
        ...trends,
        ...details,
        isLoading: false
      });

    } catch (error) {
      console.error('加载统计数据失败:', error);
      wx.showToast({
        title: '加载统计数据失败',
        icon: 'none'
      });
      this.setData({ isLoading: false });
    }
  },

  // 计算基础统计
  calculateBasicStats(dreams) {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 统计本周梦境
    const thisWeekDreams = dreams.filter(dream => {
      const dreamDate = new Date(dream.date || dream.createTime);
      return dreamDate >= oneWeekAgo;
    }).length;

    // 统计本月梦境
    const thisMonthDreams = dreams.filter(dream => {
      const dreamDate = new Date(dream.date || dream.createTime);
      return dreamDate >= oneMonthAgo;
    }).length;

    // 统计唯一星球数量
    const uniquePlanets = new Set(dreams.map(dream => dream.planetType)).size;

    return {
      totalDreams: dreams.length,
      totalPlanets: uniquePlanets,
      thisWeekDreams,
      thisMonthDreams
    };
  },

  // 计算图表数据
  calculateChartData(dreams) {
    // 情绪分布图表
    const emotionCount = {};
    dreams.forEach(dream => {
      if (dream.emotions && Array.isArray(dream.emotions)) {
        dream.emotions.forEach(emotion => {
          const emotionName = typeof emotion === 'string' ? emotion : emotion.name || emotion;
          emotionCount[emotionName] = (emotionCount[emotionName] || 0) + 1;
        });
      }
    });

    const emotionChart = Object.entries(emotionCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8) // 取前8个
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / dreams.length) * 100)
      }));

    // 星球类型分布
    const planetCount = {};
    dreams.forEach(dream => {
      const planetType = dream.planetType || '未知';
      planetCount[planetType] = (planetCount[planetType] || 0) + 1;
    });

    const planetChart = Object.entries(planetCount)
      .sort(([,a], [,b]) => b - a)
      .map(([name, count]) => ({
        name,
        count,
        percentage: Math.round((count / dreams.length) * 100)
      }));

    // 时间分布（按小时）
    const hourCount = new Array(24).fill(0);
    dreams.forEach(dream => {
      if (dream.time) {
        const hour = parseInt(dream.time.split(':')[0]);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourCount[hour]++;
        }
      }
    });

    const timeChart = hourCount.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    }));

    return {
      emotionChart,
      planetChart,
      timeChart
    };
  },

  // 计算趋势数据
  calculateTrendData(dreams) {
    const now = new Date();
    const days = [];

    // 生成最近30天的日期
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      days.push(dateStr);
    }

    // 统计每天的梦境数量
    const dreamTrend = days.map((date, index) => {
      const count = dreams.filter(dream => {
        const dreamDate = (dream.date || dream.createTime || '').split('T')[0];
        return dreamDate === date;
      }).length;

      // 预计算样式
      const left = (index / (days.length - 1)) * 100;
      const maxCount = Math.max(...dreamTrend.map(d => d.count), 1); // 避免除零错误
      const top = (1 - count / maxCount) * 80;

      return {
        date: date.split('-').slice(1).join('/'), // MM/DD格式
        count,
        style: `left: ${left}%; top: ${top}%;`
      };
    });

    // 重新计算最大值（因为现在dreamTrend已经包含了所有数据）
    const maxDreamCount = Math.max(...dreamTrend.map(d => d.count), 1);
    dreamTrend.forEach((item, index) => {
      const left = (index / (days.length - 1)) * 100;
      const top = (1 - item.count / maxDreamCount) * 80;
      item.style = `left: ${left}%; top: ${top}%;`;
    });

    // 统计每天的星球数量（去重）
    const planetTrend = days.map(date => {
      const dayDreams = dreams.filter(dream => {
        const dreamDate = (dream.date || dream.createTime || '').split('T')[0];
        return dreamDate === date;
      });

      const uniquePlanets = new Set(dayDreams.map(d => d.planetType)).size;

      return {
        date: date.split('-').slice(1).join('/'),
        count: uniquePlanets
      };
    });

    return {
      dreamTrend,
      planetTrend
    };
  },

  // 计算详细统计
  calculateDetailedStats(dreams) {
    // 情绪统计
    const emotionStats = this.calculateEmotionStats(dreams);

    // 星球统计
    const planetStats = this.calculatePlanetStats(dreams);

    // 标签统计
    const tagStats = this.calculateTagStats(dreams);

    return {
      emotionStats,
      planetStats,
      tagStats
    };
  },

  // 计算情绪统计
  calculateEmotionStats(dreams) {
    const emotionMap = {};

    dreams.forEach(dream => {
      if (dream.emotions && Array.isArray(dream.emotions)) {
        dream.emotions.forEach(emotion => {
          const emotionName = typeof emotion === 'string' ? emotion : emotion.name || emotion;
          if (!emotionMap[emotionName]) {
            emotionMap[emotionName] = {
              name: emotionName,
              count: 0,
              dreams: []
            };
          }
          emotionMap[emotionName].count++;
          emotionMap[emotionName].dreams.push(dream);
        });
      }
    });

    return Object.values(emotionMap)
      .sort((a, b) => b.count - a.count)
      .map(stat => ({
        ...stat,
        percentage: Math.round((stat.count / dreams.length) * 100)
      }));
  },

  // 计算星球统计
  calculatePlanetStats(dreams) {
    const planetMap = {};

    dreams.forEach(dream => {
      const planetType = dream.planetType || '未知';
      if (!planetMap[planetType]) {
        planetMap[planetType] = {
          name: planetType,
          count: 0,
          dreams: [],
          emoji: dream.emoji || '🌌',
          color: dream.color || '#666'
        };
      }
      planetMap[planetType].count++;
      planetMap[planetType].dreams.push(dream);
    });

    return Object.values(planetMap)
      .sort((a, b) => b.count - a.count)
      .map(stat => ({
        ...stat,
        percentage: Math.round((stat.count / dreams.length) * 100)
      }));
  },

  // 计算标签统计
  calculateTagStats(dreams) {
    const tagMap = {};

    dreams.forEach(dream => {
      if (dream.tags && Array.isArray(dream.tags)) {
        dream.tags.forEach(tag => {
          if (!tagMap[tag]) {
            tagMap[tag] = {
              name: tag,
              count: 0,
              dreams: []
            };
          }
          tagMap[tag].count++;
          tagMap[tag].dreams.push(dream);
        });
      }
    });

    return Object.values(tagMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20) // 取前20个最热门标签
      .map(stat => {
        // 预计算标签样式
        const fontSize = 24 + stat.count * 2;
        const opacity = Math.min(0.6 + stat.count * 0.1, 1); // 最大透明度为1

        return {
          ...stat,
          percentage: Math.round((stat.count / dreams.length) * 100),
          style: `font-size: ${fontSize}rpx; opacity: ${opacity};`
        };
      });
  },

  // 时间筛选
  onTimeFilterChange(e) {
    const filter = e.currentTarget.dataset.filter;
    let selectedPeriod = '全部时间';

    switch (filter) {
      case 'week':
        selectedPeriod = '最近7天';
        break;
      case 'month':
        selectedPeriod = '最近30天';
        break;
      case 'year':
        selectedPeriod = '最近一年';
        break;
    }

    this.setData({
      timeFilter: filter,
      selectedPeriod
    });

    // 重新加载数据（这里可以优化为筛选现有数据）
    this.loadAnalyticsData();
  },

  // 刷新数据
  onRefresh() {
    this.loadAnalyticsData();
    wx.showToast({
      title: '数据已刷新',
      icon: 'success'
    });
  },

  // 返回上一页
  onBack() {
    wx.navigateBack();
  },

  // 分享统计
  onShare() {
    wx.showShareMenu({
      withShareTicket: true
    });
  }
});