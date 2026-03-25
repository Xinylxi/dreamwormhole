/**
 * 数据驱动系统 - Data Driven System
 * 负责管理宇宙的所有数据源和状态
 */

class DataDrivenSystem {
  constructor() {
    this.dataSources = new Map();
    this.currentData = null;
    this.dataHistory = [];
    this.subscribers = new Map();
    this.isAutoRefresh = false;
    this.refreshInterval = null;
    
    this.init();
  }

  /**
   * 初始化数据驱动系统
   */
  init() {
    console.log('📊 数据驱动系统初始化中...');
    
    // 注册数据源
    this.registerDataSources();
    
    // 加载初始数据
    this.loadInitialData();
    
    console.log('✅ 数据驱动系统初始化完成');
  }

  /**
   * 注册数据源
   */
  registerDataSources() {
    // 本地静态数据
    this.dataSources.set('local', {
      name: '本地数据',
      type: 'static',
      priority: 1,
      load: () => this.loadLocalData(),
      refresh: () => this.loadLocalData()
    });

    // API动态数据
    this.dataSources.set('api', {
      name: 'API数据',
      type: 'dynamic',
      priority: 2,
      load: () => this.loadAPIData(),
      refresh: () => this.loadAPIData()
    });

    // 程序化生成数据
    this.dataSources.set('procedural', {
      name: '程序化数据',
      type: 'generated',
      priority: 3,
      load: () => this.generateProceduralData(),
      refresh: () => this.generateProceduralData()
    });

    // 用户自定义数据
    this.dataSources.set('user', {
      name: '用户数据',
      type: 'custom',
      priority: 4,
      load: () => this.loadUserData(),
      refresh: () => this.loadUserData()
    });
  }

  /**
   * 加载初始数据
   */
  async loadInitialData() {
    try {
      // 按优先级尝试加载数据
      const sources = Array.from(this.dataSources.values())
        .sort((a, b) => a.priority - b.priority);

      for (const source of sources) {
        try {
          const data = await source.load();
          if (data && this.validateData(data)) {
            this.currentData = data;
            console.log(`✅ 数据源加载成功: ${source.name}`);
            this.notifySubscribers('dataLoaded', data);
            return;
          }
        } catch (error) {
          console.warn(`⚠️ 数据源加载失败: ${source.name}`, error);
        }
      }

      // 如果所有数据源都失败，使用默认数据
      this.currentData = this.getDefaultData();
      console.log('📊 使用默认数据');
      this.notifySubscribers('dataLoaded', this.currentData);

    } catch (error) {
      console.error('❌ 数据加载失败:', error);
      this.currentData = this.getDefaultData();
    }
  }

