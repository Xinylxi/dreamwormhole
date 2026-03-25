/**
 * 物理规则引擎 - Physics Rules Engine
 * 负责模拟宇宙中的物理定律和规则
 */

class PhysicsRulesEngine {
  constructor() {
    this.physicalLaws = new Map();
    this.simulationObjects = new Map();
    this.forces = new Map();
    this.isSimulating = false;
    this.timeStep = 0.016; // 60fps
    this.gravityConstant = 6.674e-11;
    this.speedOfLight = 299792458;
    
    this.init();
  }

  /**
   * 初始化物理规则引擎
   */
  init() {
    console.log('⚛️ 物理规则引擎初始化中...');
    
    // 注册物理定律
    this.registerPhysicalLaws();
    
    // 初始化力场
    this.initializeForces();
    
    console.log('✅ 物理规则引擎初始化完成');
  }

  /**
   * 注册物理定律
   */
  registerPhysicalLaws() {
    // 万有引力定律
    this.physicalLaws.set('gravity', {
      name: '万有引力定律',
      formula: 'F = G * m1 * m2 / r²',
      description: '两个物体之间的引力与它们的质量乘积成正比，与距离的平方成反比',
      execute: (obj1, obj2) => {
        const distance = this.calculateDistance(obj1.position, obj2.position);
        if (distance === 0) return { x: 0, y: 0, z: 0 };
        
        const force = this.gravityConstant * obj1.mass * obj2.mass / (distance * distance);
        const direction = this.calculateDirection(obj1.position, obj2.position);
        
        return {
          x: force * direction.x,
          y: force * direction.y,
          z: force * direction.z
        };
      }
    });

    // 牛顿第二定律
    this.physicalLaws.set('newton_second', {
      name: '牛顿第二定律',
      formula: 'F = ma',
      description: '物体的加速度与作用力成正比，与质量成反比',
      execute: (force, mass) => {
        return {
          x: force.x / mass,
          y: force.y / mass,
          z: force.z / mass
        };
      }
    });

    // 相对论效应
    this.physicalLaws.set('relativity', {
      name: '相对论效应',
      formula: 'γ = 1/√(1 - v²/c²)',
      description: '高速运动下的时空弯曲效应',
      execute: (velocity) => {
        const v = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
        const gamma = 1 / Math.sqrt(1 - (v * v) / (this.speedOfLight * this.speedOfLight));
        return gamma;
      }
    });

    // 量子涨落
    this.physicalLaws.set('quantum_fluctuation', {
      name: '量子涨落',
      description: '微观尺度的随机波动',
      execute: (position, time) => {
        const noise = Math.sin(time * 0.1 + position.x * 0.01) * 
                     Math.cos(time * 0.15 + position.y * 0.02) * 
                     Math.sin(time * 0.08 + position.z * 0.015);
        return noise * 0.1;
      }
    });

    // 电磁力
    this.physicalLaws.set('electromagnetic', {
      name: '电磁力',
      formula: 'F = q1 * q2 / (4πε₀r²)',
      description: '带电粒子之间的相互作用',
      execute: (obj1, obj2) => {
        const distance = this.calculateDistance(obj1.position, obj2.position);
        if (distance === 0) return { x: 0, y: 0, z: 0 };
        
        const charge1 = obj1.charge || 0;
        const charge2 = obj2.charge || 0;
        const force = charge1 * charge2 / (4 * Math.PI * 8.854e-12 * distance * distance);
        const direction = this.calculateDirection(obj1.position, obj2.position);
        
        return {
          x: force * direction.x,
          y: force * direction.y,
          z: force * direction.z
        };
      }
    });

    // 强核力
    this.physicalLaws.set('strong_nuclear', {
      name: '强核力',
      description: '原子核内质子和中子之间的强力',
      execute: (obj1, obj2) => {
        const distance = this.calculateDistance(obj1.position, obj2.position);
        if (distance > 1e-15) return { x: 0, y: 0, z: 0 }; // 只在极短距离内有效
        
        const force = 1000; // 简化的强核力常数
        const direction = this.calculateDirection(obj1.position, obj2.position);
        
        return {
          x: force * direction.x,
          y: force * direction.y,
          z: force * direction.z
        };
      }
    });

    // 弱核力
    this.physicalLaws.set('weak_nuclear', {
      name: '弱核力',
      description: '放射性衰变中的弱相互作用',
      execute: (obj1, obj2) => {
        const distance = this.calculateDistance(obj1.position, obj2.position);
        if (distance > 1e-18) return { x: 0, y: 0, z: 0 }; // 只在极短距离内有效
        
        const force = 0.001; // 简化的弱核力常数
        const direction = this.calculateDirection(obj1.position, obj2.position);
        
        return {
          x: force * direction.x,
          y: force * direction.y,
          z: force * direction.z
        };
      }
    });
  }

