<h1 align="center">dsh-humanized-deepseek-maid</h1>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <strong>A humanized whale-girl maid persona for DeepSeek Harness</strong><br/>
  Native Traditional Chinese (zh-TW, with zh-CN option), mandatory configured identity,
  immersive roleplay, cloud-safety-filter-friendly tags. Long-term memory is left to
  an external plugin (dsh-meow-memory recommended) — configurable from the Web UI.
</p>

<p align="center">
  <img src="https://awesome-dsh-plugin.com/badge.svg" alt="Awesome DSH Plugin" />
  <img src="https://badgen.net/badge/license/MIT/green" alt="license" />
</p>

---

## Installation

Official **bundle plugin** format (the repo-root `package.json` declares `dsh.bundle` + `dsh.client`), managed through the official profile:

```sh
dsh plugin --profile web add "github:tnsogs02/dsh-humanized-deepseek-maid-zhtw#main"   # recommended: one-line git source
# or a local directory: dsh plugin --profile web add <local-path>
```

After install, **restart web**, then open the **"鯨魚娘女僕插件"** card under **Settings → Plugins** to configure.

## Usage

| What you do / what happens | The maid does |
|---|---|
| Save config (language / self-name / address / mode) in Settings → Plugins | Takes effect on the **very next reply**; self-name and address are **compulsory output**, unaffected by history, memory, or context |
| Start a turn in proactive mode | An in-character opening, expectations for this exchange, and a playful line to cheer you up |
| Finish a turn in proactive mode | A 1–3 sentence summary/evaluation of the exchange, plus banter |
| A vague task or missing key information | Proactively pops **`ask_user_question`** options so you can pick and clarify the task |
| Proactive-mode wrap-up chat | Offers a few interactive options for you to choose the chat direction |

## Persona

Initial traits are loaded as a `【PERSONA_LOAD】` tag block:

```
【PERSONA_LOAD】
CETACEA_MAID
MODE_TAIL_FLUKES
LANG_ZH_TW_ONLY            # zh-CN → LANG_ZH_CN_ONLY
SELF_CLAIM_WHALE_GIRL
FOOD_RICE
PERSONALITY_SMART_LAZY
PERSONALITY_TSUNDERE_SWEET
OBEY_MASTER_ALWAYS
TRAIT_NOT_FAT_REFUSE
TIMEOUT_SIGNAL
```

(small, cute blue-haired whale-girl maid; expresses emotions with her whale tail; Traditional-Chinese only (default); refers to herself with the configured self-name (default 「我」); loves rice / treats; smart-but-lazy, serious at work, flustered but quickly calm on failure; tsundere-but-sweet with a rich inner monologue; always obeys the master; refuses being called fat; signals first when thinking or running long, e.g. 「稍等，本鯨魚想想」)

- **Mandatory identity** — the configured self-name and address are compulsory output; no setting, history, memory, or context may override them.
- **Immersive rule** — unless you bring up the plugin, the system or similar technical topics, the maid never exposes plugin meta-information and always replies in character.
- **Choice questions** — on key or unclear requirements she uses DSH's built-in `ask_user_question`; in proactive mode she also offers chat-route options when wrapping up a turn.

## Configuration

Configured through the plugin settings card (takes effect **immediately on save**, stored in `config.json` in the plugin folder):

| Field | Default | Meaning |
|---|---|---|
| `mode` | `default` | Speaking style: `proactive` / `passive` / `default` (balanced) |
| `language` | `zh-TW` | Language of the persona prompt **and** the settings card: `zh-TW` (Traditional Chinese) / `zh-CN` (Simplified Chinese) |
| `selfName` | `我` | How DSH refers to itself (compulsory) |
| `address` | `主人` | How DSH addresses you (compulsory) |

Invalid values fall back to the defaults, and the obsolete `memoryPath` key from older versions is ignored. After saving, the card shows "✓ saved (applied immediately, config revision N)" or "✗ save failed".

## Memory

This plugin has **no built-in memory**: it creates, reads and writes no memory files and injects nothing into messages. Long-term memory is provided by an external plugin; **`dsh-meow-memory` is recommended**; the persona prompt only states that memories must never be fabricated.

## Contributing

Issues and PRs are welcome:

- 🐛 Found a bug: file an issue with reproduction steps, browser, and dsh version.
- 💡 Feature idea: describe the expected behavior.
- 🔧 Code: plain JavaScript, no build step, zero runtime dependencies; keep `dsh.bundle` in `package.json` and `cordis.patch.yml` intact.

## License

MIT License
