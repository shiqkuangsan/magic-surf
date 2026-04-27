# magic-surf

这是一个用于存放代理相关资产和配置的个人仓库。

## 范围

- Shadowrocket 配置文件
- Clash Verge Rev 覆写配置（Mac 端）
- OpenClash 配置方案（iStoreOS 软路由端）
- 规则与分组预设
- 代理工具与配置相关说明

## 当前内容

- `ACL4SSR_Full_NoAuto_Shadowrocket.conf`：iOS 端 Shadowrocket 的分组分流方案，基于 ACL4SSR `Full_NoAuto` 语义整理，节点来源仍然使用主页订阅。
- `clash-verge/`：Mac 上 Clash Verge Rev 的方案——本地 subconverter + ACL4SSR 模板 + 全局 `Merge.yaml`（字段补丁）+ 全局 `Script.js`（规则注入）。
- `openclash/`：iStoreOS 软路由 OpenClash 的方案——本地 subconverter + ACL4SSR 模板 + OpenClash 覆写自定义规则。

## 仓库为何在 2026-04-27 重构

这套仓库一天之内经历两次结构性改造，理解动机有助于按正确顺序阅读文档：

1. **subconverter fork 升级**（上午）—— OpenClash 内置 subconverter 与公共 subconverter（wcc.best / api.dler.io 等）都在源头静默丢弃 `anytls` 等现代协议节点。Mac 端 + 软路由端**双双换装** `asdlokj1qpi23/subconverter:latest`（社区活跃 fork），节点零丢失，两端架构归一。**结果**：Mac 端主备方案颠倒，原「能 ACL 转换 vs 不能 ACL 转换」分类失效。

2. **Verge Rev `prepend-rules` 废弃**（中午）—— 实测发现 Verge Rev v2.4.7 起 `Merge.yaml` 中的 `prepend-rules` / `append-rules` 顶级字段已被官方静默丢弃（v1.6.2 起废弃）。规则注入方案从 `Merge.yaml` 迁至新建的全局 `Script.js`（JavaScript 钩子）。**结果**：`clash-verge/shared/` 现有两份文件——`Merge.yaml` 仅放 mihomo 原生字段补丁，`Script.js` 承担所有规则前置注入；本仓库旧版 prepend-rules 写法全部清除。

如果陛下要 fork 本仓库，从下方「三端关系」章节开始读当前架构，不要参考 `git log` 或早期快照。

## 三端关系（2026-04-27 起统一架构）

| 端 | 工具 | subconverter 实例 | 主方案 | 备方案 |
|---|------|-----------------|------|------|
| iOS | Shadowrocket | — | 仓库根目录 conf | — |
| Mac | Clash Verge Rev | Mac Docker `127.0.0.1:25500` | subconverter URL + ACL4SSR 模板 + `clash-verge/shared/Merge.yaml`（mihomo 字段补丁）+ `clash-verge/shared/Script.js`（规则注入） | 原始订阅 + `clash-verge/raw-overrides/` |
| 软路由 | OpenClash (iStoreOS) | 软路由 Docker host:25500 | subconverter URL + ACL4SSR 模板 + `openclash/overrides/` | （无） |

三端：

- **节点池一致**：都是机场原始订阅
- **subconverter 镜像一致**：`asdlokj1qpi23/subconverter:latest`（社区活跃 fork，原生支持 anytls / hysteria2 / vless reality / tuic / ss2022）
- **分组命名一致**：`💬 Ai平台` / `🚀 节点选择` / `🎯 全球直连` 等统一组名
- **关键规则取向一致**：AI 流量 → `💬 Ai平台`、Cloudflare Tunnel → `DIRECT`

## 历史沿革

- 2026-04-27 之前：Mac Verge 默认走「原始订阅 + raw-overrides」，理由是公共 subconverter（wcc.best 等）不识别 anytls 等新协议
- 2026-04-27 上午：iStoreOS 上 OpenClash 内置 subconverter 升级为 `asdlokj1qpi23` fork（原 `tindy2013` v0.9.0 不支持 anytls，丢 22/35 节点）。Mac 端同日跟进部署本地 subconverter（同款 fork），原「不能 ACL 转换」分类失效——主备方案颠倒，主方案统一为 subconverter + ACL4SSR
- 2026-04-27 中午：实测发现 Verge Rev v2.4.7 起 `Merge.yaml` 中的 `prepend-rules` 顶级字段已废弃（mihomo 实测 0 命中）。Mac 端的规则注入方案从 `Merge.yaml` 迁至新建的全局 `clash-verge/shared/Script.js`，`Merge.yaml` 仅保留 `profile` / `tun` 等 mihomo 原生字段补丁。参考 [verge-rev #2455](https://github.com/clash-verge-rev/clash-verge-rev/issues/2455)

## Clash Verge 目录结构（Mac 端）

- `clash-verge/subconverter/`：**主方案** Mac 本地 subconverter 容器配置 + 部署说明
- `clash-verge/subscription-template.md`：**主方案** Verge 订阅地址 URL 拼装规约 + 9 份 profile 命名规约
- `clash-verge/shared/Merge.yaml`：全局共享 mihomo 原生字段补丁（主备方案共用）
- `clash-verge/shared/Script.js`：全局共享规则注入脚本（替代已废弃的 `prepend-rules`）
- `clash-verge/raw-overrides/`：**备方案** 订阅级专属 merge 覆写（仅在主方案失败时回退）
- `clash-verge/templates/`：备方案专属覆写模板
- `clash-verge/docs/`：命名和分层约定
- `clash-verge/AI-GUIDE.zh-CN.md`：给 AI 的 Verge 配置操作规约

## OpenClash 目录结构（iStoreOS 软路由端）

- `openclash/subconverter/`：iStoreOS 上 subconverter 容器部署说明 + compose 模板（与 Mac 同源）
- `openclash/overrides/`：OpenClash 覆写设置「自定义规则」prepend 模板（路由层可生效部分，是 Mac `Script.js` 的子集）
- `openclash/subscription-template.md`：OpenClash 订阅地址 URL 拼装规约 + 5 份配置命名规约（拼音风，与 Mac Verge profile 命名对齐）
- `openclash/AI-GUIDE.zh-CN.md`：给 AI 的 OpenClash 配置操作规约

## 安全约束

- 不要提交原始订阅链接、账户凭据或私有证书。
- 供应商相关的敏感内容应放在被忽略的路径下，例如 `subscriptions/`、`profiles/` 或 `secrets/`。
- 不要提交 Clash 运行时文件，例如 `profiles.yaml`、`clash-verge.yaml`、`logs/`，以及远程订阅快照。
