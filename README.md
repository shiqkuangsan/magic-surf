# magic-surf

[简体中文](README.zh-CN.md)

Personal repository for proxy-related assets and configuration.

## Scope

- Shadowrocket configuration files
- Clash Verge Rev override files (Mac)
- OpenClash configuration recipes (iStoreOS router)
- Rule and group presets
- Notes for proxy tooling and profiles

## Current Files

- `ACL4SSR_Full_NoAuto_Shadowrocket.conf`: iOS Shadowrocket grouping and routing scheme based on ACL4SSR `Full_NoAuto` semantics.
- `clash-verge/`: Clash Verge Rev configuration for Mac — local subconverter + ACL4SSR template + global `Merge.yaml` (field patches) + global `Script.js` (rule injection).
- `openclash/`: OpenClash recipes for iStoreOS router — local subconverter + ACL4SSR template + override custom rules.

## Why this repo evolved (2026-04-27)

This repo went through two structural rewrites in a single day. Understanding why helps reading the docs in the right order:

1. **Subconverter fork upgrade** (morning) — Both the OpenClash bundled subconverter and any public converter (wcc.best, api.dler.io, ...) silently dropped `anytls` and other modern protocols at the source. Replacing both ends with `asdlokj1qpi23/subconverter:latest` (community fork) restored full node count and unified Mac + router behind one image. **Effect**: primary/fallback modes inverted on the Mac side; previous "ACL convertible vs not" classification became obsolete.

2. **Verge Rev `prepend-rules` deprecation** (noon) — Empirically discovered that Clash Verge Rev v2.4.7 silently drops `prepend-rules` / `append-rules` from `Merge.yaml` (deprecated since v1.6.2). Rule injection migrated from `Merge.yaml` to a new global `Script.js` (JavaScript hook on Verge's profile chain). **Effect**: `clash-verge/shared/` now has two files (`Merge.yaml` for native field patches, `Script.js` for rule injection); old prepend-rules patterns in this repo are removed.

If you're forking this repo, start from **Three-endpoint relation** below for the current architecture, not from `git log` or older snapshots.

## Three-endpoint relation (unified architecture as of 2026-04-27)

| Endpoint | Tool | subconverter instance | Primary mode | Fallback mode |
|---------|------|---------------------|------|------|
| iOS | Shadowrocket | — | Repo root `.conf` | — |
| Mac | Clash Verge Rev | Mac Docker `127.0.0.1:25500` | subconverter URL + ACL4SSR + `clash-verge/shared/Merge.yaml` (field patches) + `clash-verge/shared/Script.js` (rule injection) | Raw subscription + `clash-verge/raw-overrides/` |
| Router | OpenClash (iStoreOS) | Router Docker host:25500 | subconverter URL + ACL4SSR + `openclash/overrides/` | (none) |

All endpoints:

- Share the **same node pool** (raw airport subscription)
- Share the **same subconverter image** (`asdlokj1qpi23/subconverter:latest`, community-maintained fork supporting anytls / hysteria2 / vless reality / tuic / ss2022)
- Share the **same group naming** (`💬 Ai平台`, `🚀 节点选择`, `🎯 全球直连`, etc.)
- Share the **same routing intent** (AI traffic → `💬 Ai平台`, Cloudflare Tunnel → `DIRECT`)

## History

- Before 2026-04-27: Mac Verge defaulted to "raw subscription + raw-overrides" because public subconverters (wcc.best etc.) did not support anytls.
- 2026-04-27 (morning): iStoreOS OpenClash bundled subconverter upgraded to `asdlokj1qpi23` fork (the original `tindy2013` v0.9.0 dropped 22/35 nodes due to lack of anytls support). Mac side deployed a local subconverter (same fork). Previous "ACL convertible vs not" classification became obsolete; primary and fallback modes were inverted.
- 2026-04-27 (noon): Verified empirically that Verge Rev v2.4.7 silently drops top-level `prepend-rules` from `Merge.yaml` (deprecated since v1.6.2). Rule injection on Mac side migrated from `Merge.yaml` to a new global `clash-verge/shared/Script.js`; `Merge.yaml` retains only mihomo native field patches. See [verge-rev #2455](https://github.com/clash-verge-rev/clash-verge-rev/issues/2455).

## Clash Verge Layout (Mac)

- `clash-verge/subconverter/`: **Primary mode** Mac local subconverter container config + deployment notes
- `clash-verge/subscription-template.md`: **Primary mode** Verge subscription URL composition convention + 9 ready-to-use profile naming
- `clash-verge/shared/Merge.yaml`: Global shared mihomo native field patches (used by both modes)
- `clash-verge/shared/Script.js`: Global shared rule injection script (replaces deprecated `prepend-rules`)
- `clash-verge/raw-overrides/`: **Fallback mode** per-subscription merge overrides
- `clash-verge/templates/`: Fallback mode override template
- `clash-verge/docs/`: Naming and layering conventions
- `clash-verge/AI-GUIDE.zh-CN.md`: Operating contract for chat AI on Verge configuration

## OpenClash Layout (iStoreOS Router)

- `openclash/subconverter/`: subconverter container deployment notes + compose template on iStoreOS (same source as Mac side)
- `openclash/overrides/`: OpenClash override "custom rules" prepend templates (router-layer subset of Mac's `Script.js`)
- `openclash/subscription-template.md`: OpenClash subscription URL composition convention + 5 ready-to-use config naming (pinyin style, aligned with Mac Verge profiles)
- `openclash/AI-GUIDE.zh-CN.md`: Operating contract for chat AI on OpenClash configuration

## Safety

- Do not commit raw subscription URLs, account credentials, or private certificates.
- Keep provider-specific secrets under ignored paths such as `subscriptions/`, `profiles/`, or `secrets/`.
- Do not commit Clash runtime files such as `profiles.yaml`, `clash-verge.yaml`, `logs/`, or remote subscription snapshots.
