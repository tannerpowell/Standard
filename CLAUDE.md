# Standard

<!-- Bootstrapped with the shared "Perceived Performance" playbook, added in bulk across Next.js projects. This file currently carries only that section; flesh it out with this repo's stack, commands, and conventions when you get a chance. -->

## Perceived Performance

Users prefer apps that feel fast. 3-layer feedback:

| Layer     | Timing   | Implementation                       |
|-----------|----------|--------------------------------------|
| Immediate | 0-150ms  | Track navigation, delay progress bar |
| Fast      | >150ms   | Show progress bar + skeleton         |
| Complete  | Variable | Fade in content                      |

Required:
1. Navigation progress bar (150ms threshold), NProgress pattern.
2. Route loading skeletons (`loading.tsx`) that mirror the actual layout.
3. Dynamic imports for >100KB deps (PDF, charts, editors, maps).
4. Cache warming script (`scripts/warmup-routes.ts`).

Key: zero perceived wait time, not zero actual wait time.

**Caveat:** this was added across all Next.js projects in bulk, so its presence here isn't a deliberate signal that this repo needs it. If this isn't a user-facing product where perceived performance matters yet (early-stage, internal tool, few or no users), bring that up rather than chasing the checklist. "This app is too small to need skeletons and a warmup script yet" is a fine thing to say, then skip it.
