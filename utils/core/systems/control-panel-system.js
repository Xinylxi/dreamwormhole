/**
 * 控制面板系统 - Control Panel System
 * 负责管理宇宙界面的所有控制参数和设置
 */

class ControlPanelSystem {
  constructor() {
    this.controls = new Map();
    this.panels = new Map();
    this.isVisible = false;
    this.currentPanel = 'main';
    this.callbacks = new Map();
    
    this.init();
  }

  /**
   * 初始化控制面板系统
   */
  init() {
    console.log('🎛️ 控制面板系统初始化中...');
    
    // 注册控制面板
    this.registerControlPanels();
    
    // 初始化默认设置
    this.initializeDefaultSettings();
    
    console.log('✅ 控制面板系统初始化完成');
  }

  /**
   * 注册控制面板
   */
  registerControlPanels() {
    // 主控制面板
    this.panels.set('main', {
      name: '主控制面板',
      icon: '🎛️',
      controls: [
        {
          id: 'evolution_speed',
          name: '进化速度',
          type: 'slider',
          min: 0,
          max: 5,
          step: 0.1,
          value: 1.0,
          unit: 'x'
        },
        {
          id: 'time_scale',
          name: '时间尺度',
          type: 'slider',
          min: 0.1,
          max: 10,
          step: 0.1,
          value: 1.0,
          unit: 'x'
        },
        {
          id: 'auto_rotate',
          name: '自动旋转',
          type: 'toggle',
          value: true
        },
        {
          id: 'show_trails',
          name: '显示轨迹',
          type: 'toggle',
          value: true
        }
      ]
    });

    // 物理控制面板
    this.panels.set('physics', {
      name: '物理控制面板',
      icon: '⚛️',
      controls: [
        {
          id: 'gravity_enabled',
          name: '万有引力',
          type: 'toggle',
          value: true
        },
        {
          id: 'gravity_strength',
          name: '引力强度',
          type: 'slider',
          min: 0,
          max: 2,
          step: 0.1,
          value: 1.0,
          unit: 'x'
        },
        {
          id: 'relativity_enabled',
          name: '相对论效应',
          type: 'toggle',
          value: false
        },
        {
          id: 'quantum_effects',
          name: '量子效应',
          type: 'toggle',
          value: false
        },
        {
          id: 'collision_detection',
          name: '碰撞检测',
          type: 'toggle',
          value: true
        }
      ]
    });

    // 视觉效果控制面板
    this.panels.set('visual', {
      name: '视觉效果控制面板',
      icon: '🎨',
      controls: [
        {
          id: 'galaxy_scale',
          name: '星系缩放',
          type: 'slider',
          min: 0.1,
          max: 3,
          step: 0.1,
          value: 1.0,
          unit: 'x'
        },
        {
          id: 'star_density',
          name: '恒星密度',
          type: 'slider',
          min: 0.1,
          max: 2,
          step: 0.1,
          value: 1.0,
          unit: 'x'
        },
        {
          id: 'nebula_opacity',
          name: '星云透明度',
          type: 'slider',
          min: 0,
          max: 1,
          step: 0.1,
          value: 0.7,
          unit: '%'
        },
        {
          id: 'black_hole_size',
          name: '黑洞大小',
          type: 'slider',
          min: 0.5,
          max: 2,
          step: 0.1,
          value: 1.0,
          unit: 'x'
        },
        {
          id: 'particle_effects',
          name: '粒子效果',
          type: 'toggle',
          value: true
        }
      ]
    });

    // 数据控制面板
    this.panels.set('data', {
      name: '数据控制面板',
      icon: '📊',
      controls: [
        {
          id: 'data_source',
          name: '数据源',
          type: 'select',
          options: [
            { value: 'local', label: '本地数据' },
            { value: 'api', label: 'API数据' },
            { value: 'procedural', label: '程序化数据' },
            { value: 'user', label: '用户数据' }
          ],
          value: 'local'
        },
        {
          id: 'auto_refresh',
          name: '自动刷新',
          type: 'toggle',
          value: false
        },
        {
          id: 'refresh_interval',
          name: '刷新间隔',
          type: 'slider',
          min: 1000,
          max: 30000,
          step: 1000,
          value: 5000,
          unit: 'ms'
        },
        {
          id: 'export_data',
          name: '导出数据',
          type: 'button',
          action: 'export'
        },
        {
          id: 'import_data',
          name: '导入数据',
          type: 'button',
          action: 'import'
        }
      ]
    });

    // 进化控制面板
    this.panels.set('evolution', {
      name: '进化控制面板',
      icon: '🧬',
      controls: [
        {
          id: 'evolution_enabled',
          name: '启用进化',
          type: 'toggle',
          value: true
        },
        {
          id: 'galaxy_spiral',
          name: '星系螺旋演化',
          type: 'toggle',
          value: true
        },
        {
          id: 'stellar_lifecycle',
          name: '恒星生命周期',
          type: 'toggle',
          value: true
        },
        {
          id: 'black_hole_accretion',
          name: '黑洞吸积',
          type: 'toggle',
          value: true
        },
        {
          id: 'nebula_evolution',
          name: '星云演化',
          type: 'toggle',
          value: true
        },
        {
          id: 'reset_evolution',
          name: '重置进化',
          type: 'button',
          action: 'reset'
        }
      ]
    });
  }

