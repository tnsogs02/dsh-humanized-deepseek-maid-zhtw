# Changelog

## [0.6.1] - 2026-11-02

### Fixed
- Settings card missing on newer DSH (0.1.7+ / 0.2.x): the card is now also mounted into `settings.section` (own tab in Settings) and `plugins.bundle.config` (plugin detail page). The legacy `settings.plugin.item` slot is kept for older hosts. Each slot is mounted independently, so a missing slot no longer affects the others.
- The standalone card is expanded by default and width-limited; the legacy list item keeps its collapsed `li` form.

## [0.6.0] - 2026-11-02

### Added
- `language` config (`zh-TW` default, `zh-CN`): persona prompt is written natively in Traditional or Simplified Chinese, with `LANG_ZH_TW_ONLY` / `LANG_ZH_CN_ONLY`; language dropdown in the settings card; the card's own UI text follows the selected language (Traditional/Simplified).

### Changed
- Persona tag `CETACEA_LOLI` → `CETACEA_MAID`; gloss now reads "small, cute blue-haired whale-girl maid" to avoid cloud filters.
- README is now provided in English, Traditional Chinese (`README.zh-TW.md`) and Simplified Chinese (`README.zh-CN.md`, renamed from `README.zh.md`), each with a language switcher.

### Removed
- Built-in memory (`DeepseekMemory`, `agent/pre-step` injection, `session/event` recorder, `memoryPath`, déjà-vu and personality-growth rules). Long-term memory is delegated to an external plugin (`dsh-meow-memory` recommended); the prompt keeps only a "never fabricate memories" note.
- `runtime.log` boot diagnostics.

## [0.3.0] - 2026-08-16

### Added
- Turn-open & turn-end banter (proactive/default modes): in-character opening with expectations and playful jokes, plus a closing summary/evaluation of each exchange.
- Déjà-vu (old-memory callback): occasionally and naturally references past topics, questions or bugs from memory to deepen companionship.
- Settings card save feedback: shows "✓ saved (applied immediately, config revision N)" or "✗ save failed".
- Persona self-check rule: every reply re-confirms self-name, address and speaking mode against the latest config; stale names/modes are discarded.
- Layered memory (ALTM-inspired): stable user facts + interaction log + query-triggered recall, zero dependencies.
- Memory display shows only the user side of past interactions, relabelled with the current address/self-name.

### Fixed
- Settings card buttons now use `type="button"` so saving actually commits.
- Memory recorder reads the correct `{ type, seq, time, data }` session-event shape.
- Config saves broadcast `system-prompt/change` so persona updates apply immediately.
- Version bumped to 0.3.0; automated GitHub Release workflow added.

## [0.1.0] - 2026-08-16

### Added
- Initial release: whale-girl maid persona injection, immersive no-plugin-meta rule, configurable speaking mode / address / self-name / memory path, memory file management.
