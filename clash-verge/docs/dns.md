# DNS 配置说明

这份文档解释 magic-surf 在 Mac Clash Verge Rev 上的 DNS 策略：两种 Verge 工作模式（**系统代理** vs **TUN**）下 DNS 链路差异、`shared/Merge.yaml` 中 `dns:` 块的作用、以及 fork 者**没有 dnsmasq 软路由层**时如何独立运转。

> 本仓库假设 fork 者的最低环境只有 macOS + Clash Verge Rev，**不假设上游有软路由 / dnsmasq / pihole**。如果你恰好有，参见文末「可选：dnsmasq 加层」。

## 1. Verge 两种模式的 DNS 链路差异

Clash Verge Rev 在 macOS 上有两种工作模式（设置 → 系统代理 / TUN 模式），二者的 **DNS 链路完全不同**，必须分开理解。

### 1.1 系统代理模式（System Proxy Mode）

mihomo 仅充当 HTTP/SOCKS 代理。**DNS 解析不由 mihomo 接管**：

```
浏览器 / app
    │  发起 example.com 请求
    ▼
系统 resolver（macOS scutil）
    │  查询 example.com 的 IP
    ▼
系统 DNS 服务器（用户在 macOS 网络面板配置的，或自动获取）
    │  返回 IP
    ▼
浏览器把整个 HTTP/HTTPS 请求（含目标域名/IP）丢给 mihomo HTTP 代理
    │
    ▼
mihomo 按规则匹配（**域名匹配仍可正常工作**，因为代理协议保留了 Host）
```

要点：