  /**
   * 加载本地数据
   */
  loadLocalData() {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      universe: {
        galaxies: [
          {
            id: 'milky_way',
            name: '银河系',
            type: 'spiral',
            arms: 4,
            stars: 100000000000,
            position: { x: 0, y: 0, z: 0 },
            rotation: { x: 0, y: 0, z: 0 },
            scale: 1.0
          }
        ],
        stars: [
          {
            id: 'sun',
            name: '太阳',
            type: 'main_sequence',
            mass: 1.0,
            temperature: 5778,
            age: 4600000000,
            position: { x: 0, y: 0, z: 0 },
            color: '#FFD700',
            size: 1.0
          }
        ],
        nebulae: [
          {
            id: 'orion_nebula',
            name: '猎户座星云',
            type: 'emission',
            density: 0.3,
            temperature: 10000,
            position: { x: 100, y: 50, z: 0 },
            color: '#FF69B4',
            size: 50
          }
        ],
        blackHoles: [
          {
            id: 'sagittarius_a',
            name: '人马座A*',
            mass: 4000000,
            position: { x: 0, y: 0, z: 0 },
            accretionDisk: {
              radius: 100,
              temperature: 1000000,
              rotationSpeed: 0.1
            },
            jet: {
              power: 0.8,
              direction: { x: 0, y: 1, z: 0 }
            }
          }
        ]
      },
      physics: {
        gravity: true,
        relativity: false,
        quantumEffects: false,
        timeScale: 1.0
      },
      evolution: {
        enabled: true,
        speed: 1.0,
        rules: ['galaxy_spiral', 'stellar_lifecycle']
      }
    };
  }

  /**
   * 加载API数据
   */
  async loadAPIData() {
    try {
      // 模拟API调用
      const response = await fetch('/api/universe-data');
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('API数据加载失败:', error);
      throw error;
    }
  }

  /**
   * 生成程序化数据
   */
  generateProceduralData() {
    const data = {
      version: '1.0.0',
      timestamp: Date.now(),
      universe: {
        galaxies: [],
        stars: [],
        nebulae: [],
        blackHoles: []
      },
      physics: {
        gravity: true,
        relativity: false,
        quantumEffects: true,
        timeScale: 1.0
      },
      evolution: {
        enabled: true,
        speed: 1.0,
        rules: ['galaxy_spiral', 'stellar_lifecycle', 'nebula_evolution']
      }
    };

    // 生成随机星系
    for (let i = 0; i < 3; i++) {
      data.universe.galaxies.push({
        id: `galaxy_${i}`,
        name: `星系 ${i + 1}`,
        type: Math.random() > 0.5 ? 'spiral' : 'elliptical',
        arms: Math.floor(Math.random() * 4) + 2,
        stars: Math.floor(Math.random() * 1000000000),
        position: {
          x: (Math.random() - 0.5) * 2000,
          y: (Math.random() - 0.5) * 2000,
          z: (Math.random() - 0.5) * 2000
        },
        rotation: {
          x: Math.random() * Math.PI * 2,
          y: Math.random() * Math.PI * 2,
          z: Math.random() * Math.PI * 2
        },
        scale: 0.5 + Math.random() * 1.5
      });
    }

    // 生成随机恒星
    for (let i = 0; i < 50; i++) {
      data.universe.stars.push({
        id: `star_${i}`,
        name: `恒星 ${i + 1}`,
        type: this.getRandomStarType(),
        mass: Math.random() * 20 + 0.1,
        temperature: Math.random() * 5000 + 3000,
        age: Math.random() * 10000000000,
        position: {
          x: (Math.random() - 0.5) * 1000,
          y: (Math.random() - 0.5) * 1000,
          z: (Math.random() - 0.5) * 1000
        },
        color: this.getStarColor(Math.random() * 5000 + 3000),
        size: Math.random() * 2 + 0.5
      });
    }

    // 生成随机星云
    for (let i = 0; i < 20; i++) {
      data.universe.nebulae.push({
        id: `nebula_${i}`,
        name: `星云 ${i + 1}`,
        type: this.getRandomNebulaType(),
        density: Math.random() * 0.5 + 0.1,
        temperature: Math.random() * 10000 + 5000,
        position: {
          x: (Math.random() - 0.5) * 1500,
          y: (Math.random() - 0.5) * 1500,
          z: (Math.random() - 0.5) * 1500
        },
        color: this.getNebulaColor(),
        size: Math.random() * 100 + 25
      });
    }

    // 生成随机黑洞
    for (let i = 0; i < 5; i++) {
      data.universe.blackHoles.push({
        id: `blackhole_${i}`,
        name: `黑洞 ${i + 1}`,
        mass: Math.random() * 10000000 + 1000000,
        position: {
          x: (Math.random() - 0.5) * 800,
          y: (Math.random() - 0.5) * 800,
          z: (Math.random() - 0.5) * 800
        },
        accretionDisk: {
          radius: Math.random() * 200 + 50,
          temperature: Math.random() * 1000000 + 500000,
          rotationSpeed: Math.random() * 0.2 + 0.05
        },
        jet: {
          power: Math.random() * 0.5 + 0.3,
          direction: {
            x: (Math.random() - 0.5) * 2,
            y: (Math.random() - 0.5) * 2,
            z: (Math.random() - 0.5) * 2
          }
        }
      });
    }

    return data;
  }

  /**
   * 加载用户数据
   */
  loadUserData() {
    try {
      const userData = wx.getStorageSync('universe_user_data');
      if (userData) {
        return JSON.parse(userData);
      }
    } catch (error) {
      console.error('用户数据加载失败:', error);
    }
    return null;
  }

  /**
   * 保存用户数据
   */
  saveUserData(data) {
    try {
      wx.setStorageSync('universe_user_data', JSON.stringify(data));
      console.log('✅ 用户数据保存成功');
    } catch (error) {
      console.error('❌ 用户数据保存失败:', error);
    }
  }

  /**
   * 获取默认数据
   */
  getDefaultData() {
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      universe: {
        galaxies: [],
        stars: [],
        nebulae: [],
        blackHoles: []
      },
      physics: {
        gravity: true,
        relativity: false,
        quantumEffects: false,
        timeScale: 1.0
      },
      evolution: {
        enabled: false,
        speed: 1.0,
        rules: []
      }
    };
  }

  /**
   * 验证数据格式
   */
  validateData(data) {
    if (!data || typeof data !== 'object') {
      return false;
    }

    const requiredFields = ['version', 'timestamp', 'universe'];
    for (const field of requiredFields) {
      if (!(field in data)) {
        console.warn(`数据缺少必需字段: ${field}`);
        return false;
      }
    }

    return true;
  }

  /**
   * 获取随机恒星类型
   */
  getRandomStarType() {
    const types = ['main_sequence', 'red_giant', 'white_dwarf', 'neutron_star', 'blue_giant'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * 获取随机星云类型
   */
  getRandomNebulaType() {
    const types = ['emission', 'reflection', 'dark', 'planetary'];
    return types[Math.floor(Math.random() * types.length)];
  }

  /**
   * 根据温度获取恒星颜色
   */
  getStarColor(temperature) {
    if (temperature > 30000) return '#9BB0FF'; // 蓝色
    if (temperature > 10000) return '#AABFFF'; // 蓝白色
    if (temperature > 7500) return '#CAD7FF'; // 白色
    if (temperature > 6000) return '#FFF4EA'; // 黄白色
    if (temperature > 5000) return '#FFD700'; // 黄色
    if (temperature > 3500) return '#FF8C00'; // 橙色
    return '#FF4500'; // 红色
  }

  /**
   * 获取星云颜色
   */
  getNebulaColor() {
    const colors = ['#FF69B4', '#FF1493', '#00BFFF', '#9370DB', '#FF6347', '#32CD32'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  /**
   * 订阅数据变化
   */
  subscribe(event, callback) {
    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }
    this.subscribers.get(event).push(callback);
  }

  /**
   * 取消订阅
   */
  unsubscribe(event, callback) {
    if (this.subscribers.has(event)) {
      const callbacks = this.subscribers.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 通知订阅者
   */
  notifySubscribers(event, data) {
    if (this.subscribers.has(event)) {
      this.subscribers.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`订阅者回调执行失败: ${event}`, error);
        }
      });
    }
  }

  /**
   * 刷新数据
   */
  async refreshData(sourceId = null) {
    try {
      let data = null;
      
      if (sourceId && this.dataSources.has(sourceId)) {
        const source = this.dataSources.get(sourceId);
        data = await source.refresh();
      } else {
        // 尝试所有数据源
        const sources = Array.from(this.dataSources.values())
          .sort((a, b) => a.priority - b.priority);

        for (const source of sources) {
          try {
            data = await source.refresh();
            if (data && this.validateData(data)) {
              break;
            }
          } catch (error) {
            console.warn(`数据源刷新失败: ${source.name}`, error);
          }
        }
      }

      if (data && this.validateData(data)) {
        this.currentData = data;
        this.dataHistory.push({
          timestamp: Date.now(),
          data: JSON.parse(JSON.stringify(data))
        });

        // 保持历史记录在合理范围内
        if (this.dataHistory.length > 100) {
          this.dataHistory.shift();
        }

        this.notifySubscribers('dataRefreshed', data);
        console.log('✅ 数据刷新成功');
        return data;
      } else {
        throw new Error('数据验证失败');
      }

    } catch (error) {
      console.error('❌ 数据刷新失败:', error);
      this.notifySubscribers('dataRefreshFailed', error);
      throw error;
    }
  }

  /**
   * 启动自动刷新
   */
  startAutoRefresh(interval = 5000) {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    this.isAutoRefresh = true;
    this.refreshInterval = setInterval(() => {
      this.refreshData();
    }, interval);

    console.log(`🔄 自动刷新已启动，间隔: ${interval}ms`);
  }

  /**
   * 停止自动刷新
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }

    this.isAutoRefresh = false;
    console.log('⏸️ 自动刷新已停止');
  }

  /**
   * 获取当前数据
   */
  getCurrentData() {
    return this.currentData;
  }

  /**
   * 获取数据历史
   */
  getDataHistory() {
    return this.dataHistory;
  }

  /**
   * 导出数据
   */
  exportData() {
    return {
      current: this.currentData,
      history: this.dataHistory,
      sources: Array.from(this.dataSources.keys())
    };
  }

  /**
   * 导入数据
   */
  importData(data) {
    try {
      if (this.validateData(data)) {
        this.currentData = data;
        this.notifySubscribers('dataImported', data);
        console.log('✅ 数据导入成功');
        return true;
      } else {
        throw new Error('数据格式无效');
      }
    } catch (error) {
      console.error('❌ 数据导入失败:', error);
      return false;
    }
  }
}

// 导出数据驱动系统
module.exports = DataDrivenSystem;
