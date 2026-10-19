# OpenClash 家庭网关模板

本目录维护订阅转换、规则覆写与个人节点注入方法。不同网关的转换器位置、内核与规则可能不同；可选部署角色见 [跨端说明](../docs/deployment-status.md)。

## 两种订阅接入方式

| 接入方式 | OpenClash 中的源 | 转换由谁执行 |
|---|---|---|
| 完整转换 URL | /sub?target=clash&url=...&config=... | URL 指向的转换器；此方式不再做一次在线转换 |
| 原始订阅 + OpenClash 转换设置 | 原始订阅 URL，加上 UCI/LuCI 中的转换服务与模板 | OpenClash 调用配置的转换后端 |

先读取实际订阅选项和生成结果，识别当前使用哪一种，避免双重转换，也不要把已经使用转换设置的订阅强行改为“关闭”。真实 URL 与认证不入库。[订阅模板](subscription-template.md) 的完整 URL 示例仅对应第一种。

## 双旁路由角色

示意角色：网关 A 运行转换器并通过 127.0.0.1:25500 自用；网关 B 通过 LAN 访问网关 A。网关 B 不必运行第二个容器，但后端地址必须指向网关 A，不能使用网关 B 自己的回环。角色名称不对应真实设备；订阅与节点池是否相同须另行核对。

通过网关 B 更新订阅前核实网关 A 的后端可达；这种依赖不是独立灾备或自动 HA。新环境应按实际转换器所在主机填地址，不把示例 LAN 地址当成公共入口。

## 配置来源

| 内容 | 所有者 |
|---|---|
| 订阅地址、转换器选项、计划 | /etc/config/openclash（UCI/LuCI） |
| 拉取或转换后的源 | /etc/openclash/config/*.yaml |
| 生成运行配置 | /etc/openclash/<配置名>.yaml；重建时可能覆盖 |
| 公共分流例外 | [overrides/custom-rules.yaml](overrides/custom-rules.yaml) |
| 私有节点与需保留的 AI 规则 | 设备 custom/personal-nodes.yaml、personal-ai-rules.yaml |
| 个人节点注入与持久化接入 | [overrides/](overrides/README.md) |

## 修改与验收

先备份实际源、UCI 和选择，再改目标字段。订阅刷新、重建和热加载是不同动作；仅改运行 YAML 不保证下一次重建保留。完整步骤和回退见 [覆写说明](overrides/README.md)。

检查源配置、生成配置、运行节点/组/规则、原有选择和 HTTPS/业务请求。源失败时聚合 HTTP 200 不证明所有源成功；组数和规则数不固定。节点探测不是付费 API 推理或全屋透明代理验收。

[subconverter/](subconverter/README.md) 提供镜像与 Compose 维护方法；不要仅因旧文档称“全协议”就跳过真实订阅样本测试。路由层不能使用来自客户端的进程名作为通用分流依据。

## 隐私

只提交无凭据模板。实际订阅、节点认证、完整运行 YAML、原始数据库和备份留在设备或私有存储；当前状态与匿名维护记录归 私有知识库。
