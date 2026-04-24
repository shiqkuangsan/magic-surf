# Clash Verge Rev

[English](README.md)

这个目录是手工维护的 Clash Verge Rev 配置的唯一可信来源。

这里只存放安全文件：
- 全局共享 merge 覆写
- 原始订阅专属 merge 覆写
- 可复用模板
- 命名和分层文档

这里不存放：
- 原始订阅链接
- 运行时生成文件
- 远程订阅快照
- 日志或数据库

## 两种模式

### 1. 可使用 ACL 转换的订阅

这类订阅以 ACL 转换结果作为主分组和主分流来源。

规则：
- 所有 AI 相关流量最终统一指向 `💬 Ai平台`
- 除非有非常明确的理由，否则不要额外挂 Clash Verge 的 `rules/groups/proxies` 覆写槽
- `shared/Merge.yaml` 只负责补所有订阅都通用的公共规则

### 2. 不能使用 ACL 转换的原始订阅

保留原始订阅，避免破坏节点兼容性；然后从 `raw-overrides/` 挂专属 merge 覆写。

规则：
- 由专属 merge 文件负责 `proxy-groups` 和 `rules`
- 所有 AI 相关流量最终统一指向 `💬 Ai平台`
- 公共补丁仍然只放在 `shared/Merge.yaml`

## 目录结构

- `shared/Merge.yaml`：全局共享 merge 补丁
- `raw-overrides/guaren-default.yaml`：`管人默认` 的专属覆写
- `raw-overrides/cishan-default.yaml`：`慈善默认` 的专属覆写
- `templates/raw-override.base.yaml`：后续新增原始订阅覆写时的基础模板
- `acl-convertible/`：可走 ACL 转换订阅的约定说明
- `docs/conventions.md`：长期维护用的命名和分层规则
