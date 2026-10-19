const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../clash-verge/shared/Script.js'), 'utf8');
const AI = '💬 Ai平台';
const MANUAL = '🚀 手动切换';
const node = {name: 'example-personal', type: 'socks5', server: '192.0.2.1', port: 1080};
const plain = value => JSON.parse(JSON.stringify(value));
function script(nodes = [], rules = []) {
  const context = vm.createContext({fixtureNodes: nodes, fixtureRules: rules});
  vm.runInContext(source, context);
  vm.runInContext('customNodes.push(...fixtureNodes); customRules.push(...fixtureRules);', context);
  return (config, profile = '') => context.main(config, profile);
}

test('replaces only matching nodes and adds references only to allowlisted select groups', () => {
  const original = {
    proxies: [{name: 'other', type: 'direct'}, {...node, server: '192.0.2.2'}],
    'proxy-groups': [
      {name: AI, type: 'select', proxies: ['other', node.name, node.name]},
      {name: MANUAL, type: 'select', proxies: ['other']},
      {name: 'unrelated', type: 'select', proxies: ['other']},
      {name: 'auto', type: 'url-test', proxies: ['other']}
    ],
    rules: ['DOMAIN,local.invalid,DIRECT', 'MATCH,DIRECT'],
    dns: {enable: true}, tun: {enable: true}, profile: {'store-fake-ip': true}
  };
  const result = plain(script([node])(plain(original)));
  assert.deepEqual(result.proxies, [original.proxies[0], node]);
  assert.deepEqual(result['proxy-groups'][0].proxies, ['other', node.name]);
  assert.deepEqual(result['proxy-groups'][1].proxies, ['other', node.name]);
  assert.deepEqual(result['proxy-groups'].slice(2), original['proxy-groups'].slice(2));
  for (const key of ['dns', 'tun', 'profile']) assert.deepEqual(result[key], original[key]);
  assert.deepEqual(result.rules.slice(-2), original.rules);
});

test('personal rules precede common rules and repeated execution is identical', () => {
  const localRule = 'DOMAIN,example.invalid,DIRECT';
  const run = script([node], [localRule, localRule]);
  const result = run({rules: [localRule, 'MATCH,DIRECT']});
  assert.equal(result.rules[0], localRule);
  assert.equal(result.rules.filter(rule => rule === localRule).length, 1);
  const first = JSON.stringify(result);
  assert.equal(JSON.stringify(run(result)), first);
});

test('existing AI group remains intact with no private nodes configured', () => {
  const group = {name: AI, type: 'select', proxies: ['OpenAI']};
  const result = plain(script()({'proxy-groups': [group], rules: []}));
  assert.deepEqual(result['proxy-groups'], [group]);
  assert.equal(result.proxies, undefined);
});

test('creates compatibility alias to an existing OpenAI group', () => {
  const groups = [{name: 'OpenAI', type: 'select', proxies: ['proxy']}];
  const result = plain(script()({'proxy-groups': groups, rules: []}));
  assert.deepEqual(result['proxy-groups'].find(group => group.name === AI).proxies, ['OpenAI']);
});

test('does not create a cycle through a group already referencing the missing alias', () => {
  const result = plain(script()({'proxy-groups': [
    {name: 'OpenAI', type: 'select', proxies: ['indirect']},
    {name: 'indirect', type: 'select', proxies: [AI]},
    {name: MANUAL, type: 'select', proxies: ['proxy']}
  ]}));
  assert.deepEqual(result['proxy-groups'].find(group => group.name === AI).proxies, [MANUAL]);
});

test('unknown layouts use explicit REJECT rather than silently selecting DIRECT or loopback', () => {
  const result = plain(script()({proxies: [node,
    {name: 'local', type: 'socks5', server: '127.0.0.1'},
    {name: 'direct', type: 'direct', server: '192.0.2.2'}]}));
  assert.deepEqual(result['proxy-groups'][0].proxies, ['REJECT', node.name]);
});

test('profile and final-rule group fallbacks remain supported', () => {
  const config = {'proxy-groups': [{name: 'custom', type: 'select', proxies: ['proxy']}], rules: ['MATCH,custom']};
  for (const profile of ['', 'custom']) {
    const result = plain(script()(plain(config), profile));
    assert.deepEqual(result['proxy-groups'].find(group => group.name === AI).proxies, ['custom']);
  }
});

test('duplicate or empty personal names fail before changing the input', () => {
  for (const nodes of [[node, node], [{...node, name: ' '}], [null]]) {
    const config = {rules: ['MATCH,DIRECT']};
    const before = plain(config);
    assert.throws(() => script(nodes)(config), /name/);
    assert.deepEqual(config, before);
  }
});
