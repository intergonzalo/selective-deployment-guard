# Architecture

```mermaid
flowchart LR
    C[Changed files] --> R[Impact resolver]
    R --> D{Classification}
    D -->|docs only| S[SKIP]
    D -->|tests / QA| V[VALIDATE ONLY]
    D -->|mapped runtime| P[SELECTIVE targets]
    D -->|unknown runtime| F[FULL impact]
    F --> A{Explicit exceptional authorization?}
    A -->|no| B[BLOCK / fail closed]
    A -->|yes| E[Exceptional full release]
```

## Invariants

1. Validation does not imply deployment.
2. Documentation-only changes do not publish runtime.
3. Shared runtime contracts may expand to multiple explicit dependents.
4. Unknown runtime impact never silently degrades to “deploy all”.
5. Full-impact execution requires a separate explicit authorization signal.
6. The resolver returns evidence explaining how each changed path was classified.
7. Output is deterministic for a given change set and configuration.
