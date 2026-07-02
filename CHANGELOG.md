# Changelog

All notable project changes should be recorded here before each commit.

Timestamp format: `YYYY-MM-DD HH:mm Z` using local project time, precise to the minute.

## 2026-07-02 15:36 +0800

### Added

- Added Phase 2.2 MVP Scope Triage to classify necessary features, delayed features, long-term enhancements, and pseudo-requirements before implementation continues.
- Added context for the new scope-triage phase.

### Changed

- Moved Feedback & Session Results from Phase 2.2 to Phase 2.3.
- Updated roadmap, state, DDD, and agent guidance to make scope triage the next step.

## 2026-07-02 15:23 +0800

### Added

- Added `.planning/codebase/DDD-ARCHITECTURE.md` to establish DDD subdomains, bounded contexts, aggregate candidates, and Phase 2.2 architecture guidance.

### Changed

- Updated architecture, structure, and state planning docs to reference the DDD model before starting Feedback & Session Results.
- Updated maintenance and agent guides so new sessions read the DDD architecture before Phase 2.2 implementation.

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
