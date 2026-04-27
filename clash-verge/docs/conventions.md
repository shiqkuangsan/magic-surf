# Conventions

## Layering

There are only three layers:

1. ACL conversion output for subscriptions (subconverter URL + ACL4SSR template)
2. Per-subscription raw merge overrides for the **fallback mode**
3. Two global override slots that auto-apply to all profiles:
   - `shared/Merge.yaml` — YAML field-level deep-merge patches
   - `shared/Script.js` — JavaScript runtime config rewriter

## Shared Merge Scope (`shared/Merge.yaml`)

`shared/Merge.yaml` may contain (mihomo native top-level fields, deep-merged):
- `profile`
- `tun`
- `dns` (see [`dns.md`](dns.md) for system-proxy vs TUN behavior, baseline policy, and dnsmasq-free operation)
- `hosts`
- `proxy-providers` / `rule-providers`
- `sniffer`
- `experimental`
- Other mihomo native top-level overrides

`shared/Merge.yaml` must **not** contain:
- `prepend-rules` / `append-rules` / `prepend-proxies` / `append-proxy-groups`
  (deprecated since Verge Rev v1.6.2, silently dropped in v2.4.7+)
- Full `proxy-groups` or `rules` arrays (these would replace subscription content entirely)

Rule injection — even cross-subscription common patches — must go through `shared/Script.js`.

## Shared Script Scope (`shared/Script.js`)

`shared/Script.js` is the canonical place for rule injection on top of subscriptions.

Owns:
- Rule prepending (process-name routing, corporate intranet DIRECT, Cloudflare Tunnel DIRECT, Claude UDP REJECT, Steam long-tail FQDN DIRECT, etc.)
- Any logical / composite rule (`AND` / `OR` / `NOT`) that ACL4SSR's static rule lists cannot express
- Cross-subscription rules that should evaluate before ACL4SSR's massive ruleset

Must not own:
- Subscription-specific routing intent
- Provider-specific node grouping

Function signature:

```javascript
function main(config, profileName) {
  // config: parsed mihomo config object (subscription + Merge.yaml already merged)
  // profileName: current profile's name (string)
  // return: modified config object that Verge dispatches to mihomo
  return config;
}
```

Rule prepending pattern:

```javascript
config.rules = [...prependRules, ...(config.rules || [])];
```

## Raw Override Scope (`raw-overrides/*.yaml`)

`raw-overrides/*.yaml` should own (fallback mode only):
- `proxy-groups`
- `rules`

They should not own:
- subscription URLs
- provider snapshots
- runtime state

## Repository Safety

Never commit:
- `profiles.yaml`
- `clash-verge.yaml`
- `clash-verge.yaml*.bak`
- `logs/`
- remote subscription snapshot files
- files containing tokens, passwords, UUIDs, or raw provider links
