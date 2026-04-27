# Subconverter on iStoreOS

iStoreOS 软路由本机运行 subconverter Docker 容器，作为 OpenClash 的订阅转换后端。

## 镜像

| 项 | 值 |
|----|-----|
| 镜像 | `asdlokj1qpi23/subconverter:latest` |
| 版本（截至 2026-04） | `v0.9.9-cd74f4d` |
| 仓库 | <https://hub.docker.com/r/asdlokj1qpi23/subconverter> |
| 维护活跃度 | 高（社区主流 anytls fork） |
| 协议支持 | Hysteria / Hysteria2 / Vless (reality) / Tuic / **anyTLS** / mieru / ss2022 / vmess / trojan |

不要用 `tindy2013/subconverter:latest`——v0.9.0 起停滞，**不识别 anytls**，订阅转换时会静默丢弃所有 anytls 节点。

## 部署

### 网络模式：host

subconverter 用 `network_mode: host` 直接占用宿主 25500 端口。OpenClash 在同机访问时直连 `http://127.0.0.1:25500/sub`，**无须进 Docker 内网或反向代理**，链路最短。

### compose 模板

参见同目录 [`subconverter-compose.yml`](./subconverter-compose.yml)。

iStoreOS 上的实际路径：`/root/docker/compose/subconverter-compose.yml`

### 升级 / 回滚

```bash
# 升级
ssh root@<router-ip>
cd /root/docker/compose
docker compose -f subconverter-compose.yml pull
docker compose -f subconverter-compose.yml up -d

# 验证
curl -sS http://127.0.0.1:25500/version

# 回滚（若新镜像有问题）
sed -i 's|asdlokj1qpi23/subconverter:latest|tindy2013/subconverter:latest|' subconverter-compose.yml
docker compose -f subconverter-compose.yml up -d
```

## 测试

```bash
# 1. anytls 单节点解析测试
curl -sS "http://127.0.0.1:25500/sub?target=clash&url=anytls%3A%2F%2Fuuid%401.2.3.4%3A443%23test"
# 期望输出包含 `type: anytls`

# 2. 真实订阅 + ACL4SSR 模板测试（替换 <SUB-URL>）
RAW="<URL-encoded-subscription>"
ACL="https%3A%2F%2Fraw.githubusercontent.com%2FACL4SSR%2FACL4SSR%2Fmaster%2FClash%2Fconfig%2FACL4SSR_Online_Full_NoAuto.ini"
curl -sS -A "clash.meta" \
  "http://127.0.0.1:25500/sub?target=clash&url=${RAW}&config=${ACL}&emoji=true&new_name=true&udp=true&scv=true&list=false&sort=true" \
  | head -30
# 期望输出包含 28 个 proxy-groups（🚀 节点选择 / 💬 Ai平台 / ...）+ 10000+ rules
```

## 周边容器

iStoreOS 上还跑着 `sub-web-local`（端口 18080），是 subconverter 的 Web 前端（与 wcc.best 同款 UI），可在浏览器拼参数测试。访问 `http://<router-ip>:18080/`，后端地址填本机 `http://127.0.0.1:25500/`。

## 注意

- subconverter 的本地缓存：每次 OpenClash 拉订阅时 subconverter 都会**重新去机场拉原始订阅**（不缓存）。短时间内大量重复拉取可能触发机场 Cloudflare WAF 速率限制（HTTP 403 + error code 1005）——一般 5-30 分钟自动恢复
- subconverter 默认**单源失败不阻断聚合**：聚合 URL 中某家机场临时 503/挂掉，subconverter 会跳过这家继续合并其余源，输出仍 HTTP 200
- subconverter 不接受大于 8KB 的 URL（nginx 默认限制），但实测聚合 4 家机场的 URL 也仅 ~640 字符，远低于阈值
