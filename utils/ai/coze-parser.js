/**
 * Coze响应解析器
 * 支持解析Coze机器人返回的Markdown格式和结构化文本格式
 */

/**
 * 解析Coze返回的结构化文本
 * 支持两种模式：
 * 1. analysis模式：提取梦境解析信息用于保存
 * 2. story模式：提取平行宇宙故事内容用于展示
 */
function parseCozeResponse(content, mode = 'analysis') {
  if (!content || typeof content !== 'string') {
    console.warn('❌ Coze响应内容为空');
    return null;
  }

  console.log('📝 解析Coze响应内容，模式:', mode);
  console.log('📄 原始内容（前200字）:', content.substring(0, 200));

  // 预处理：将Markdown格式转换为标准格式
  const processedContent = preprocessMarkdown(content);
  console.log('✨ 预处理后的内容（前200字）:', processedContent.substring(0, 200));

  const lines = processedContent.split('\n');
  const result = {
    rawContent: content,
    processedContent: processedContent,
    sections: {}
  };

  // 提取各个标记的内容
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // 梦境解析
    if (line.startsWith('【梦境解析】') || line.startsWith('### 梦境解析')) {
      result.sections.dreamAnalysis = extractContent(line, '【梦境解析】', '### 梦境解析');
      // 如果解析内容跨多行，继续读取
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('【') && !lines[j].startsWith('###') && lines[j].trim() !== '') {
        result.sections.dreamAnalysis += '\n' + lines[j].trim();
        j++;
      }
    }

    // 情绪指数
    if (line.startsWith('【情绪指数】')) {
      const emotionMatch = line.match(/【情绪指数】(\d+)%/);
      if (emotionMatch) {
        result.sections.emotionScore = parseInt(emotionMatch[1]);
      }
    }
    // 也尝试从Markdown格式中提取情绪
    if (line.includes('**焦虑感**') || line.includes('**焦虑**')) {
      const anxietyMatch = line.match(/\*\*焦虑感?\*\*\s*\((\d+)%\)/);
      if (anxietyMatch) {
        result.sections.emotionScore = parseInt(anxietyMatch[1]);
      }
    }

    // 关键词
    if (line.startsWith('【关键词】')) {
      const keywordsText = line.replace('【关键词】', '').trim();
      result.sections.keywords = keywordsText.split('、').map(k => k.trim()).filter(k => k);
    }
    // 也尝试从Markdown格式中提取关键词
    if (line.startsWith('**关键词**') || line.startsWith('关键词：')) {
      const keywordsText = line.replace(/\*\*关键词\*\*:?/, '').replace('关键词：', '').trim();
      result.sections.keywords = keywordsText.split(/[,，、]/).map(k => k.trim()).filter(k => k);
    }

    // 星球类型
    if (line.startsWith('【星球类型】')) {
      result.sections.planetType = line.replace('【星球类型】', '').trim();
    }

    // 平行宇宙开启
    if (line.startsWith('【平行宇宙开启】')) {
      result.sections.parallelUniverseIntro = line.replace('【平行宇宙开启】', '').trim();
    }

    // 当前轮数
    if (line.startsWith('【当前轮数】')) {
      const roundMatch = line.match(/【当前轮数】(\d+)\/(\d+)/);
      if (roundMatch) {
        result.sections.currentRound = parseInt(roundMatch[1]);
        result.sections.totalRounds = parseInt(roundMatch[2]);
      }
    }

    // 分支选项 - 支持多种格式
    if (line.startsWith('【分支选项】') || line.includes('请告诉我您的选择')) {
      result.sections.branchOptions = [];
      
      // 尝试提取A/B/C/D选项
      let j = i + 1;
      while (j < lines.length) {
        const optionLine = lines[j].trim();
        
        // 匹配 A.、B.、C.、D. 格式
        if (optionLine.match(/^[A-D]\./)) {
          const optionText = optionLine.replace(/^[A-D]\.\s*/, '');
          result.sections.branchOptions.push({
            label: optionLine.charAt(0),
            text: optionText
          });
          j++;
        }
        // 匹配 **A.** 格式
        else if (optionLine.match(/^\*\*[A-D]\.\*\*/)) {
          const optionText = optionLine.replace(/^\*\*[A-D]\.\*\*\s*/, '');
          result.sections.branchOptions.push({
            label: optionLine.match(/\*\*([A-D])\.\*\*/)[1],
            text: optionText
          });
          j++;
        }
        // 匹配 - **A.** 格式（Markdown列表）
        else if (optionLine.match(/^-\s*\*\*[A-D]\./)) {
          const optionText = optionLine.replace(/^-\s*\*\*[A-D]\.\*\*\s*/, '');
          result.sections.branchOptions.push({
            label: optionLine.match(/\*\*([A-D])\./)[1],
            text: optionText
          });
          j++;
        }
        // 选项的详细描述（跨行）
        else if (optionLine.match(/^-\s+\*\*/) && result.sections.branchOptions.length > 0) {
          const match = optionLine.match(/\*\*([^*]+)\*\*：?\s*(.+)/);
          if (match) {
            const label = match[1];
            const text = match[2];
            result.sections.branchOptions.push({
              label: label,
              text: text
            });
          }
          j++;
        }
        else if (optionLine.startsWith('【') || optionLine.startsWith('###') || optionLine === '' || optionLine.startsWith('请告诉我')) {
          break;
        } else {
          // 选项跨多行，追加到最后一个选项
          if (result.sections.branchOptions.length > 0) {
            result.sections.branchOptions[result.sections.branchOptions.length - 1].text += '\n' + optionLine;
          }
          j++;
        }
      }
    }

    // 平行宇宙展开
    if (line.startsWith('【平行宇宙展开】')) {
      result.sections.parallelUniverseStory = line.replace('【平行宇宙展开】', '').trim();
      // 故事内容可能跨多行
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('【') && !lines[j].startsWith('###') && lines[j].trim() !== '') {
        result.sections.parallelUniverseStory += '\n' + lines[j].trim();
        j++;
      }
    }

    // 平行宇宙收束
    if (line.startsWith('【平行宇宙收束】')) {
      result.sections.parallelUniverseConclusion = line.replace('【平行宇宙收束】', '').trim();
      // 结束内容可能跨多行
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('【') && lines[j].trim() !== '') {
        result.sections.parallelUniverseConclusion += '\n' + lines[j].trim();
        j++;
      }
    }

    // 平行宇宙结项报告
    if (line.startsWith('【平行宇宙结项报告】')) {
      result.sections.conclusionReport = {};
      let j = i + 1;
      while (j < lines.length && !lines[j].startsWith('【') && !lines[j].startsWith('###') && lines[j].trim() !== '') {
        const reportLine = lines[j].trim();
        if (reportLine.startsWith('探险轮数：')) {
          result.sections.conclusionReport.explorationRounds = reportLine.replace('探险轮数：', '');
        } else if (reportLine.startsWith('关键选择：')) {
          result.sections.conclusionReport.keyChoices = reportLine.replace('关键选择：', '');
        } else if (reportLine.startsWith('心理洞察：')) {
          result.sections.conclusionReport.psychologicalInsight = reportLine.replace('心理洞察：', '');
        } else if (reportLine.startsWith('治愈成就：')) {
          result.sections.conclusionReport.healingAchievement = reportLine.replace('治愈成就：', '');
        }
        j++;
      }
    }

    // 星球诞生
    if (line.startsWith('【星球诞生】')) {
      result.sections.planetBirth = line.replace('【星球诞生】', '').trim();
    }
  }

  console.log('✅ 解析后的sections:', result.sections);

  // 根据模式返回不同格式
  if (mode === 'analysis') {
    // 分析模式：返回用于保存到数据库的格式
    return convertToAnalysisFormat(result);
  } else if (mode === 'story') {
    // 故事模式：返回用于展示的格式
    return convertToStoryFormat(result);
  }

  return result;
}

