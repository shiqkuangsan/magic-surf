# OpenClash 覆写规则

OpenClash「覆写设置 → 规则设置 → 自定义规则」用于在 ACL4SSR 模板规则前后叠加个人规则。

## 三类开关

| 开关 | 含义 | 默认 |
|------|------|------|
| 第三方规则 | 用一份外部规则文件**完全覆盖** ACL4SSR 的 rules | ❌ 关 |
| 仅代理命中规则流量 | 类似 final 不走代理，未命中规则的全部直连 | ❌ 关 |
| **自定义规则** | 在 ACL4SSR 规则**之前** prepend 自定义规则 | ✅ 开 |

只用「自定义规则」即可。第三方规则会破坏 ACL4SSR 体系，不要开。

## 优先匹配（prepend）模板

参见同目录 [`custom-rules.yaml`](./custom-rules.yaml)。

OpenClash 在 LuCI 界面里把这部分内容直接显示为 yaml `rules:` 数组——粘贴时连 `rules:` 行**也要带上**（不要只贴 `- DOMAIN-...` 部分）。

## 与 Mac Verge 的同步

| 类别 | OpenClash `custom-rules.yaml` | Mac Verge `shared/Script.js`（`prependRules` 数组） |
|------|----------------------|---------------------------------------------|
| Cloudflare Tunnel 直连 | ✅（域名 + IP-CIDR） | ✅（多 `PROCESS-NAME,cloudflared`，仅 Mac 端生效） |
| Steam CDN 直连 | ✅ | ✅ |
| Claude UDP:443 REJECT | ✅（仅 DOMAIN-KEYWORD 复合） | ✅（多 `PROCESS-NAME-REGEX` 复合，仅 Mac 端生效） |
| Claude/Anthropic → 💬 Ai平台 | ✅（DOMAIN-KEYWORD + DOMAIN-SUFFIX） | ✅（DOMAIN 部分由 ACL4SSR 模板提供，Script 仅注入 PROCESS-NAME-REGEX） |
| 公司内网 your-corp → 直连 | 默认注释（仅特定场景启用） | ✅（Mac 必须） |
| `PROCESS-NAME` / `PROCESS-NAME-REGEX` | ❌ **不生效**（路由不知道客户端进程） | ✅ |

> ⚠️ 路由层 OpenClash **看不到客户端进程名**——`PROCESS-NAME` / `PROCESS-NAME-REGEX` 规则在路由层永远不命中。Mac Verge 通过 `Script.js` 注入这些规则到 mihomo runtime（v2.4.7 起 Merge.yaml 的 `prepend-rules` 已废弃，详见 Verge 端 `shared/Script.js` 头部说明）。

## 候补匹配（append）

OpenClash 同一文本框可同时填 prepend 和 append（部分版本分两栏）。一般情况下 **append 留空**：

- ACL4SSR 模板已经有兜底规则 `MATCH,🐟 漏网之鱼`
- 若 prepend 已抓到的关键字（如 anthropic / claude）在 append 重复 → **死规则**，永远不触发，应删

只有在 ACL4SSR 没匹配上的情况下需要兜底分流时，才在 append 加规则。陛下当前场景不需要。

## 路径与生效

iStoreOS 上的实际存储位置：`/etc/openclash/custom/openclash_custom_rules.list`

修改后：

1. WebUI 点「保存配置」（注意：OpenClash 有「**保存**」和「**保存并应用**」两个按钮，前者只写文件不重启核心）
2. 「服务管理」→ 重启 OpenClash 让 mihomo 重新加载

## Tip：通过 SSH 直接编辑（高效）

```bash
ssh root@<router-ip>
vi /etc/openclash/custom/openclash_custom_rules.list
# 编辑完成后
/etc/init.d/openclash restart
```
