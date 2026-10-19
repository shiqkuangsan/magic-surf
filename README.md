# magic-surf

用于 Mac Clash Verge Rev、家庭 OpenClash 和 iPhone Shadowrocket 的代理配置模板、扩展脚本与部署方法。三端共享分流意图和部分分组命名，节点池、DNS、转换器位置及生效配置可以不同。

本仓库维护可复用实现；设备现状、选择理由与带日期的验收记录由使用者在私有知识库中维护。实际生效状态须从运行配置和请求结果核实。真实订阅、组织域名、节点认证和备份留在设备或私有配置中。

## 从哪里开始

| 对象 | 入口 | 本仓库负责 |
|---|---|---|
| Mac | [Clash Verge](clash-verge/README.md) | 全局规则、无凭据个人节点逻辑、字段与 DNS 示例 |
| 家庭网关 | [OpenClash](openclash/README.md) | 转换器部署、分流覆写、个人节点持久化接入 |
| iPhone | [Shadowrocket 模板](ACL4SSR_Full_NoAuto_Shadowrocket.conf) | 节点与规则分离的模板；使用前核对设备激活配置 |
| 跨端边界 | [部署方式与验证状态](docs/deployment-status.md) | 说明通用部署角色与验收边界，不发布使用者快照 |

## 配置分层

- 订阅和转换器：提供节点、基础分组与规则。选择已验证的解析器，检查源节点和转换结果，不保证任何协议或供应商永远零丢失。
- Mac：全局 Script 注入规则与个人节点；DNS 持久源与普通 Merge 分开管理。订阅专属扩展可能改变最终结果。
- OpenClash：UCI 管订阅，源 YAML 经自定义规则和 overwrite hook 生成运行 YAML；只改运行文件可能被下次重建覆盖。
- Shadowrocket：主页订阅供节点，conf 管分组和规则；本机代理与家庭旁路由路径分别验收。

不以固定组数、规则数或节点数量作为通用配置契约，也不从两个端使用同名分组推断出口一致。节点所在组、组当前选择和真实请求命中须分别检查。

## 日常修改

先核对目标设备及已有私有配置，再修改本仓库模板；部署前比较差异，保留回退材料，部署后检查持久源、生成结果与实际连通性。仓库文件变化不会自动部署。更新个人节点时保留其他协议字段，先备份和验证，再热加载受影响配置。

设备清单、个人知识库路径、地址对应关系、运行数量及维护时间线保留在私有记录中；公开模板不提供反向身份映射。

## 本地检查

需要支持 node:test 的 Node.js、Python 3.9+ 及含 YAML/JSON 标准库的 Ruby。以下检查离线运行，不连接设备。

```bash
node --test tests/mac-script.test.cjs
python3 tests/check_templates.py
python3 tests/check_privacy.py --history
ruby tests/openclash-personal-nodes.rb
sh -n openclash/overrides/personal-nodes-hook.sh
```

## 隐私

可通过环境变量 PRIVACY_DENYLIST_FILE 指向库外私有关键词文件，执行额外的正文与历史检查；关键词不写入报告或仓库。此检查不修改提交作者或 GitHub 账号。

禁止提交真实订阅 URL、token、UUID、密码、私钥、私有组织信息、运行时完整配置、节点快照、日志、数据库或设备备份。仅在设备本地的私有副本填入实例参数；提交前重新检查差异。

## License

MIT
