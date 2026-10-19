# OpenClash 公共规则与个人节点覆写

公共规则位于 [custom-rules.yaml](custom-rules.yaml)，根据当前配置在 LuCI 自定义规则入口合并；不要覆盖原有全部规则。路由层只看到网络目标，客户端进程名规则留在 Mac。

## 个人节点的输入与接入

[personal-nodes.rb](personal-nodes.rb) 接受一个生成运行 YAML 路径；固定从设备 `/etc/openclash/custom/` 读取两份私有输入：

| 文件 | 格式与职责 |
|---|---|
| personal-nodes.yaml | 非空节点对象数组，每个 name 非空且唯一；真实协议与认证字段只填在设备私有文件 |
| personal-ai-rules.yaml | 指向 AI 组的规则字符串数组；从已确认的实际策略维护，不把某次历史规则数量当成固定要求 |

仅用于理解结构的无凭据节点示例（不是可用代理）：

```yaml
- name: example-personal
  type: socks5
  server: 192.0.2.1
  port: 1080
```

规则结构示例（不是完整 AI 规则集）：

```yaml
- DOMAIN,example.invalid,💬 Ai平台
```

部署前备份现有 overwrite hook、脚本、两份私有源、UCI、原运行 YAML 和各手动组选择。备份目录权限 0700；含私密内容的文件仅设备本地保存。私有输入权限设为 0600，核对 YAML 格式与节点协议完整性。

把本目录 Ruby 模板及 [personal-nodes-hook.sh](personal-nodes-hook.sh) 部署到设备 `/etc/openclash/custom/`。在**现有** openclash_custom_overwrite.sh 中，找到当前版本提供生成配置路径的调用位置，核对 CONFIG_FILE 确实指向该文件，再追加调用；保留其余原有逻辑：

```sh
# CONFIG_FILE must be supplied by the installed OpenClash hook context.
sh /etc/openclash/custom/personal-nodes-hook.sh "$CONFIG_FILE" || exit 1
```

不能用这个片段覆盖整份 hook，也不能假定所有 OpenClash 版本提供同名变量；未知时先查实际脚本。确保 overwrite 调用发生在配置重建期间且后续没有其他处理覆盖节点或分组。

## 行为与验证

Ruby 模板按名称替换个人节点，向现有 AI/手动 select 组追加去重引用；缺 AI 组时创建它，并保留既有规则和 profile 字段、开启 store-selected。它不主动切换运行组选择，也不发出 API 请求。

先用副本验证候选 YAML，再在明确授权内触发当前版本支持的重建或热加载。使用实际运行内核的工作目录及 SAFE_PATHS（若存在）进行配置校验，不能为绕过预检直接删除路径限制。热加载只证明当前结果；要宣称重建持久性，必须实际验证 hook 路径。

核对两份持久源、生成节点、组内引用次数、AI 规则顺序、其他组和原选择；再对受影响节点作 HTTPS 和必要业务验证。修改仓库不代表设备已部署，也不以一次 probe 代替 AI 推理验收。

## 回退

恢复备份中的 hook、私有源及原运行 YAML，按实际版本重新加载并恢复手动组选择；核对当前业务。需要完整撤销时，先移除本次新增调用，再按精确清单清理新增文件。不要仅恢复生成 YAML 后立即重建，否则仍可能被当前源覆盖。

实际设备状态与维护记录保存在使用者的私有知识库中；原始配置与回退材料留在设备或库外私有归档。两个库各自维护职责，不复制真实订阅、认证或原始证据。
