# 梦境虫洞 - Dream Wormhole

一个探索平行时空扭曲的微信小程序，记录和分析你的梦境。

## 🌌 项目简介

梦境虫洞是一个基于"梦是平行时空的扭曲"理论的梦境记录与分析小程序。用户可以通过文字或语音记录梦境，AI会分析情绪和标签，并以宇宙地图的形式可视化所有梦境。

## ✨ 主要功能

### 1. 梦境记录
- 📝 文字输入梦境内容
- 🎤 语音输入（支持录音和自动语音识别）
- 🤖 AI自动分析情绪指数（压力、快乐、焦虑、兴奋等）
- 🏷️ 自动生成梦境标签
- 💾 保存到虫洞

### 2. 宇宙地图
- 🪐 不同梦境类型用不同星球表示
- 🔗 星球之间通过"虫洞"连接
- 📊 统计信息展示
- 🗺️ 点击星球查看详情
- 🌍 3D星球探索（旋转、缩放、交互）

### 3. 梦境详情
- 📖 查看完整梦境内容
- 📊 情绪分析可视化
- 🏷️ 梦境标签展示
- 🔮 AI解梦功能
- 🔍 相似梦境推荐

### 4. 数据分析
- 📈 梦境统计分析（情绪分布、星球分布、时间趋势）
- ☁️ 热门标签云
- 📅 时间筛选功能（7天、30天、一年）
- 📊 多维度图表展示

### 5. 时空穿梭（开发中）
- 🚀 告诉AI你想做什么梦
- 🎵 睡前AI语音引导
- 📊 梦境实现度报告

### 6. 宇宙进化引擎
- 🌌 自动进化的宇宙界面系统
- ⚡ 数据驱动的内容生成
- 🔬 物理规则模拟
- 🎛️ 控制面板和参数调节

## 🎨 设计特点

- **渐变主题**: 使用紫色渐变（#667eea → #764ba2）营造神秘梦幻氛围
- **宇宙风格**: 深色背景配合发光效果，模拟宇宙空间
- **现代UI**: 圆角卡片、柔和阴影、流畅动画
- **响应式设计**: 适配不同屏幕尺寸

## 📁 项目结构

