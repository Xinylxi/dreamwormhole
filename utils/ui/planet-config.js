// utils/planet-config.js - 星球配置

const PLANET_TYPES = {
  '飞翔星球': {
    name: '飞翔星球',
    emoji: '🦅',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    description: '自由飞翔的梦境'
  },
  '海洋星球': {
    name: '海洋星球',
    emoji: '🌊',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    description: '深海的梦境'
  },
  '森林星球': {
    name: '森林星球',
    emoji: '🌲',
    color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    description: '自然的梦境'
  },
  '迷宫星球': {
    name: '迷宫星球',
    emoji: '🌑',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    description: '探索与焦虑的梦境'
  },
  '城市星球': {
    name: '城市星球',
    emoji: '🏙️',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    description: '都市生活的梦境'
  },
  '奇幻星球': {
    name: '奇幻星球',
    emoji: '✨',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    description: '奇幻冒险的梦境'
  },
  '恐怖星球': {
    name: '恐怖星球',
    emoji: '👻',
    color: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
    description: '恐惧与紧张的梦境'
  },
  '童年星球': {
    name: '童年星球',
    emoji: '🎈',
    color: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    description: '童年回忆的梦境'
  }
};

/**
 * 根据分类结果获取星球配置
 * @param {string} planetType - 星球类型
 * @returns {Object} 星球配置
 */
function getPlanetConfig(planetType) {
  return PLANET_TYPES[planetType] || PLANET_TYPES['奇幻星球'];
}

/**
 * 获取所有星球类型
 * @returns {Array} 星球类型列表
 */
function getAllPlanetTypes() {
  return Object.keys(PLANET_TYPES);
}

/**
 * 生成随机星球位置
 * @returns {Object} 星球位置 {x, y}
 */
function generatePlanetPosition() {
  return {
    x: Math.random() * 80 + 10,
    y: Math.random() * 80 + 10
  };
}

module.exports = {
  PLANET_TYPES,
  getPlanetConfig,
  getAllPlanetTypes,
  generatePlanetPosition
};

