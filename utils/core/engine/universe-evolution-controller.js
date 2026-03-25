/**
 * 宇宙进化主控制器 - Universe Evolution Main Controller
 * 整合所有系统，实现完整的宇宙进化引擎
 */

const UniverseEvolutionEngine = require('./universe-evolution-engine');
const DataDrivenSystem = require('./data-driven-system');
const PhysicsRulesEngine = require('./physics-rules-engine');
const ControlPanelSystem = require('./control-panel-system');
const SelfEvolutionMechanism = require('./self-evolution-mechanism');

class UniverseEvolutionController {
  constructor() {
    this.version = '1.0.0';
    this.isInitialized = false;
    this.systems = new Map();
    this.eventBus = new Map();
    this.isRunning = false;
    
    this.init();
  }

  /**
   * 初始化主控制器
   */
  init() {
    console.log(`🌌 宇宙进化主控制器 v${this.version} 启动中...`);
    
    try {
      // 初始化各个系统
      this.initializeSystems();
      
      // 建立系统间通信
      this.establishSystemCommunication();
      
      // 启动主循环
      this.startMainLoop();
      
      this.isInitialized = true;
      console.log('✅ 宇宙进化主控制器初始化完成');
      
    } catch (error) {
      console.error('❌ 宇宙进化主控制器初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化各个系统
   */
  initializeSystems() {
    // 初始化数据驱动系统
    this.systems.set('data', new DataDrivenSystem());
    
    // 初始化物理规则引擎
    this.systems.set('physics', new PhysicsRulesEngine());
    
    // 初始化控制面板系统
    this.systems.set('control', new ControlPanelSystem());
    
    // 初始化自我进化机制
    this.systems.set('evolution', new SelfEvolutionMechanism());
    
    // 初始化宇宙进化引擎
    this.systems.set('universe', new UniverseEvolutionEngine());
    
    console.log('✅ 所有系统初始化完成');
  }

  /**
   * 建立系统间通信
   */
  establishSystemCommunication() {
    // 数据系统 -> 物理系统
    this.systems.get('data').subscribe('dataLoaded', (data) => {
      this.systems.get('physics').importSimulationState(data.physics);
    });

    // 数据系统 -> 控制面板
    this.systems.get('data').subscribe('dataRefreshed', (data) => {
      this.systems.get('control').setControlValue('data_source', data.source);
    });

    // 控制面板 -> 物理系统
    this.systems.get('control').registerCallback('gravity_enabled', (enabled) => {
      this.systems.get('physics').setForceParameters('gravity', { enabled });
    });

    this.systems.get('control').registerCallback('gravity_strength', (strength) => {
      this.systems.get('physics').setForceParameters('gravity', { strength });
    });

    // 控制面板 -> 进化引擎
    this.systems.get('control').registerCallback('evolution_enabled', (enabled) => {
      if (enabled) {
        this.systems.get('universe').startEvolutionLoop();
      } else {
        this.systems.get('universe').stopEvolutionLoop();
      }
    });

    this.systems.get('control').registerCallback('evolution_speed', (speed) => {
      this.systems.get('universe').controlPanel.evolutionSpeed = speed;
    });

    // 自我进化机制 -> 所有系统
    this.systems.get('evolution').registerCallback('performance_optimization', (context) => {
      this.optimizeAllSystems(context);
    });

    console.log('✅ 系统间通信建立完成');
  }

  /**
   * 启动主循环
   */
  startMainLoop() {
    this.isRunning = true;
    this.mainLoop();
  }

  /**
   * 主循环
   */
  mainLoop() {
    if (!this.isRunning) return;

    try {
      // 更新所有系统
      this.updateAllSystems();
      
      // 处理系统间通信
      this.processSystemCommunication();
      
      // 检查系统健康状态
      this.checkSystemHealth();
      
    } catch (error) {
      console.error('主循环执行错误:', error);
    }

    // 继续下一帧
    requestAnimationFrame(() => this.mainLoop());
  }

  /**
   * 更新所有系统
   */
  updateAllSystems() {
    for (const [systemName, system] of this.systems) {
      try {
        if (system.update && typeof system.update === 'function') {
          system.update();
        }
      } catch (error) {
        console.error(`系统更新失败: ${systemName}`, error);
      }
    }
  }

  /**
   * 处理系统间通信
   */
  processSystemCommunication() {
    // 处理事件总线中的事件
    for (const [event, handlers] of this.eventBus) {
      handlers.forEach(handler => {
        try {
          handler();
        } catch (error) {
          console.error(`事件处理失败: ${event}`, error);
        }
      });
    }
  }

  /**
   * 检查系统健康状态
   */
  checkSystemHealth() {
    for (const [systemName, system] of this.systems) {
      if (system.getStatus && typeof system.getStatus === 'function') {
        const status = system.getStatus();
        if (status.error) {
          console.warn(`系统健康警告: ${systemName}`, status.error);
        }
      }
    }
  }

  /**
   * 优化所有系统
   */
  optimizeAllSystems(context) {
    console.log('🔧 执行全系统优化');
    
    // 优化数据系统
    if (this.systems.get('data').optimize) {
      this.systems.get('data').optimize(context);
    }
    
    // 优化物理系统
    if (this.systems.get('physics').optimize) {
      this.systems.get('physics').optimize(context);
    }
    
    // 优化控制面板
    if (this.systems.get('control').optimize) {
      this.systems.get('control').optimize(context);
    }
  }

  /**
   * 获取系统状态
   */
  getSystemStatus() {
    const status = {
      version: this.version,
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      systems: {}
    };

    for (const [systemName, system] of this.systems) {
      if (system.getStatus && typeof system.getStatus === 'function') {
        status.systems[systemName] = system.getStatus();
      } else {
        status.systems[systemName] = { status: 'running' };
      }
    }

    return status;
  }

  /**
   * 获取系统性能指标
   */
  getPerformanceMetrics() {
    const metrics = {
      timestamp: Date.now(),
      systems: {}
    };

    for (const [systemName, system] of this.systems) {
      if (system.getPerformanceMetrics && typeof system.getPerformanceMetrics === 'function') {
        metrics.systems[systemName] = system.getPerformanceMetrics();
      }
    }

    return metrics;
  }

  /**
   * 导出系统状态
   */
  exportSystemState() {
    const state = {
      version: this.version,
      timestamp: Date.now(),
      systems: {}
    };

    for (const [systemName, system] of this.systems) {
      if (system.exportState && typeof system.exportState === 'function') {
        state.systems[systemName] = system.exportState();
      }
    }

    return state;
  }

  /**
   * 导入系统状态
   */
  importSystemState(state) {
    try {
      if (state.version !== this.version) {
        console.warn(`版本不匹配: 当前版本 ${this.version}, 导入版本 ${state.version}`);
      }

      for (const [systemName, systemState] of Object.entries(state.systems)) {
        if (this.systems.has(systemName)) {
          const system = this.systems.get(systemName);
          if (system.importState && typeof system.importState === 'function') {
            system.importState(systemState);
          }
        }
      }

      console.log('✅ 系统状态导入成功');
      return true;

    } catch (error) {
      console.error('❌ 系统状态导入失败:', error);
      return false;
    }
  }

  /**
   * 重置所有系统
   */
  resetAllSystems() {
    console.log('🔄 重置所有系统');
    
    for (const [systemName, system] of this.systems) {
      if (system.reset && typeof system.reset === 'function') {
        system.reset();
      }
    }
    
    console.log('✅ 所有系统已重置');
  }

  /**
   * 停止所有系统
   */
  stopAllSystems() {
    console.log('⏸️ 停止所有系统');
    
    this.isRunning = false;
    
    for (const [systemName, system] of this.systems) {
      if (system.stop && typeof system.stop === 'function') {
        system.stop();
      }
    }
    
    console.log('✅ 所有系统已停止');
  }

  /**
   * 重启所有系统
   */
  restartAllSystems() {
    console.log('🔄 重启所有系统');
    
    this.stopAllSystems();
    
    setTimeout(() => {
      this.initializeSystems();
      this.establishSystemCommunication();
      this.startMainLoop();
      console.log('✅ 所有系统已重启');
    }, 1000);
  }

  /**
   * 获取系统
   */
  getSystem(systemName) {
    return this.systems.get(systemName);
  }

  /**
   * 添加自定义系统
   */
  addCustomSystem(systemName, system) {
    this.systems.set(systemName, system);
    console.log(`✅ 自定义系统已添加: ${systemName}`);
  }

  /**
   * 移除系统
   */
  removeSystem(systemName) {
    if (this.systems.has(systemName)) {
      const system = this.systems.get(systemName);
      if (system.stop && typeof system.stop === 'function') {
        system.stop();
      }
      this.systems.delete(systemName);
      console.log(`✅ 系统已移除: ${systemName}`);
    }
  }

  /**
   * 订阅事件
   */
  subscribe(event, callback) {
    if (!this.eventBus.has(event)) {
      this.eventBus.set(event, []);
    }
    this.eventBus.get(event).push(callback);
  }

  /**
   * 取消订阅
   */
  unsubscribe(event, callback) {
    if (this.eventBus.has(event)) {
      const handlers = this.eventBus.get(event);
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  emit(event, data) {
    if (this.eventBus.has(event)) {
      this.eventBus.get(event).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`事件处理失败: ${event}`, error);
        }
      });
    }
  }

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    return {
      version: this.version,
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      systemCount: this.systems.size,
      systemNames: Array.from(this.systems.keys()),
      eventCount: this.eventBus.size,
      eventNames: Array.from(this.eventBus.keys())
    };
  }