```
dream-wormhole-master/
├── app.js                 # 小程序入口
├── app.json              # 全局配置
├── app.wxss              # 全局样式
├── project.config.json   # 项目配置
├── project.private.config.json  # 私有配置
├── sitemap.json          # 站点地图
├── components/           # 组件
│   └── navigation-bar/   # 自定义导航栏
├── pages/                # 页面
│   ├── analytics/        # 数据分析页面
│   ├── dreams/           # 梦境相关页面
│   │   ├── record/       # 梦境记录页
│   │   └── detail/       # 梦境详情页
│   ├── planets/          # 星球相关页面
│   │   └── detail/       # 星球详情页
│   │       └── explore/  # 3D星球探索
│   ├── testing/          # 测试页面
│   │   ├── test/         # AI分析测试页
│   │   └── api-test/     # API测试页
│   └── universe/         # 宇宙相关页面
│       └── map/          # 宇宙地图页
├── utils/                # 工具模块
│   ├── ai/               # AI相关工具
│   │   ├── coze.js       # Coze API封装
│   │   └── mock-analyze.js # 模拟分析
│   ├── data/             # 数据管理工具
│   │   ├── cloud.js      # 云数据库操作
│   │   └── cloud-test.js # 云测试工具
│   ├── ui/               # UI工具
│   │   └── planet-config.js # 星球配置
│   ├── core/             # 核心引擎
│   │   ├── engine/       # 进化引擎
│   │   │   ├── universe-evolution-engine.js
│   │   │   ├── universe-evolution-controller.js
│   │   │   └── universe-evolution-examples.js
│   │   └── systems/      # 系统组件
│   │       ├── data-driven-system.js
│   │       ├── physics-rules-engine.js
│   │       ├── control-panel-system.js
│   │       └── self-evolution-mechanism.js
│   └── common/           # 通用工具
│       ├── error-handler.js # 错误处理
│       └── coze-diagnostic.js # 诊断工具
├── cloudfunctions/       # 云函数
│   ├── coze-proxy/       # Coze API代理
│   └── getOpenId/        # 获取用户OpenID
├── coze-oauth-server-main/  # OAuth服务器
│   ├── app.js
│   ├── Dockerfile
│   ├── package.json
│   └── routes/
│       └── oauth.js
└── Read/                 # 项目文档
    ├── README.md         # 项目说明
    ├── QUICK_START.md    # 快速开始指南
    ├── USAGE_GUIDE.md    # 使用指南
    ├── DATABASE_SETUP.md # 数据库配置
    ├── COZE_SETUP.md     # Coze配置
    ├── CLOUD_FUNCTION_DEPLOY.md # 云函数部署
    ├── ANALYTICS_FEATURE_README.md # 分析功能说明
    ├── VOICE_AND_AI_FEATURES.md # 语音AI功能
    ├── 3D_PLANET_EXPLORATION.md # 3D探索说明
    ├── UNIVERSE_EVOLUTION_ENGINE_README.md # 进化引擎
    ├── CONSOLE_WARNINGS_FIX.md # 警告修复
    ├── GIT_PUSH_GUIDE.md # Git推送指南
    └── COLLABORATION_GUIDE.md # 协作指南
```
```

## 🚀 快速开始

### 1. 环境准备
- 安装微信开发者工具
- 获取微信小程序AppID
- 准备Coze API密钥（可选，用于AI分析）

### 2. 云开发配置
1. 打开微信开发者工具，导入项目
2. 点击顶部 **"云开发"** 按钮开通云服务
3. 创建环境并记录环境ID
4. 在 `app.js` 中配置环境ID

### 3. 数据库设置
在云开发控制台创建两个集合：
- `dreams` - 存储梦境记录
- `planets` - 存储星球数据

### 4. 云函数部署
部署 `cloudfunctions/` 下的云函数：
- `coze-proxy` - Coze API代理
- `getOpenId` - 用户身份获取

### 5. Coze AI配置（可选）
如需AI分析功能：
1. 访问 [Coze平台](https://www.coze.com/)
2. 创建机器人并获取API Key
3. 在 `utils/coze.js` 中配置API信息

### 6. 运行测试
1. 在开发者工具中点击 **"编译"**
2. 测试梦境记录和AI分析功能

> 📖 详细步骤请参考 [QUICK_START.md](QUICK_START.md)

或者临时注释掉 `app.json` 中的 `tabBar` 配置。

### 3. 运行项目
1. 使用微信开发者工具打开项目
2. 点击"编译"按钮
3. 在模拟器中预览效果

## 🛠️ 技术栈

- **前端框架**: 微信小程序原生框架
- **渲染引擎**: Skyline + Glass-easel
- **样式系统**: WXSS
- **AI服务**: Coze API
- **数据库**: 微信云开发数据库
- **云函数**: Node.js
- **OAuth服务器**: Node.js + Express
- **容器化**: Docker

## 📦 依赖说明

### 小程序依赖
- 无需额外依赖（使用微信原生API）

### 云函数依赖
- `wx-server-sdk`: 微信云开发SDK
- `axios`: HTTP请求库（用于调用Coze API）

### OAuth服务器依赖
- `express`: Web框架
- `cors`: 跨域处理
- `dotenv`: 环境变量管理

## 🚀 部署说明

### 微信小程序部署
1. 在微信开发者工具中完成开发
2. 点击"上传"按钮提交审核
3. 等待微信官方审核通过

### 云函数部署
参考 [CLOUD_FUNCTION_DEPLOY.md](CLOUD_FUNCTION_DEPLOY.md)

### OAuth服务器部署
```bash
cd coze-oauth-server-main
npm install
npm start
# 或使用Docker
docker build -t coze-oauth-server .
docker run -p 3000:3000 coze-oauth-server
```

## 🤝 贡献指南

欢迎贡献代码！请参考 [COLLABORATION_GUIDE.md](COLLABORATION_GUIDE.md)

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 发起 Pull Request

## 📄 许可证

本项目采用 MIT 许可证。

## 📞 联系方式

如有问题或建议，请通过以下方式联系：
- 提交 Issue
- 发送 Pull Request
- 邮箱：（请根据实际情况填写）

---

> 🌟 如果这个项目对你有帮助，请给它一个星标！
AI分析梦境后会生成情绪指数，包括：
- 压力指数
- 快乐指数
- 焦虑指数
- 兴奋指数

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License

## 👨‍💻 开发者

一个充满想象力的UI工程师 😊

---

**梦境虫洞** - 探索平行时空的扭曲 🌌
