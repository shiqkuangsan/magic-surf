# OpenClash 订阅 URL 模板

以下只演示“完整转换 URL”方式。另一种“原始订阅 + OpenClash 转换设置”同样需要按实际源核实，见 [接入方式](README.md)。示例回环地址只适用于转换器与 OpenClash 同机；跨设备调用应使用实际后端地址，不能原样填回环。

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

`url` 参数支持以 `|`（URL 编码后是 `%7C`）分隔多个订阅。subconverter 会并发拉取、合并节点，**一个源失败时仍可能输出聚合结果；须逐源检查，不能用聚合 HTTP 200 证明全部成功**。

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
| `sort` | `true` | 请求转换器排序；不把该参数当作已进行延迟实测 |
| `insert` | `false` | 不插入默认节点 |
| `fdn` | `false` | 不过滤非节点行 |
| `tfo` | `false` | 不开启 TCP Fast Open（路由层兼容性更好） |

## OpenClash「配置订阅」编辑要点

| 字段 | 值 |
|------|----|
| 订阅地址 | 上方拼好的完整 URL |
| User-Agent | **`clash.meta`** |
| 在线订阅转换 | 此完整转换 URL 方式关闭二次转换；原始 URL 方式另行核实 |
| 排除无效节点 | 勾上「过期时间 / 剩余流量 / TG群 / 官网」（机场返回的几条信息节点） |
| 节点过滤 / 排除 | 默认空（subconverter 已通过模板控制） |

## ACL4SSR 模板可选变体

| 模板 | 用途 |
|------|------|
| `ACL4SSR_Online_Full_NoAuto.ini` | **推荐**：历史示例采用的分组风格；数量随模板和源更新变化 |
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

这些是建议名称，不是机器当前文件名；既有配置名称由使用者在私有记录中维护。切换前确认个人节点覆写、AI 组及选择能保留，不因模板命名而重命名现有文件。

> 命名采用拼音风（`guaren / cishan / maoxiong / peiqian`）而非 host 别名（`is / aikun / gbshct / dash`），与 Mac Verge profile 命名跨端统一，便于在两端文档中互相引用。
