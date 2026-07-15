# Changelog

All notable project changes should be recorded here before each commit.

Timestamp format: `YYYY-MM-DD HH:mm Z` using local project time, precise to the minute.

## 2026-07-15 09:31 +0800

### Added

- Added Phase 5.1-5.6 planning and context directories for content foundations, trusted audio and accent variants, guided phoneme lessons, local recording/review, data-driven exercises, and a new-language pilot.
- Added stable M5 requirements for content provenance, guided learning, audio fallback, accent variants, local recording, and reusable exercise templates.

### Changed

- Reframed M5 from immediate language expansion to trusted content and practice-experience expansion, with the new-language pilot after the shared interfaces stabilize.
- Documented the boundary that iSpeakerReact can inspire product mechanisms, but its Oxford-derived course and media assets must not be copied without verified redistribution rights.

## 2026-07-03 16:10 +0800

### Added

- Expanded Vitest into a broader unit/component test system with Testing Library, jsdom, and V8 coverage.
- Added parser, judge, profile, difficulty-map, training-session, minimal-pair, phoneme-detail, storage, recommendation, and major component tests.
- Added `npm run test:watch` and `npm run test:coverage`.

### Changed

- Fixed Pinyin diacritic normalization so tone marks convert to canonical tone-number syllables like `hao3` instead of `ha3o`.
- Updated Tailwind/Vitest testing dependencies and cleared production dependency audit findings.
- Updated testing, concerns, structure, stack, and agent docs for the expanded test system.

## 2026-07-03 11:52 +0800

### Added

- Added Vitest and `npm run test` for lightweight TypeScript unit tests.
- Added fixture-based tests for local recommendation/mastery updates and guarded storage behavior.
- Added parser/judge smoke tests for IPA tokenization and near-match feedback.

### Changed

- Updated testing, concerns, structure, stack, and agent docs for the new test suite.

## 2026-07-03 11:39 +0800

### Added

- Added local mastery records stored in guarded localStorage and updated from spelling and minimal-pair results.
- Added recommendation ranking that combines local accuracy history with optional L1 difficulty levels and falls back to ordinary topics.
- Added next-step recommendation cards to spelling and minimal-pair completion views.
- Added a clear-personalization-data entry in the optional Coach panel.

### Changed

- Changed SmartRecommend from an automatic pre-training sidebar into a manually opened Coach layer.
- Updated Phase 4.1 planning summary, state, roadmap, and codebase docs for M4 completion.

## 2026-07-03 11:22 +0800

### Added

- Added Phase 3.3 planning, QA checklist, and completion summary.
- Added a phoneme detail read model and drawer showing profile metadata, L1-aware explanations, examples, and minimal-pair practice entry points.
- Added phoneme detail entry points from topic selection, smart recommendations, spelling diffs, and minimal-pair review.

### Changed

- Updated planning, roadmap, state, agent guide, and codebase docs for completed M3 and the next M4 local-personalization phase.

## 2026-07-02 21:53 +0800

### Added

- Added Phase 3.2 planning, context, QA checklist, and completion summary.

### Changed

- Kept the Mandarin on-screen keypad as initials/finals/tones and moved the structured-input guidance into the input placeholder.
- Updated the Mandarin tone keypad to show and insert neutral tone as `5`.
- Updated README, PRD, roadmap, state, agent guide, and codebase docs for completed Phase 3.2.

## 2026-07-02 21:29 +0800

### Added

- Added Phase 2.4 publish-readiness plan, QA checklist, and completion summary.
- Added structured minimal-pair training models, curated English/Mandarin minimal-pair data, question generation utilities, and an A/B listening view.
- Added minimal-pair data validation to `npm run validate:data`.

### Changed

- Updated README, README_EN, PRD, index title, planning state, roadmap, and agent guide for the completed M2 release-readiness pass and completed Phase 3.1 minimal-pair slice.
- Updated codebase docs for the new minimal-pair data model, architecture flow, structure, testing coverage, and TTS quality risk.

## 2026-07-02 16:55 +0800

### Added

