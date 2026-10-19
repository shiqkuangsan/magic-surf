require 'yaml'
file=ARGV.fetch(0)
d=YAML.load_file(file)
nodes=YAML.load_file('/etc/openclash/custom/personal-nodes.yaml')
raise 'personal nodes must be a nonempty array' unless nodes.is_a?(Array) && !nodes.empty?
raise 'personal nodes require nonempty names' unless nodes.all?{|n|n.is_a?(Hash) && n['name'].is_a?(String) && !n['name'].strip.empty?}
names=nodes.map{|n|n.fetch('name')}
raise 'duplicate personal node names' unless names.uniq==names
rules=YAML.load_file('/etc/openclash/custom/personal-ai-rules.yaml')
raise 'AI rules must be an array of nonempty strings' unless rules.is_a?(Array) && rules.all?{|r|r.is_a?(String) && !r.strip.empty?}
d['proxy-groups'] ||= []
unless d['proxy-groups'].any?{|g|g['name']=='💬 Ai平台'}
 d['proxy-groups'] << {'name'=>'💬 Ai平台','type'=>'select','proxies'=>names}
end
d['rules']=rules+(d['rules']||[]).reject{|r|rules.include?(r)}
d['proxies']=(d['proxies']||[]).reject{|n|names.include?(n['name'])}+nodes
(d['proxy-groups']||[]).each do |g|
 next unless g['type']=='select' && ['💬 Ai平台','🚀 手动切换'].include?(g['name'])
 g['proxies']=((g['proxies']||[])+names).uniq
end
d['profile']||={};d['profile']['store-selected']=true
File.write(file,YAML.dump(d))