  /**
   * 初始化默认设置
   */
  initializeDefaultSettings() {
    // 从所有面板收集控制项
    for (const [panelId, panel] of this.panels) {
      for (const control of panel.controls) {
        this.controls.set(control.id, {
          ...control,
          panel: panelId
        });
      }
    }
  }

  /**
   * 获取控制值
   */
  getControlValue(controlId) {
    const control = this.controls.get(controlId);
    return control ? control.value : null;
  }

  /**
   * 设置控制值
   */
  setControlValue(controlId, value) {
    const control = this.controls.get(controlId);
    if (control) {
      control.value = value;
      this.controls.set(controlId, control);
      
      // 触发回调
      this.triggerCallback(controlId, value);
      
      console.log(`🎛️ 控制项 ${controlId} 设置为: ${value}`);
    }
  }

  /**
   * 注册回调函数
   */
  registerCallback(controlId, callback) {
    if (!this.callbacks.has(controlId)) {
      this.callbacks.set(controlId, []);
    }
    this.callbacks.get(controlId).push(callback);
  }

  /**
   * 触发回调
   */
  triggerCallback(controlId, value) {
    if (this.callbacks.has(controlId)) {
      this.callbacks.get(controlId).forEach(callback => {
        try {
          callback(value);
        } catch (error) {
          console.error(`控制项回调执行失败: ${controlId}`, error);
        }
      });
    }
  }

  /**
   * 显示控制面板
   */
  showControlPanel() {
    this.isVisible = true;
    console.log('🎛️ 控制面板已显示');
  }

  /**
   * 隐藏控制面板
   */
  hideControlPanel() {
    this.isVisible = false;
    console.log('🎛️ 控制面板已隐藏');
  }

  /**
   * 切换控制面板
   */
  toggleControlPanel() {
    this.isVisible = !this.isVisible;
    console.log(`🎛️ 控制面板${this.isVisible ? '已显示' : '已隐藏'}`);
  }

  /**
   * 切换面板
   */
  switchPanel(panelId) {
    if (this.panels.has(panelId)) {
      this.currentPanel = panelId;
      console.log(`🎛️ 切换到面板: ${this.panels.get(panelId).name}`);
    }
  }

  /**
   * 获取当前面板
   */
  getCurrentPanel() {
    return this.panels.get(this.currentPanel);
  }

  /**
   * 获取所有面板
   */
  getAllPanels() {
    return Array.from(this.panels.entries());
  }

  /**
   * 获取面板控制项
   */
  getPanelControls(panelId) {
    const panel = this.panels.get(panelId);
    return panel ? panel.controls : [];
  }

  /**
   * 重置所有设置
   */
  resetAllSettings() {
    for (const [controlId, control] of this.controls) {
      // 重置为默认值
      if (control.type === 'slider') {
        control.value = (control.min + control.max) / 2;
      } else if (control.type === 'toggle') {
        control.value = false;
      } else if (control.type === 'select') {
        control.value = control.options[0].value;
      }
      
      this.controls.set(controlId, control);
      this.triggerCallback(controlId, control.value);
    }
    
    console.log('🔄 所有设置已重置');
  }

  /**
   * 导出设置
   */
  exportSettings() {
    const settings = {};
    for (const [controlId, control] of this.controls) {
      settings[controlId] = control.value;
    }
    
    return {
      version: '1.0.0',
      timestamp: Date.now(),
      settings: settings
    };
  }

