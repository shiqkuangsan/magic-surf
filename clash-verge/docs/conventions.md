# Layering and ownership

The repository owns reusable templates and logic. Device-local private copies own credentials, organization rules and machine-specific exceptions. A private knowledge base owns dated observations and decisions. See [deployment status](../../docs/deployment-status.md).

## Subscription input

A subscription may be raw or converter-generated. Verify the actual source, protocol coverage and per-profile extensions instead of assuming every profile uses the same converter or node pool. Raw merge overrides apply only to the intended profile and may replace arrays.

## Shared Merge

[Merge.yaml](../shared/Merge.yaml) contains generic profile/TUN fields. Preserve device-local route exclusions when adopting it. It deliberately has no DNS block; use [DNS ownership](dns.md). Do not use undocumented prepend-* fields or replace complete rule/group arrays to add one rule.

## Shared Script

[Script.js](../shared/Script.js) owns common rule injection, the AI compatibility group and personal-node injection. Rules added by the script are deduplicated; unrelated rules retain their order. Personal node names must be unique. Only existing allowlisted select groups receive personal nodes; automatic groups are not rewritten.

The repository keeps customNodes/customRules empty. Fill them only in the locally deployed private copy. Merge changes rather than overwriting that copy. Test per-profile overrides because later transformations can change the final output.

## Validation

Check source, generated configuration, runtime groups/rules, current selection and controlled requests. Repository tests cover transformation behavior, not live deployment. Never commit profiles.yaml, generated runtime YAML, logs, subscription URLs, private nodes or backups.