  /**
   * 执行系统诊断
   */
  performSystemDiagnosis() {
    const diagnosis = {
      timestamp: Date.now(),
      overall: 'healthy',
      systems: {},
      recommendations: []
    };

    for (const [systemName, system] of this.systems) {
      const systemDiagnosis = {
        status: 'healthy',
        issues: [],
        performance: 'good'
      };

      // 检查系统状态
      if (system.getStatus && typeof system.getStatus === 'function') {
        const status = system.getStatus();
        if (status.error) {
          systemDiagnosis.status = 'error';
          systemDiagnosis.issues.push(status.error);
        }
      }

      // 检查性能
      if (system.getPerformanceMetrics && typeof system.getPerformanceMetrics === 'function') {
        const metrics = system.getPerformanceMetrics();
        if (metrics.fps && metrics.fps < 30) {
          systemDiagnosis.performance = 'poor';
          diagnosis.recommendations.push(`优化 ${systemName} 系统性能`);
        }
      }

      diagnosis.systems[systemName] = systemDiagnosis;
    }

    // 确定整体状态
    const hasErrors = Object.values(diagnosis.systems).some(s => s.status === 'error');
    const hasPoorPerformance = Object.values(diagnosis.systems).some(s => s.performance === 'poor');
    
    if (hasErrors) {
      diagnosis.overall = 'error';
    } else if (hasPoorPerformance) {
      diagnosis.overall = 'warning';
    }

    return diagnosis;
  }
}

// 导出宇宙进化主控制器
module.exports = UniverseEvolutionController;
