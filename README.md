# magic-surf

一套**三端同源**的代理栈配置——Mac Clash Verge Rev / iOS Shadowrocket / iStoreOS OpenClash 共用同一节点池、同一 subconverter、同一 ACL4SSR 模板、同一分组命名、同一规则取向。

> 本仓库是**配置 + 文档**，不是软件。fork 后按 `clash-verge/` 或 `openclash/` 下的 README 落地。

## 这套配置解决了什么

**1. 现代协议在公共 subconverter 上被静默丢弃**

机场订阅常带 `anytls` / `hysteria2` / `vless reality` / `tuic` / `ss2022` 等 2024 后协议。OpenClash 内置的 `tindy2013/subconverter:v0.9.0` 与公共转换器（wcc.best / api.dler.io 等）不识别这些协议，转换时整段节点会被丢弃（实测 22/35 节点被吞）。

→ **本仓库统一用 `asdlokj1qpi23/subconverter:latest`（社区活跃 fork，原生支持上述协议）**，部署在 Mac Docker 与软路由 Docker，两端镜像一致。

**2. 端侧规则注入没有标准化出路**

`Merge.yaml` 的 `prepend-rules` 自 Verge Rev v1.6.2 起已被官方废弃，v2.4.7 静默丢弃——但很多教程仍在推这个写法，结果是**配置看起来对、mihomo 不识别、整段无效**。

→ **本仓库给出 `shared/Script.js` 全局脚本方案**（Verge JS 钩子，在订阅规则前拼接自定义规则），覆盖：
- 进程级路由（PROCESS-NAME，如 Claude / Anthropic 客户端）
- 公司内网直连（DOMAIN-SUFFIX + IP-CIDR）
- Cloudflare Tunnel 直连（避免 argotunnel / cftunnel 走代理失败）
- Steam CDN 漏网域名直连
- Claude UDP:443 REJECT（强制 Anthropic 客户端走 TCP，规避 QUIC 路径连通性问题）

**3. 三端配置容易漂移**

Mac / iOS / 软路由分头维护时，分组命名常漂成 `💬 Ai平台` vs `💬 AI平台` vs `claude in`，规则注入零散在多处，一改三处。

→ **本仓库锁定统一命名**（28 组 ACL4SSR 标准 + `💬 Ai平台` 等 emoji 前缀）+ **统一拼音 profile 命名**（`agg-acl / guaren-acl / cishan-acl / maoxiong-acl / peiqian-acl`，跨端对齐）+ **AI 流量统一指向 `💬 Ai平台`**。

**4. ACL4SSR 模板没有 DNS baseline，企业 VPN + TUN 共存复杂**

ACL4SSR_Online_Full_NoAuto 提供 28 组分组 + 10401 条规则，但不带 `dns:` 块。fork 后若不补 DNS 配置，TUN 模式下默认行为靠 mihomo 内置兜底，企业 VPN（EasyConnect / AnyConnect）连入后内网域名解析失败。

→ **本仓库给出 `shared/Merge.yaml` 的 DNS baseline**（fake-ip + 国内 DoH nameserver + 境外 DoH fallback + proxy-server-nameserver 防回环）+ **`docs/dns.md` 完整链路文档**（系统代理 vs TUN 模式 / 企业 VPN + TUN 共存配方 / 入口域名鸡生蛋死锁修复）。

## 三端能力一览

| 端 | 工具 | 主要能力 | 入口文件 |
|---|------|---------|---------|
| iOS | Shadowrocket | ACL4SSR Full_NoAuto 完整分组分流，远程 RULE-SET 同步 | `ACL4SSR_Full_NoAuto_Shadowrocket.conf` |
| Mac | Clash Verge Rev | 本地 subconverter + ACL4SSR + 端侧规则脚本注入 + DNS baseline + 备方案降级 | `clash-verge/README.md` |
| 软路由 | OpenClash (iStoreOS) | 网关层透明代理 + 同款 subconverter + ACL4SSR + 端侧规则覆写 | `openclash/README.md` |

三端共享：

- **同一节点池**（机场原始订阅）
- **同一 subconverter 镜像**（`asdlokj1qpi23/subconverter:latest`）
- **同一 ACL4SSR 模板**（`Online_Full_NoAuto.ini`）
- **同一组名 / profile 命名**
- **同一 AI 路由取向**：所有 AI 流量 → `💬 Ai平台`
- **同一直连兜底**：Cloudflare Tunnel / 公司内网 / Steam CDN → DIRECT

## 快速开始

### 我要在 Mac 上配 Clash Verge

→ [`clash-verge/README.md`](clash-verge/README.md)（主备双方案 / 本地 subconverter 部署 / Script.js 注入 / DNS baseline）

### 我要在 iStoreOS 软路由上配 OpenClash

→ [`openclash/README.md`](openclash/README.md)（subconverter 容器升级 / 订阅地址写法 / 覆写自定义规则）

### 我要在 iPhone 上配 Shadowrocket

→ 直接导入 `ACL4SSR_Full_NoAuto_Shadowrocket.conf`，节点来源仍用机场提供的原始订阅。

## 目录结构

```
magic-surf/
├── ACL4SSR_Full_NoAuto_Shadowrocket.conf    # iOS 端配置
├── clash-verge/                             # Mac 端
│   ├── subconverter/                        #   本地 subconverter 容器
│   ├── shared/Merge.yaml                    #   全局字段补丁（profile / tun / dns）
│   ├── shared/Script.js                     #   全局规则注入脚本（替代 prepend-rules）
│   ├── raw-overrides/                       #   备方案：订阅级 merge 覆写
│   ├── templates/                           #   备方案模板
│   ├── subscription-template.md             #   订阅 URL 拼装规约
│   ├── docs/conventions.md                  #   命名分层约定
│   ├── docs/dns.md                          #   DNS 配置说明（系统代理 vs TUN / VPN 共存）
│   └── AI-GUIDE.zh-CN.md                    #   给聊天 AI 的操作规约
└── openclash/                               # 软路由端
    ├── subconverter/                        #   subconverter 容器（与 Mac 同源）
    ├── overrides/                           #   覆写自定义规则
    ├── subscription-template.md             #   订阅 URL 拼装规约
    └── AI-GUIDE.zh-CN.md                    #   给聊天 AI 的操作规约
```

## 安全约束

- **不要提交真实订阅 URL / token / UUID / 密码 / 节点快照** —— 本仓库所有文件中订阅链接以占位符形式出现（`<airport-host>/<token>`）
- **不要提交运行时文件** —— `profiles.yaml`、`clash-verge.yaml`、`logs/`、`/etc/openclash/` 等
- **不要提交个人专属内网信息** —— 公司域名、内网 IP、内网 DNS server 等需要替换为占位符（`<corp-domain>` / `10.x.x.x`）

## License

MIT
