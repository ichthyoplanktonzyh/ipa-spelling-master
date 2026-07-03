# AGENT.md — PhoneticMaster Agent Guide

> Last updated: 2026-07-03
> Source of truth: `.planning/`, especially `.planning/MAINTENANCE.md`

This file is a compact operating guide for AI agents and maintainers working in this repository. If this file conflicts with `.planning/`, follow the more specific `.planning/` document and update this guide later.

## 1. Start Here

For every new session, read these first:

1. `.planning/STATE.md` — current milestone, phase, next work
2. `.planning/codebase/ARCHITECTURE.md` — system map, data flow, module boundaries
3. `.planning/codebase/DDD-ARCHITECTURE.md` — bounded contexts, domain model, next architecture moves
4. `.planning/codebase/STRUCTURE.md` — where files live and where new code belongs
5. `.planning/codebase/STACK.md` — dependencies and commands
6. `.planning/codebase/DATA-MODEL.md` — core types and storage semantics

Read these as needed:

| Need | Read |
|---|---|
| Product direction or scope | `.planning/PROJECT.md` |
| Requirements and acceptance criteria | `.planning/REQUIREMENTS.md` |
| Milestones and phase ordering | `.planning/ROADMAP.md` |
| Code rules and architecture conventions | `.planning/codebase/CONVENTIONS.md` |
| Known risks and fragile areas | `.planning/codebase/CONCERNS.md` |
| Verification strategy and gaps | `.planning/codebase/TESTING.md` |
| Current phase details | `.planning/phases/<phase>/` |
| Documentation workflow | `.planning/MAINTENANCE.md` |

## 2. Current Project Snapshot

- Product: PhoneticMaster, a lightweight pure-frontend multilingual phonetic perception trainer.
- Current milestone: M4 — local personalization and L1-aware coach, completed.
- Current priority: Move toward M5 new-language/content expansion, while keeping Phase 4.1 local personalization stable.
- Core principle: the trainer must work on its own; L1-aware recommendation is an optional coach layer.
- DDD direction: Training Core and Feedback are the core domains; Phase 3.3 added `PhonemeDetail` as a Feedback/Coaching read model; Phase 4.1 added `MasteryRecord` and `Recommendation` as Learner Progress/Coaching read models.
- MVP deployment target: static frontend hosting. `server.ts` is useful for local preview/self-hosting, not a required backend.

## 3. Architecture Guardrails

- The app is `LanguageProfile`-driven. UI behavior should come from profiles, not language-specific branching scattered through components.
- Dependency direction:

```text
components -> profiles -> utils / data / l1
```

- Components must not directly import `src/data/*`, `src/utils/ipaParser.ts`, or `src/utils/pinyinParser.ts`.
- Use `profile.wordBank` for training data and `profile.parseNotation` / `profile.judge` for parsing and judgment.
- `src/types.ts` is the single source for shared domain types. Component props can stay local to component files.
- `src/l1/*` depends only on shared types and L1/L2 data; it must not depend on concrete profiles.
- New languages should require:
  - `src/profiles/{code}.ts`
  - `src/data/{code}WordBank.ts`
  - one registration import in `src/profiles/index.ts`
  - optional parser and L1 mapping files
- Do not modify framework components just to add a language.
- All `localStorage` usage must be guarded. Storage failure must never block a training session.
- New or edited source files should keep the SPDX license header used by the project.

## 4. Product Rules

- L2 selection is the minimum requirement to train. L1 is optional.
- Missing L1, missing difficulty map, or failed local storage writes must degrade gracefully.
- English IPA uses IPA notation. Chinese Pinyin stores canonical tone-number form in `pronunciation` and display diacritics in `pronunciationAlt`.
- New word banks should use `TrainingItem[]`, not legacy `WordData[]`.
- Avoid adding backend, account, database, cloud sync, ASR, or analytics unless the roadmap explicitly moves into the relevant future milestone.

## 5. Commands

| Command | Purpose |
|---|---|
| `npm run dev` | start the Vite/Express dev server on port 3000 |
| `npm run lint` | TypeScript check via `tsc --noEmit` |
| `npm run test` | run Vitest unit tests |
| `npm run test:coverage` | run Vitest with V8 coverage |
| `npm run validate:data` | validate profiles, word banks, and L1/L2 maps |
| `npx tsc --noEmit` | direct type check |
| `npm run build` | production build plus bundled `server.ts` |
| `GITHUB_PAGES=true npm run build` | build with GitHub Pages asset base (`/PhoneticMaster/`) |
| `npm run start` | run `dist/server.cjs` after build |
| `npm run clean` | remove build artifacts |

Tests use Vitest plus Testing Library/jsdom. Current coverage includes parser/judge matrices, Training/Feedback utilities, Phase 4.1 storage/recommendation behavior, profile judge adapters, and major UI component smoke/interaction tests; see `.planning/codebase/TESTING.md`.

## 6. CI/CD And Deployment

