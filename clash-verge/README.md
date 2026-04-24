# Clash Verge Rev

[简体中文](README.zh-CN.md)

This directory is the source of truth for hand-maintained Clash Verge Rev configuration.

It only stores safe files:
- global shared merge overrides
- raw subscription merge overrides
- reusable templates
- documentation for naming and layering

It does not store:
- raw subscription URLs
- generated runtime files
- remote subscription snapshots
- logs or databases

## Modes

### 1. ACL-convertible subscriptions

Use ACL conversion as the main source of groups and routing.

Rules:
- keep the final AI traffic target as `💬 Ai平台`
- avoid extra Clash Verge `rules/groups/proxies` overlay files unless there is a very specific reason
- let `shared/Merge.yaml` provide only common cross-subscription patches

### 2. Raw subscriptions with local overrides

Keep the original subscription untouched for node compatibility, then use a dedicated merge override from `raw-overrides/`.

Rules:
- the merge file owns `proxy-groups` and `rules`
- all AI traffic must ultimately route to `💬 Ai平台`
- common patches still live in `shared/Merge.yaml`

## Structure

- `shared/Merge.yaml`: shared global merge patch
- `raw-overrides/guaren-default.yaml`: dedicated override for `管人默认`
- `raw-overrides/cishan-default.yaml`: dedicated override for `慈善默认`
- `templates/raw-override.base.yaml`: base template for future raw subscription overrides
- `acl-convertible/`: docs for ACL-convertible subscriptions
- `docs/conventions.md`: long-term rules for naming and layering
- `AI-GUIDE.zh-CN.md`: Chinese operational guide intended for chat-based AI assistants
