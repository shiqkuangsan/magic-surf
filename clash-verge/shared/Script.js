// 全局扩展脚本（Global Extend Script）
// 补 ACL4SSR 模板覆盖不到 / 跨订阅通用的个人规则
//
// === 为何用 Script 而不是 Merge.yaml 的 prepend-rules ===
//
// Clash Verge Rev 自 v1.6.2 起，全局 Merge.yaml 中的 prepend-rules /
// append-rules / prepend-proxies 等顶级 prepend-* 字段已被官方废弃。
// 当前 v2.4.7 的 Merge 引擎做的是裸 YAML 字段级 deep-merge，
// 不再展开这些"语法糖"——它们会被原样保留为 runtime config 顶级字段，
// mihomo 内核不识别该字段，整段静默丢弃。
//
// 来源：
//   https://github.com/clash-verge-rev/clash-verge-rev/issues/2455
//   https://github.com/clash-verge-rev/clash-verge-rev/issues/5306
//   https://github.com/clash-verge-rev/clash-verge-rev/issues/6732
//
// 替代方案：Script.js 在 Verge 的 profile chain 末端运行，可以直接修改
// 即将下发给 mihomo 的 config 对象。规则注入走 config.rules 数组的头部
// 拼接，等价于原 prepend-rules 的语义。
//
// === 部署位置 ===
//
// Verge 数据目录:
//   ~/Library/Application Support/io.github.clash-verge-rev.clash-verge-rev/profiles/Script.js
// 在 profiles.yaml 顶级位置作为 uid=Script 的 ChainItem 自动应用，无需挂槽。
// 与同位置的 uid=Merge 的 Merge.yaml 平级、并行生效。
//
// === 验证方法 ===
//
// 1. 查 mihomo 实际加载的规则总数与首条
//    curl -s --unix-socket /tmp/verge/verge-mihomo.sock 'http://localhost/rules' \
//      | python3 -c "import sys,json;r=json.load(sys.stdin)['rules'];print(len(r),r[0])"
//    若生效：总数 = ACL4SSR 原数 + len(prependRules)，第 0 条是下方 A 段第 1 条
//
// 2. 实际触发 mihomo 日志查命中
//    curl -s --unix-socket /tmp/verge/verge-mihomo.sock 'http://localhost/logs?level=info' &
//    curl --proxy http://127.0.0.1:7890 -m 4 -s -o /dev/null https://www.your-corp.com/
//    日志应见: match DomainSuffix(your-corp.com) using DIRECT
//
// === 维护原则 ===
//
// - 这里只放 ACL4SSR_Online_Full_NoAuto 模板覆盖不到的规则
// - 信任模板，不重复定义已有规则
// - 复合规则（AND / OR / NOT）只能走这里，Merge.yaml 时代已不能注入

const prependRules = [
  // ===== A. Claude UDP:443 REJECT（强制降级 TCP，ACL4SSR 无此规则）=====
  "AND,((DOMAIN-KEYWORD,anthropic),(NETWORK,UDP),(DST-PORT,443)),REJECT",
  "AND,((DOMAIN-KEYWORD,claude),(NETWORK,UDP),(DST-PORT,443)),REJECT",
  "AND,((PROCESS-NAME-REGEX,(?i)anthropic),(NETWORK,UDP),(DST-PORT,443)),REJECT",
  "AND,((PROCESS-NAME-REGEX,(?i)claude),(NETWORK,UDP),(DST-PORT,443)),REJECT",

  // ===== B. Claude 进程名路由（ACL4SSR 只管域名不管进程）=====
  "PROCESS-NAME-REGEX,(?i)anthropic,💬 Ai平台",
  "PROCESS-NAME-REGEX,(?i)claude,💬 Ai平台",

  // ===== C. 公司内网（Mac 专属，ACL4SSR 不可能有）=====
  "DOMAIN-SUFFIX,your-corp.com,DIRECT",
  "DOMAIN-SUFFIX,your-corp.cn,DIRECT",
  "DOMAIN-KEYWORD,your-corp,DIRECT",
  "IP-CIDR,172.16.0.8/32,DIRECT,no-resolve",
  "IP-CIDR,6.6.6.6/32,DIRECT,no-resolve",

  // ===== D. Cloudflare Tunnel（cloudflared 走代理会崩）=====
  "DOMAIN-SUFFIX,argotunnel.com,DIRECT",
  "DOMAIN-SUFFIX,cftunnel.com,DIRECT",
  "DOMAIN-SUFFIX,cloudflare-gateway.com,DIRECT",
  "IP-CIDR,198.41.192.0/24,DIRECT,no-resolve",
  "IP-CIDR,198.41.200.0/24,DIRECT,no-resolve",
  "PROCESS-NAME,cloudflared,DIRECT",

  // ===== E. Steam CDN 精准 FQDN（补 ACL4SSR SteamCN.list 可能漏的）=====
  "DOMAIN-SUFFIX,steamcontent.com,DIRECT",
  "DOMAIN-SUFFIX,cs.steampowered.com,DIRECT",
  "DOMAIN,cdn.steampowered.com,DIRECT",
  "DOMAIN,cdn.akamai.steamstatic.com,DIRECT",
  "DOMAIN-SUFFIX,steam.clovercdn.com,DIRECT",
];

function main(config, profileName) {
  void profileName; // 保留官方签名，当前未按 profile 区分
  config.rules = [...prependRules, ...(config.rules || [])];
  return config;
}
