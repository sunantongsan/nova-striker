#!/usr/bin/env python3
"""Reject mismatched or stale bundled game bytes before publishing any AAB."""
import hashlib,json,pathlib,re,sys,zipfile
def verify(bundle, expected):
    with zipfile.ZipFile(bundle) as z:
        m=json.loads(z.read('base/assets/patch-bundled.json'))
        assert m['nativeVersion']==expected, 'Bundled nativeVersion differs from Android versionCode'
        for f in m['files']:
            b=z.read('base/assets/'+f['path'])
            assert len(b)==f['size'] and hashlib.sha256(b).hexdigest()==f['sha256'], 'Stale bundled content: '+f['path']
        assert 'assets/energy-shell286.webp' in [f['path'] for f in m['files']], 'Missing approved shell asset'
        print('PASS AAB native',expected,'content',m['contentVersion'],m['label'],'all bundled hashes verified')
if __name__=='__main__':
    expected=int(re.search(r'versionCode\s+(\d+)',pathlib.Path('app/build.gradle').read_text()).group(1))
    verify(sys.argv[1],expected)
