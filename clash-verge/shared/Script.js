// Global Verge script template. Never overwrite a personalized copy blindly.
// Fill customNodes/customRules locally; keep the repository arrays empty.
// See ../README.md for source ownership and validation.

const prependRules = [
  // Prefer TCP for Claude-related traffic by rejecting UDP:443.
  "AND,((DOMAIN-KEYWORD,anthropic),(NETWORK,UDP),(DST-PORT,443)),REJECT",
  "AND,((DOMAIN-KEYWORD,claude),(NETWORK,UDP),(DST-PORT,443)),REJECT",
  "AND,((PROCESS-NAME-REGEX,(?i)anthropic),(NETWORK,UDP),(DST-PORT,443)),REJECT",
  "AND,((PROCESS-NAME-REGEX,(?i)claude),(NETWORK,UDP),(DST-PORT,443)),REJECT",

  // Route matching local processes to the AI group.
  "PROCESS-NAME-REGEX,(?i)anthropic,💬 Ai平台",
  "PROCESS-NAME-REGEX,(?i)claude,💬 Ai平台",

  // Keep Cloudflare Tunnel traffic on the direct path.
  "DOMAIN-SUFFIX,argotunnel.com,DIRECT",
  "DOMAIN-SUFFIX,cftunnel.com,DIRECT",
  "DOMAIN-SUFFIX,cloudflare-gateway.com,DIRECT",
  "IP-CIDR,198.41.192.0/24,DIRECT,no-resolve",
  "IP-CIDR,198.41.200.0/24,DIRECT,no-resolve",
  "PROCESS-NAME,cloudflared,DIRECT",

  // Supplement Steam CDN destinations.
  "DOMAIN-SUFFIX,steamcontent.com,DIRECT",
  "DOMAIN-SUFFIX,cs.steampowered.com,DIRECT",
  "DOMAIN,cdn.steampowered.com,DIRECT",
  "DOMAIN,cdn.akamai.steamstatic.com,DIRECT",
  "DOMAIN-SUFFIX,steam.clovercdn.com,DIRECT",
];

// Credentials belong only in the locally deployed copy of this array.
const customNodes = [];
// Add private organization rules only to the locally deployed copy.
const customRules = [];
const targetNames = new Set(["💬 Ai平台", "🚀 手动切换"]);

function personalNodesByName() {
  const nodes = new Map();
  for (const node of customNodes) {
    if (!node || typeof node.name !== "string" || !node.name.trim()) {
      throw new Error("Personal nodes require a nonempty name");
    }
    if (nodes.has(node.name)) throw new Error("Duplicate personal node name");
    nodes.set(node.name, node);
  }
  return nodes;
}

function ensureAiGroup(config, profileName) {
  const alias = "💬 Ai平台";
  const groups = config["proxy-groups"] || [];
  const nodes = config.proxies || [];
  if (groups.some(group => group.name === alias) || nodes.some(node => node.name === alias)) return;
  const byName = new Map(groups.map(group => [group.name, group]));
  const normalize = name => String(name || "")
    .replace(/^[^A-Za-z0-9\u3400-\u9FFF]+/, "").trim().toLowerCase();
  const informational = name => /套餐|流量|到期|官网|充值|剩余|更新订阅|公告|直连|DIRECT|REJECT|拦截|广告/i.test(name);
  function referencesAlias(name, visited) {
    if (name === alias) return true;
    if (visited.has(name)) return false;
    visited.add(name);
    const group = byName.get(name);
    return !!group && (group.proxies || []).some(item => referencesAlias(item, visited));
  }
  const eligible = group => group && !informational(group.name)
    && !referencesAlias(group.name, new Set());
  function findGroup(preferences) {
    for (const preference of preferences) {
      const group = groups.find(item => eligible(item) && normalize(item.name) === preference);
      if (group) return group.name;
    }
    return null;
  }
  let target = findGroup(["claude", "openai", "chatgpt", "ai平台", "人工智能", "ai"])
    || findGroup(["节点选择", "节点列表", "手动切换", "代理选择", "proxy", "proxies", "proxy select", "proxyselect"]);
  if (!target && eligible(byName.get(profileName))) target = profileName;
  if (!target) {
    for (const rule of config.rules || []) {
      if (typeof rule !== "string" || !/^(MATCH|FINAL),/.test(rule)) continue;
      const name = rule.split(",")[1];
      if (eligible(byName.get(name))) { target = name; break; }
    }
  }
  // Unknown layouts need an explicit selection; never silently route AI to DIRECT.
  const choices = target ? [target] : ["REJECT", ...nodes
    .filter(node => node && node.server && !informational(node.name)
      && !["direct", "reject", "dns", "pass"].includes(node.type)
      && !["127.0.0.1", "localhost", "0.0.0.0", "::1"].includes(node.server))
    .map(node => node.name)];
  groups.push({name: alias, type: "select", proxies: [...new Set(choices)]});
  config["proxy-groups"] = groups;
}

function addPersonalNodes(config, nodes) {
  if (nodes.size === 0) return;
  config.proxies = (config.proxies || []).filter(node => !nodes.has(node.name));
  config.proxies.push(...nodes.values());
  for (const group of config["proxy-groups"] || []) {
    if (group.type !== "select" || !targetNames.has(group.name)) continue;
    group.proxies = (group.proxies || []).filter(name => !nodes.has(name));
    group.proxies.push(...nodes.keys());
  }
}

function main(config, profileName) {
  const nodes = personalNodesByName();
  ensureAiGroup(config, profileName);
  const injected = [...new Set([...customRules, ...prependRules])];
  const injectedSet = new Set(injected);
  config.rules = [...injected, ...(config.rules || []).filter(rule => !injectedSet.has(rule))];
  addPersonalNodes(config, nodes);
  return config;
}
