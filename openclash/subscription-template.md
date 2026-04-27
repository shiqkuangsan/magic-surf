# OpenClash 订阅 URL 模板

OpenClash 的「订阅地址」字段直接填本地 subconverter URL，subconverter 内部再去拉机场原始订阅 + 套 ACL4SSR 模板。

## 单家机场（独立配置）

```
http://127.0.0.1:25500/sub
  ?target=clash
  &url=<URL-encoded raw subscription URL>
  &config=https%3A%2F%2Fraw.githubusercontent.com%2FACL4SSR%2FACL4SSR%2Fmaster%2FClash%2Fconfig%2FACL4SSR_Online_Full_NoAuto.ini
  &emoji=true
  &new_name=true
  &udp=true
  &scv=true
  &list=false
  &sort=true
  &insert=false
  &fdn=false
  &tfo=false
```

> 实际填入 OpenClash 时**写成一行**，不要换行。

## 多家机场聚合

`url` 参数支持以 `|`（URL 编码后是 `%7C`）分隔多个订阅。subconverter 会并发拉取、合并节点，**单家失败不影响整体**。

```
&url=<URL1>%7C<URL2>%7C<URL3>%7C<URL4>
```

## 参数说明

| 参数 | 值 | 含义 |
|------|----|------|
| `target` | `clash` | 输出 Clash 格式（含 ClashMeta 协议） |
| `url` | URL-encoded 原始订阅 | 多源用 `%7C` 分隔 |
| `config` | URL-encoded ACL4SSR INI 模板 | 决定分组与规则 |
| `emoji` | `true` | 节点名前加国旗 emoji |
| `new_name` | `true` | 重命名为标准化格式（自动去重） |
| `udp` | `true` | 节点开启 UDP 转发能力 |
| `scv` | `true` | skip-cert-verify，跳过 TLS 证书校验 |
| `list` | `false` | 输出完整配置（不仅是节点列表） |
| `sort` | `true` | 节点按延迟排序 |
| `insert` | `false` | 不插入默认节点 |
| `fdn` | `false` | 不过滤非节点行 |
| `tfo` | `false` | 不开启 TCP Fast Open（路由层兼容性更好） |

## OpenClash「配置订阅」编辑要点

| 字段 | 值 |
|------|----|
| 订阅地址 | 上方拼好的完整 URL |
| User-Agent | **`clash.meta`** |
| 在线订阅转换 | **关闭** |
| 排除无效节点 | 勾上「过期时间 / 剩余流量 / TG群 / 官网」（机场返回的几条信息节点） |
| 节点过滤 / 排除 | 默认空（subconverter 已通过模板控制） |

## ACL4SSR 模板可选变体

| 模板 | 用途 |
|------|------|
| `ACL4SSR_Online_Full_NoAuto.ini` | **推荐**：28 组 + 10401 规则，无自动选择，纯手动 + 国别 |
| `ACL4SSR_Online_Full.ini` | 同上，多个 url-test 自动选择 |
| `ACL4SSR_Online.ini` | 简化版，~12 组 |
| `ACL4SSR_Online_NoAuto.ini` | 简化版无自动 |

模板源：<https://github.com/ACL4SSR/ACL4SSR/tree/master/Clash/config>

切换时只改 URL 中的 `&config=` 参数即可，OpenClash 下次更新订阅时生效。

## 多订阅管理建议

推荐配置文件命名规约（与 Mac Verge 端 `../clash-verge/subscription-template.md` 对齐，全部使用拼音风）：

| OpenClash 配置文件名 | 订阅 URL（&url= 部分） | 用途 |
|---------------------|----------------------|------|
| `agg-acl.yaml` | URL1\|URL2\|URL3\|URL4 | 主用，多家机场聚合 |
| `guaren-acl.yaml` | 管人单家 URL | 单家备用 |
| `cishan-acl.yaml` | 慈善单家 URL | 单家备用 |
| `maoxiong-acl.yaml` | 猫熊单家 URL | 单家备用 |
| `peiqian-acl.yaml` | 赔钱单家 URL | 单家备用 |

「配置管理」一键切换。日常用 `agg-acl`，遇某家全挂时切到该家专属配置以排障。

> 命名采用拼音风（`guaren / cishan / maoxiong / peiqian`）而非 host 别名（`is / aikun / gbshct / dash`），与 Mac Verge profile 命名跨端统一，便于在两端文档中互相引用。