- **mihomo 配置中的 `dns:` 块在系统代理模式下基本不参与解析**——除非命中需要 mihomo 自己向上游解析的场景（如 `IP-CIDR` 规则但 client 只给了域名时的反查）
- **DNS 隐私 / 污染 / 被劫持，全靠系统层 DNS**——所以这个模式下，建议陛下把 macOS 网络面板里的 DNS 改成可信公网 DoH/DoT 上游（或交给软路由 dnsmasq）
- 已知 Verge Rev 早期版本会**强改系统 DNS 为 `114.114.114.114`**——见 [Verge Rev #2455](https://github.com/clash-verge-rev/clash-verge-rev/issues/2455)。如果发现 `scutil --dns` 显示 114 而你没配置过，关掉 Verge 的「DNS 设置 → 启用」，或升级 Verge 到修复版

### 1.2 TUN 模式（Enhanced / TUN Mode）

mihomo 创建虚拟网卡，**接管全机 TCP/UDP 流量 + DNS 53 端口**：

```
浏览器 / app
    │  发起 example.com 请求
    ▼
系统 resolver
    │  查询 example.com → DNS 包从 53 端口出去
    ▼
mihomo TUN 接管 53 端口
    │
    ▼
mihomo 内置 DNS（受 `dns:` 块控制）
    │  enhanced-mode: fake-ip → 返回 198.18.x.x 假地址
    │  enhanced-mode: redir-host → 返回真实 IP（向上游解析）
    ▼
返回给系统 / 应用
    │  应用按返回 IP 发起 TCP 连接
    ▼
mihomo TUN 拦截 TCP，按规则匹配到对应代理
```

要点：

- **mihomo 配置中的 `dns:` 块决定一切**——上游、fake-ip vs redir-host、fallback、nameserver-policy 都由它控制
- **fake-ip 模式**（推荐）：mihomo 不立即解析真实 IP，先返回保留地址，TCP 建连时再交给代理出口去解（节省往返、避免污染）
- **redir-host 模式**：mihomo 立即向上游解析真实 IP——更兼容老软件，但 DNS 污染风险变成 mihomo 选错上游就出事

## 2. shared/Merge.yaml 中的 `dns:` 块

`shared/Merge.yaml` 顶级提供一份 **baseline `dns:` 块**，配置原则：

1. **TUN 模式下生效，系统代理模式下大多无影响**——所以两个模式下都可以挂这份 baseline
2. **default-nameserver** 用国内 plain DNS（aliyun / dnspod），仅在 mihomo 启动时解析上游 DoH 域名时使用，避免鸡生蛋
3. **nameserver** 用国内 DoH，给国内域名加密直连，不走代理
4. **proxy-server-nameserver** 用国内 DoH，专门解析机场节点域名（即代理服务器自身的 DNS），避免节点域名走 fallback 然后被代理解析造成回环
5. **fallback** 用境外 DoH，给被识别为非中国域名的解析（默认行为，可由 nameserver-policy 精细控制）
6. **fallback-filter / nameserver-policy**：默认按 GeoIP 区分，国内走 nameserver，国外走 fallback
7. **fake-ip 默认开启**——配合 `fake-ip-filter` 排除局域网常见域名（保证 OpenWRT/打印机/AirDrop 等不被假地址污染）

baseline 的具体 yaml 内容见 [`../shared/Merge.yaml`](../shared/Merge.yaml)。

### 2.1 fork 者可调整项

| 字段 | 默认值 | 调整场景 |
|------|--------|---------|
| `enhanced-mode` | `fake-ip` | 如果有大量 P2P / 早期 IM 软件不兼容 fake-ip，改 `redir-host` |
| `fake-ip-filter` | 通用清单 | 公司内网 / NAS / 智能家居等需要走真实 IP 的域名加进来 |
| `nameserver` | aliyun + dnspod DoH | 替换为陛下信任的境内 DoH/DoT |
| `proxy-server-nameserver` | aliyun + dnspod DoH | 必须**走非代理**的国内可信上游，避免回环 |
| `fallback` | cloudflare + google DoH | 替换为境外可信 DoH |
| `fallback-filter.geoip-code` | `CN` | 留 `CN`，其他地区也按相同套路 |

## 3. 没有 dnsmasq 时的运转

magic-surf 不依赖 dnsmasq——上述 baseline 在「**只有 macOS + Clash Verge Rev**」的 fork 环境下完整可用：

| 维度 | 表现 |
|------|------|
| TUN 模式 DNS 解析 | mihomo 内置 DNS 客户端处理 → `dns:` 块全权决定，不需要 dnsmasq |
| 系统代理模式 DNS 解析 | 由 macOS 系统 resolver + 网络面板 DNS 处理 → 与 dnsmasq 无关 |
| 国内/国外分流 | mihomo 用 GeoIP / nameserver-policy 区分，无需 dnsmasq 帮忙 |
| 隐私 / 抗污染 | DoH 链路天然加密，无需 dnsmasq 中转 |
| 局域网解析（`*.lan`） | 走 `fake-ip-filter` 排除 → 系统 mDNS / Bonjour 兜底 |

如果你**不打算引入软路由**，跳过下一节即可。

## 4. 可选：dnsmasq 加层

只有以下场景才建议引入 dnsmasq（一般跑在软路由 / 树莓派 / NAS）：

| 引入理由 | 加什么层 |
|---------|---------|
| 多端（Mac / iPhone / IoT）共享同一份强制覆写 | dnsmasq 做 LAN 内权威 DNS，写 `address=/foo.lan/192.168.x.x` |
| 需要把某些域名**永远固定**到指定 IP | 同上 |
| 全屋广告拦截（pihole 等） | dnsmasq 上挂黑名单 |
| 软路由作为家庭 DNS hub | mihomo `dns:` 用 dnsmasq 当 default-nameserver / nameserver |

陛下家用环境就是这一套——iStoreOS 上跑 dnsmasq，Mac 系统代理模式下系统 DNS 指向软路由，TUN 模式下 mihomo `dns:` 块的 default-nameserver 也可改指向 `192.168.x.x:53`（软路由 IP）。详见 KnowledgeBase 系列 02-DNS覆写与dnsmasq配置拆解 / 06-家庭OpenClash旁路由方案。

magic-surf 默认 baseline **不依赖此情况**——fork 者按各自环境调整。

## 5. 快速排错

| 现象 | 优先怀疑 |
|------|---------|
| `scutil --dns` 显示 `114.114.114.114` 但没配置过 | Verge Rev 系统 DNS 强改 bug，关 Verge「DNS 设置 → 启用」或升级 |
| TUN 模式下浏览器域名打不开但代理正常 | 检查 mihomo 日志 `dns/...`，多半是 fake-ip-filter 漏了某域名 |
| 系统代理模式下国内站点解析慢 | 系统 DNS 可能被设到境外，改成本机软路由或国内 DoH |
| 节点域名解析失败（如 `aaa.example.com → ?`） | `proxy-server-nameserver` 配错了或走了 fallback 造成回环 |
| 内网域名（`*.lan` / `your-corp.local`）走代理出去 | 加进 `fake-ip-filter`，必要时配合 `nameserver-policy` 精确指向内网 DNS |

更详细排查见 [`AI-GUIDE.zh-CN.md`](../AI-GUIDE.zh-CN.md) 第「诊断」节。

## 参考

- mihomo DNS 文档：<https://wiki.metacubex.one/config/dns/>
- Verge Rev 系统 DNS 强改 bug 历史：<https://github.com/clash-verge-rev/clash-verge-rev/issues/2455>
- ACL4SSR 模板默认不带 `dns:` 块——所以 `Merge.yaml` 的 `dns:` 是 fork 后的**主要 DNS 真值源**
