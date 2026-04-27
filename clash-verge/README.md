# Clash Verge Rev (Mac)

[简体中文](README.zh-CN.md)

This directory is the source of truth for manually maintained Mac Clash Verge Rev configuration.

Stored here:
- Global shared merge overrides (`shared/Merge.yaml` for mihomo native field patches)
- Global shared rule injection script (`shared/Script.js` — replaces deprecated `prepend-rules` syntax)
- Per-subscription raw merge overrides (**fallback mode**)
- Subconverter container config (**primary mode core dependency**)
- Subscription URL template
- Naming and layering docs

Never stored here:
- Raw subscription URLs / tokens
- Runtime files
- Remote subscription snapshots
- Logs or databases

## Two Modes (Primary / Fallback)

### 1 (Primary): subconverter + ACL4SSR

**Default path.** A local subconverter container (`asdlokj1qpi23/subconverter:latest`, bound to `127.0.0.1:25500`) runs on Mac. Verge subscription URL points to the local subconverter URL, which internally applies the `ACL4SSR_Online_Full_NoAuto.ini` template.

Rules:
- All AI traffic goes to `💬 Ai平台`
- ACL4SSR template provides 28 groups and ~10401 rules
- `shared/Script.js` prepends local-only rules (PROCESS-NAME, corporate intranet, Cloudflare Tunnel, Steam long-tail FQDN, Claude UDP REJECT)
- `shared/Merge.yaml` patches mihomo native fields only (`profile`, `tun`, `dns`, etc.)
- Do **not** use `raw-overrides/*.yaml`

### 2 (Fallback): raw subscription + per-subscription merge override

**Only when primary fails** (e.g. airport anti-bot strict, subconverter can't fetch upstream; or need per-subscription proxy-group customization).

Rules:
- Keep raw subscription URL to preserve node protocol fidelity
- `raw-overrides/*.yaml` defines the subscription's `proxy-groups` and `rules`
- AI traffic still routes to `💬 Ai平台`
- `shared/Script.js` still injects common rules; `shared/Merge.yaml` still patches mihomo native fields

## Layout

- `subconverter/` — **Primary mode** Mac subconverter container config + deployment notes
- `subscription-template.md` — **Primary mode** Verge subscription URL composition convention + 9 ready-to-use profile URLs
- `shared/Merge.yaml` — Global shared mihomo field patch (used by both modes)
- `shared/Script.js` — Global shared rule injection script (replaces deprecated `prepend-rules`)
- `raw-overrides/*.yaml` — **Fallback mode** per-subscription overrides
- `templates/raw-override.base.yaml` — Fallback mode override template
- `docs/conventions.md` — Naming and layering rules
- `AI-GUIDE.zh-CN.md` — Operating contract for chat AI

## Relation to OpenClash

The iStoreOS OpenClash side uses the exact same architecture (subconverter + ACL4SSR). Both sides share the **same node pool, group names, and AI routing target**. See `../openclash/`.

Only difference:

| Dimension | Mac Verge | iStoreOS OpenClash |
|-----------|-----------|-------------------|
| Subconverter Docker network | `ports: 127.0.0.1:25500` | `network_mode: host` |
| Local rule injection slot | `shared/Script.js` (JS) + `shared/Merge.yaml` (field patches) | OpenClash override → custom rules (YAML) |

## History

- **Before 2026-04-27**: Mac default was "raw subscription + raw-overrides" because public subconverters (wcc.best etc.) didn't recognize anytls and other new protocols
- **2026-04-27 morning**: Local `asdlokj1qpi23/subconverter:latest` deployed on Mac (community-maintained fork supporting anytls / hysteria2 / vless reality / tuic / ss2022). Original anytls blocker gone — primary and fallback modes reversed; primary path is now subconverter + ACL4SSR
- **2026-04-27 noon**: Verified empirically that Verge Rev v2.4.7 silently drops top-level `prepend-rules` from `Merge.yaml` (deprecated since v1.6.2). Rule injection migrated from `Merge.yaml` to `shared/Script.js`; `Merge.yaml` retains only mihomo native field patches (`profile`, `tun`, etc.). See [verge-rev #2455](https://github.com/clash-verge-rev/clash-verge-rev/issues/2455)
