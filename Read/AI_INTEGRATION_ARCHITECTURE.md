# 梦境AI分析接入架构与问题诊断

本文档总结 `dream-wormhole` 项目中 Coze AI 集成流程、关键文件和可能的失败点。

## 1. 关键调用链（从前端到Coze）

1. `pages/testing/test/test.js` （真实AI测试入口）：
   - `analyzeDream(testDream)` -> `utils/ai/coze.js`。
2. `utils/ai/coze.js`：
   - `analyzeDream` 构造 “梦境分析” prompt
   - 调用 `chatWithCoze(prompt)`
   - `chatWithCoze` -> `callCloudFunction(message, conversationId)`
   - `callCloudFunction` 通过 `wx.cloud.callFunction({ name: 'coze-proxy', data: {message, conversationId}})` 调用云函数
   - 解析云函数返回：`res.result.success===true` 且 `res.result.data` 的内容
   - 兼容格式：`data.messages` / `data.content` / `data.response` / `data.data` / 字符串
   - `analyzeDream` 从 `response.content` 提取 JSON (`{ ... }`) 并 `JSON.parse` 后返回结果

3. 云函数 `cloudfunctions/coze-proxy/index.js`：
   - 接收 `message, conversationId`
   - 如果令牌快过期，调用内部 `refreshAccessToken()`（通过 `CLOUD_HOST_DOMAIN/refresh-token`）。
   - 请求转发：`POST ${CLOUD_HOST_DOMAIN}/proxy/coze/chat`，包含:
     - `conversation_id`、`bot_id`、`user`、`query`、`stream:false`
     - Header `Authorization: Bearer ${accessToken}`
   - 若 Coze 返回 `code !== 0`，返回 `success:false` + error
   - 否则 `return { success: true, data: response.data }`

4. 云托管服务 `coze-oauth-server-main/server/app.js`（代理层）：
   - `/proxy/coze/chat` 转发到 `https://api.coze.cn/open_api/v2/chat`，透传 token
   - `/refresh-token` 转发到 `https://api.coze.cn/open_api/v2/token/refresh`

5. Coze 平台 `agent`：
   - 由 `prompt` 中内容触发，返回应为 JSON 格式（`analyzeDream` 中解析）

## 2. 目前项目中真实AI调用与 mock 的区别

- `pages/dreams/record/record.js`：
  - 目前使用 `mockAnalyzeDream`（模拟本地生成）
  - 不会经过 `utils/ai/coze.js` 与 Coze API

- `pages/testing/test/test.js`：
  - 使用 `analyzeDream`（真实 Coze 接口路径）
  - 也提供 `testNetwork` 直接测试 `https://api.coze.cn/v1/chat` (不走云函数)

## 3. 用户描述的问题最可能原因

1. 如果在“梦境记录页面”触发分析，确实不会走 Coze（使用 mock）。
2. 若在“测试页面”走真实路径仍无结果，可能是以下任一：
   - 云函数 `coze-proxy` 未部署或名称不匹配。`wx.cloud.callFunction({name:'coze-proxy'})` 需要一致。
   - `cloudfunctions/coze-proxy` 内 `CLOUD_HOST_DOMAIN` 不可达或未部署（默认 `https://api.dreamwormhole.cloud`）。
   - `accessToken` 已过期且刷新失败，导致返回 `success:false`。
   - `coze代理回包格式不符合 `utils/ai/coze.js` 解析规则（`data.messages` / `data.content` 等未命中）导致“无法识别Coze响应格式”。
   - `analyzeDream` 解析 JSON 出错：若 `content` 包含多余文本或不标准 JSON，`JSON.parse` 会抛异常，进入 catch。

## 4. 关键定位步骤（不改代码，可先在线调试）

- 打开小程序控制台日志：
  - `☁️ 调用云函数代理Coze API...`
  - `📦 云函数响应`（是否返回 success/data）
  - `AI响应格式无法识别` / `分析梦境失败`
- 查看云函数日志 `coze-proxy`：是否收到调用，返回 Coze 数据；是否 refresh 失败。
- 若希望“record页面”也使用真实 AI，把 `mockAnalyzeDream` 替换为 `analyzeDream`（后续改动，当前先了解）。

## 5. 建议补充记录字段

- `COZE_BOT_ID`、`accessToken`、`refreshToken` 是否正确。
- 运行 `pages/testing/test/test.js` 的 `testCozeAPI` 按钮结果。
- Coze agent 期望输出示例（最好在 Coze 平台已校验可返回标准 JSON）。

---

## 6. 代码级别“最可能的 bug”结论

- 场景A：`pages/dreams/record` -> mock，用户看到的数据是固定模拟（非Coze）
- 场景B：`pages/testing` -> coze，但可能在 `utils/ai/coze.js` 中未兼容你agent的实际返回结构（没有匹配 `data.messages` 或 `data.content`）


