# Selective Deployment Guard — Reference Implementation

[![CI](https://github.com/intergonzalo/selective-deployment-guard/actions/workflows/ci.yml/badge.svg)](https://github.com/intergonzalo/selective-deployment-guard/actions/workflows/ci.yml)

An executable public reference for **mapping source changes to the smallest safe deployment scope** while failing closed when runtime impact cannot be proven.

The project is synthetic and independent from the private production systems that inspired the pattern.

## What it demonstrates

- deterministic changed-file classification;
- documentation-only `skip`;
- test/QA-only `validate_only`;
- explicit `selective` deployment targets for mapped runtime changes;
- dependency expansion for shared runtime contracts;
- unknown runtime impact => `full` classification;
- `full` deployment blocked by default;
- exceptional full deployment requires explicit caller authorization;
- validation and deployment treated as separate concerns;
- explainable evidence for every classification.

## Run it

Requires Node.js 22+ and has no runtime dependencies.

```bash
npm run check
npm test
npm run demo
```

## Core idea

A deployment resolver should not use “deploy everything” as a fallback for uncertainty.

Known, mapped changes can publish only the affected components. Non-runtime changes can validate without publication. Unknown runtime changes are surfaced as a full-impact condition and fail closed unless an exceptional mechanism explicitly authorizes that full release.

That preserves speed for normal work without making uncertainty silently dangerous.

## Public/private boundary

All paths and targets in this project are synthetic. No production service names, cloud projects, internal workflow configuration, credentials or private repository structure are published.
