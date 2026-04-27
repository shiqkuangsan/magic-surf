# Subconverter on macOS

Mac 本地通过 Docker Desktop 跑同一份 subconverter，Verge 订阅地址直接指 `http://127.0.0.1:25500/sub?...`。

与 iStoreOS 端的差别**仅在 Docker 网络**（Mac Docker Desktop 不支持 Linux `network_mode: host`）：

| 项 | iStoreOS | macOS |
|----|----------|-------|
| 镜像 | `asdlokj1qpi23/subconverter:latest` | 同 |
| 网络模式 | `network_mode: host` | `ports: "127.0.0.1:25500:25500"`（仅 bind localhost） |
| compose 路径 | `/root/docker/compose/subconverter-compose.yml` | `~/docker/docker-compose/subconverter-compose.yml` |
| 数据卷 | 无 | 无 |

完整背景与行为说明（镜像选择 / 协议覆盖 / 升级回滚 / 故障注意）参见 [`../../openclash/subconverter/README.md`](../../openclash/subconverter/README.md)——镜像与行为对齐，无须重复。

## 部署

参见同目录 [`subconverter-compose.yml`](./subconverter-compose.yml)，落到 `~/docker/docker-compose/subconverter-compose.yml`：

```bash
cp subconverter-compose.yml ~/docker/docker-compose/

cd ~/docker/docker-compose
docker compose -f subconverter-compose.yml pull
docker compose -f subconverter-compose.yml up -d

# 验证
curl -sS http://127.0.0.1:25500/version    # 期望: subconverter v0.9.9-cd74f4d backend
curl -sS "http://127.0.0.1:25500/sub?target=clash&url=anytls%3A%2F%2Fuuid%401.2.3.4%3A443%23test" | grep "type: anytls"
```

## 安全

- `ports` 字段**显式 bind 到 `127.0.0.1`**，不暴露给 LAN——Mac 不应做转换器服务方
- 出门在外（不在家网络）：subconverter 仍在 Mac 本地跑，**完全不依赖 iStoreOS / 家庭网络**

## 与 sub-web 关系

不需要 sub-web。陛下日常拼 URL 直接按 `../subscription-template.md` 复制即可。
