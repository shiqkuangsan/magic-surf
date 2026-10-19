"""Offline checks for template ownership, local documentation links and accidental secrets."""
from pathlib import Path
import re
import json
import subprocess

def yaml_load(path):
    result = subprocess.run(["ruby", "-ryaml", "-rjson", "-e",
        "print JSON.generate(YAML.load_file(ARGV.fetch(0)))", str(path)],
        capture_output=True, text=True, check=True)
    return json.loads(result.stdout)

ROOT = Path(__file__).resolve().parents[1]
files = [p for p in ROOT.rglob('*') if p.is_file() and not any(x in p.relative_to(ROOT).parts for x in ['.git', '.local', '__pycache__'])]
for path in files:
    if path.suffix in ['.yaml', '.yml']:
        yaml_load(path)

merge = yaml_load(ROOT / 'clash-verge/shared/Merge.yaml')
assert 'dns' not in merge, 'Shared Merge must not become a second DNS owner'
current = yaml_load(ROOT / 'clash-verge/examples/dns-current.example.yaml')['dns']
assert current['direct-nameserver-follow-policy'] is True
assert current['respect-rules'] is False
assert all('#🚀 节点选择' in url for url in current['nameserver'])
assert all(url.endswith('#DIRECT') for url in current['direct-nameserver'])
script = (ROOT / 'clash-verge/shared/Script.js').read_text()
assert 'const customNodes = [];' in script and 'const customRules = [];' in script
assert 'corp.example.invalid' not in script and '192.0.2.10' not in script
phone = (ROOT / 'ACL4SSR_Full_NoAuto_Shadowrocket.conf').read_text()
assert 'verify the active device configuration before use' in phone
section = phone.split('[Proxy Group]', 1)[1].split('[Rule]', 1)[0]
assert sum(bool(re.match(r'^[^#\s].*=', line)) for line in section.splitlines()) == 40

links = 0
for path in files:
    if path.suffix != '.md':
        continue
    text = re.sub(r'(?ms)^```.*?^```[^\n]*$', '', path.read_text())
    for raw in re.findall(r'\[[^\]]*\]\(([^)]+)\)', text):
        if raw.startswith(('https://', 'http://', '#', 'mailto:')):
            continue
        target = (path.parent / raw.split('#')[0]).resolve()
        assert target.is_relative_to(ROOT) and target.exists(), f'Invalid repository link in {path.relative_to(ROOT)}: {raw}'
        links += 1

# Reject identifying host paths and high-confidence secret formats; not every field name is a secret.
for path in files:
    if path.suffix not in ['.md', '.yaml', '.yml', '.js', '.rb', '.sh', '.conf']:
        continue
    text = path.read_text()
    assert not re.search(r'/Users/[A-Za-z][A-Za-z0-9_.-]+/', text), f'Host identity path in {path.relative_to(ROOT)}'
    assert not re.search(r'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----', text)
    assert not re.search(r'\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}\b', text), f'UUID-like credential in {path.relative_to(ROOT)}'
print(f'PASS: YAML, DNS ownership, empty private arrays, phone scope, {links} local links and secret-pattern checks')
