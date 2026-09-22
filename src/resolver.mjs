const DEFAULT_CONFIG = Object.freeze({
  ignoredPrefixes: ['docs/', '.github/ISSUE_TEMPLATE/'],
  validationPrefixes: ['test/', 'tests/', 'qa/'],
  targetPrefixes: Object.freeze({
    'apps/portal/': ['portal-ui'],
    'apps/admin/': ['admin-ui'],
    'services/api/': ['api-service'],
    'services/worker/': ['worker-service'],
    'shared/contracts/': ['portal-ui', 'admin-ui', 'api-service', 'worker-service'],
  }),
  runtimeExtensions: ['.js', '.mjs', '.cjs', '.ts', '.php', '.py', '.json', '.yaml', '.yml'],
});

export function resolveDeployment(changedFiles, { allowFull = false, config = DEFAULT_CONFIG } = {}) {
  const files = [...new Set(changedFiles)].sort();
  const targets = new Set();
  const reasons = [];
  let validationNeeded = false;
  let unknownRuntimeImpact = false;

  for (const file of files) {
    if (config.ignoredPrefixes.some((prefix) => file.startsWith(prefix)) || file.endsWith('.md')) {
      reasons.push({ file, classification: 'ignored' });
      continue;
    }

    if (config.validationPrefixes.some((prefix) => file.startsWith(prefix))) {
      validationNeeded = true;
      reasons.push({ file, classification: 'validation_only' });
      continue;
    }

    const entry = Object.entries(config.targetPrefixes).find(([prefix]) => file.startsWith(prefix));
    if (entry) {
      for (const target of entry[1]) targets.add(target);
      reasons.push({ file, classification: 'mapped', targets: [...entry[1]] });
      continue;
    }

    if (config.runtimeExtensions.some((ext) => file.endsWith(ext))) {
      unknownRuntimeImpact = true;
      reasons.push({ file, classification: 'unmapped_runtime' });
    } else {
      validationNeeded = true;
      reasons.push({ file, classification: 'validation_only_unmapped' });
    }
  }

  if (unknownRuntimeImpact) {
    return Object.freeze({
      mode: 'full',
      allowed: Boolean(allowFull),
      targets: Object.freeze([]),
      validationNeeded: true,
      reason: allowFull ? 'explicit_full_authorization' : 'unmapped_runtime_impact_fail_closed',
      evidence: Object.freeze(reasons),
    });
  }

  const orderedTargets = [...targets].sort();
  if (orderedTargets.length > 0) {
    return Object.freeze({
      mode: 'selective',
      allowed: true,
      targets: Object.freeze(orderedTargets),
      validationNeeded: true,
      reason: 'mapped_runtime_impact',
      evidence: Object.freeze(reasons),
    });
  }

  return Object.freeze({
    mode: validationNeeded ? 'validate_only' : 'skip',
    allowed: true,
    targets: Object.freeze([]),
    validationNeeded,
    reason: validationNeeded ? 'no_deployable_runtime_impact' : 'non_runtime_changes_only',
    evidence: Object.freeze(reasons),
  });
}

export { DEFAULT_CONFIG };
