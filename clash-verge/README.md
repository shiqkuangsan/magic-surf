# Clash Verge Rev（Mac）

这个目录是手工维护的 Mac Clash Verge Rev 配置的唯一可信来源。

这里只存放安全文件：
- 全局共享 merge 覆写
- 原始订阅专属 merge 覆写（**备方案**）
- subconverter 容器配置（**主方案核心依赖**）
- 订阅 URL 模板
- 命名和分层文档

这里不存放：
- 原始订阅链接 / token
- 运行时生成文件
- 远程订阅快照
- 日志或数据库

## 两种模式（主备分明）

### 1（主方案）：subconverter + ACL4SSR

**默认走这个**。Mac 本地跑一个 subconverter 容器（`asdlokj1qpi23/subconverter:latest`，监听 `127.0.0.1:25500`），Verge 订阅地址直接指向本地 subconverter URL，subconverter 内部套 ACL4SSR_Online_Full_NoAuto.ini 模板生成完整配置。

规则：
- AI 相关流量统一指向 `💬 Ai平台`
- ACL4SSR 模板负责 28 组分组与 10401 条规则
- `shared/Script.js` 在订阅规则前注入端侧补丁（PROCESS-NAME / 公司内网 / Cloudflare Tunnel / Steam 漏网 FQDN / Claude UDP REJECT）
- `shared/Merge.yaml` 仅承担 mihomo 原生字段覆盖（profile / tun / dns 等）
- **不**使用 `raw-overrides/*.yaml`

### 2（备方案）：原始订阅 + 订阅级 merge 覆写

**仅在主方案失败时退回**——例如机场 anti-bot 严格 subconverter 拉不到内容、或需要逐订阅自定义 `proxy-groups`。

规则：
- 保留原始订阅，避免破坏节点兼容性
- `raw-overrides/*.yaml` 提供该订阅的 `proxy-groups` + `rules`
- AI 相关流量仍统一指向 `💬 Ai平台`
- `shared/Script.js` 仍承担公共规则注入；`shared/Merge.yaml` 仍承担字段级补丁

## 目录结构

- `subconverter/`：**主方案** Mac 本地 subconverter 容器配置 + 部署说明
- `subscription-template.md`：**主方案** Verge 订阅地址 URL 拼装规约 + 9 份 profile 完整 URL
- `shared/Merge.yaml`：全局共享 mihomo 字段补丁（主备方案共用）
- `shared/Script.js`：全局共享规则注入脚本（替代已废弃的 `prepend-rules` 写法）
- `raw-overrides/*.yaml`：**备方案** 订阅级专属覆写
- `templates/raw-override.base.yaml`：备方案专属覆写模板
- `docs/conventions.md`：命名和分层规则
- `docs/dns.md`：DNS 配置说明（系统代理 vs TUN 模式 / `Merge.yaml` 中 `dns:` 块 / 不依赖 dnsmasq）
- `AI-GUIDE.zh-CN.md`：给聊天型 AI 使用的配置操作规约

## 与 OpenClash 端的关系

iStoreOS 软路由端的 OpenClash 走完全同款架构（subconverter + ACL4SSR），两端**节点池、分组命名、AI 流量目标一致**。详见 `../openclash/`。

唯一差别：

| 维度 | Mac Verge | iStoreOS OpenClash |
|------|-----------|-------------------|
| subconverter Docker 网络 | port mapping `127.0.0.1:25500` | `network_mode: host` |
| 端侧规则注入落点 | `shared/Script.js`（JS）+ `shared/Merge.yaml`（字段补丁） | OpenClash 覆写 → 自定义规则（YAML） |

## 历史

- **2026-04-27 之前**：Mac 端默认走「原始订阅 + raw-overrides」，理由是公共 subconverter（wcc.best 等）不识别 anytls 等新协议
- **2026-04-27 上午**：Mac 本地部署 `asdlokj1qpi23/subconverter:latest`（社区活跃 fork，原生支持 anytls / hysteria2 / vless reality / tuic / ss2022），原 anytls 阻塞消除——主备方案颠倒，主方案改为 subconverter + ACL4SSR
- **2026-04-27 中午**：实测发现 Verge Rev v2.4.7 起 `Merge.yaml` 中的 `prepend-rules` 顶级字段已废弃（mihomo 实测 0 命中）。规则注入方案从 `Merge.yaml` 迁至 `shared/Script.js`，`Merge.yaml` 仅保留 `profile` / `tun` 等 mihomo 原生字段补丁。参考 [verge-rev #2455](https://github.com/clash-verge-rev/clash-verge-rev/issues/2455)
