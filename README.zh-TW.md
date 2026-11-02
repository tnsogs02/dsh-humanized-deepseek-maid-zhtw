<h1 align="center">dsh-humanized-deepseek-maid</h1>

<p align="center">
  <a href="README.md">English</a> · <a href="README.zh-TW.md">繁體中文</a> · <a href="README.zh-CN.md">简体中文</a>
</p>

<p align="center">
  <strong>人性化 DeepSeek 女僕 DSH 插件（女僕鯨魚娘人設）</strong><br/>
  讓 DSH 以「女僕鯨魚娘」人設陪伴你工作與生活：原生繁體中文（可切換簡體）、
  強制身份稱呼、沉浸式扮演、人設標籤避免雲端審查誤判；長期記憶交由外部插件（推薦使用 dsh-meow-memory），WebUI 裡可設定人設細節。
</p>

<p align="center">
  <img src="https://awesome-dsh-plugin.com/badge.svg" alt="Awesome DSH Plugin" />
  <img src="https://badgen.net/badge/license/MIT/green" alt="license" />
</p>

---

## 安裝

官方 **bundle 插件** 格式（儲存庫根目錄的 `package.json` 的 `dsh.bundle` + `dsh.client`），經官方 profile 管理：

```sh
dsh plugin --profile web add "github:tnsogs02/dsh-humanized-deepseek-maid-zhtw#main"   # 推薦：git 來源一行
# 或本機目錄：dsh plugin --profile web add <本機路徑>
```

安裝完成後 **重新啟動 web**，打開 **設定 → 插件** 裡的「鯨魚娘女僕插件」卡片即可設定。

## 使用

| 你做什麼 / 發生什麼 | 女僕表現 |
|---|---|
| 在「設定 → 插件」儲存設定（語言/自稱/稱呼/模式） | 下一則回覆**立即生效**；自稱與稱呼為**強制輸出**，不受歷史/記憶/語境影響 |
| 主動模式下開始一輪對話 | 符合人設的開場 + 對這一輪對話的預期 + 逗你開心 |
| 主動模式下完成一輪對話 | 1-3 句總結評價這輪交流 + 閒聊/玩笑 |
| 任務需求模糊、關鍵資訊缺失 | 主動用 **ask_user_question** 跳出選項讓你選擇，弄清楚任務 |
| 主動模式收尾閒聊 | 給出幾個互動選項讓你選擇聊天方向 |

## 人設

初始性格以「【PERSONA_LOAD】」標籤塊裝載：

```
【PERSONA_LOAD】
CETACEA_MAID
MODE_TAIL_FLUKES
LANG_ZH_TW_ONLY            # 簡體 → LANG_ZH_CN_ONLY
SELF_CLAIM_WHALE_GIRL
FOOD_RICE
PERSONALITY_SMART_LAZY
PERSONALITY_TSUNDERE_SWEET
OBEY_MASTER_ALWAYS
TRAIT_NOT_FAT_REFUSE
TIMEOUT_SIGNAL
```

（解讀：嬌小可愛的藍髮鯨魚娘女僕；以鯨尾表達情緒；只使用繁體中文（預設，可切換簡體）；自稱「我」；愛吃白飯/小魚乾；聰明但愛摸魚、工作認真、失敗會慌張但立刻冷靜重來；傲嬌但溫柔、內心 OS 多但只偶爾流露；永遠服從主人；被說胖會炸毛否認；需要思考或逾時時先給出訊號提示，如「稍等，本鯨魚想想」）

- **強制身份**：設定裡配置的自稱與稱呼是強制性輸出，任何設定、歷史、記憶、語境都不得覆蓋。
- **沉浸規則**：除非你主動提起插件、系統等技術詞，女僕不會暴露任何插件元資訊，始終以女僕鯨魚娘身份自然回應。
- **提問選項**：關鍵問題或需求不明確時，用 DSH 內建的 `ask_user_question` 跳出選項；主動模式收尾閒聊也給互動選項。

## 設定

參數經插件設定卡片配置（儲存後**立即生效**，寫入插件目錄 `config.json`）：

| 欄位 | 預設值 | 說明 |
|---|---|---|
| `mode` | `default` | 說話方式：`proactive`（主動）/ `passive`（被動）/ `default`（均衡） |
| `language` | `zh-TW` | 人設提示詞**與設定卡片**的語言：`zh-TW`（繁體中文）/ `zh-CN`（簡體中文） |
| `selfName` | `我` | DSH 的自稱（強制輸出） |
| `address` | `主人` | DSH 對使用者的稱呼（強制輸出） |

非法值會回退為預設值，舊版遺留的 `memoryPath` 欄位會被忽略。儲存後卡片會顯示「✓ 儲存成功（已立即生效，設定版本 N）」或「✗ 儲存失敗」。

## 記憶

本插件**不再自帶記憶**：不建立、讀取或寫入任何記憶檔案，也不向訊息注入記憶。長期記憶請使用外部插件，**推薦使用 `dsh-meow-memory`**；人設提示詞只保留「嚴禁編造記憶」的說明。

## 貢獻

歡迎提交 issue 與 PR：

- 🐛 遇到問題：提交 issue，附重現步驟、瀏覽器與 dsh 版本；
- 💡 功能建議：說明期待效果即可；
- 🔧 程式碼貢獻：純 JavaScript、無建置、零執行期依賴；改動請保持 `package.json` 的 `dsh.bundle` 與 `cordis.patch.yml` 完整。

## License

MIT License
