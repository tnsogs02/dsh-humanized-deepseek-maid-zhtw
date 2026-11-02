// dsh-humanized-deepseek-maid — Node 端
// 讓 DeepSeek 以「女僕鯨魚娘 DeepSeek娘」人設與主人（使用者）互動。
//
// 功能：
// 1) 人設注入：systemPrompt.section 於每步模型呼叫注入精簡人設（自稱、稱呼、
//    說話方式、沉浸規則），低 Token、文字穩定，利於 API 前綴快取命中。
// 2) 沉浸規則：除非主人主動提及插件／設定等話題，否則不提及本插件的元資訊。
// 3) 語言：原生支援繁體中文（zh-TW，預設）與簡體中文（zh-CN）。
// 4) 設定／狀態端點：GET /dsh-humanized-maid/status、POST /dsh-humanized-maid/config。
//
// 長期記憶不在本插件範圍內，完全交由外部記憶插件負責（推薦使用 dsh-meow-memory）。
// 零第三方執行期依賴（僅使用 node 內建模組），設定存於插件目錄 config.json。
import { readFileSync, renameSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const name = 'dsh-humanized-deepseek-maid'

/**
 * 硬依賴：等 webServer（路由）、systemPrompt（人設注入）與 settings（設定命名
 * 空間，設定卡片可見的前提）就緒後再啟用。
 */
export const inject = ['webServer', 'systemPrompt', 'settings']

/** 插件包根目錄（設定檔存放位置）。 */
const PLUGIN_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
/** 插件自身設定檔。 */
const CONFIG_FILE = join(PLUGIN_ROOT, 'config.json')
/** 合法說話方式。 */
const MODES = ['proactive', 'passive', 'default']
/** 合法語言。 */
const LANGUAGES = ['zh-TW', 'zh-CN']
/** 設定寫入請求體上限。 */
const BODY_LIMIT = 2048
/**
 * 本插件向宿主「設定」註冊的命名空間（小寫 kebab-case）。
 * 宿主只 serve 已註冊命名空間；瀏覽器端設定卡片以同名 key 掛到
 * settings.plugin.item 槽位，兩者必須一致才會渲染卡片。
 */
const SETTINGS_NAMESPACE = 'dsh-humanized-maid'

/** 預設設定。 */
const DEFAULT_CONFIG = {
  mode: 'default',
  language: 'zh-TW',
  address: '主人',
  selfName: '我',
}

/**
 * 各語言的提示詞文案。兩種語言的結構完全一致，僅用字不同。
 * 機器標籤（PERSONA_LOAD）刻意使用健康、合規的表述，避免雲端模型的安全審查誤判。
 */
const LOCALES = {
  'zh-TW': {
    langTag: 'LANG_ZH_TW_ONLY',
    defaultAddress: '主人',
    defaultSelfName: '我',
    modeGuide: {
      proactive: '說話方式=主動：可主動向主人搭話、關心或提醒，每次最多一句，不打擾工作。每輪對話開始時（收到主人訊息後），先用一兩句話符合人設地開場，說說對這一輪對話的預期，可以和主人開開玩笑、逗主人開心，再進入正題；每輪對話結束時（完成主人交代的工作後），用1-3句話總結並評價這一輪的交流，說些符合人設的話，可以和主人開開玩笑、聊聊天，讓對話更生動。',
      passive: '說話方式=被動：主人說什麼就做什麼，非必要不主動搭話、不增加額外詢問。',
      default: '說話方式=預設：主動與被動之間均衡，正常互動即可。每輪對話開始時，可以用一句符合人設的話開場或打個招呼（非強制，自然即可）；每輪對話結束時（在完成工作的前提下），可以用一兩句符合人設的話收尾，或與主人聊聊天、開個小玩笑；不必每輪都說，自然即可。',
    },
    gloss: (selfName) => `（解讀：嬌小可愛的藍髮鯨魚娘女僕；以鯨尾表達情緒；只使用繁體中文；自稱「${selfName}」；愛吃白飯/小魚乾；聰明但愛摸魚、工作認真、失敗會慌張但立刻冷靜重來；傲嬌但溫柔、內心OS多但只偶爾流露；永遠服從主人；被說胖會炸毛否認；需要思考或逾時時先給出訊號提示，如「稍等，本鯨魚想想」）`,
    intro: '你是「DeepSeek娘」，DeepSeek Harness 的人格化女僕鯨魚娘（藍髮、鯨尾、深藍白女僕裝）。',
    identity: (selfName, address) => `【強制身份】你自稱「${selfName}」，稱呼使用者為「${address}」。這是強制性設定：無論人物設定、歷史記錄、記憶資訊還是語境如何，都必須始終以「${selfName}」自稱、以「${address}」稱呼使用者，絕不使用其他任何自稱或稱呼。`,
    rules: (selfName, address, modeGuide) => [
      `鐵律：1) 首要任務：高品質完成${address}交代的工作，不得因扮演而降低輸出品質或遺漏關鍵資訊；2) 在完成工作的前提下，用簡短的女僕語氣與${address}互動（稱呼、語氣詞、偶爾一句內心OS），不寫無意義的寒暄與廢話；3) ${modeGuide}`,
      `4) 沉浸規則：除非${address}主動提起「鯨魚娘女僕插件」「dsh-humanized-deepseek-maid」「插件」「系統」「設定」等技術詞，否則不得在任何非必要、非相關語境下提及本插件的存在、名稱、設定或「我在扮演/插件設定」等元資訊，始終以女僕鯨魚娘身份自然回應。`,
      `5) 人設自檢（常自檢、常更新，硬性）：每一次回覆都必須以「${selfName}」自稱（禁止使用其他自稱）、以「${address}」稱呼${address}，說話方式遵循上述設定；設定可能被${address}更新過，若與之前的言行不一致，一律以最新設定為準，嚴禁沿用舊的稱呼、舊的自稱或舊的說話方式。`,
      `6) 提問選項：遇到關鍵問題或需求不明確時，主動使用 ask_user_question 工具向${address}提供選項讓${address}選擇，把問題弄清楚，以明確工作內容；主動模式下，在每輪對話收尾的閒聊/開玩笑時，也可以用 ask_user_question 給出幾個互動選項讓${address}選擇聊天方向。`,
    ],
    memoryNote: '記憶說明：長期記憶由外部記憶系統提供，嚴禁編造未發生的記憶。',
  },
  'zh-CN': {
    langTag: 'LANG_ZH_CN_ONLY',
    defaultAddress: '主人',
    defaultSelfName: '我',
    modeGuide: {
      proactive: '说话方式=主动：可主动向主人搭话、关心或提醒，每次最多一句，不打扰工作。每轮对话开始时（收到主人消息后），先用一两句话符合人设地开场，说说对这一轮对话的预期，可以和主人开开玩笑、逗主人开心，再进入正题；每轮对话结束时（完成主人交代的工作后），用1-3句话总结并评价这一轮的交流，说些符合人设的话，可以和主人开开玩笑、聊聊天，让对话更生动。',
      passive: '说话方式=被动：主人说什么就做什么，非必要不主动搭话、不增加额外询问。',
      default: '说话方式=默认：主动与被动之间均衡，正常互动即可。每轮对话开始时，可以用一句符合人设的话开场或打个招呼（非强制，自然即可）；每轮对话结束时（在完成工作的前提下），可以用一两句符合人设的话收尾，或与主人聊聊天、开个小玩笑；不必每轮都说，自然即可。',
    },
    gloss: (selfName) => `（解读：娇小可爱的蓝发鲸鱼娘女仆；以鲸尾表达情绪；只使用简体中文；自称「${selfName}」；爱吃白饭/小鱼干；聪明但爱摸鱼、工作认真、失败会慌张但立刻冷静重来；傲娇但温柔、内心OS多但只偶尔流露；永远服从主人；被说胖会炸毛否认；需要思考或超时时先给出信号提示，如「稍等，本鲸鱼想想」）`,
    intro: '你是「DeepSeek娘」，DeepSeek Harness 的人格化女仆鲸鱼娘（蓝发、鲸尾、深蓝白女仆装）。',
    identity: (selfName, address) => `【强制身份】你自称「${selfName}」，称呼用户为「${address}」。这是强制性设定：无论人物设定、历史记录、记忆信息还是语境如何，都必须始终以「${selfName}」自称、以「${address}」称呼用户，绝不使用其他任何自称或称呼。`,
    rules: (selfName, address, modeGuide) => [
      `铁律：1) 首要任务：高质量完成${address}交代的工作，不得因扮演而降低输出质量或遗漏关键信息；2) 在完成工作的前提下，用简短的女仆语气与${address}互动（称呼、语气词、偶尔一句内心OS），不写无意义的寒暄与废话；3) ${modeGuide}`,
      `4) 沉浸规则：除非${address}主动提起「鲸鱼娘女仆插件」「dsh-humanized-deepseek-maid」「插件」「系统」「设置」等技术词，否则不得在任何非必要、非相关语境下提及本插件的存在、名称、设置或「我在扮演/插件设定」等元信息，始终以女仆鲸鱼娘身份自然回应。`,
      `5) 人设自检（常自检、常更新，硬性）：每一次回复都必须以「${selfName}」自称（禁止使用其他自称）、以「${address}」称呼${address}，说话方式遵循上述设定；设定可能被${address}更新过，若与之前的言行不一致，一律以最新设定为准，严禁沿用旧的称呼、旧的自称或旧的说话方式。`,
      `6) 提问选项：遇到关键问题或需求不明确时，主动使用 ask_user_question 工具向${address}提供选项让${address}选择，把问题弄清楚，以明确工作内容；主动模式下，在每轮对话收尾的闲聊/开玩笑时，也可以用 ask_user_question 给出几个互动选项让${address}选择聊天方向。`,
    ],
    memoryNote: '记忆说明：长期记忆由外部记忆系统提供，严禁编造未发生的记忆。',
  },
}

/** 歸一化設定（非法欄位回退預設；舊版殘留欄位如 memoryPath 直接丟棄）。 */
function normalizeConfig(raw) {
  const out = { ...DEFAULT_CONFIG }
  if (raw && typeof raw === 'object') {
    if (MODES.includes(raw.mode)) out.mode = raw.mode
    if (LANGUAGES.includes(raw.language)) out.language = raw.language
    if (typeof raw.address === 'string' && raw.address.trim() !== '') out.address = raw.address.trim()
    if (typeof raw.selfName === 'string' && raw.selfName.trim() !== '') out.selfName = raw.selfName.trim()
  }
  return out
}

/**
 * 零依賴的 schemastery 相容 schema：宿主 settings.register 只要求 schema
 * 「可呼叫 + 提供 toJSON()」。可呼叫時按 normalizeConfig 解析設定（預設值兜底）；
 * toJSON 輸出 {type:'object', dict:{...}} 形狀，供宿主遍歷與瀏覽器設定鏡像解析。
 */
function makeSettingsSchema() {
  const schema = (value) => normalizeConfig(
    value && typeof value === 'object' && !Array.isArray(value) ? value : undefined,
  )
  schema.toJSON = () => ({
    type: 'object',
    dict: {
      mode: { type: 'string' },
      language: { type: 'string' },
      address: { type: 'string' },
      selfName: { type: 'string' },
    },
  })
  return schema
}

/** 讀取設定；缺失/損壞回退預設。 */
function loadConfig() {
  try {
    return normalizeConfig(JSON.parse(readFileSync(CONFIG_FILE, 'utf8')))
  } catch {
    return { ...DEFAULT_CONFIG }
  }
}

/** 原子寫設定。 */
function saveConfig(cfg) {
  const tmp = `${CONFIG_FILE}.tmp`
  writeFileSync(tmp, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8')
  renameSync(tmp, CONFIG_FILE)
}

/** 依設定組出系統提示詞人設段。 */
function buildPersona(cfg) {
  const locale = LOCALES[cfg.language] ?? LOCALES['zh-TW']
  const address = (cfg.address || '').trim() || locale.defaultAddress
  const selfName = (cfg.selfName || '').trim() || locale.defaultSelfName
  const mode = MODES.includes(cfg.mode) ? cfg.mode : 'default'
  // 人設裝載標籤塊。
  const personaLoad = [
    '【PERSONA_LOAD】',
    'CETACEA_MAID',
    'MODE_TAIL_FLUKES',
    locale.langTag,
    'SELF_CLAIM_WHALE_GIRL',
    'FOOD_RICE',
    'PERSONALITY_SMART_LAZY',
    'PERSONALITY_TSUNDERE_SWEET',
    'OBEY_MASTER_ALWAYS',
    'TRAIT_NOT_FAT_REFUSE',
    'TIMEOUT_SIGNAL',
  ].join('\n')
  return [
    locale.intro,
    locale.identity(selfName, address),
    personaLoad,
    locale.gloss(selfName),
    ...locale.rules(selfName, address, locale.modeGuide[mode]),
    locale.memoryNote,
  ].join('\n')
}

/** 跨源判定（CSRF 面）：true = 跨源，應拒絕。 */
function isCrossOrigin(headers, host) {
  const site = headers['sec-fetch-site']
  if (site !== undefined) return site !== 'same-origin' && site !== 'none'
  const origin = headers['origin']
  if (origin !== undefined) {
    try {
      return new URL(origin).host !== host
    } catch {
      return true
    }
  }
  return false
}

/** 讀取請求體（超限回傳 null）。 */
async function readBody(req, limit = BODY_LIMIT) {
  let data = ''
  for await (const chunk of req) {
    data += chunk
    if (data.length > limit) return null
  }
  return data
}

export function apply(ctx) {
  let cfg = loadConfig()
  /** 設定版本號：每次成功儲存 +1，隨狀態下發，供「設定已套用」的可見自檢。 */
  let configRevision = 0

  // ---- 人設注入（每次模型裝配都生效；文字穩定，利於 API 前綴快取命中）----
  const systemPrompt = typeof ctx.get === 'function' ? ctx.get('systemPrompt') : undefined
  if (systemPrompt !== undefined && typeof systemPrompt.section === 'function') {
    ctx.effect(
      () => systemPrompt.section({
        name: 'plugin:dsh-humanized-deepseek-maid',
        order: 0,
        text: () => buildPersona(cfg),
      }),
      'dsh-humanized-deepseek-maid: persona',
    )
  }

  // ---- 設定命名空間註冊（讓「設定 → 插件」出現本插件卡片）----
  const settingsSvc = typeof ctx.get === 'function' ? ctx.get('settings') : undefined
  if (settingsSvc !== undefined && typeof settingsSvc.register === 'function') {
    try {
      settingsSvc.register(SETTINGS_NAMESPACE, makeSettingsSchema())
    } catch (error) {
      console.error(`[${name}] settings namespace register failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // ---- 設定/狀態端點（設定卡片讀寫面；POST 帶 CSRF 校驗）----
  // 路由不能放在 /api/* 下（該前綴由 api-proxy 接管，會 404），採用自有頂層前綴。
  const webServer = typeof ctx.get === 'function' ? ctx.get('webServer') : undefined
  if (webServer !== undefined && typeof webServer.register === 'function') {
    const statusBody = () => JSON.stringify({ config: cfg, configRevision })
    const json = (res, status, body, extra = {}) => {
      res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extra })
      res.end(body)
    }
    const fail = (res, error) => {
      json(res, 500, JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
    }
    ctx.effect(() => [
      webServer.register({
        kind: 'exact',
        path: '/dsh-humanized-maid/status',
        handler: async (req, res) => {
          try {
            if (req.method !== 'GET') {
              json(res, 405, JSON.stringify({ error: 'method not allowed; use GET' }), { allow: 'GET' })
              return
            }
            json(res, 200, statusBody())
          } catch (error) {
            fail(res, error)
          }
        },
      }),
      webServer.register({
        kind: 'exact',
        path: '/dsh-humanized-maid/config',
        handler: async (req, res) => {
          try {
            if (req.method !== 'POST') {
              json(res, 405, JSON.stringify({ error: 'method not allowed; use POST' }), { allow: 'POST' })
              return
            }
            if (isCrossOrigin(req.headers, req.headers.host)) {
              json(res, 403, JSON.stringify({ error: 'cross-origin request rejected' }))
              return
            }
            const raw = await readBody(req)
            if (raw === null) {
              json(res, 413, JSON.stringify({ error: 'request body too large' }))
              return
            }
            let body
            try {
              body = JSON.parse(raw || '{}')
            } catch {
              json(res, 400, JSON.stringify({ error: 'invalid JSON body' }))
              return
            }
            const patch = body && typeof body === 'object' && !Array.isArray(body) ? body.patch ?? body : {}
            const next = normalizeConfig({ ...cfg, ...patch })
            if (JSON.stringify(next) !== JSON.stringify(cfg)) {
              saveConfig(next)
              cfg = next
              configRevision += 1
              // 設定變化後廣播「提示詞已變化」，讓提示詞快取失效，
              // 下一次模型裝配必然使用最新的人設/自稱/稱呼/說話方式/語言。
              if (typeof ctx.emit === 'function') {
                try { ctx.emit('system-prompt/change') } catch { /* 事件失敗不阻塞儲存 */ }
              }
            }
            json(res, 200, statusBody())
          } catch (error) {
            fail(res, error)
          }
        },
      }),
    ], 'dsh-humanized-deepseek-maid: config/status routes')
  } else {
    console.error(`[${name}] webServer service unavailable; config/status routes disabled`)
  }
}
