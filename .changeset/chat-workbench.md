---
'agents-kit-svelte': minor
---

Rename `TrailsideClaudeChat` to `ChatWorkbench`. `TrailsideClaudeChat` still works as a deprecated alias and will be removed in the next major release; replace the import to move over:

```diff
- import { TrailsideClaudeChat } from 'agents-kit-svelte/chat';
+ import { ChatWorkbench } from 'agents-kit-svelte/chat';
```