  /**
   * 初始化力场
   */
  initializeForces() {
    this.forces.set('gravity', {
      enabled: true,
      strength: 1.0,
      range: Infinity
    });

    this.forces.set('electromagnetic', {
      enabled: false,
      strength: 1.0,
      range: 1000
    });

    this.forces.set('strong_nuclear', {
      enabled: false,
      strength: 1.0,
      range: 1e-15
    });

    this.forces.set('weak_nuclear', {
      enabled: false,
      strength: 1.0,
      range: 1e-18
    });
  }

  /**
   * 添加模拟对象
   */
  addSimulationObject(id, object) {
    this.simulationObjects.set(id, {
      ...object,
      velocity: object.velocity || { x: 0, y: 0, z: 0 },
      acceleration: object.acceleration || { x: 0, y: 0, z: 0 },
      forces: { x: 0, y: 0, z: 0 }
    });
  }

  /**
   * 移除模拟对象
   */
  removeSimulationObject(id) {
    this.simulationObjects.delete(id);
  }

  /**
   * 更新模拟对象
   */
  updateSimulationObject(id, updates) {
    if (this.simulationObjects.has(id)) {
      const object = this.simulationObjects.get(id);
      Object.assign(object, updates);
      this.simulationObjects.set(id, object);
    }
  }

