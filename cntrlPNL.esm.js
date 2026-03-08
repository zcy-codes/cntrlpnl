// cntrlPNL — ES Module build
// Usage: import { cntrlPNL } from 'https://cdn.jsdelivr.net/gh/zcy-codes/cntrlpnl@main/cntrlPNL.esm.js'

const _states = [];
export { _states as pnlStates };

let _tip = null;
const getTip = () => {
    if (!_tip) {
        _tip = document.createElement('div');
        _tip.style = 'position:fixed;background:#1a1a1e;border:1px solid var(--accent,#0f0);color:#ccc;padding:6px 10px;font-size:10px;z-index:200000;visibility:hidden;pointer-events:none;max-width:180px;line-height:1.5;font-family:monospace;';
        document.body.appendChild(_tip);
    }
    return _tip;
};

const hexToRgb = h => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
const rgbToHex = (r,g,b) => '#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const isHex   = h => /^#[0-9a-fA-F]{6}$/.test(h);
const rgbToHsl = (r,g,b) => {
    r/=255; g/=255; b/=255;
    const mx=Math.max(r,g,b), mn=Math.min(r,g,b); let h,s; const l=(mx+mn)/2;
    if(mx===mn){h=s=0;}else{const d=mx-mn; s=l>.5?d/(2-mx-mn):d/(mx+mn);
        switch(mx){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}}
    return {h:h*360,s:s*100,l:l*100};
};
const hslToRgb = (h,s,l) => {
    h/=360; s/=100; l/=100;
    const hue2=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<.5)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;};
    if(s===0)return {r:Math.round(l*255),g:Math.round(l*255),b:Math.round(l*255)};
    const q=l<.5?l*(1+s):l+s-l*s, p=2*l-q;
    return {r:Math.round(hue2(p,q,h+1/3)*255),g:Math.round(hue2(p,q,h)*255),b:Math.round(hue2(p,q,h-1/3)*255)};
};

const normalize = config => {
    if (config.ui || config.controls) {
        const ui       = config.ui || {};
        const controls = config.controls || [];
        const extractDefaults = items => {
            const state = {};
            const walk = list => list.forEach(item => {
                if (item.key !== undefined && item.default !== undefined)
                    state[item.key] = item.default;
                if (item.children) walk(item.children);
                if (item.tabs) item.tabs.forEach(t => walk(t.children || []));
            });
            walk(items);
            return state;
        };
        return {
            title:     ui.title     || 'Panel',
            theme:     { accent: ui.accent },
            collapsed: ui.collapsed || false,
            closeKey:  ui.closeKey  || null,
            state:     extractDefaults(controls),
            layout:    controls,
        };
    }
    return config;
};

