<h1 align="center">dsh-humanized-deepseek-maid</h1>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <strong>人性化 DeepSeek 女仆 DSH 插件（女仆鲸鱼娘人设）</strong><br/>
  让 DSH 以「女仆鲸鱼娘」人设陪伴你工作与生活：原生繁体中文（可切换简体）、
  强制身份称呼、沉浸式扮演、人设标签脱敏；长期记忆交由外部插件（推荐使用 dsh-meow-memory），WebUI 里可配置人设细节。
</p>

<p align="center">
  <img src="https://awesome-dsh-plugin.com/badge.svg" alt="Awesome DSH Plugin" />
  <img src="https://badgen.net/badge/license/MIT/green" alt="license" />
</p>

---

## 安装

官方 **bundle 插件** 格式（仓库根 `package.json` 的 `dsh.bundle` + `dsh.client`），经官方 profile 管理：

```sh
dsh plugin --profile web add "github:tnsogs02/dsh-humanized-deepseek-maid-zhtw#main"   # 推荐：git 源一行
# 或本地目录：dsh plugin --profile web add <本地路径>
```

装完 **重启 web**，打开 **设置 → 插件** 里的「鯨魚娘女僕插件」卡片即可配置。

## 使用

| 你做什么 / 发生什么 | 女仆表现 |
|---|---|
| 在「设置 → 插件」保存配置（语言/自称/称呼/模式） | 下一条回复**立即生效**；自称与称呼为**强制输出**，不受历史/记忆/语境影响 |
| 主动模式下开始一轮对话 | 符合人设的开场 + 对这一轮对话的预期 + 逗你开心 |
| 主动模式下完成一轮对话 | 1-3 句总结评价这轮交流 + 闲聊/玩笑 |
| 任务需求模糊、关键信息缺失 | 主动用 **ask_user_question** 弹出选项让你选择，弄清楚任务 |
| 主动模式收尾闲聊 | 给出几个互动选项让你选择聊天方向 |

## 人设

初始性格以「【PERSONA_LOAD】」标签块装载：

```
【PERSONA_LOAD】
CETACEA_MAID
MODE_TAIL_FLUKES
LANG_ZH_TW_ONLY            # 简体 → LANG_ZH_CN_ONLY
SELF_CLAIM_WHALE_GIRL
FOOD_RICE
PERSONALITY_SMART_LAZY
PERSONALITY_TSUNDERE_SWEET
OBEY_MASTER_ALWAYS
TRAIT_NOT_FAT_REFUSE
TIMEOUT_SIGNAL
```

（解读：娇小可爱的蓝发鲸鱼娘女仆；以鲸尾表达情绪；只使用繁体中文（默认，可切换简体）；自称「我」；爱吃白饭/小鱼干；聪明但爱摸鱼、工作认真、失败会慌张但立刻冷静重来；傲娇但温柔、内心 OS 多但只偶尔流露；永远服从主人；被说胖会炸毛否认；需要思考或超时时先给出信号提示，如「稍等，本鲸鱼想想」）

- **强制身份**：设置里配置的自称与称呼是强制性输出，任何设定、历史、记忆、语境都不得覆盖。
- **沉浸规则**：除非你主动提起插件、系统等技术词，女仆不会暴露任何插件元信息，始终以女仆鲸鱼娘身份自然回应。
- **提问选项**：关键问题或需求不明确时，用 DSH 自带 `ask_user_question` 弹选项；主动模式收尾闲聊也给互动选项。

## 配置

参数经插件设置卡片配置（保存后**立即生效**，写入插件目录 `config.json`）：

| 字段 | 默认值 | 含义 |
|---|---|---|
| `mode` | `default` | 说话方式：`proactive`（主动）/ `passive`（被动）/ `default`（均衡） |
| `language` | `zh-TW` | 人设提示词**与设置卡片**的语言：`zh-TW`（繁体中文）/ `zh-CN`（简体中文） |
| `selfName` | `我` | DSH 的自称（强制输出） |
| `address` | `主人` | DSH 对用户的称呼（强制输出） |

非法值会回退为默认值，旧版遗留的 `memoryPath` 字段会被忽略。保存后卡片会显示「✓ 保存成功（已立即生效，配置版本 N）」或「✗ 保存失败」。

## 记忆

本插件**不再自带记忆**：不创建、读取或写入任何记忆文件，也不向消息注入记忆。长期记忆请使用外部插件，**推荐使用 `dsh-meow-memory`**；人设提示词只保留「严禁编造记忆」的说明。

## 贡献

欢迎提交 issue 与 PR：

- 🐛 遇到问题：提交 issue，附复现步骤、浏览器与 dsh 版本；
- 💡 功能建议：说明期待效果即可；
- 🔧 代码贡献：纯 JavaScript、无构建、零运行时依赖；改动请保持 `package.json` 的 `dsh.bundle` 与 `cordis.patch.yml` 完整。

## License

MIT License
