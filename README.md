# magic-surf

[简体中文](README.zh-CN.md)

Personal repository for proxy-related assets and configuration.

## Scope

- Shadowrocket configuration files
- Clash Verge Rev override files
- Rule and group presets
- Notes for proxy tooling and profiles

## Current Files

- `ACL4SSR_Full_NoAuto_Shadowrocket.conf`: iOS Shadowrocket grouping and routing scheme based on ACL4SSR `Full_NoAuto` semantics, using homepage subscriptions as the node source.
- `clash-verge/`: source-controlled Clash Verge Rev override files and conventions, without raw subscriptions or runtime dumps.

## Clash Verge Layout

- `clash-verge/shared/`: global shared merge files such as `Merge.yaml`
- `clash-verge/raw-overrides/`: dedicated merge overrides for subscriptions that cannot use ACL conversion
- `clash-verge/templates/`: reusable templates for future raw subscription overrides
- `clash-verge/acl-convertible/`: conventions for subscriptions that should use ACL conversion directly
- `clash-verge/docs/`: naming and layering conventions

## Safety

- Do not commit raw subscription URLs, account credentials, or private certificates.
- Keep provider-specific secrets under ignored paths such as `subscriptions/`, `profiles/`, or `secrets/`.
- Do not commit Clash runtime files such as `profiles.yaml`, `clash-verge.yaml`, `logs/`, or remote subscription snapshots.