  /**
   * 导入设置
   */
  importSettings(settingsData) {
    try {
      if (settingsData.settings) {
        for (const [controlId, value] of Object.entries(settingsData.settings)) {
          this.setControlValue(controlId, value);
        }
        console.log('✅ 设置导入成功');
        return true;
      } else {
        throw new Error('设置数据格式无效');
      }
    } catch (error) {
      console.error('❌ 设置导入失败:', error);
      return false;
    }
  }

  /**
   * 保存设置到本地存储
   */
  saveSettingsToStorage() {
    try {
      const settings = this.exportSettings();
      wx.setStorageSync('universe_control_settings', JSON.stringify(settings));
      console.log('✅ 设置已保存到本地存储');
    } catch (error) {
      console.error('❌ 设置保存失败:', error);
    }
  }

  /**
   * 从本地存储加载设置
   */
  loadSettingsFromStorage() {
    try {
      const settingsData = wx.getStorageSync('universe_control_settings');
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        this.importSettings(settings);
        console.log('✅ 设置已从本地存储加载');
        return true;
      }
    } catch (error) {
      console.error('❌ 设置加载失败:', error);
    }
    return false;
  }

  /**
   * 获取控制面板HTML
   */
  generateControlPanelHTML() {
    const currentPanel = this.getCurrentPanel();
    if (!currentPanel) return '';

    let html = `
      <div class="control-panel ${this.isVisible ? 'visible' : 'hidden'}">
        <div class="panel-header">
          <h3>${currentPanel.icon} ${currentPanel.name}</h3>
          <button class="close-btn" onclick="controlPanel.hideControlPanel()">×</button>
        </div>
        <div class="panel-content">
    `;

    for (const control of currentPanel.controls) {
      html += this.generateControlHTML(control);
    }

    html += `
        </div>
        <div class="panel-footer">
          <button onclick="controlPanel.resetAllSettings()">重置</button>
          <button onclick="controlPanel.saveSettingsToStorage()">保存</button>
        </div>
      </div>
    `;

    return html;
  }

  /**
   * 生成控制项HTML
   */
  generateControlHTML(control) {
    let html = `<div class="control-item" data-id="${control.id}">`;
    html += `<label>${control.name}</label>`;

    switch (control.type) {
      case 'slider':
        html += `
          <input type="range" 
                 min="${control.min}" 
                 max="${control.max}" 
                 step="${control.step}" 
                 value="${control.value}"
                 onchange="controlPanel.setControlValue('${control.id}', this.value)">
          <span class="value-display">${control.value}${control.unit || ''}</span>
        `;
        break;

      case 'toggle':
        html += `
          <label class="toggle">
            <input type="checkbox" 
                   ${control.value ? 'checked' : ''}
                   onchange="controlPanel.setControlValue('${control.id}', this.checked)">
            <span class="slider"></span>
          </label>
        `;
        break;

      case 'select':
        html += `<select onchange="controlPanel.setControlValue('${control.id}', this.value)">`;
        for (const option of control.options) {
          html += `<option value="${option.value}" ${option.value === control.value ? 'selected' : ''}>${option.label}</option>`;
        }
        html += `</select>`;
        break;

      case 'button':
        html += `
          <button onclick="controlPanel.handleButtonAction('${control.action}')">
            ${control.name}
          </button>
        `;
        break;
    }

    html += `</div>`;
    return html;
  }

  /**
   * 处理按钮动作
   */
  handleButtonAction(action) {
    switch (action) {
      case 'export':
        this.exportData();
        break;
      case 'import':
        this.importData();
        break;
      case 'reset':
        this.resetEvolution();
        break;
      default:
        console.warn(`未知的按钮动作: ${action}`);
    }
  }

  /**
   * 导出数据
   */
  exportData() {
    const data = this.exportSettings();
    const dataStr = JSON.stringify(data, null, 2);
    
    // 创建下载链接
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'universe-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    
    console.log('📁 设置已导出');
  }

  /**
   * 导入数据
   */
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target.result);
            this.importSettings(data);
          } catch (error) {
            console.error('❌ 文件解析失败:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  /**
   * 重置进化
   */
  resetEvolution() {
    // 触发重置进化回调
    this.triggerCallback('reset_evolution', true);
    console.log('🔄 进化已重置');
  }

  /**
   * 获取控制面板状态
   */
  getControlPanelState() {
    return {
      isVisible: this.isVisible,
      currentPanel: this.currentPanel,
      controls: Array.from(this.controls.entries()),
      panels: Array.from(this.panels.keys())
    };
  }
}

// 导出控制面板系统
module.exports = ControlPanelSystem;
