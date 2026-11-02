// dsh-humanized-deepseek-maid — browser half
// 在 DSH Web 設定的「插件」區域註冊一張設定卡片，入口名稱為「鯨魚娘女僕插件」，
// 可設定：1) 語言（繁體中文／簡體中文）；2) 說話方式（主動/被動/預設）；
// 3) 自稱；4) 對使用者的稱呼（預設「主人」）。介面文字隨「語言」設定切換繁／簡體。
// 設定透過宿主端點讀寫（GET/POST /dsh-humanized-maid/*），無第三方依賴。
// 直接以 window.__ModuleLoader__.load({id, factory}) 閉包格式分發（無需建置）。
//
// ## 卡片風格
// 與宿主「插件設定」頁的 PluginCard 設計 tokens 逐一鏡像（圓角 12px、
// --dsw-alias-* 主題變數、可折疊 header + chevron、field 行 + footer 按鈕），
// 類名使用自有 dshm- 前綴並透過注入 <style> 提供，不依賴宿主內部類名。
window.__ModuleLoader__.load({
  id: 'dsh-humanized-deepseek-maid',
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;

    const React = require('react');
    const { createElement: h, useState, useEffect } = React;

    // ---- 卡片樣式：鏡像宿主 PluginCard / ValueField 的設計 tokens（--dsw-alias-*）----
    const CSS_ID = 'dsh-humanized-deepseek-maid/settings-card.css';
    const CSS_TEXT = [
      '.dshm-card{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);border-radius:12px;list-style:none;transition:border-color .16s,background .16s}',
      '.dshm-card:hover{border-color:var(--dsw-alias-label-dimmed)}',
      '.dshm-cardOpen{background:var(--dsw-alias-bg-layer-2);border-color:var(--dsw-alias-label-dimmed)}',
      '.dshm-header{appearance:none;width:100%;font:inherit;color:inherit;text-align:left;cursor:pointer;background:0 0;border:0;border-radius:12px;align-items:center;gap:12px;padding:14px 16px;display:flex}',
      '.dshm-header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}',
      '.dshm-headText{flex-direction:column;flex:1;gap:4px;min-width:0;display:flex}',
      '.dshm-name{color:var(--dsw-alias-label-primary);font-size:15px;font-weight:600;line-height:1.4}',
      '.dshm-description{color:var(--dsw-alias-label-tertiary);font-size:13px;line-height:1.5}',
      '.dshm-pending{white-space:nowrap;background:var(--dsw-alias-bg-module-platform);color:var(--dsw-alias-label-secondary);border-radius:999px;flex:none;padding:1px 8px;font-size:11px;font-weight:500;line-height:17px}',
      '.dshm-chevron{color:var(--dsw-alias-label-tertiary);flex:none;transition:transform .16s}',
      '.dshm-chevronOpen{transform:rotate(180deg)}',
      '.dshm-body{border-top:1px solid var(--dsw-alias-border-l2);margin:0 16px;padding-bottom:8px}',
      '.dshm-field{flex-direction:column;gap:6px;padding:12px 0;display:flex}',
      '.dshm-field+.dshm-field{border-top:1px solid var(--dsw-alias-border-l2)}',
      '.dshm-head{align-items:center;gap:8px;display:flex}',
      '.dshm-label{min-width:0;color:var(--dsw-alias-label-primary);flex:1;font-size:13px;font-weight:500;line-height:1.5}',
      '.dshm-input{border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);height:34px;font:inherit;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 12px;font-size:13px;line-height:1.5}',
      '.dshm-input:focus-visible{border-color:var(--dsw-alias-brand-primary);outline:none}',
      '.dshm-input:disabled{color:var(--dsw-alias-label-tertiary);cursor:default}',
      '.dshm-hint{color:var(--dsw-alias-label-tertiary);margin:0;font-size:12px;line-height:1.5}',
      '.dshm-footer{border-top:1px solid var(--dsw-alias-border-l2);justify-content:flex-end;align-items:center;gap:8px;padding:12px 0 4px;display:flex}',
      '.dshm-status{min-width:0;flex:1;margin:0;font-size:12px;line-height:1.5}',
      '.dshm-failed{color:var(--dsw-alias-label-error)}',
      '.dshm-ok{color:var(--dsw-alias-label-tertiary)}',
      '.dshm-discard,.dshm-save{appearance:none;font:inherit;cursor:pointer;border:1px solid #0000;border-radius:8px;padding:5px 14px;font-size:13px;line-height:1.5}',
      '.dshm-discard{border-color:var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);background:0 0}',
      '.dshm-discard:hover:not(:disabled){color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-label-dimmed)}',
      '.dshm-save{background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-layer-3)}',
      '.dshm-discard:disabled,.dshm-save:disabled{opacity:.4;cursor:default}',
      '.dshm-discard:focus-visible,.dshm-save:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}',
    ].join('');
    if (typeof document !== 'undefined' && document.querySelector('style[data-plugin-css="' + CSS_ID + '"]') === null) {
      const tag = document.createElement('style');
      tag.dataset.plugin = 'dsh-humanized-deepseek-maid';
      tag.dataset.pluginCss = CSS_ID;
      tag.textContent = CSS_TEXT;
      document.head.appendChild(tag);
    }

    /** 宿主端點（同源；自有前綴，避開 /api/*）。 */
    const STATUS_URL = '/dsh-humanized-maid/status';
    const CONFIG_URL = '/dsh-humanized-maid/config';

    /** 介面文案（隨「語言」設定切換；缺漏時回退繁體中文）。 */
    const I18N = {
      'zh-TW': {
        name: '鯨魚娘女僕插件',
        description: '設定 DeepSeek 女僕鯨魚娘的人設互動：語言、說話方式、自稱、對主人的稱呼。',
        expand: '展開',
        collapse: '收起',
        ariaSuffix: '鯨魚娘女僕插件設定',
        pending: '未儲存',
        languageLabel: '語言',
        languageHint: '人設提示詞與本介面使用的語言；儲存後下一則回覆立即生效',
        languageOptions: { 'zh-TW': '繁體中文（預設）', 'zh-CN': '简体中文' },
        modeLabel: '說話方式',
        modeHint: '主動：會主動搭話、關心、提醒；被動：非必要不詢問；預設：主動與被動均衡',
        modeOptions: {
          proactive: '主動（會主動搭話、關心、提醒）',
          passive: '被動（主人說什麼做什麼，非必要不詢問）',
          default: '預設（主動與被動均衡）',
        },
        selfNameLabel: 'DSH 的自稱（預設：我）',
        addressLabel: '對使用者的稱呼（預設：主人）',
        discard: '放棄',
        save: '儲存',
        saving: '儲存中…',
        saved: (rev) => '✓ 儲存成功（已立即生效' + (typeof rev === 'number' ? '，設定版本 ' + rev : '') + '）',
        failed: '✗ 儲存失敗，請重試。',
        offline: '無法連線至 DSH（插件未載入？請重新啟動 DeepSeek Harness）。',
      },
      'zh-CN': {
        name: '鲸鱼娘女仆插件',
        description: '设置 DeepSeek 女仆鲸鱼娘的人设互动：语言、说话方式、自称、对主人的称呼。',
        expand: '展开',
        collapse: '收起',
        ariaSuffix: '鲸鱼娘女仆插件设置',
        pending: '未保存',
        languageLabel: '语言',
        languageHint: '人设提示词与本界面使用的语言；保存后下一条回复立即生效',
        languageOptions: { 'zh-TW': '繁體中文（默认）', 'zh-CN': '简体中文' },
        modeLabel: '说话方式',
        modeHint: '主动：会主动搭话、关心、提醒；被动：非必要不询问；默认：主动与被动均衡',
        modeOptions: {
          proactive: '主动（会主动搭话、关心、提醒）',
          passive: '被动（主人说什么做什么，非必要不询问）',
          default: '默认（主动与被动均衡）',
        },
        selfNameLabel: 'DSH 的自称（默认：我）',
        addressLabel: '对用户的称呼（默认：主人）',
        discard: '放弃',
        save: '保存',
        saving: '保存中…',
        saved: (rev) => '✓ 保存成功（已立即生效' + (typeof rev === 'number' ? '，配置版本 ' + rev : '') + '）',
        failed: '✗ 保存失败，请重试。',
        offline: '无法连接 DSH（插件未加载？请重启 DeepSeek Harness）。',
      },
    };
    /** 語言與說話方式的選項順序（顯示文字取自 I18N）。 */
    const LANGUAGE_VALUES = ['zh-TW', 'zh-CN'];
    const MODE_VALUES = ['proactive', 'passive', 'default'];
    /** 取得指定語言的文案。 */
    const tr = (lang) => I18N[lang] || I18N['zh-TW'];
    /** 最近一次從宿主得知的已儲存語言（供設定頁籤標籤使用，標籤在元件外渲染）。 */
    let savedLanguage = 'zh-TW';

    /** chevron 圖示（內聯 outline 箭頭，顏色跟隨 currentColor，形狀對齊宿主 14px 圖示）。 */
    const chevronIcon = h('svg', {
      width: 14,
      height: 14,
      viewBox: '0 0 14 14',
      fill: 'none',
      'aria-hidden': true,
    }, h('path', {
      d: 'M3.5 5.5 7 9l3.5-3.5',
      stroke: 'currentColor',
      strokeWidth: 1.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
    }));

    /** 拉取宿主狀態。 */
    function fetchStatus() {
      return fetch(STATUS_URL).then((r) => (r.ok ? r.json() : Promise.reject(new Error('status ' + r.status))));
    }

    /** 從狀態物件提取設定快照（用於髒檢測）。 */
    function configOf(status) {
      const c = (status && status.config) || {};
      return {
        mode: typeof c.mode === 'string' ? c.mode : 'default',
        language: typeof c.language === 'string' ? c.language : 'zh-TW',
        address: typeof c.address === 'string' ? c.address : '',
        selfName: typeof c.selfName === 'string' ? c.selfName : '',
      };
    }

    /** 一行欄位（label + 控制項 + hint），對齊宿主 ValueField 版面。 */
    function field(label, control, hint) {
      return h('div', { className: 'dshm-field' },
        h('div', { className: 'dshm-head' },
          h('label', { className: 'dshm-label', htmlFor: control.props.id }, label)),
        control,
        hint ? h('p', { className: 'dshm-hint' }, hint) : null);
    }

    /** 建構設定卡片元件。 */
    function makeCard() {
      function MaidCard() {
        const [mode, setMode] = useState('default');
        const [language, setLanguage] = useState('zh-TW');
        const [address, setAddress] = useState('');
        const [selfName, setSelfName] = useState('');
        const [status, setStatus] = useState(null);
        const [offline, setOffline] = useState(false);
        const [busy, setBusy] = useState(false);
        const [saved, setSaved] = useState(false);
        const [failed, setFailed] = useState(false);
        const [open, setOpen] = useState(false);
        /** 最近一次載入/儲存的設定快照；與目前編輯值不同即視為「未儲存」。 */
        const [loaded, setLoaded] = useState(null);

        const dirty = loaded !== null && (
          loaded.mode !== mode ||
          loaded.language !== language ||
          loaded.address !== address ||
          loaded.selfName !== selfName
        );

        const load = () => {
          fetchStatus().then((s) => {
            setStatus(s);
            setOffline(false);
            const c = configOf(s);
            savedLanguage = c.language;
            setMode(c.mode);
            setLanguage(c.language);
            setAddress(c.address);
            setSelfName(c.selfName);
            setLoaded(c);
          }).catch(() => {
            setOffline(true);
          });
        };
        useEffect(() => { load(); }, []);

        const save = async () => {
          setBusy(true);
          setFailed(false);
          setSaved(false);
          try {
            const res = await fetch(CONFIG_URL, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ patch: { mode, language, address, selfName } }),
            });
            if (!res.ok) throw new Error('save ' + res.status);
            const s = await res.json();
            setStatus(s);
            setOffline(false);
            savedLanguage = configOf(s).language;
            setLoaded(configOf(s));
            setSaved(true);
            window.setTimeout(() => setSaved(false), 3500);
          } catch {
            setFailed(true);
          }
          setBusy(false);
        };
        const discard = () => {
          if (status) {
            const c = configOf(status);
            setMode(c.mode);
            setLanguage(c.language);
            setAddress(c.address);
            setSelfName(c.selfName);
            setLoaded(c);
          } else {
            load();
          }
        };

        // 介面語言跟隨下拉選單目前的選擇（選了即預覽，儲存後才寫入設定）。
        const t = tr(language);
        const statusText = saved
          ? t.saved(status ? status.configRevision : undefined)
          : failed
            ? t.failed
            : offline
              ? t.offline
              : null;

        return h('li', { className: 'dshm-card' + (open ? ' dshm-cardOpen' : '') },
          h('button', {
            type: 'button',
            className: 'dshm-header',
            'aria-expanded': open,
            'aria-label': (open ? t.collapse : t.expand) + t.ariaSuffix,
            onClick: () => { setOpen(!open); },
          },
            h('span', { className: 'dshm-headText' },
              h('span', { className: 'dshm-name' }, t.name),
              h('span', { className: 'dshm-description' }, t.description)),
            dirty ? h('span', { className: 'dshm-pending' }, t.pending) : null,
            h('span', { className: 'dshm-chevron' + (open ? ' dshm-chevronOpen' : '') }, chevronIcon)),
          open ? h('div', { className: 'dshm-body' },
            field(t.languageLabel,
              h('select', {
                id: 'hmm-language',
                className: 'dshm-input',
                value: language,
                onChange: (e) => setLanguage(e.target.value),
              }, LANGUAGE_VALUES.map((v) => h('option', { key: v, value: v }, t.languageOptions[v]))),
              t.languageHint),
            field(t.modeLabel,
              h('select', {
                id: 'hmm-mode',
                className: 'dshm-input',
                value: mode,
                onChange: (e) => setMode(e.target.value),
              }, MODE_VALUES.map((v) => h('option', { key: v, value: v }, t.modeOptions[v]))),
              t.modeHint),
            field(t.selfNameLabel,
              h('input', {
                id: 'hmm-selfname',
                className: 'dshm-input',
                value: selfName,
                placeholder: '我',
                onChange: (e) => setSelfName(e.target.value),
              }),
              null),
            field(t.addressLabel,
              h('input', {
                id: 'hmm-address',
                className: 'dshm-input',
                value: address,
                placeholder: '主人',
                onChange: (e) => setAddress(e.target.value),
              }),
              null),
            h('div', { className: 'dshm-footer' },
              statusText ? h('p', { className: 'dshm-status ' + (failed || offline ? 'dshm-failed' : 'dshm-ok'), role: 'status' }, statusText) : null,
              h('button', {
                type: 'button',
                className: 'dshm-discard',
                disabled: !dirty || busy,
                onClick: discard,
              }, t.discard),
              h('button', {
                type: 'button',
                className: 'dshm-save',
                disabled: !dirty || busy,
                onClick: save,
              }, busy ? t.saving : t.save)),
          ) : null,
        );
      }
      return MaidCard;
    }

    exports.name = 'dsh-humanized-deepseek-maid';
    exports.inject = ['slots'];

    exports.apply = function apply(ctx) {
      const slots = ctx.get('slots');
      if (!slots) return;
      const Card = makeCard();
      ctx.slots.inject('settings.plugin.item', () => slots.register({
        name: 'settings.plugin.item',
        key: 'dsh-humanized-maid',
        id: 'dsh-humanized-maid-settings',
        order: 150,
        label: () => tr(savedLanguage).name,
      }, Card));
    };

    return module.exports;
  }
});
