# Clash Verge Rev（Mac）

本目录维护可复用模板，不包含本机完整配置或认证。可选部署角色与验收边界见 [跨端说明](../docs/deployment-status.md)；组织域名、节点实例与应用专属例外在本地私有副本维护。

## 配置来源

| 内容 | 仓库模板 | 设备上的持久源 |
|---|---|---|
| 规则、AI 兼容组、个人节点注入 | shared/Script.js | Verge 数据目录 profiles/Script.js，保留本机 customNodes/customRules |
| 通用字段 | shared/Merge.yaml | Verge 全局 Merge；本模板不携带 DNS |
| DNS | examples/dns-current.example.yaml、dns-legacy.example.yaml | 选择并核实本机的持久源，具体见 [DNS](docs/dns.md) |
| 订阅特有分组与规则 | raw-overrides/ | 仅需要时使用；可能覆盖前面的扩展结果 |
| 节点与基础规则来源 | 订阅及转换模板 | 核对激活订阅与更新结果；不把任何旧路径当成已部署事实 |

数据目录通常为 `~/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/`。生成的 clash-verge.yaml 用于检查结果，不是唯一维护源。

## 全局脚本与个人节点

[shared/Script.js](shared/Script.js) 保留公共规则，提供三个本地定制入口：

- customNodes：默认空数组；仅在部署到本机的私有副本中填入节点对象。名称须非空且唯一，保留协议要求的全部字段。
- customRules：默认空数组；在本机添加组织域名等私有规则，优先于公共规则。不把真实域名提交到仓库。
- targetNames：个人节点只向名单中实际存在的 select 组追加，默认 AI 与手动组；不改自动组或其他分组。

脚本按名称替换个人节点，去重对应组内引用与注入规则，重复执行保持结果一致。不存在 AI 组时，优先复用已有 AI/代理组并避免循环引用；未知布局提供 REJECT 和候选节点，须自行确认选择，不静默落到 DIRECT。

个人节点没有示例认证值，也没有自动获取私有配置的逻辑。**不要直接用仓库空数组版本覆盖个性化脚本**。先备份，再合并公共逻辑与本机数组；每次订阅切换都核对生成配置与运行内核。

## 订阅与转换

[subscription-template.md](subscription-template.md) 给出本地 subconverter URL 示例；[subconverter/](subconverter/README.md) 保存 Compose。使用该路径前确认本机转换器确实可达，而不是仅凭目录存在判断已经部署。

原始订阅可作为另一种输入方式；[raw-overrides/](raw-overrides/README.md) 仅解决对应订阅的分组/规则兼容问题。它们可能替换数组，必须核实最终 AI 组、个人节点与规则未丢失。分组、节点和规则数量取决于实际订阅及扩展，不固定为历史数字。

## 部署与验证

1. 备份本机 Script、Merge 和 DNS 持久源；记录当前激活订阅与选择。
2. 在本地私有副本合并脚本。保留原有节点、组织规则、TUN 例外；不要从仓库推断真实域名。
3. DNS 按 [DNS 来源](docs/dns.md) 管理，保留组织策略；不要因套模板切换 DNS 所有者。
4. 重新激活后检查生成 YAML、控制接口的节点与规则、目标组当前选择；再做有限 HTTPS 与业务检查。
5. 失败时恢复备份并重新加载，核对选择和实际请求。保存文件或内核启动成功不足以证明业务通过。

本仓库不会自动部署。跨端的部署模式与验收边界见 [跨端说明](../docs/deployment-status.md)。
