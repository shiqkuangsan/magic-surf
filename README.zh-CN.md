# magic-surf

[English](README.md)

这是一个用于存放代理相关资产和配置的个人仓库。

## 范围

- Shadowrocket 配置文件
- Clash Verge Rev 覆写配置
- 规则与分组预设
- 代理工具与配置相关说明

## 当前内容

- `ACL4SSR_Full_NoAuto_Shadowrocket.conf`：iOS 端 Shadowrocket 的分组分流方案，基于 ACL4SSR `Full_NoAuto` 语义整理，节点来源仍然使用主页订阅。
- `clash-verge/`：受 Git 管理的 Clash Verge Rev 覆写配置和约定说明，不包含原始订阅链接或运行时产物。

## Clash Verge 目录结构

- `clash-verge/shared/`：全局共享 merge 文件，例如 `Merge.yaml`
- `clash-verge/raw-overrides/`：不能使用 ACL 转换时的专属 merge 覆写
- `clash-verge/templates/`：后续新增原始订阅覆写时可复用的模板
- `clash-verge/acl-convertible/`：适合直接走 ACL 转换的订阅约定
- `clash-verge/docs/`：命名和分层约定

## 安全约束

- 不要提交原始订阅链接、账户凭据或私有证书。
- 供应商相关的敏感内容应放在被忽略的路径下，例如 `subscriptions/`、`profiles/` 或 `secrets/`。
- 不要提交 Clash 运行时文件，例如 `profiles.yaml`、`clash-verge.yaml`、`logs/`，以及远程订阅快照。
