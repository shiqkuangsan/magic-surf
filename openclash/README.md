# OpenClash（iStoreOS 软路由）

iStoreOS 上 OpenClash 的网关方案。Mac Clash Verge 与软路由 OpenClash 现在跑**同款架构**——本地 subconverter + ACL4SSR 模板 + 端侧规则注入。差别仅在端侧规则注入机制：Verge 走 `Script.js`，OpenClash 走「覆写设置 → 自定义规则」。

## 架构

```
原始机场订阅 (含 anytls / vless / hysteria2 / vmess)
        │
        ▼
iStoreOS Docker: subconverter (asdlokj1qpi23/subconverter:latest, host 网络 :25500)
        │  + ACL4SSR_Online_Full_NoAuto.ini 模板
        ▼
完整 Clash YAML（节点 + 28 组分组 + 10401 规则）
        │
        ▼
OpenClash「配置订阅」（订阅地址 = 本机 subconverter URL，在线订阅转换=关闭，UA=clash.meta）
        │
        ▼
OpenClash「覆写设置 → 自定义规则」叠加个人 prepend 规则
        │
        ▼
mihomo Meta 内核（alpha 分支，全协议支持）
```

## 为什么是这个架构

历史包袱：

- **OpenClash 内置 subconverter 老旧**：默认镜像 `tindy2013/subconverter:latest` (v0.9.0) 不支持 anytls 等 2024 年后新协议，订阅转换时 22/35 节点会被静默丢弃
- **公共转换器（wcc.best 等）同样老旧**：URL 中嵌入这类后端会在源头丢节点
- **机场内容协商**：UA = `clash.meta` 时机场可能直接返回完整 Clash YAML（含新协议），故订阅链路应保持端到端 Meta 兼容

解法：

- 替换软路由本地 subconverter 容器镜像为 `asdlokj1qpi23/subconverter:latest`（v0.9.9，社区活跃 fork，原生支持 anytls / hysteria2 / vless reality / tuic / ss2022）
- OpenClash「在线订阅转换」**关闭**，订阅地址直接填写本地 subconverter 的 URL（subconverter 已内置 ACL4SSR 模板调用）
- 多机场订阅可通过 `&url=URL1|URL2|...` 在 subconverter 层面聚合

## 与 Clash Verge 的关系

- Mac Clash Verge 与软路由 OpenClash 都走 subconverter + ACL4SSR 模板，**架构同款**
- **节点池一致**：两端最终消费的都是机场原始订阅的全部节点
- **分组命名一致**：双方都遵循 `💬 Ai平台` / `🚀 节点选择` / `🎯 全球直连` 等统一组名（参见 `clash-verge/AI-GUIDE.zh-CN.md` 的命名规约）
- **配置文件命名一致**：两端配置/profile 命名都用拼音风（`agg-acl / guaren-acl / cishan-acl / maoxiong-acl / peiqian-acl`）
- **规则取向一致**：AI 流量 → `💬 Ai平台`、Cloudflare Tunnel → `DIRECT`、Steam CDN → `DIRECT`、Claude UDP:443 → `REJECT`
- **差异**：路由层不识别 PROCESS-NAME 规则，故 Mac 端 `Script.js` 多 6 条进程相关规则；OpenClash 端 your-corp 默认注释（Mac 端通过 Script.js 直连内网）

## 目录结构

- `subconverter/` — iStoreOS 上 subconverter 容器的部署说明与 compose 模板
- `overrides/` — OpenClash 覆写设置（自定义规则）的模板和说明
- `subscription-template.md` — OpenClash 订阅地址 URL 拼装模板（不含 token）
- `AI-GUIDE.zh-CN.md` — 给 AI 的 OpenClash 配置操作规约

## 安全约束

- **不要提交真实订阅 URL**：本目录所有文件中订阅链接以占位符形式出现（`<airport-host>/<token>`）
- **不要提交 token / UUID / 密码 / 节点快照**
- **不要提交 OpenClash 运行时**：`/etc/openclash/`、`/etc/config/openclash`、生成的 `*.yaml` 配置等
- 真实订阅地址只保留在路由器本地与个人安全笔记中

## 关键运维入口

- OpenClash WebUI: `http://<router-ip>/cgi-bin/luci/admin/services/openclash`
- OpenClash 还原: `http://<router-ip>/cgi-bin/luci/admin/services/openclash/restore`
- subconverter (本机调用): `http://127.0.0.1:25500/sub?...`
- subconverter 前端 (sub-web-local): `http://<router-ip>:18080/`
- mihomo Wiki: <https://wiki.metacubex.one/>
