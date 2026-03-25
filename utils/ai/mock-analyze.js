// utils/mock-analyze.js - 模拟 AI 分析（用于测试）

/**
 * 模拟 AI 分析梦境（用于测试）
 * @param {string} dreamContent - 梦境内容
 * @returns {Promise} 返回模拟分析结果
 */
function mockAnalyzeDream(dreamContent) {
  return new Promise((resolve) => {
    // 模拟网络延迟
    setTimeout(() => {
      // 简单的关键词匹配分类
      const content = dreamContent.toLowerCase();
      
      let planetType = '奇幻星球';
      let emoji = '✨';
      let color = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
      let description = '奇幻冒险的梦境';
      
      if (content.includes('飞') || content.includes('天空') || content.includes('翱翔')) {
        planetType = '飞翔星球';
        emoji = '🦅';
        color = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        description = '自由飞翔的梦境';
      } else if (content.includes('海') || content.includes('水') || content.includes('游泳')) {
        planetType = '海洋星球';
        emoji = '🌊';
        color = 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
        description = '深海的梦境';
      } else if (content.includes('森林') || content.includes('树') || content.includes('自然')) {
        planetType = '森林星球';
        emoji = '🌲';
        color = 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';
        description = '自然的梦境';
      } else if (content.includes('迷宫') || content.includes('迷失') || content.includes('困惑')) {
        planetType = '迷宫星球';
        emoji = '🌑';
        color = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        description = '探索与焦虑的梦境';
      } else if (content.includes('城市') || content.includes('建筑') || content.includes('街道')) {
        planetType = '城市星球';
        emoji = '🏙️';
        color = 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
        description = '都市生活的梦境';
      } else if (content.includes('魔法') || content.includes('超能力') || content.includes('怪物')) {
        planetType = '奇幻星球';
        emoji = '✨';
        color = 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
        description = '奇幻冒险的梦境';
      } else if (content.includes('害怕') || content.includes('恐惧') || content.includes('追逐')) {
        planetType = '恐怖星球';
        emoji = '👻';
        color = 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
        description = '恐惧与紧张的梦境';
      } else if (content.includes('童年') || content.includes('学校') || content.includes('玩耍')) {
        planetType = '童年星球';
        emoji = '🎈';
        color = 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)';
        description = '童年回忆的梦境';
      }
      
      // 生成模拟情绪数据
      const emotions = [
        { name: '压力', value: Math.floor(Math.random() * 50) },
        { name: '快乐', value: Math.floor(Math.random() * 80) + 20 },
        { name: '焦虑', value: Math.floor(Math.random() * 40) },
        { name: '兴奋', value: Math.floor(Math.random() * 70) + 10 }
      ];
      
      // 生成模拟标签 - 根据内容长度调整
      const tagKeywords = ['飞翔', '海洋', '森林', '城市', '自由', '快乐', '探索', '冒险', '神秘', '奇幻', '梦境', '回忆'];
      const tags = [];
      
      // 根据内容长度决定标签数量
      const contentLength = dreamContent.length;
      let tagCount = 3; // 默认3个标签
      
      if (contentLength < 10) {
        tagCount = 1; // 短内容只生成1个标签
      } else if (contentLength < 20) {
        tagCount = 2; // 中等长度生成2个标签
      }
      
      // 尝试从内容中提取关键词作为标签
      const contentWords = dreamContent.split(/[\s，。！？、]/).filter(word => word.length > 0);
      for (let word of contentWords) {
        if (word.length >= 2 && tags.length < tagCount) {
          tags.push(word);
        }
      }
      
      // 如果标签不够，用随机标签补充
      while (tags.length < tagCount) {
        const randomTag = tagKeywords[Math.floor(Math.random() * tagKeywords.length)];
        if (!tags.includes(randomTag)) {
          tags.push(randomTag);
        }
      }
      
      if (tags.length === 0) tags.push('梦境');
      
      // 根据内容长度生成不同详细程度的解梦
      let interpretation = '';
      if (contentLength < 10) {
        interpretation = `这是一个简短的${planetType}梦境。虽然内容不多，但梦境往往反映内心的真实想法。建议你记录更多梦境细节，以便获得更深入的分析。`;
      } else if (contentLength < 30) {
        interpretation = `这是一个关于${planetType}的梦境。梦境反映了你内心的某些想法和情感。建议你关注梦境中的细节，它们可能代表了你现实生活中的某些方面。`;
      } else {
        interpretation = `这是一个关于${planetType}的梦境。梦境反映了你内心的某些想法和情感。建议你关注梦境中的细节，它们可能代表了你现实生活中的某些方面。梦境是潜意识与意识之间的桥梁，通过分析梦境可以帮助你更好地了解自己。`;
      }

      const result = {
        emotions: emotions,
        tags: tags,
        planetType: planetType,
        interpretation: interpretation
      };
      
      console.log('模拟分析完成:', result);
      resolve(result);
    }, 1000); // 1秒延迟
  });
}

module.exports = {
  mockAnalyzeDream
};

