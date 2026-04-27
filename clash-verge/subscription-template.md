# Verge 订阅 URL 模板

Mac Verge 走 `http://127.0.0.1:25500/...`（本地 subconverter）。模板与 OpenClash 完全一致，只换 host。

## 单家机场

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

> 实际填入 Verge「订阅地址」时**写成一行**。

## 多家聚合

`url` 参数以 `|`（URL 编码 `%7C`）分隔多源：

```
&url=<URL1>%7C<URL2>%7C<URL3>%7C<URL4>
```

详细参数解释见 [`../openclash/subscription-template.md`](../openclash/subscription-template.md)，两端共用同一规约。

## Verge 订阅设置

| 字段 | 值 |
|------|----|
| 订阅地址 | 上方拼好的完整 URL |
| User-Agent | **`clash.meta`** |
| 更新策略 | 默认即可 |

## 多订阅管理

推荐 profile 命名规约（与 OpenClash 配置文件命名对齐）：

| Verge profile 名 | 订阅 URL（&url= 部分） | 用途 |
|-----------------|----------------------|------|
| `agg-acl` | URL1\|URL2\|...（管人+慈善聚合，主用） | 日常默认 |
| `guaren-acl` | 管人单家 URL | 单家备用 |
| `cishan-acl` | 慈善单家 URL | 单家备用 |
| `maoxiong-acl` | 猫熊单家 URL | 单家备用 |
| `peiqian-acl` | 赔钱单家 URL | 单家备用 |
| `jiguang-acl` | 极光单家 URL | 单家备用 |
| `yiyuan-acl` | 一元单家 URL | 单家备用 |
| `ikuuu-acl` | ikuuu 单家 URL | 单家备用 |
| `vvcloud-acl` | Vvcloud 单家 URL | 单家备用 |

各 profile 自动挂载全局 `shared/Merge.yaml`（mihomo 字段补丁）+ `shared/Script.js`（规则注入）——这两个全局位在 `profiles.yaml` 顶级位置，对所有 profile 默认生效，**无需手动挂槽**。

> ⚠️ 真实订阅 URL 含 token，禁止 commit 到本仓库。陛下首次部署时按上述模板拼装 URL，仅落地到本机 Verge 数据目录。
