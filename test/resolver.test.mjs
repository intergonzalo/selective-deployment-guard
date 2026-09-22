import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDeployment } from '../src/resolver.mjs';

test('documentation-only changes skip deployment', () => {
  const result = resolveDeployment(['docs/architecture.md', 'README.md']);
  assert.equal(result.mode, 'skip');
  assert.equal(result.allowed, true);
  assert.deepEqual(result.targets, []);
});

test('mapped runtime change produces a selective target set', () => {
  const result = resolveDeployment(['apps/admin/dashboard.js']);
  assert.equal(result.mode, 'selective');
  assert.deepEqual(result.targets, ['admin-ui']);
});

test('shared contract expands to all declared dependents', () => {
  const result = resolveDeployment(['shared/contracts/case.json']);
  assert.deepEqual(result.targets, ['admin-ui', 'api-service', 'portal-ui', 'worker-service']);
});

test('test-only changes validate without deployment', () => {
  const result = resolveDeployment(['test/resolver.test.mjs']);
  assert.equal(result.mode, 'validate_only');
  assert.equal(result.validationNeeded, true);
});

test('unknown runtime impact becomes full and fails closed by default', () => {
  const result = resolveDeployment(['runtime/unknown-handler.js']);
  assert.equal(result.mode, 'full');
  assert.equal(result.allowed, false);
  assert.equal(result.reason, 'unmapped_runtime_impact_fail_closed');
});

test('full deployment requires explicit exceptional authorization', () => {
  const result = resolveDeployment(['runtime/unknown-handler.js'], { allowFull: true });
  assert.equal(result.mode, 'full');
  assert.equal(result.allowed, true);
  assert.equal(result.reason, 'explicit_full_authorization');
});

test('result is deterministic regardless of duplicate or input ordering', () => {
  const a = resolveDeployment(['services/api/index.js', 'apps/admin/x.js', 'services/api/index.js']);
  const b = resolveDeployment(['apps/admin/x.js', 'services/api/index.js']);
  assert.deepEqual(a.targets, b.targets);
  assert.deepEqual(a.targets, ['admin-ui', 'api-service']);
});
