"""Install verified public patch objects; publish manifests only after all files pass."""
import hashlib, json, os, pathlib, urllib.request, subprocess, time

SOURCE = 'https://nova-striker-updates.vercel.app'
ROOT = pathlib.Path('/srv/nova-patches')
EXPECTED = '832e5b2ffba70fed9ecde44b3a2b430402bfe7445f24e2229efd49d4a6439835'

def get(path):
    with urllib.request.urlopen(SOURCE + path, timeout=60) as response:
        return response.read()

manifests = []
for version in range(19, 39):
    path = '/patches/test/native-%d/manifest.json' % version
    data = get(path)
    manifest = json.loads(data)
    assert manifest['contentVersion'] == 143 and manifest['nativeVersion'] == version
    if version == 38:
        assert manifest['id'] == EXPECTED
    manifests.append((path, data, manifest))

objects = ROOT / 'objects'
objects.mkdir(parents=True, exist_ok=True)
seen = set()
for _, _, manifest in manifests:
    for f in manifest['files']:
        sha = f['sha256']
        assert len(sha) == 64 and all(c in '0123456789abcdef' for c in sha)
        if sha in seen:
            continue
        data = get('/objects/' + sha)
        assert len(data) == f['size'] and hashlib.sha256(data).hexdigest() == sha
        pending = objects / (sha + '.tmp')
        pending.write_bytes(data)
        os.replace(pending, objects / sha)
        seen.add(sha)
        print('Verified object', len(seen), flush=True)

for path, data, _ in manifests:
    target = ROOT / path.lstrip('/')
    target.parent.mkdir(parents=True, exist_ok=True)
    pending = target.with_suffix('.pending')
    pending.write_bytes(data)
    os.replace(pending, target)
print('NOVA143_READY', len(seen), 'objects;', len(manifests), 'manifests')

# Add only static patch routes to the existing site's Caddy configuration.
config = pathlib.Path('/etc/caddy/Caddyfile')
old = config.read_text()
marker = 'game.guardscan.xyz {'
assert old.count(marker) == 1
if 'handle @nova_patches143' not in old:
    addition = '''
    @nova_patches143 path /objects/* /patches/*
    handle @nova_patches143 {
        root * /srv/nova-patches
        header /patches/* Cache-Control "no-store"
        header /objects/* Cache-Control "public, max-age=31536000, immutable"
        header X-Content-Type-Options "nosniff"
        file_server
    }
'''
    candidate = config.with_name('Caddyfile.nova143-candidate')
    candidate.write_text(old.replace(marker, marker + addition, 1))
    subprocess.run(['caddy', 'validate', '--config', str(candidate), '--adapter', 'caddyfile'], check=True)
    backup = config.with_name('Caddyfile.before-nova143-' + str(int(time.time())))
    backup.write_text(old)
    os.replace(candidate, config)
    try:
        subprocess.run(['systemctl', 'reload', 'caddy'], check=True)
    except Exception:
        config.write_text(old)
        subprocess.run(['systemctl', 'reload', 'caddy'], check=True)
        raise
with urllib.request.urlopen('https://game.guardscan.xyz/patches/test/native-38/manifest.json', timeout=30) as response:
    live = json.load(response)
    assert live['id'] == EXPECTED
with urllib.request.urlopen('https://game.guardscan.xyz/health', timeout=30) as response:
    assert response.status == 200
print('NOVA143_HTTPS_VERIFIED; existing health OK')
