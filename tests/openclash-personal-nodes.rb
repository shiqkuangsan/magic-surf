require 'yaml'
require 'tmpdir'
require 'digest'
SCRIPT = File.expand_path('../openclash/overrides/personal-nodes.rb', __dir__)
AI = '💬 Ai平台'
MANUAL = '🚀 手动切换'
module YAML
  class << self
    alias_method :original_load_file, :load_file
    attr_accessor :fixture_nodes, :fixture_rules
    def load_file(path, *args)
      return Marshal.load(Marshal.dump(fixture_nodes)) if path == '/etc/openclash/custom/personal-nodes.yaml'
      return Marshal.load(Marshal.dump(fixture_rules)) if path == '/etc/openclash/custom/personal-ai-rules.yaml'
      original_load_file(path, *args)
    end
  end
end
def assert(value, message)
  raise message unless value
end
def apply(path)
  ARGV.replace([path])
  load SCRIPT
  YAML.original_load_file(path)
end
Dir.mktmpdir('personal-nodes-review-') do |dir|
  path = File.join(dir, 'runtime.yaml')
  node = {'name'=>'test-personal', 'type'=>'socks5', 'server'=>'192.0.2.1', 'port'=>1080}
  rules = ["DOMAIN,example.invalid,#{AI}"]
  YAML.fixture_nodes = [node]
  YAML.fixture_rules = rules
  base = {'dns'=>{'enable'=>true}, 'tun'=>{'enable'=>true}, 'profile'=>{'store-fake-ip'=>true},
    'proxies'=>[{'name'=>'other', 'type'=>'direct'}, node.merge('server'=>'192.0.2.2')],
    'proxy-groups'=>[{'name'=>AI,'type'=>'select','proxies'=>['other','test-personal']},
                     {'name'=>MANUAL,'type'=>'select','proxies'=>['other']},
                     {'name'=>'untouched','type'=>'select','proxies'=>['other']},
                     {'name'=>'automatic','type'=>'url-test','proxies'=>['other']}],
    'rules'=>['DOMAIN,local.invalid,DIRECT',rules.first,'MATCH,DIRECT']}
  File.write(path,YAML.dump(base)); result=apply(path)
  assert(result['proxies']==[base['proxies'][0],node], 'Node replacement failed')
  assert(result['rules']==rules+['DOMAIN,local.invalid,DIRECT','MATCH,DIRECT'], 'Rule precedence or retention failed')
  assert(result['dns']==base['dns'] && result['tun']==base['tun'], 'Unrelated settings changed')
  assert(result['proxy-groups'][2..-1]==base['proxy-groups'][2..-1], 'Non-target groups changed')
  assert(result['proxy-groups'][0]['proxies']==['other','test-personal'], 'AI group duplicates')
  assert(result['proxy-groups'][1]['proxies']==['other','test-personal'], 'Manual group injection failed')
  assert(result['profile']=={'store-fake-ip'=>true,'store-selected'=>true}, 'Profile settings lost')
  puts 'PASS: replacement, rule precedence, group scope, unrelated fields and profile preservation'
  bytes=File.binread(path); apply(path); assert(File.binread(path)==bytes, 'Repeated execution not idempotent')
  puts 'PASS: byte-identical repeated execution'
  File.write(path,YAML.dump({'rules'=>['MATCH,DIRECT']})); result=apply(path)
  assert(result['proxy-groups']==[{'name'=>AI,'type'=>'select','proxies'=>['test-personal']}], 'Missing AI group creation failed')
  puts 'PASS: missing node/group/profile sections initialized'
  YAML.fixture_nodes=[node,node]; before=File.binread(path)
  begin
    apply(path)
    raise 'Duplicate names accepted'
  rescue RuntimeError => e
    raise unless e.message=='duplicate personal node names'
  end
  assert(File.binread(path)==before,'Duplicate-name failure changed file')
  puts 'PASS: duplicate personal names rejected without modifying target'
  YAML.fixture_nodes=[node];YAML.fixture_rules=nil
  begin
    apply(path)
    raise 'Invalid rules accepted'
  rescue RuntimeError => e
    raise unless e.message == 'AI rules must be an array of nonempty strings'
  end
  assert(File.binread(path)==before,'Invalid-input failure changed file')
  puts 'PASS: invalid rules fail before target write'
  YAML.fixture_rules=rules
  [[], nil, [{'name'=>''}], [{'name'=>' '}]].each do |invalid|
    YAML.fixture_nodes=invalid
    begin
      apply(path)
      raise 'Invalid nodes accepted'
    rescue RuntimeError => e
      raise unless ['personal nodes must be a nonempty array', 'personal nodes require nonempty names'].include?(e.message)
    end
    assert(File.binread(path)==before,'Invalid nodes changed the target')
  end
  puts 'PASS: empty or malformed personal-node sources rejected without writing'
end
