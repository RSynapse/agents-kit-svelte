---
'agents-kit-svelte': minor
---

Export the data types declared inside components (for example `AgentTask`, `SubAgent`, `ParallelLane`, `EvalIteration`, `InsightCard`, `FormField`) from `/chat`, `/data`, `/effects` and `/workflows`, as well as the package root, so you can type the data you pass in. The catalogue's usage examples now use the real props and types, and the install test type-checks every one of them.
