# Raw Overrides

These files are for subscriptions that cannot safely use ACL conversion.

Each file should:
- define the main `proxy-groups`
- define the main `rules`
- route all AI traffic to `💬 Ai平台`

Each file should not:
- contain subscription URLs
- contain node credentials
- depend on standalone Clash Verge `rules/groups/proxies` overlay files

Current files:
- `guaren-default.yaml`
- `cishan-default.yaml`

