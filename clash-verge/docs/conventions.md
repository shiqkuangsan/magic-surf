# Conventions

## Layering

There are only three layers:

1. ACL conversion output for subscriptions that support it
2. Dedicated raw merge overrides for subscriptions that do not support ACL conversion
3. `shared/Merge.yaml` for common patches

## Shared Merge Scope

`shared/Merge.yaml` may contain:
- `profile`
- `tun`
- `prepend-rules`
- cross-subscription direct rules
- cross-subscription process-based routing rules

`shared/Merge.yaml` should not contain:
- full `proxy-groups`
- full subscription-specific routing bodies
- provider-specific node grouping logic

## Raw Override Scope

`raw-overrides/*.yaml` should own:
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

