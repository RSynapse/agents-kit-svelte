---
'agents-kit-svelte': minor
---

Theming: every colour, radius, font and shadow is now a public `--ak-*` token, declared in an `agents-kit` cascade layer so host CSS wins without `!important`. Tokens can be set on `:root` or on any wrapper, and `[data-theme="system"]` follows the OS colour scheme. The chat accent now follows the main accent unless `--ak-chat-accent` is set.

Each component merges your `class` last with tailwind-merge, so your utilities replace the kit's. The helper is exported as `cn()` from `agents-kit-svelte/primitives`.

Deprecated: the `--color-*-val` variables still work as overrides in this release and are removed in the next minor.