const injectCSS = () => {
    if (document.getElementById('pnl-css')) return;
    const s = document.createElement('style'); s.id='pnl-css';
    s.innerHTML = `
    .pnl-main { position:fixed;right:20px;width:256px;background:#1f1f22;border:1px solid #2e2e33;font-family:ui-monospace,'SF Mono','Cascadia Code',monospace;font-size:11px;color:#c8c8d0;z-index:10000;box-shadow:0 8px 32px rgba(0,0,0,.6); }
    .pnl-body { overflow:hidden;max-height:2000px;transition:max-height .35s cubic-bezier(.4,0,.2,1),opacity .25s ease;opacity:1;overflow-y:auto;overflow-x:hidden; }
    .pnl-body::-webkit-scrollbar{width:3px}.pnl-body::-webkit-scrollbar-thumb{background:#333}
    .pnl-main.is-minimized .pnl-body{max-height:0!important;opacity:0;pointer-events:none;overflow:hidden}
    .pnl-head{display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 10px;height:30px;background:#17171a;border-bottom:1px solid #2e2e33;user-select:none}
    .pnl-title{font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--accent);opacity:.9}
    .p-btn{color:#555;cursor:pointer;font-size:11px;padding:4px;transition:color .1s}.p-btn:hover{color:var(--accent)}
    .pnl-row{display:grid;grid-template-columns:72px 1fr;align-items:center;min-height:28px;padding:0 8px 0 10px;gap:6px;border-bottom:1px solid #28282d}
    .pnl-label{font-size:10px;color:#888;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:default}
    .pnl-label.has-tip{cursor:help}.pnl-label.has-tip:hover{color:var(--accent)}
    .pnl-ctrls{display:flex;align-items:center;gap:5px;min-width:0;justify-content:flex-end}
    .pnl-sep{padding:4px 8px 4px 10px;min-height:22px;display:flex;align-items:center;background:#1a1a1d;border-bottom:1px solid #2e2e33;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:#555}
    .pnl-slider-row{padding:5px 8px 6px 10px;border-bottom:1px solid #28282d}
    .pnl-slider-top{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:5px}
    .pnl-slider-lbl{font-size:10px;color:#888}
    .pnl-num-input{font-size:10px;color:var(--accent);font-family:inherit;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;text-align:right;width:52px;cursor:ns-resize;padding:0}
    .pnl-num-input:focus{cursor:text;border-bottom-color:var(--accent)}
    input[type=range]{display:block;width:100%;height:2px;-webkit-appearance:none;appearance:none;background:#333;cursor:pointer;border-radius:1px;margin:0}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;background:var(--accent);border-radius:50%;box-shadow:0 0 4px var(--accent);cursor:grab}
    input[type=range]::-moz-range-thumb{width:10px;height:10px;border:none;background:var(--accent);border-radius:50%}
    .pnl-toggle{width:28px;height:14px;border-radius:7px;background:#333;border:1px solid #444;cursor:pointer;position:relative;transition:background .15s,border-color .15s;flex-shrink:0}
    .pnl-toggle.on{background:var(--accent);border-color:var(--accent)}
    .pnl-toggle::after{content:'';position:absolute;width:10px;height:10px;border-radius:50%;background:#888;top:1px;left:1px;transition:transform .15s,background .15s}
    .pnl-toggle.on::after{transform:translateX(14px);background:#000}
    .pnl-color-block{border-bottom:1px solid #28282d}
    .pnl-color-head-row{display:grid;grid-template-columns:72px 1fr;align-items:center;min-height:28px;padding:0 8px 0 10px;gap:6px}
    .pnl-color-inline{display:flex;align-items:center;gap:6px;justify-content:flex-end}
    .pnl-color-swatch{width:16px;height:16px;border-radius:2px;border:1px solid #444;flex-shrink:0}
    .pnl-color-hex-inp{flex:1;min-width:0;background:transparent;border:none;border-bottom:1px solid transparent;color:var(--accent);font-size:10px;font-family:inherit;outline:none;text-align:right;cursor:text}
    .pnl-color-hex-inp:focus{border-bottom-color:var(--accent)}
    .pnl-color-extras{padding:7px 10px 9px;background:#17171a;border-top:1px solid #28282d;display:flex;flex-direction:column;gap:7px}
    .pnl-color-canvas{width:100%;height:80px;cursor:crosshair;border-radius:2px;display:block}
    .pnl-color-hue-row{display:flex;align-items:center;gap:6px}
    .pnl-color-hue-slider{flex:1;height:8px;border-radius:4px;cursor:pointer;outline:none;background:linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);-webkit-appearance:none;appearance:none}
    .pnl-color-hue-slider::-webkit-slider-thumb{-webkit-appearance:none;width:10px;height:10px;border-radius:50%;background:#fff;border:1px solid #888;cursor:grab}
    .pnl-color-swatch-lg{width:18px;height:18px;border-radius:2px;border:1px solid #444;flex-shrink:0}
    .pnl-color-opacity-row{display:flex;align-items:center;gap:6px}
    .pnl-color-opacity-track{flex:1;height:8px;border-radius:4px;position:relative;overflow:hidden}
    .pnl-color-opacity-checker{position:absolute;inset:0;background-image:linear-gradient(45deg,#444 25%,transparent 25%),linear-gradient(-45deg,#444 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#444 75%),linear-gradient(-45deg,transparent 75%,#444 75%);background-size:6px 6px;background-position:0 0,0 3px,3px -3px,-3px 0}
    .pnl-color-opacity-grad{position:absolute;inset:0}
    .pnl-color-opacity-range{-webkit-appearance:none;appearance:none;position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;margin:0}
    .pnl-opacity-num{font-size:10px;color:var(--accent);width:32px;text-align:right;background:transparent;border:none;border-bottom:1px solid transparent;outline:none;font-family:inherit;cursor:ns-resize}
    .pnl-opacity-num:focus{cursor:text;border-bottom-color:var(--accent)}
    .pnl-rgb-row-inner{display:flex;gap:4px}
    .pnl-rgb-field{flex:1;display:flex;flex-direction:column;align-items:center;gap:2px}
    .pnl-rgb-lbl{font-size:8px;color:#555;text-transform:uppercase}
    .pnl-rgb-inp{width:100%;background:#2a2a2f;border:1px solid #3a3a40;color:var(--accent);font-size:10px;font-family:inherit;text-align:center;padding:2px 3px;outline:none;border-radius:2px}
    .pnl-rgb-inp:focus{border-color:var(--accent)}
    .pnl-select{flex:1;min-width:0;background:#2a2a2f;border:1px solid #3a3a40;color:#c8c8d0;font-size:10px;font-family:inherit;padding:3px 20px 3px 7px;cursor:pointer;outline:none;appearance:none;-webkit-appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='4'%3E%3Cpath d='M0 0l3.5 4L7 0z' fill='%23666'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 7px center;border-radius:2px}
    .pnl-select:focus{border-color:var(--accent)}
    .pnl-text-input{flex:1;min-width:0;background:#2a2a2f;border:1px solid #3a3a40;color:var(--accent);font-size:10px;font-family:inherit;padding:3px 7px;outline:none;border-radius:2px}
    .pnl-text-input:focus{border-color:var(--accent)}
    .pnl-stepper{display:flex;align-items:center;gap:4px;flex:1;justify-content:flex-end}
    .pnl-stepper-btn{width:16px;height:16px;border-radius:2px;background:#2a2a2f;border:1px solid #3a3a40;color:#888;font-size:14px;line-height:1;cursor:pointer;user-select:none;display:flex;align-items:center;justify-content:center;transition:border-color .1s,color .1s;flex-shrink:0}
    .pnl-stepper-btn:hover{border-color:var(--accent);color:var(--accent)}
    .pnl-stepper-val{font-size:10px;color:var(--accent);min-width:40px;text-align:right}
    .pnl-action-btn{display:block;width:calc(100% - 16px);margin:5px 8px;padding:6px 10px;background:#2a2a2f;border:1px solid #3a3a40;color:#c8c8d0;font-size:10px;font-family:inherit;font-weight:600;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;text-align:center;border-radius:2px;transition:border-color .15s,color .15s,background .15s}
    .pnl-action-btn:hover{border-color:var(--accent);color:var(--accent);background:#1f1f25}
    .pnl-action-btn:active{opacity:.6}
    .pnl-link,.pnl-popup-tag{display:block;width:calc(100% - 16px);margin:5px 8px;padding:6px 10px;background:#252528;border:1px solid #3a3a40;color:#888;font-size:10px;font-family:inherit;cursor:pointer;text-align:center;border-radius:2px;transition:color .15s,border-color .15s}
    .pnl-link:hover,.pnl-popup-tag:hover{color:var(--accent);border-color:var(--accent)}
    .pnl-folder{border-bottom:1px solid #28282d}
    .f-head{display:flex;align-items:center;justify-content:space-between;padding:0 8px 0 10px;height:26px;background:#1a1a1d;cursor:pointer;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#666;border-bottom:1px solid #28282d;user-select:none;transition:color .1s}
    .f-head:hover{color:#aaa}.f-icon{font-size:9px;opacity:.6}
    .f-body{display:none;border-left:2px solid var(--accent)}.f-body.is-open{display:block}
    .pnl-tab-bar{display:flex;background:#17171a;border-bottom:1px solid #2e2e33}
    .pnl-tab{flex:1;padding:6px 4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;cursor:pointer;color:#444;text-align:center;border-bottom:2px solid transparent;transition:color .12s,border-color .12s;user-select:none}
    .pnl-tab:hover{color:#888}.pnl-tab.is-active{color:var(--accent);border-bottom-color:var(--accent)}
    .pnl-tab-panels{overflow:hidden}.pnl-tab-panel{display:none}.pnl-tab-panel.is-active{display:block}
    .pnl-tab-panel.slide-left{animation:tp-left .18s cubic-bezier(.16,1,.3,1)}
    .pnl-tab-panel.slide-right{animation:tp-right .18s cubic-bezier(.16,1,.3,1)}
    @keyframes tp-left{from{opacity:0;transform:translateX(10px)}to{opacity:1;transform:none}}
    @keyframes tp-right{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:none}}
    .pnl-point2d-wrap{padding:6px 8px 7px 10px;border-bottom:1px solid #28282d}
    .pnl-point2d-top{display:flex;align-items:center;gap:5px;margin-bottom:5px}
    .pnl-point2d-lbl{font-size:10px;color:#888;flex:1}
    .pnl-xy-inp{width:52px;background:#2a2a2f;border:1px solid #3a3a40;color:var(--accent);font-size:10px;font-family:inherit;padding:2px 5px;outline:none;text-align:center;border-radius:2px;cursor:ns-resize}
    .pnl-xy-inp:focus{border-color:var(--accent);cursor:text}
    .pnl-xy-label{font-size:9px;color:#555}
    .pnl-point2d-pad{position:relative;width:100%;height:90px;background:#17171a;border:1px solid #2e2e33;cursor:crosshair;border-radius:2px;overflow:hidden}
    .pnl-point2d-axis{position:absolute;background:#2a2a2f;pointer-events:none}
    .pnl-point2d-axis.v{left:50%;top:0;width:1px;height:100%}
    .pnl-point2d-axis.h{top:50%;left:0;height:1px;width:100%}
    .pnl-point2d-handle{position:absolute;width:8px;height:8px;background:var(--accent);border-radius:50%;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 0 6px var(--accent)}
    .pnl-modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.8);display:none;align-items:center;justify-content:center;z-index:150000}
    .pnl-modal{background:#1f1f22;border:1px solid var(--accent);padding:20px;width:300px;font-family:ui-monospace,monospace}
    .pnl-modal h3{color:var(--accent);font-size:11px;text-transform:uppercase;margin-bottom:10px}
    .pnl-modal p{font-size:10px;color:#888;line-height:1.6;margin-bottom:14px}
    .pnl-modal-btns{display:flex;gap:8px;flex-wrap:wrap;border-top:1px solid #2e2e33;padding-top:12px}
    .pnl-modal-btn{background:#2a2a2f;border:1px solid #3a3a40;color:#c8c8d0;padding:5px 10px;cursor:pointer;font-size:10px;font-family:inherit;border-radius:2px}
    .pnl-modal-btn:hover{border-color:var(--accent);color:var(--accent)}
    `;
    document.head.appendChild(s);
};