- Added explicit `TrainingSession`, `TrainingAnswer`, and `SessionResult` models for training feedback and results.
- Added phoneme diff and session result views with review, retry, recent history, and clear-history controls.
- Added guarded localStorage helpers for recent session results.
- Added a Phase 2.3 manual QA checklist and completion summary.

### Changed

- Replaced end-of-session alerts with a result page.
- Made nearMatch an independent feedback state that is tracked separately from exact correct answers.
- Updated planning and codebase docs for the completed Phase 2.3 feedback/session loop.

## 2026-07-02 16:42 +0800

### Changed

- Reworded user-facing Pinyin terminology from phonemes to Pinyin units/training units.
- Clarified in README that the 61 Pinyin units are 21 initials, 35 finals, and 5 tones.

## 2026-07-02 16:32 +0800

### Added

- Added the public GitHub Pages demo link to README and invited user feedback.
- Added a non-blocking TTS troubleshooting panel with browser guidance and diagnostic details when speech playback is unavailable or fails.

## 2026-07-02 16:19 +0800

### Added

- Added keyboard shortcuts for playback, answer submission, navigation, mode switching, difficulty switching, word-set refresh, keypad toggling, and topic focus.
- Added tooltip hints to the related training controls.

## 2026-07-02 15:58 +0800

### Added

- Added `scripts/validateData.ts` and `npm run validate:data` to validate language profiles, word banks, notation tokens, and L1/L2 difficulty maps.
- Added Phase 2.2 completion summary and updated planning docs for the data-cleaning gate.

### Changed

- Migrated the English word bank to `TrainingItem[]` and removed runtime conversion from `englishProfile`.
- Deduplicated English and Chinese training items by `display + pronunciation`.
- Normalized Pinyin parsing for neutral tone, zero-initial `y/w` spellings, and `j/q/x + ü` finals.
- Updated README and codebase docs with current word-bank counts and validation workflow.

## 2026-07-02 15:42 +0800

### Added

- Added Phase 2.2 Data Cleaning to clean and validate word banks, language profiles, and L1/L2 mappings before implementation continues.
- Added context for the new data-cleaning phase.

### Changed

- Moved Feedback & Session Results from Phase 2.2 to Phase 2.3.
- Updated roadmap, state, DDD, and agent guidance to make data cleaning the next step.

## 2026-07-02 15:23 +0800

### Added

- Added `.planning/codebase/DDD-ARCHITECTURE.md` to establish DDD subdomains, bounded contexts, aggregate candidates, and Feedback/Session Results architecture guidance.

### Changed

- Updated architecture, structure, and state planning docs to reference the DDD model before starting Feedback & Session Results.
- Updated maintenance and agent guides so new sessions read the DDD architecture before feedback/session implementation.

## 2026-07-02 15:17 +0800

### Added

- Added `src/utils/trainingSession.ts` to centralize training item picking and fresh session initialization.
- Added the Phase 2.1 completion summary under `.planning/phases/2.1-standalone-training-core/`.

### Changed

- Made L1 optional in onboarding; users can now start training with only a target language selected.
- Updated the main training shell so no-L1 sessions show direct training and do not render the recommendation sidebar.
- Reset sessions through a shared training-session utility when changing mode, difficulty, topic, word count, or word set.
- Added explicit Previous navigation to the browse/listen training mode.
- Updated planning and codebase documentation for Phase 2.1 completion.

## 2026-07-02 15:06 +0800

### Added

- Added root-level `AGENT.md` as a compact maintenance guide for future AI agents and maintainers.

### Changed

- Updated `.planning/codebase/STRUCTURE.md` to include the new agent guide.

## 2026-06-22 14:00 +0800

### Changed

- Reframed the product roadmap around a standalone, pure-frontend phonetic training MVP.
- Reordered future milestones: M2 standalone trainer, M3 targeted/minimal-pair training, M4 local personalization, M5 new languages, M6 optional cloud enhancements.
- Added phase plans for standalone training, feedback/session results, minimal pairs, and local personalization.
- Updated planning docs to clarify that L1-aware recommendations are an optional coaching layer, not a prerequisite for training.

### Added

- Root-level `CHANGELOG.md` for commit-by-commit change tracking.
