# DNS 示例与配置来源

本目录提供公共 DNS 策略示例，不描述任何使用者的实际 DNS、组织域名、VPN 入口或专属路由。选择策略后，应在本机私有配置中补充并验收。

## 两种可选策略

| 示例 | 策略意图 | 使用前检查 |
|---|---|---|
| [dns-current.example.yaml](../examples/dns-current.example.yaml) | 默认解析绑定代理组，DIRECT 使用独立上游并遵循域名策略 | 代理组存在、节点解析不回环、私有策略和 Fake-IP 排除完整 |
| [dns-legacy.example.yaml](../examples/dns-legacy.example.yaml) | nameserver 配合 fallback 的另一种通用策略 | 过滤条件、真实查询路径及内外网业务 |

两个文件名只是模板标识，不表示任何设备的当前或历史采用状态。示例不包含完整的机器专属策略，不能直接替换现有私有配置。

## 明确持久源

| 对象 | 维护边界 |
|---|---|
| Verge DNS 设置 / dns_config.yaml | 可选的 DNS 持久源；按实际版本核实生成路径 |
| shared/Merge.yaml | 本仓库模板只含通用字段；选择用 Merge 管 DNS 时须自行合并并核实覆盖顺序 |
| profiles/Script.js | 规则和个人节点；不复制完整 DNS 配置 |
| 生成 YAML / 内核配置 | 检查最终结果，不作为唯一持久源 |
| 可选的本地 DNS 服务 | 核对真实监听、已加载配置和转发路径 |

只选定一个明确的 DNS 所有者。变更前保留原持久源与回退材料，变更后核对生成结果及实际查询；不要按旧教程盲目关闭现有设置。

## 验证边界

- DIRECT 是规则结果，不等于地理分类；域名策略例外单独检查。
- TUN 开启时，指定公共 DNS 的 dig 仍可能被劫持；Fake-IP 不证明对应解析器的真实应答。
- curl --noproxy 不能绕过 TUN。结合运行连接和路由判断路径。
- 节点域名的 bootstrap/proxy-server-nameserver 不应依赖尚未建立的代理。
- 组织域名、VPN 入口、私网路由及应用业务分别验收；公共网站成功不证明内网业务通过。
