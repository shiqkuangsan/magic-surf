# OpenClash (iStoreOS Router)

[简体中文](README.zh-CN.md)

OpenClash strategy on the iStoreOS router. Both Mac (Clash Verge) and the router (OpenClash) now run the **same architecture** — local subconverter + ACL4SSR template + endpoint rule injection. Only the rule injection mechanism differs (Verge: `Script.js`; OpenClash: override → custom rules).

## Architecture

```
Raw airport subscription (anytls / vless / hysteria2 / vmess ...)
        │
        ▼
iStoreOS Docker: subconverter (asdlokj1qpi23/subconverter:latest, host network :25500)
        │  + ACL4SSR_Online_Full_NoAuto.ini template
        ▼
Full Clash YAML (proxies + 28 groups + 10401 rules)
        │
        ▼
OpenClash "Subscriptions" (URL = local subconverter URL, online convert OFF, UA = clash.meta)
        │
        ▼
OpenClash "Overrides → Custom Rules" (prepend personal rules)
        │
        ▼
mihomo Meta core (alpha branch, full protocol support)
```

## Why this architecture

- OpenClash bundled subconverter is stale: default `tindy2013/subconverter:latest` (v0.9.0) does not recognize anytls (introduced in mihomo 1.19.0, late 2024). Public converters like wcc.best share the same gap. Either entry point silently drops nodes.
- Replace the local subconverter image with `asdlokj1qpi23/subconverter:latest` (v0.9.9), an actively maintained community fork that supports anytls / hysteria2 / vless reality / tuic / ss2022.
- Disable OpenClash's "Online Convert" and feed the OpenClash subscription URL directly to the local subconverter, which embeds the ACL4SSR template URL.
- Aggregate multiple airports at the subconverter layer with `&url=URL1|URL2|...`.

## Relationship with Clash Verge

Mac and router share:
- The same node pool (raw airport subscription, no upstream loss)
- The same group names (`💬 Ai平台` / `🚀 节点选择` / `🎯 全球直连` / etc.)
- The same config naming convention (pinyin-style: `agg-acl / guaren-acl / cishan-acl / maoxiong-acl / peiqian-acl`)
- The same routing intent (AI → `💬 Ai平台`, Cloudflare Tunnel → DIRECT, Steam CDN → DIRECT, Claude UDP:443 → REJECT)

Difference: the router layer does not see client process names, so Mac Verge's `Script.js` carries 6 extra `PROCESS-NAME` / `PROCESS-NAME-REGEX` rules that don't exist on the router side. See `AI-GUIDE.zh-CN.md` for the full naming convention and `../clash-verge/` for the Verge counterpart.

## Layout

- `subconverter/` — Deployment notes and compose template for the subconverter container.
- `overrides/` — OpenClash override templates (custom rules).
- `subscription-template.md` — URL template (no real tokens).
- `AI-GUIDE.zh-CN.md` — Operating contract for chat AI.

## Safety rails

- Never commit real subscription URLs, tokens, UUIDs, passwords, or node snapshots.
- Never commit OpenClash runtime files such as `/etc/openclash/*`, `/etc/config/openclash`, or generated `*.yaml` configs.
- Real subscription URLs live only on the router and in personal secure notes.
