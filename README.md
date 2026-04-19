# magic-surf

Personal repository for proxy-related assets and configuration.

## Scope

- Shadowrocket configuration files
- Rule and group presets
- Notes for proxy tooling and profiles

## Current Files

- `ACL4SSR_Full_NoAuto_Shadowrocket.conf`: Shadowrocket config based on ACL4SSR `Full_NoAuto` semantics, using homepage subscriptions as the node source.

## Safety

- Do not commit raw subscription URLs, account credentials, or private certificates.
- Keep provider-specific secrets under ignored paths such as `subscriptions/`, `profiles/`, or `secrets/`.
