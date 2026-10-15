#!/usr/bin/env python3
"""Local verification only: never upload, deploy, submit a lead or emit a real conversion."""
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
LOG_ROOT = Path('/tmp/ccg-tracking-repair-verification')
LOG_ROOT.mkdir(mode=0o700, exist_ok=True)
ENV = {k: v for k, v in os.environ.items() if not re.search(r'SECRET|TOKEN|API_KEY|DATABASE_URL|SMTP|PASSWORD|RUN_LIVE', k, re.I)}


def run(name, args, extra=None):
    env = dict(ENV)
    env.update(extra or {})
    print(f'Running {name}', flush=True)
    log = LOG_ROOT / f'{name}.log'
    with log.open('w') as out:
        result = subprocess.run(args, cwd=ROOT, env=env, stdout=out, stderr=subprocess.STDOUT)
    if result.returncode:
        print('\n'.join(log.read_text().splitlines()[-35:]), flush=True)
        raise RuntimeError(f'{name} failed; see {log}')
    print(f'PASS {name}', flush=True)
    return log


def fingerprint(mode):
    public = ROOT / 'dist/public'
    entries = [(str(p.relative_to(public)), hashlib.sha256(p.read_bytes()).hexdigest()) for p in sorted(public.rglob('*')) if p.is_file()]
    worker = public / '_worker.js'
    assert not re.search(r'^import\s', worker.read_text(), re.M), 'Worker must be self-contained'
    config = (ROOT / 'client/src/generated/baysideSoutheastConfig.ts').read_text()
    assert 'BAYSIDE_SOUTHEAST_PREVIEW_ENABLED = false' in config
    assert 'BAYSIDE_SOUTHEAST_PUBLISHED_ENABLED = false' in config
    ledger = {
        'mode': mode, 'worker_sha256': hashlib.sha256(worker.read_bytes()).hexdigest(),
        'file_count': len(entries), 'total_bytes': sum(p.stat().st_size for p in public.rglob('*') if p.is_file()),
        'asset_ledger_sha256': hashlib.sha256(json.dumps(entries).encode()).hexdigest(),
        'source_flags_restored_default_off': True,
    }
    (LOG_ROOT / f'{mode}-artifact.json').write_text(json.dumps(ledger, indent=2) + '\n')
    print(json.dumps(ledger), flush=True)


run('full-safe', ['pnpm', 'test:safe'])
run('typescript', ['pnpm', 'check'])
run('quote-source', ['pnpm', 'quote:verify:source'])
run('default-build', ['pnpm', 'build'])
run('default-destinations', ['pnpm', 'tracking:verify:build'])
run('default-worker-syntax', ['node', '--check', 'dist/public/_worker.js'])
fingerprint('default-off')
# A real build with deliberately wrong inherited public settings must still emit approved mappings.
run('candidate-build-hostile-overrides', ['pnpm', 'build:bayside-southeast-production'], {
    'VITE_GADS_LABEL_QUOTE': 'unapproved-other-quote-action',
    'VITE_GADS_LABEL_PHONE': 'phone_call_click',
})
run('candidate-destinations', ['pnpm', 'tracking:verify:build'])
run('candidate-quote-build', ['pnpm', 'quote:verify:build'])
run('candidate-worker-syntax', ['node', '--check', 'dist/public/_worker.js'])
fingerprint('five-page-local-candidate')
run('diff-whitespace', ['git', 'diff', '--check'])
print('Verification chain complete; no deployment or submission performed.', flush=True)