  /**
   * 计算两个点之间的距离
   */
  calculateDistance(pos1, pos2) {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    const dz = pos2.z - pos1.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * 计算方向向量
   */
  calculateDirection(pos1, pos2) {
    const distance = this.calculateDistance(pos1, pos2);
    if (distance === 0) return { x: 0, y: 0, z: 0 };
    
    return {
      x: (pos2.x - pos1.x) / distance,
      y: (pos2.y - pos1.y) / distance,
      z: (pos2.z - pos1.z) / distance
    };
  }

  /**
   * 计算合力
   */
  calculateNetForce(objectId) {
    const object = this.simulationObjects.get(objectId);
    if (!object) return { x: 0, y: 0, z: 0 };

    let netForce = { x: 0, y: 0, z: 0 };

    // 计算与其他对象的所有相互作用力
    for (const [otherId, otherObject] of this.simulationObjects) {
      if (otherId === objectId) continue;

      const distance = this.calculateDistance(object.position, otherObject.position);
      
      // 万有引力
      if (this.forces.get('gravity').enabled && distance < this.forces.get('gravity').range) {
        const gravityForce = this.physicalLaws.get('gravity').execute(object, otherObject);
        netForce.x += gravityForce.x * this.forces.get('gravity').strength;
        netForce.y += gravityForce.y * this.forces.get('gravity').strength;
        netForce.z += gravityForce.z * this.forces.get('gravity').strength;
      }

      // 电磁力
      if (this.forces.get('electromagnetic').enabled && distance < this.forces.get('electromagnetic').range) {
        const emForce = this.physicalLaws.get('electromagnetic').execute(object, otherObject);
        netForce.x += emForce.x * this.forces.get('electromagnetic').strength;
        netForce.y += emForce.y * this.forces.get('electromagnetic').strength;
        netForce.z += emForce.z * this.forces.get('electromagnetic').strength;
      }

      // 强核力
      if (this.forces.get('strong_nuclear').enabled && distance < this.forces.get('strong_nuclear').range) {
        const strongForce = this.physicalLaws.get('strong_nuclear').execute(object, otherObject);
        netForce.x += strongForce.x * this.forces.get('strong_nuclear').strength;
        netForce.y += strongForce.y * this.forces.get('strong_nuclear').strength;
        netForce.z += strongForce.z * this.forces.get('strong_nuclear').strength;
      }

      // 弱核力
      if (this.forces.get('weak_nuclear').enabled && distance < this.forces.get('weak_nuclear').range) {
        const weakForce = this.physicalLaws.get('weak_nuclear').execute(object, otherObject);
        netForce.x += weakForce.x * this.forces.get('weak_nuclear').strength;
        netForce.y += weakForce.y * this.forces.get('weak_nuclear').strength;
        netForce.z += weakForce.z * this.forces.get('weak_nuclear').strength;
      }
    }

    // 量子涨落
    if (this.forces.get('quantum_fluctuation').enabled) {
      const quantumNoise = this.physicalLaws.get('quantum_fluctuation').execute(object.position, Date.now());
      netForce.x += quantumNoise;
      netForce.y += quantumNoise;
      netForce.z += quantumNoise;
    }

    return netForce;
  }

  /**
   * 更新对象状态
   */
  updateObjectState(objectId, deltaTime) {
    const object = this.simulationObjects.get(objectId);
    if (!object) return;

    // 计算合力
    const netForce = this.calculateNetForce(objectId);
    object.forces = netForce;

    // 计算加速度 (F = ma)
    const acceleration = this.physicalLaws.get('newton_second').execute(netForce, object.mass);
    object.acceleration = acceleration;

    // 更新速度
    object.velocity.x += acceleration.x * deltaTime;
    object.velocity.y += acceleration.y * deltaTime;
    object.velocity.z += acceleration.z * deltaTime;

    // 相对论效应
    if (this.forces.get('relativity').enabled) {
      const velocity = Math.sqrt(object.velocity.x * object.velocity.x + 
                                object.velocity.y * object.velocity.y + 
                                object.velocity.z * object.velocity.z);
      const gamma = this.physicalLaws.get('relativity').execute(object.velocity);
      
      // 应用相对论修正
      object.velocity.x *= gamma;
      object.velocity.y *= gamma;
      object.velocity.z *= gamma;
    }

    // 更新位置
    object.position.x += object.velocity.x * deltaTime;
    object.position.y += object.velocity.y * deltaTime;
    object.position.z += object.velocity.z * deltaTime;

    // 更新对象
    this.simulationObjects.set(objectId, object);
  }

  /**
   * 模拟一步
   */
  simulateStep(deltaTime = this.timeStep) {
    if (!this.isSimulating) return;

    // 更新所有对象
    for (const [objectId] of this.simulationObjects) {
      this.updateObjectState(objectId, deltaTime);
    }

    // 检查碰撞
    this.checkCollisions();

    // 应用边界条件
    this.applyBoundaryConditions();
  }

  /**
   * 检查碰撞
   */
  checkCollisions() {
    const objects = Array.from(this.simulationObjects.entries());
    
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const [id1, obj1] = objects[i];
        const [id2, obj2] = objects[j];
        
        const distance = this.calculateDistance(obj1.position, obj2.position);
        const collisionDistance = (obj1.radius || 1) + (obj2.radius || 1);
        
        if (distance < collisionDistance) {
          this.handleCollision(id1, obj1, id2, obj2);
        }
      }
    }
  }

  /**
   * 处理碰撞
   */
  handleCollision(id1, obj1, id2, obj2) {
    // 简化的弹性碰撞
    const totalMass = obj1.mass + obj2.mass;
    const massRatio1 = obj1.mass / totalMass;
    const massRatio2 = obj2.mass / totalMass;
    
    // 交换部分动量
    const tempVel1 = { ...obj1.velocity };
    const tempVel2 = { ...obj2.velocity };
    
    obj1.velocity.x = tempVel1.x * (1 - massRatio2) + tempVel2.x * massRatio2;
    obj1.velocity.y = tempVel1.y * (1 - massRatio2) + tempVel2.y * massRatio2;
    obj1.velocity.z = tempVel1.z * (1 - massRatio2) + tempVel2.z * massRatio2;
    
    obj2.velocity.x = tempVel2.x * (1 - massRatio1) + tempVel1.x * massRatio1;
    obj2.velocity.y = tempVel2.y * (1 - massRatio1) + tempVel1.y * massRatio1;
    obj2.velocity.z = tempVel2.z * (1 - massRatio1) + tempVel1.z * massRatio1;
    
    // 更新对象
    this.simulationObjects.set(id1, obj1);
    this.simulationObjects.set(id2, obj2);
  }

  /**
   * 应用边界条件
   */
  applyBoundaryConditions() {
    const boundary = 1000; // 边界大小
    
    for (const [objectId, object] of this.simulationObjects) {
      // 弹性边界
      if (Math.abs(object.position.x) > boundary) {
        object.velocity.x *= -0.8; // 弹性碰撞
        object.position.x = Math.sign(object.position.x) * boundary;
      }
      
      if (Math.abs(object.position.y) > boundary) {
        object.velocity.y *= -0.8;
        object.position.y = Math.sign(object.position.y) * boundary;
      }
      
      if (Math.abs(object.position.z) > boundary) {
        object.velocity.z *= -0.8;
        object.position.z = Math.sign(object.position.z) * boundary;
      }
      
      this.simulationObjects.set(objectId, object);
    }
  }

  /**
   * 启动模拟
   */
  startSimulation() {
    this.isSimulating = true;
    this.simulationLoop();
    console.log('🚀 物理模拟已启动');
  }

  /**
   * 停止模拟
   */
  stopSimulation() {
    this.isSimulating = false;
    console.log('⏸️ 物理模拟已停止');
  }

  /**
   * 模拟循环
   */
  simulationLoop() {
    if (!this.isSimulating) return;
    
    this.simulateStep();
    requestAnimationFrame(() => this.simulationLoop());
  }

  /**
   * 设置力场参数
   */
  setForceParameters(forceName, parameters) {
    if (this.forces.has(forceName)) {
      const force = this.forces.get(forceName);
      Object.assign(force, parameters);
      this.forces.set(forceName, force);
    }
  }

  /**
   * 获取模拟对象
   */
  getSimulationObject(id) {
    return this.simulationObjects.get(id);
  }

  /**
   * 获取所有模拟对象
   */
  getAllSimulationObjects() {
    return Array.from(this.simulationObjects.entries());
  }

  /**
   * 计算系统总能量
   */
  calculateTotalEnergy() {
    let totalEnergy = 0;
    
    for (const [id, object] of this.simulationObjects) {
      // 动能
      const kinetic = 0.5 * object.mass * (
        object.velocity.x * object.velocity.x +
        object.velocity.y * object.velocity.y +
        object.velocity.z * object.velocity.z
      );
      
      // 势能 (简化为重力势能)
      const potential = object.mass * 9.81 * object.position.y;
      
      totalEnergy += kinetic + potential;
    }
    
    return totalEnergy;
  }

  /**
   * 计算系统动量
   */
  calculateTotalMomentum() {
    let totalMomentum = { x: 0, y: 0, z: 0 };
    
    for (const [id, object] of this.simulationObjects) {
      totalMomentum.x += object.mass * object.velocity.x;
      totalMomentum.y += object.mass * object.velocity.y;
      totalMomentum.z += object.mass * object.velocity.z;
    }
    
    return totalMomentum;
  }

  /**
   * 重置模拟
   */
  resetSimulation() {
    this.simulationObjects.clear();
    this.isSimulating = false;
    console.log('🔄 物理模拟已重置');
  }

  /**
   * 导出模拟状态
   */
  exportSimulationState() {
    return {
      objects: Array.from(this.simulationObjects.entries()),
      forces: Array.from(this.forces.entries()),
      timeStep: this.timeStep,
      isSimulating: this.isSimulating
    };
  }

  /**
   * 导入模拟状态
   */
  importSimulationState(state) {
    this.simulationObjects.clear();
    for (const [id, object] of state.objects) {
      this.simulationObjects.set(id, object);
    }
    
    this.forces.clear();
    for (const [name, force] of state.forces) {
      this.forces.set(name, force);
    }
    
    this.timeStep = state.timeStep;
    this.isSimulating = state.isSimulating;
    
    console.log('✅ 模拟状态导入成功');
  }
}

// 导出物理规则引擎
module.exports = PhysicsRulesEngine;
