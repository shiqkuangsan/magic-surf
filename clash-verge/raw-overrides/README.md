# Raw Overrides（备方案 · 订阅级覆写）

> ℹ️ Mac 主方案是 subconverter + ACL4SSR + 全局 `shared/Script.js` 注入规则。本目录是**备方案专属**机制——保留对**特定单订阅**做完整自治覆写的能力。
>
> 详见 `../README.zh-CN.md` 的「两种模式」与 `../AI-GUIDE.zh-CN.md` 的「模式 2（备方案）」。

## 何时退回备方案

主方案失败的常见原因：

- 机场对 UA / 自动化访问严格，subconverter 拉不到完整内容
- 需要逐订阅完全自定义 `proxy-groups`（如 AI 节点偏好台湾排第一），ACL4SSR 28 组结构满足不了

## 文件约定

每份 raw-override 必须：

- 定义完整 `proxy-groups`
- 定义完整 `rules`
- 把所有 AI 流量路由到 `💬 Ai平台`

每份 raw-override **不应**：

- 包含订阅 URL
- 包含节点凭据 / token / uuid / password
- 依赖独立的 Verge `rules/groups/proxies` 覆写槽
- 重复 `shared/Script.js` 中已注入的规则（PROCESS-NAME / 公司内网 / Cloudflare Tunnel / Steam 漏网 / Claude UDP REJECT）—— 这些由全局 Script 自动覆盖，订阅级 raw-override 无需重写

## 现存样本

- `cishan-default.yaml` —— 慈善订阅历史覆写（AI 节点偏好台湾顺序）
- `guaren-default.yaml` —— 管人订阅历史覆写（机场命名规约定制）

陛下 2026-04-27 起切主方案后，这两份保留作**降级兜底样本**。新建 raw-override 参考 `../templates/raw-override.base.yaml`。
