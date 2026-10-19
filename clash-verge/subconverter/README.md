# Mac subconverter 示例

[Compose](subconverter-compose.yml) 演示将后端绑定到 Mac 的 127.0.0.1:25500；它是可选部署模板，文件存在不证明本机容器正在运行。先核对 Docker 的可用性、实际镜像与 /version，再把激活订阅指向该服务。

模板采用显式 loopback 端口映射，避免无意向 LAN 提供 Mac 后端。网关侧可在 host 网络提供后端，另一台网关通过 LAN 访问该宿主；两种部署方式不能仅靠复制 URL 中的 127.0.0.1 切换。

部署前确认目标 Compose 目录并备份原文件和镜像引用；在明确授权后执行 Docker 操作。协议、过滤和聚合结果需要使用受控样本验证，不以固定版本号或数量验收。

升级和恢复方法见 [家庭后端说明](../../openclash/subconverter/README.md)。真实订阅不写入仓库或命令历史；原镜像应保留到回退验收完成。
