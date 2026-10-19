"""Check tracked content and optionally reachable history without printing matched values."""
import argparse
import ipaddress
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
parser = argparse.ArgumentParser()
parser.add_argument('--history', action='store_true', help='Also inspect every reachable historical text blob')
args = parser.parse_args()
patterns = {
    'host-user-path': r'/Users/[A-Za-z0-9_.-]+/',
    'private-key': r'-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----',
    'uuid': r'\b[0-9a-fA-F]{8}-(?:[0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}\b',
    'mobile-number': r'(?<!\d)1[3-9]\d{9}(?!\d)',
}
# Keep real identifiers in a private external file, never in this repository.
private_path = os.environ.get('PRIVACY_DENYLIST_FILE')
private_terms = Path(private_path).read_text().splitlines() if private_path else []
failures = []
checked = 0

def check(label, raw):
    global checked
    if b'\0' in raw:
        return
    checked += 1
    text = raw.decode('utf-8', errors='replace')
    for kind, pattern in patterns.items():
        if re.search(pattern, text):
            failures.append((label, kind))
    if any(term.strip() and term.casefold() in text.casefold() for term in private_terms):
        failures.append((label, 'private-identifier'))
    # Private host addresses belong in local records; standard network ranges are allowed.
    for candidate in re.findall(r'(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?:/\d{1,2})?(?![\w.])', text):
        try:
            address = ipaddress.ip_interface(candidate)
        except ValueError:
            continue
        if '/' in candidate:
            continue
        if any(address.ip in ipaddress.ip_network(net) for net in ['10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16']):
            failures.append((label, 'private-host-address'))

tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
for name in filter(None, tracked):
    check(name, (ROOT / name).read_bytes())
if args.history:
    rows = subprocess.check_output(['git', 'rev-list', '--objects', '--all'], cwd=ROOT).decode().splitlines()
    for row in rows:
        parts = row.split(' ', 1)
        if len(parts) != 2:
            continue
        oid, name = parts
        kind = subprocess.check_output(['git', 'cat-file', '-t', oid], cwd=ROOT).strip()
        if kind == b'blob':
            check('history:' + oid[:10] + ':' + name,
                  subprocess.check_output(['git', 'cat-file', 'blob', oid], cwd=ROOT))
if failures:
    for label, kind in sorted(set(failures)):
        print('FAIL:', label, kind)
    raise SystemExit(1)
print('PASS:', checked, 'text inputs; private denylist', 'enabled' if private_path else 'not supplied')