/**
 * 预处理Markdown格式，转换为标准格式
 */
function preprocessMarkdown(content) {
  let processed = content;
  
  // 转换Markdown标题为标准标记
  processed = processed.replace(/###\s*梦境解析/g, '【梦境解析】');
  processed = processed.replace(/###\s*关键节点/g, '【关键节点】');
  processed = processed.replace(/###\s*情感状态诊断/g, '【情感状态诊断】');
  
  // 提取焦虑感作为情绪指数
  const anxietyMatch = processed.match(/\*\*焦虑感\*\*\s*\((\d+)%\)/);
  if (anxietyMatch) {
    const emotionScore = anxietyMatch[1];
    processed = processed.replace(/###\s*情感状态诊断/g, `【情绪指数】${emotionScore}%\n【情感状态诊断】`);
  }
  
  // 提取关键词（如果有）
  const keywordMatch = processed.match(/\*\*关键词\*\*:?\s*([^\n]+)/);
  if (keywordMatch) {
    processed = processed.replace(/\*\*关键词\*\*:?\s*([^\n]+)/, '【关键词】$1');
  }
  
  return processed;
}

/**
 * 提取内容（支持多种格式）
 */
function extractContent(line, marker1, marker2) {
  if (line.startsWith(marker1)) {
    return line.replace(marker1, '').trim();
  }
  if (line.startsWith(marker2)) {
    return line.replace(marker2, '').trim();
  }
  return '';
}

/**
 * 转换为分析格式（用于保存到数据库）
 */
function convertToAnalysisFormat(parsed) {
  const sections = parsed.sections;

  // 情绪数组转换
  const emotions = [];
  if (sections.emotionScore !== undefined) {
    emotions.push({ name: '焦虑', value: sections.emotionScore });
    // 根据焦虑程度添加其他情绪
    if (sections.emotionScore > 70) {
      emotions.push({ name: '压力', value: sections.emotionScore - 10 });
      emotions.push({ name: '紧张', value: sections.emotionScore - 20 });
    } else if (sections.emotionScore > 40) {
      emotions.push({ name: '不安', value: sections.emotionScore + 10 });
      emotions.push({ name: '恐惧', value: sections.emotionScore - 5 });
    }
    emotions.push({ name: '求生欲', value: 100 }); // 从Coze响应中提取
  }
  
  // 关键词提取（从梦境解析中提取）
  let keywords = sections.keywords || ['梦境', '被追杀', '焦虑'];
  if (sections.dreamAnalysis) {
    // 尝试从梦境解析中提取更多关键词
    const additionalKeywords = sections.dreamAnalysis
      .match(/(?!\*\*)([\u4e00-\u9fa5]{2,4})/g)
      ?.filter(k => k.length >= 2 && k.length <= 4)
      .slice(0, 3) || [];
    keywords = [...new Set([...keywords, ...additionalKeywords])].slice(0, 5);
  }

  // 星球类型映射
  const planetTypeMap = {
    'happy': '飞翔星球',
    'sad': '海洋星球',
    'fear': '恐怖星球',
    'anger': '迷宫星球',
    'surprise': '城市星球',
    'calm': '森林星球',
    'excitement': '奇幻星球',
    'love': '童年星球',
    'adventure': '奇幻星球',
    'mystery': '迷宫星球',
    'unknown': '恐怖星球' // 被追杀梦境归类为恐怖星球
  };

  let planetType = sections.planetType || 'fear'; // 默认为恐惧星球
  if (planetTypeMap[planetType]) {
    planetType = planetTypeMap[planetType];
  }

  // 生成解释（包含梦境解析）
  let interpretation = sections.dreamAnalysis || '';
  if (sections.parallelUniverseIntro) {
    interpretation += '\n\n' + sections.parallelUniverseIntro;
  }

  // 提取分支选项用于保存
  let branchOptionsForSave = [];
  if (sections.branchOptions && sections.branchOptions.length > 0) {
    branchOptionsForSave = sections.branchOptions.map(opt => ({
      label: opt.label,
      text: opt.text
    }));
  }

  return {
    emotions: emotions,
    tags: keywords,
    planetType: planetType,
    interpretation: interpretation,
    // 保存原始Coze响应
    rawCozeResponse: parsed.rawContent,
    // 保存故事相关的数据
    storyData: {
      currentRound: sections.currentRound || 1,
      totalRounds: sections.totalRounds || 10,
      branchOptions: branchOptionsForSave,
      hasBranchOptions: (sections.branchOptions && sections.branchOptions.length > 0),
      isComplete: !!sections.conclusionReport,
      conclusionReport: sections.conclusionReport
    }
  };
}

/**
 * 转换为故事展示格式（用于在页面中展示）
 */
function convertToStoryFormat(parsed) {
  const sections = parsed.sections;

  // 构建故事内容
  let storyContent = '';
  if (sections.dreamAnalysis) {
    storyContent += sections.dreamAnalysis + '\n\n';
  }
  if (sections.parallelUniverseIntro) {
    storyContent += sections.parallelUniverseIntro + '\n\n';
  } else if (sections.parallelUniverseStory) {
    storyContent += sections.parallelUniverseStory + '\n\n';
  } else if (sections.parallelUniverseConclusion) {
    storyContent += sections.parallelUniverseConclusion + '\n\n';
  }

  // 提取分支选项（用于交互）
  let branchOptionsForDisplay = [];
  if (sections.branchOptions && sections.branchOptions.length > 0) {
    branchOptionsForDisplay = sections.branchOptions.map((opt, index) => ({
      label: opt.label || String.fromCharCode(65 + index),
      text: opt.text || opt,
      icon: getBranchIcon(opt.label || String.fromCharCode(65 + index))
    }));
  }

  return {
    // 当前轮次信息
    roundInfo: {
      current: sections.currentRound || 1,
      total: sections.totalRounds || 10
    },

    // 梦境解析（首轮显示）
    dreamAnalysis: sections.dreamAnalysis || '',

    // 情绪指数
    emotionScore: sections.emotionScore || 50,

    // 关键词
    keywords: sections.keywords || [],

    // 星球类型
    planetType: sections.planetType || 'unknown',

    // 平行宇宙开启（首轮）
    parallelUniverseIntro: sections.parallelUniverseIntro || '',

    // 平行宇宙展开（后续轮次）
    parallelUniverseStory: sections.parallelUniverseStory || '',

    // 平行宇宙收束（最后一轮）
    parallelUniverseConclusion: sections.parallelUniverseConclusion || '',

    // 结项报告
    conclusionReport: sections.conclusionReport || null,

    // 星球诞生
    planetBirth: sections.planetBirth || '',

    // 分支选项（用于交互）
    branchOptions: branchOptionsForDisplay,

    // 故事内容（用于显示）
    storyContent: storyContent,

    // 判断是否完成
    isCompleted: !!sections.conclusionReport,

    // 是否是第一轮
    isFirstRound: (sections.currentRound === 1 || sections.dreamAnalysis !== ''),

    // 是否有分支选项
    hasBranchOptions: (sections.branchOptions && sections.branchOptions.length > 0)
  };
}

/**
 * 获取分支选项的图标
 */
function getBranchIcon(label) {
  const iconMap = {
    'A': '🚶',
    'B': '🏃',
    'C': '🎭',
    'D': '⚔️'
  };
  return iconMap[label] || '✨';
}

/**
 * 判断Coze响应是否是首轮响应
 */
function isFirstRoundResponse(content) {
  if (!content) return false;
  return content.includes('梦境解析') || content.includes('核心意象分析');
}

/**
 * 判断Coze响应是否是中间轮响应
 */
function isMiddleRoundResponse(content) {
  if (!content) return false;
  return content.includes('平行宇宙展开') || content.includes('分支选项');
}

/**
 * 判断Coze响应是否是最后一轮响应
 */
function isFinalRoundResponse(content) {
  if (!content) return false;
  return content.includes('平行宇宙收束') || content.includes('结项报告');
}

module.exports = {
  parseCozeResponse,
  isFirstRoundResponse,
  isMiddleRoundResponse,
  isFinalRoundResponse
};