- Canonical GitHub repository: `https://github.com/ichthyoplanktonzyh/PhoneticMaster`.
- Public GitHub Pages URL: `https://ichthyoplanktonzyh.github.io/PhoneticMaster/`.
- Local `origin` should point to `https://github.com/ichthyoplanktonzyh/PhoneticMaster.git`; the old `ipa-spelling-master` URL redirects but should not be used for new setup.
- Deployment workflow: `.github/workflows/deploy.yml`.
- Trigger: every push to `main`, plus manual `workflow_dispatch`.
- Workflow checks: `npm ci` → `npm run validate:data` → `npm run lint` → `npm run build` with `GITHUB_PAGES=true` → upload `dist/` → deploy Pages.
- GitHub Pages must be enabled with build type `workflow`; if `actions/configure-pages` returns a Pages Not Found error, enable Pages for the repository first.
- `vite.config.ts` uses `process.env.GITHUB_PAGES === 'true'` to set `base: '/PhoneticMaster/'`. Keep this value aligned with the repository name and public Pages path.
- Before changing the repository name, custom domain, or Pages path, update all of these together: `vite.config.ts`, `README.md`, `README_EN.md`, Git remote URL, and this section.
- To verify a Pages deployment locally, run `GITHUB_PAGES=true npm run build` and inspect `dist/index.html`; asset URLs should start with `/PhoneticMaster/assets/`.
- After deployment, verify the public page and assets with:

```bash
curl -I -L https://ichthyoplanktonzyh.github.io/PhoneticMaster/
curl -L https://ichthyoplanktonzyh.github.io/PhoneticMaster/ | sed -n '1,40p'
```

- GitHub Actions currently emits Node/action deprecation annotations for some upstream actions being forced to newer Node runtimes; these are warnings unless the run fails.

## 7. Documentation Maintenance

`.planning/MAINTENANCE.md` defines the full rules. The short version:

- On every commit, consider whether `.planning/codebase/*` needs updates and record user-facing changes in root `CHANGELOG.md` with a minute-level timestamp: `YYYY-MM-DD HH:mm Z`.
- When a phase is completed:
  1. Run `npx tsc --noEmit`
  2. Run `npm run build`
  3. Write `.planning/phases/<phase>/<phase>-SUMMARY.md`
  4. Update `.planning/STATE.md`
  5. Update `.planning/ROADMAP.md`
  6. Freeze that phase folder
- Do not edit frozen phase files. Put new findings in the next phase context.
- Stable requirement IDs in `.planning/REQUIREMENTS.md` must not be renamed. Deprecate with strikethrough and a reason.
- Every issue in `.planning/codebase/CONCERNS.md` must include concrete file paths.
- Every `.planning/codebase/*.md` file should keep a `> 最后更新：YYYY-MM-DD` line near the top.
- Use relative links between planning documents.
- Prefer tables for structured planning data and ASCII diagrams for architecture sketches.

## 8. What To Update When

| Change | Required docs |
|---|---|
| Phase completed | `.planning/STATE.md`, phase summary |
| Roadmap or milestone status changed | `.planning/ROADMAP.md` |
| Product direction changed | `.planning/PROJECT.md` |
| Requirements changed | `.planning/REQUIREMENTS.md` |
| Files or directories added/removed | `.planning/codebase/STRUCTURE.md` |
| Architecture or module boundaries changed | `.planning/codebase/ARCHITECTURE.md` |
| Domain boundaries or aggregate ownership changed | `.planning/codebase/DDD-ARCHITECTURE.md` |
| Dependencies or commands changed | `.planning/codebase/STACK.md` |
| Types, persistence, or notation semantics changed | `.planning/codebase/DATA-MODEL.md` |
| Coding rules changed | `.planning/codebase/CONVENTIONS.md` |
| New or resolved technical debt | `.planning/codebase/CONCERNS.md` |
| Tests added or testing strategy changed | `.planning/codebase/TESTING.md` |
| CI/CD, Pages URL, or repository path changed | `AGENT.md`, `.planning/codebase/STACK.md`, README files |

## 9. Known Fragile Areas

Check `.planning/codebase/CONCERNS.md` before touching:

- `src/App.tsx`, `src/components/OnboardingView.tsx`, `src/components/SmartRecommend.tsx` — L1/L2 entry flow is being adjusted for standalone training.
- `src/utils/pinyinParser.ts` — pinyin syllable parsing has many edge cases; update fixtures before changing it.
- `src/utils/judge.ts` — `nearMatch` behavior can be too lenient for large length differences; matrix tests cover current behavior.
- `src/l1/zh_en.ts`, `src/l1/en_zh.ts` — L1/L2 mapping data is structurally validated but not linguistically exhaustive.
- `src/utils/phonemeDetails.ts`, `src/components/PhonemeDetailPanel.tsx` — Phase 3.3 read model/UI; fixture/component tests now cover the main paths.
- `src/utils/recommendation.ts`, `src/utils/storage.ts` — Phase 4.1 local personalization; fixture-based unit tests exist and should be updated before changing ranking or persistence semantics.
- `scripts/validateData.ts` — data validation gate has no fixture-based unit tests yet.
- `.github/workflows/deploy.yml` + `vite.config.ts` — Pages deployment depends on the `/PhoneticMaster/` base path matching the repository name.
- `src/components/IPAKeypad.tsx` — legacy component, currently dead code.

## 10. Working Style

- Keep changes scoped to the active phase or explicit user request.
- Preserve user edits in the working tree. Do not revert unrelated changes.
- Prefer existing project patterns over new abstractions.
- Before finishing any code change, run at least `npm run lint`; run `npm run build` for phase-level or user-facing changes.
- If verification cannot be run, state that clearly in the handoff.