/**
 * Create a cntrlPNL panel.
 *
 * @param {object} config  - Panel config object (new ui/controls format or legacy title/state/layout)
 * @param {number} [index] - Index for window.pnlStates (defaults to next available slot)
 * @returns {Proxy} The reactive state object for this panel
 *
 * @example
 * import { cntrlPNL } from 'https://cdn.jsdelivr.net/gh/zcy-codes/cntrlpnl@main/cntrlPNL.esm.js'
 *
 * const state = cntrlPNL({
 *   ui: { title: 'scene', accent: '#00ff88' },
 *   controls: [
 *     { type: 'slider', key: 'speed', default: 50, min: 0, max: 100 },
 *     { type: 'toggle', key: 'paused', default: false },
 *   ]
 * })
 *
 * // read state anywhere
 * requestAnimationFrame(() => {
 *   mesh.rotation.y += state.speed * 0.01
 * })
 */
export function cntrlPNL(rawConfig, index) {
    injectCSS();

    const config = normalize(rawConfig);
    const { title, state={}, layout=[], theme={}, collapsed=false, closeKey=null } = config;

    // default index to next slot
    if (index === undefined) index = _states.length;

    const accent = theme.accent || '#00ff88';
    const bindings = new Map();
    const proxy = new Proxy(state, {
        set(t,p,v){ t[p]=v; bindings.get(p)?.forEach(fn=>fn(v)); return true; }
    });
    _states[index] = proxy;

    const win = document.createElement('div');
    win.className = `pnl-main${collapsed?' is-minimized':''}`;
    win.style.setProperty('--accent', accent);
    win.innerHTML = `<div class="pnl-head"><span class="pnl-title">${title}</span><span class="p-btn">${collapsed?'▸':'▾'}</span></div><div class="pnl-body"></div>`;
    document.body.appendChild(win);

    const tip = getTip();

    const showModal = m => {
        const ov=document.createElement('div'); ov.className='pnl-modal-overlay'; ov.style.display='flex';
        ov.innerHTML=`<div class="pnl-modal"><h3>${m.title}</h3><p>${m.text||''}</p><div class="pnl-modal-btns"></div></div>`;
        m.buttons.forEach(b=>{ const btn=document.createElement('button'); btn.className='pnl-modal-btn'; btn.innerText=b.label; btn.onclick=()=>{if(b.action==='close')ov.remove();if(b.action==='popup')showModal(b.config);}; ov.querySelector('.pnl-modal-btns').appendChild(btn); });
        document.body.appendChild(ov);
    };

    const bind = (key,fn) => { if(!bindings.has(key))bindings.set(key,[]); bindings.get(key).push(fn); };

    const makeScrub = (el, getVal, setVal, step, min, max) => {
        const dec = String(step).includes('.') ? String(step).split('.')[1].length : 0;
        const clamp = v => Math.min(max??Infinity, Math.max(min??-Infinity, parseFloat(v.toFixed(dec+4))));
        let startY, startV, moved;
        el.addEventListener('mousedown', e => {
            if (document.activeElement===el) return;
            e.preventDefault();
            startY=e.clientY; startV=getVal(); moved=false;
            const onMove = e => { if(Math.abs(e.clientY-startY)>2) moved=true; setVal(clamp(startV+(startY-e.clientY)*step)); };
            const onUp   = () => { window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp); if(!moved){el.focus();el.select();} };
            window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp);
        });
        el.addEventListener('change', e => { const v=parseFloat(e.target.value); if(!isNaN(v)) setVal(clamp(v)); });
        el.addEventListener('keydown', e => { if(e.key==='Enter') el.blur(); });
    };

    const addTip = (el,text) => {
        el.addEventListener('mouseenter', ()=>{ tip.innerText=text; tip.style.visibility='visible'; });
        el.addEventListener('mousemove', e=>{ const tw=180,vw=window.innerWidth; let lx=e.clientX+14; if(lx+tw>vw)lx=e.clientX-tw-8; tip.style.left=lx+'px'; tip.style.top=(e.clientY-10)+'px'; });
        el.addEventListener('mouseleave', ()=>tip.style.visibility='hidden');
    };

    const buildColorPicker = (item, container) => {
        const modes=item.modes||[]; const hasBox=modes.includes('box'),hasSlider=modes.includes('slider'),hasOpacity=modes.includes('opacity'),hasRgb=modes.includes('rgb'),hasExtras=hasBox||hasSlider||hasOpacity||hasRgb;
        let currentHex=proxy[item.key]||'#ff0000',opacity=1,hue=0;
        const {r:ir,g:ig,b:ib}=hexToRgb(currentHex); hue=rgbToHsl(ir,ig,ib).h;
        const block=document.createElement('div'); block.className='pnl-color-block';
        const headRow=document.createElement('div'); headRow.className='pnl-color-head-row';
        const rowLbl=document.createElement('div'); rowLbl.className='pnl-label'; rowLbl.innerText=item.label||item.key;
        if(item.info){rowLbl.classList.add('has-tip');addTip(rowLbl,item.info);}
        const inlineWrap=document.createElement('div'); inlineWrap.className='pnl-color-inline';
        const swatch=document.createElement('div'); swatch.className='pnl-color-swatch'; swatch.style.background=currentHex;
        const hexInp=document.createElement('input'); hexInp.className='pnl-color-hex-inp'; hexInp.type='text'; hexInp.value=currentHex; hexInp.spellcheck=false;
        inlineWrap.append(swatch,hexInp); headRow.append(rowLbl,inlineWrap); block.appendChild(headRow);
        let extras,canvas,ctx,boxHandle,hueSlider,swatchLg,opRange,opNum,opGrad,rInp,gInp,bInp;
        if(hasExtras){
            extras=document.createElement('div'); extras.className='pnl-color-extras';
            if(hasBox){canvas=document.createElement('canvas');canvas.className='pnl-color-canvas';canvas.height=80;boxHandle=document.createElement('div');boxHandle.style.cssText='position:absolute;width:8px;height:8px;border-radius:50%;border:2px solid #fff;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 0 3px rgba(0,0,0,.6);';const cw=document.createElement('div');cw.style.cssText='position:relative;margin-bottom:2px;';cw.append(canvas,boxHandle);extras.appendChild(cw);const drawBox=()=>{const w=canvas.offsetWidth||230,h=canvas.height;canvas.width=w;ctx=canvas.getContext('2d');ctx.fillStyle=`hsl(${hue},100%,50%)`;ctx.fillRect(0,0,w,h);const wg=ctx.createLinearGradient(0,0,w,0);wg.addColorStop(0,'rgba(255,255,255,1)');wg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=wg;ctx.fillRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(0,0,0,1)');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);};const pickBox=e=>{const r=canvas.getBoundingClientRect(),w=r.width,h=r.height;const x=Math.max(0,Math.min(w,e.clientX-r.left)),y=Math.max(0,Math.min(h,e.clientY-r.top));boxHandle.style.left=x+'px';boxHandle.style.top=y+'px';const {r:rr,g:gg,b:bb}=hslToRgb(hue,(x/w)*100,100-(y/h)*50*(1+(1-x/w)));updateDOM(rgbToHex(rr,gg,bb));proxy[item.key]=currentHex;};canvas.addEventListener('mousedown',e=>{drawBox();pickBox(e);const mv=e2=>pickBox(e2);const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);};window.addEventListener('mousemove',mv);window.addEventListener('mouseup',up);});requestAnimationFrame(drawBox);}
            if(hasSlider){const hr=document.createElement('div');hr.className='pnl-color-hue-row';swatchLg=document.createElement('div');swatchLg.className='pnl-color-swatch-lg';swatchLg.style.background=currentHex;hueSlider=document.createElement('input');hueSlider.type='range';hueSlider.className='pnl-color-hue-slider';hueSlider.min=0;hueSlider.max=360;hueSlider.step=1;hueSlider.value=Math.round(hue);hueSlider.oninput=e=>{hue=parseInt(e.target.value);const {r,g,b}=hexToRgb(currentHex);const {s,l}=rgbToHsl(r,g,b);const {r:nr,g:ng,b:nb}=hslToRgb(hue,s,l);updateDOM(rgbToHex(nr,ng,nb));proxy[item.key]=currentHex;};hr.append(swatchLg,hueSlider);extras.appendChild(hr);}
            if(hasOpacity){const or=document.createElement('div');or.className='pnl-color-opacity-row';const track=document.createElement('div');track.className='pnl-color-opacity-track';const checker=document.createElement('div');checker.className='pnl-color-opacity-checker';opGrad=document.createElement('div');opGrad.className='pnl-color-opacity-grad';opGrad.style.background=`linear-gradient(to right,transparent,${currentHex})`;opRange=document.createElement('input');opRange.type='range';opRange.className='pnl-color-opacity-range';opRange.min=0;opRange.max=1;opRange.step=0.01;opRange.value=1;opNum=document.createElement('input');opNum.className='pnl-opacity-num';opNum.type='text';opNum.value='1.00';opRange.oninput=e=>{opacity=parseFloat(e.target.value);opNum.value=opacity.toFixed(2);if(item.onOpacity)item.onOpacity(opacity);};track.append(checker,opGrad,opRange);or.append(track,opNum);extras.appendChild(or);}
            if(hasRgb){const {r,g,b}=hexToRgb(currentHex);const rgbEl=document.createElement('div');rgbEl.className='pnl-rgb-row-inner';const mkF=(l,v)=>{const f=document.createElement('div');f.className='pnl-rgb-field';const lb=document.createElement('span');lb.className='pnl-rgb-lbl';lb.innerText=l;const i=document.createElement('input');i.className='pnl-rgb-inp';i.type='text';i.value=v;f.append(lb,i);return{f,i};};const {f:rf,i:ri}=mkF('R',r);const {f:gf,i:gi}=mkF('G',g);const {f:bf,i:bi}=mkF('B',b);rInp=ri;gInp=gi;bInp=bi;const syncRgb=()=>{const rv=parseInt(rInp.value),gv=parseInt(gInp.value),bv=parseInt(bInp.value);if(![rv,gv,bv].some(isNaN)){updateDOM(rgbToHex(rv,gv,bv));proxy[item.key]=currentHex;}};[rInp,gInp,bInp].forEach(i=>{i.addEventListener('change',syncRgb);i.addEventListener('keydown',e=>{if(e.key==='Enter')syncRgb();});});rgbEl.append(rf,gf,bf);extras.appendChild(rgbEl);}
            block.appendChild(extras);
        }
        const updateDOM=hex=>{currentHex=hex;swatch.style.background=hex;if(document.activeElement!==hexInp)hexInp.value=hex;if(hueSlider){const {r,g,b}=hexToRgb(hex);const {h}=rgbToHsl(r,g,b);hue=h;hueSlider.value=Math.round(h);}if(swatchLg)swatchLg.style.background=hex;if(rInp){const {r,g,b}=hexToRgb(hex);if(document.activeElement!==rInp)rInp.value=r;if(document.activeElement!==gInp)gInp.value=g;if(document.activeElement!==bInp)bInp.value=b;}if(opGrad)opGrad.style.background=`linear-gradient(to right,transparent,${hex})`;};
        hexInp.addEventListener('change',e=>{const v=e.target.value.trim();if(isHex(v)){updateDOM(v);proxy[item.key]=currentHex;}else hexInp.value=currentHex;});
        hexInp.addEventListener('keydown',e=>{if(e.key==='Enter'){const v=hexInp.value.trim();if(isHex(v)){updateDOM(v);proxy[item.key]=currentHex;}hexInp.blur();}});
        bind(item.key,v=>updateDOM(v));
        container.appendChild(block);
    };

    const addTabs = (item, container) => {
        const bar=document.createElement('div'); bar.className='pnl-tab-bar';
        const panels=document.createElement('div'); panels.className='pnl-tab-panels';
        let active=0; const tabEls=[],panelEls=[];
        const activate=i=>{const dir=i>active?'slide-left':'slide-right';tabEls.forEach((t,ti)=>t.classList.toggle('is-active',ti===i));panelEls.forEach((p,pi)=>{p.classList.remove('is-active','slide-left','slide-right');if(pi===i){p.classList.add('is-active');if(i!==active)p.classList.add(dir);}});active=i;};
        item.tabs.forEach((tab,i)=>{const t=document.createElement('div');t.className=`pnl-tab${i===0?' is-active':''}`;t.innerText=tab.label;t.onclick=()=>activate(i);bar.appendChild(t);tabEls.push(t);const p=document.createElement('div');p.className=`pnl-tab-panel${i===0?' is-active':''}`;tab.children.forEach(c=>addRow(c,p));panels.appendChild(p);panelEls.push(p);});
        container.appendChild(bar); container.appendChild(panels);
    };

    const addRow = (item, container) => {
        if(item.type==='tabs'){addTabs(item,container);return;}
        if(item.type==='color'){buildColorPicker(item,container);return;}
        if(item.type==='button'){const btn=document.createElement('button');btn.className='pnl-action-btn';btn.innerText=item.label;btn.onclick=()=>item.onClick&&item.onClick(proxy);container.appendChild(btn);return;}
        if(item.type==='link'||item.type==='popup'){const btn=document.createElement('button');btn.className=item.type==='link'?'pnl-link':'pnl-popup-tag';btn.innerText=item.label;btn.onclick=()=>item.type==='link'?window.open(item.url,'_blank'):showModal(item.config);container.appendChild(btn);return;}
        if(item.type==='folder'){const f=document.createElement('div');f.className='pnl-folder';const fh=document.createElement('div');fh.className='f-head';fh.innerHTML=`<span>${item.label}</span><span class="f-icon">▸</span>`;const fb=document.createElement('div');fb.className='f-body';fh.onclick=()=>{const o=fb.classList.toggle('is-open');fh.querySelector('.f-icon').innerText=o?'▾':'▸';updateStack();};item.children.forEach(c=>addRow(c,fb));f.appendChild(fh);f.appendChild(fb);container.appendChild(f);return;}
        if(item.type==='text'){const sep=document.createElement('div');sep.className='pnl-sep';sep.innerText=item.label;container.appendChild(sep);return;}
        if(item.type==='point2d'){
            const xR=item.xRange||[-1,1],yR=item.yRange||[-1,1];
            const toPercX=v=>((v-xR[0])/(xR[1]-xR[0]))*100,toPercY=v=>(1-(v-yR[0])/(yR[1]-yR[0]))*100;
            const fromPX=p=>xR[0]+(p/100)*(xR[1]-xR[0]),fromPY=p=>yR[1]-(p/100)*(yR[1]-yR[0]);
            const fmtXY=v=>v.toFixed(2);
            const wrap=document.createElement('div');wrap.className='pnl-point2d-wrap';
            const top=document.createElement('div');top.className='pnl-point2d-top';
            const lbl=document.createElement('span');lbl.className='pnl-point2d-lbl';lbl.innerText=item.label||item.key;
            const xLbl=document.createElement('span');xLbl.className='pnl-xy-label';xLbl.innerText='x';
            const xInp=document.createElement('input');xInp.className='pnl-xy-inp';xInp.type='text';
            const yLbl=document.createElement('span');yLbl.className='pnl-xy-label';yLbl.innerText='y';
            const yInp=document.createElement('input');yInp.className='pnl-xy-inp';yInp.type='text';
            const pad=document.createElement('div');pad.className='pnl-point2d-pad';pad.innerHTML='<div class="pnl-point2d-axis v"></div><div class="pnl-point2d-axis h"></div>';
            const handle=document.createElement('div');handle.className='pnl-point2d-handle';pad.appendChild(handle);
            const cur=proxy[item.key]||{x:0,y:0};
            const setHandle=(x,y)=>{x=Math.max(xR[0],Math.min(xR[1],x));y=Math.max(yR[0],Math.min(yR[1],y));handle.style.left=toPercX(x)+'%';handle.style.top=toPercY(y)+'%';if(document.activeElement!==xInp)xInp.value=fmtXY(x);if(document.activeElement!==yInp)yInp.value=fmtXY(y);};
            xInp.value=fmtXY(cur.x);yInp.value=fmtXY(cur.y);setHandle(cur.x,cur.y);
            const commitXY=()=>{const x=parseFloat(xInp.value),y=parseFloat(yInp.value);if(!isNaN(x)&&!isNaN(y))proxy[item.key]={x,y};};
            xInp.addEventListener('change',commitXY);xInp.addEventListener('keydown',e=>{if(e.key==='Enter')commitXY();});
            yInp.addEventListener('change',commitXY);yInp.addEventListener('keydown',e=>{if(e.key==='Enter')commitXY();});
            const s2d=item.step||0.01;
            makeScrub(xInp,()=>proxy[item.key]?.x??0,v=>{proxy[item.key]={x:v,y:proxy[item.key]?.y??0};},s2d,xR[0],xR[1]);
            makeScrub(yInp,()=>proxy[item.key]?.y??0,v=>{proxy[item.key]={x:proxy[item.key]?.x??0,y:v};},s2d,yR[0],yR[1]);
            const onMove=e=>{const r=pad.getBoundingClientRect();const px=Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100)),py=Math.max(0,Math.min(100,((e.clientY-r.top)/r.height)*100));proxy[item.key]={x:parseFloat(fromPX(px).toFixed(3)),y:parseFloat(fromPY(py).toFixed(3))};};
            pad.onmousedown=e=>{onMove(e);const up=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',up);};window.addEventListener('mousemove',onMove);window.addEventListener('mouseup',up);};
            bind(item.key,v=>setHandle(v.x,v.y));
            top.append(lbl,xLbl,xInp,yLbl,yInp);wrap.appendChild(top);wrap.appendChild(pad);container.appendChild(wrap);return;
        }
        if(item.type==='slider'){
            const step=item.step||1,dec=String(step).includes('.')?String(step).split('.')[1].length:0;
            const fmt=v=>dec>0?Number(v).toFixed(dec):String(Math.round(v));
            const clamp=v=>Math.min(item.max??100,Math.max(item.min??0,v));
            const block=document.createElement('div');block.className='pnl-slider-row';
            const topRow=document.createElement('div');topRow.className='pnl-slider-top';
            const lbl=document.createElement('span');lbl.className='pnl-slider-lbl';lbl.innerText=item.label||item.key;
            if(item.info)addTip(lbl,item.info);
            const num=document.createElement('input');num.className='pnl-num-input';num.type='text';num.value=fmt(proxy[item.key]??0);
            const range=document.createElement('input');range.type='range';range.min=item.min??0;range.max=item.max??100;range.step=step;range.value=proxy[item.key]??0;
            makeScrub(num,()=>parseFloat(proxy[item.key]??0),v=>{proxy[item.key]=clamp(v);},step,item.min??0,item.max??100);
            range.oninput=e=>{proxy[item.key]=parseFloat(e.target.value);};
            bind(item.key,v=>{range.value=v;num.value=fmt(v);});
            topRow.append(lbl,num);block.append(topRow,range);container.appendChild(block);return;
        }
        const row=document.createElement('div');row.className='pnl-row';
        const lbl=document.createElement('div');lbl.className='pnl-label';lbl.innerText=item.label||item.key;
        const ctrls=document.createElement('div');ctrls.className='pnl-ctrls';
        if(item.info){lbl.classList.add('has-tip');addTip(lbl,item.info);}
        if(item.type==='toggle'){const tog=document.createElement('div');tog.className=`pnl-toggle${proxy[item.key]?' on':''}`;tog.onclick=()=>proxy[item.key]=!proxy[item.key];bind(item.key,v=>tog.classList.toggle('on',!!v));ctrls.appendChild(tog);}
        else if(item.type==='select'){const sel=document.createElement('select');sel.className='pnl-select';Object.entries(item.options).forEach(([val,label])=>{const o=document.createElement('option');o.value=val;o.innerText=label;if(String(proxy[item.key])===String(val))o.selected=true;sel.appendChild(o);});sel.onchange=e=>proxy[item.key]=e.target.value;bind(item.key,v=>sel.value=v);ctrls.appendChild(sel);}
        else if(item.type==='inputtext'){const inp=document.createElement('input');inp.className='pnl-text-input';inp.type='text';inp.value=proxy[item.key]||'';inp.placeholder=item.placeholder||'';inp.oninput=e=>proxy[item.key]=e.target.value;bind(item.key,v=>{if(inp!==document.activeElement)inp.value=v;});ctrls.appendChild(inp);}
        else if(item.type==='stepper'){const min=item.min??-Infinity,max=item.max??Infinity,step=item.step||1;const dec=String(step).includes('.')?String(step).split('.')[1].length:0;const fmt=v=>dec>0?v.toFixed(dec):String(v);const clamp=v=>Math.min(max,Math.max(min,parseFloat(v.toFixed(10))));const wrap=document.createElement('div');wrap.className='pnl-stepper';const dBtn=document.createElement('button');dBtn.className='pnl-stepper-btn';dBtn.innerText='−';const valEl=document.createElement('span');valEl.className='pnl-stepper-val';valEl.innerText=fmt(proxy[item.key]??0);const iBtn=document.createElement('button');iBtn.className='pnl-stepper-btn';iBtn.innerText='+';dBtn.onclick=()=>proxy[item.key]=clamp((proxy[item.key]??0)-step);iBtn.onclick=()=>proxy[item.key]=clamp((proxy[item.key]??0)+step);bind(item.key,v=>valEl.innerText=fmt(v));wrap.append(dBtn,valEl,iBtn);ctrls.appendChild(wrap);}
        row.appendChild(lbl);row.appendChild(ctrls);container.appendChild(row);
    };

    layout.forEach(item => addRow(item, win.querySelector('.pnl-body')));

    const updateStack = () => { let o=20; document.querySelectorAll('.pnl-main').forEach(p=>{ p.style.top=o+'px'; o+=p.offsetHeight+8; }); };
    const toggle = () => {
        const body=win.querySelector('.pnl-body');
        const minimizing=!win.classList.contains('is-minimized');
        if(minimizing){ body.style.maxHeight=body.scrollHeight+'px'; requestAnimationFrame(()=>{ win.classList.add('is-minimized'); setTimeout(updateStack,360); }); }
        else { win.classList.remove('is-minimized'); setTimeout(updateStack,360); }
        win.querySelector('.p-btn').innerText=minimizing?'▸':'▾';
    };
    win.querySelector('.p-btn').onclick=toggle;
    if(closeKey) window.addEventListener('keydown',e=>{ if(e.key===closeKey)toggle(); });
    setTimeout(updateStack,50);

    return proxy;
}

export default cntrlPNL;
