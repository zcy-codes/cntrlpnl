/* cntrlPNL v3.6 ESM — https://github.com/zcy-codes/cntrlpnl */

export const pnlStates = [];
    window.pnlStates = pnlStates;
    /* ─── Global tooltip ──────────────────────────────────────────────── */
    const tip = document.createElement('div');
    tip.style = 'position:fixed;background:#1a1a1e;border:1px solid #555;color:#ccc;padding:6px 10px;font-size:10px;z-index:200000;visibility:hidden;pointer-events:none;max-width:180px;line-height:1.5;font-family:\'Geist Mono\',ui-monospace,monospace;';
    document.body.appendChild(tip);

    /* ─── Hex / RGB helpers ───────────────────────────────────────────── */
    const hexToRgb = h => ({ r: parseInt(h.slice(1,3),16), g: parseInt(h.slice(3,5),16), b: parseInt(h.slice(5,7),16) });
    const rgbToHex = (r,g,b) => '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
    const isHex   = h => /^#[0-9a-fA-F]{6}$/.test(h);
    /* hsl <-> rgb */
    const rgbToHsl = (r,g,b) => { r/=255;g/=255;b/=255; const mx=Math.max(r,g,b),mn=Math.min(r,g,b); let h,s,l=(mx+mn)/2; if(mx===mn){h=s=0;}else{const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);switch(mx){case r:h=((g-b)/d+(g<b?6:0))/6;break;case g:h=((b-r)/d+2)/6;break;default:h=((r-g)/d+4)/6;}} return {h:h*360,s:s*100,l:l*100}; };
    const hslToRgb = (h,s,l) => { h/=360;s/=100;l/=100; const hue2rgb=(p,q,t)=>{if(t<0)t+=1;if(t>1)t-=1;if(t<1/6)return p+(q-p)*6*t;if(t<1/2)return q;if(t<2/3)return p+(q-p)*(2/3-t)*6;return p;}; let r,g,b; if(s===0){r=g=b=l;}else{const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;r=hue2rgb(p,q,h+1/3);g=hue2rgb(p,q,h);b=hue2rgb(p,q,h-1/3);} return {r:Math.round(r*255),g:Math.round(g*255),b:Math.round(b*255)}; };

    const builder = (config, index) => {
        const { title, state={}, layout=[], theme={}, collapsed=false, closeKey=null, width=260 } = config;

        if (!document.getElementById('pnl-css')) {
            const s = document.createElement('style');
            s.id = 'pnl-css';
            s.innerHTML = `
            @import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@300;400;500;600;700&display=swap');

            .pnl-main {
                position:fixed; right:20px; width:var(--pnl-width,260px);
                background:var(--pnl-bg); border:1px solid var(--pnl-border);
                font-family:'Geist Mono',ui-monospace,'SF Mono','Cascadia Code',monospace;
                font-size:11px; color:var(--pnl-text); z-index:10000;
                border-radius:4px; overflow:hidden;
                box-shadow:0 2px 6px rgba(0,0,0,.5),0 12px 40px rgba(0,0,0,.6);
            }
            .pnl-body {
                overflow-y:auto; overflow-x:hidden;
                max-height:2000px; opacity:1;
                transition:max-height .3s cubic-bezier(.4,0,.2,1),opacity .2s ease;
            }
            .pnl-body::-webkit-scrollbar { width:4px; }
            .pnl-body::-webkit-scrollbar-thumb { background:#444; border-radius:99px; }
            .pnl-body::-webkit-scrollbar-thumb:hover { background:#555; }
            .pnl-main.is-minimized .pnl-body { max-height:0!important; opacity:0; pointer-events:none; overflow:hidden; }

            .pnl-head {
                display:flex; align-items:center; justify-content:space-between;
                padding:0 10px 0 12px; height:32px;
                background:var(--pnl-bg-head); border-bottom:1px solid var(--pnl-border); user-select:none;
            }
            .pnl-title { font-size:10px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--accent); opacity:.85; }
            .p-btn { color:#555; cursor:pointer; font-size:10px; padding:4px; transition:color .1s; line-height:1; }
            .p-btn:hover { color:var(--accent); }

            .pnl-row {
                display:grid; grid-template-columns:80px 1fr;
                align-items:center; min-height:32px;
                padding:0 10px 0 12px; gap:8px;
                border-bottom:1px solid var(--pnl-border-row);
            }
            .pnl-label { font-size:10px; color:var(--pnl-label); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; cursor:default; letter-spacing:.01em; }
            .pnl-label.has-tip { cursor:help; }
            .pnl-label.has-tip:hover { color:var(--accent); }
            .pnl-ctrls { display:flex; align-items:center; gap:5px; min-width:0; justify-content:flex-end; }

            .pnl-sep {
                padding:0 12px; min-height:24px; display:flex; align-items:center; gap:8px;
                background:var(--pnl-bg-head); border-top:1px solid var(--pnl-border); border-bottom:1px solid var(--pnl-border-row);
                font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:.14em; color:#555;
            }
            .pnl-sep::before, .pnl-sep::after { content:''; flex:1; height:1px; background:var(--pnl-border-row); }

            /* ── Slider ── */
            .pnl-slider-row { padding:6px 10px 7px 12px; border-bottom:1px solid var(--pnl-border-row); }
            .pnl-slider-top { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
            .pnl-slider-track-wrap { position:relative; height:16px; display:flex; align-items:center; }
            .pnl-slider-track-wrap input[type=range] {
                -webkit-appearance:none; appearance:none;
                width:100%; height:3px; margin:0; background:var(--pnl-border-row);
                border-radius:99px; cursor:pointer; position:relative; z-index:1;
                outline:none;
            }
            .pnl-slider-track-wrap input[type=range]::-webkit-slider-thumb {
                -webkit-appearance:none; width:12px; height:12px;
                background:#e0e0e0; border-radius:50%; border:none; cursor:grab;
                box-shadow:0 1px 3px rgba(0,0,0,.6);
            }
            .pnl-slider-track-wrap input[type=range]:active::-webkit-slider-thumb { cursor:grabbing; }
            .pnl-slider-track-wrap input[type=range]::-moz-range-thumb {
                width:12px; height:12px; border:none; background:#e0e0e0;
                border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,.6);
            }
            .pnl-slider-track-wrap input[type=range]::-moz-range-track {
                background:transparent; height:3px;
            }
            .pnl-slider-fill { position:absolute; left:0; height:3px; background:var(--accent); border-radius:99px; pointer-events:none; z-index:0; opacity:.7; }

            /* ── Number inputs ── */
            .pnl-num {
                font-size:10px; color:var(--accent); background:var(--pnl-bg-input);
                border:1px solid var(--pnl-border-row); border-radius:3px; outline:none;
                font-family:inherit; text-align:right; padding:3px 6px; min-width:0;
                transition:border-color .1s;
            }
            .pnl-num:hover { border-color:#555; }
            .pnl-num.wide   { width:52px; cursor:ns-resize; }
            .pnl-num.wide:focus  { cursor:text; border-color:var(--accent); }
            .pnl-num.narrow { width:38px; cursor:ns-resize; }
            .pnl-num.narrow:focus { cursor:text; border-color:var(--accent); }

            /* ── Toggle ── */
            .pnl-toggle {
                width:32px; height:16px; border-radius:99px;
                background:#303030; border:1px solid #444;
                cursor:pointer; position:relative; flex-shrink:0;
                transition:background .15s,border-color .15s;
            }
            .pnl-toggle.on { background:var(--accent); border-color:var(--accent); }
            .pnl-toggle::after {
                content:''; position:absolute; width:12px; height:12px;
                border-radius:50%; background:#888; top:1px; left:1px;
                transition:transform .15s,background .15s;
                box-shadow:0 1px 3px rgba(0,0,0,.4);
            }
            .pnl-toggle.on::after { transform:translateX(16px); background:#fff; }

            /* ── Checkbox ── */
            .pnl-checkbox {
                width:16px; height:16px; border-radius:3px;
                background:var(--pnl-bg-input); border:1px solid var(--pnl-border-row);
                cursor:pointer; position:relative; flex-shrink:0;
                transition:background .12s,border-color .12s;
            }
            .pnl-checkbox.on { background:var(--accent); border-color:var(--accent); }
            .pnl-checkbox::after {
                content:''; position:absolute;
                left:3px; top:4px;
                width:8px; height:4px;
                border-left:1.5px solid transparent;
                border-bottom:1.5px solid transparent;
                transform:rotate(-45deg);
                transition:border-color .12s;
            }
            .pnl-checkbox.on::after { border-color:#000; }

            /* ── Color picker ── */
            .pnl-color-block { border-bottom:1px solid var(--pnl-border-row); }
            .pnl-color-head-row { display:grid; grid-template-columns:80px 1fr; align-items:center; min-height:32px; padding:0 10px 0 12px; gap:8px; overflow:hidden; }
            .pnl-color-inline { display:flex; align-items:center; gap:6px; justify-content:flex-end; min-width:0; overflow:hidden; }
            .pnl-color-swatch { width:16px; height:16px; border-radius:3px; border:none; box-shadow:inset 0 0 0 1px rgba(0,0,0,.5),inset 0 0 0 2px rgba(255,255,255,.04); flex-shrink:0; }
            .pnl-color-hex-inp {
                flex:1; min-width:0; width:0; background:var(--pnl-bg-input); border:1px solid var(--pnl-border-row); border-radius:3px;
                color:var(--accent); font-size:10px; font-family:inherit; outline:none;
                text-align:right; padding:3px 6px; cursor:text; transition:border-color .1s;
            }
            .pnl-color-hex-inp:hover { border-color:#555; }
            .pnl-color-hex-inp:focus { border-color:var(--accent); }
            .pnl-color-expander-inner { padding:8px 10px 10px; background:var(--pnl-bg-input); border-top:1px solid var(--pnl-border-row); display:flex; flex-direction:column; gap:8px; }
            .pnl-color-canvas { width:100%; height:80px; cursor:crosshair; border-radius:3px; display:block; }
            .pnl-color-hue-row { display:flex; align-items:center; gap:7px; }
            .pnl-color-hue-slider {
                flex:1; height:8px; border-radius:99px; cursor:pointer; outline:none;
                background:linear-gradient(to right,#f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);
                -webkit-appearance:none; appearance:none;
            }
            .pnl-color-hue-slider::-webkit-slider-thumb {
                -webkit-appearance:none; width:12px; height:12px; border-radius:50%;
                background:#fff; border:1px solid #888; cursor:grab;
                box-shadow:0 1px 3px rgba(0,0,0,.5);
            }
            .pnl-color-swatch-lg { width:18px; height:18px; border-radius:3px; border:none; box-shadow:inset 0 0 0 1px rgba(0,0,0,.5),inset 0 0 0 2px rgba(255,255,255,.04); flex-shrink:0; }
            .pnl-color-opacity-row { display:flex; align-items:center; gap:7px; }
            .pnl-color-opacity-track { flex:1; height:8px; border-radius:99px; position:relative; overflow:hidden; }
            .pnl-color-opacity-checker {
                position:absolute; inset:0;
                background-image:linear-gradient(45deg,#444 25%,transparent 25%),linear-gradient(-45deg,#444 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#444 75%),linear-gradient(-45deg,transparent 75%,#444 75%);
                background-size:6px 6px; background-position:0 0,0 3px,3px -3px,-3px 0;
            }
            .pnl-color-opacity-grad { position:absolute; inset:0; }
            .pnl-color-opacity-input { -webkit-appearance:none; appearance:none; position:absolute; inset:0; width:100%; height:100%; opacity:0; cursor:pointer; margin:0; }
            .pnl-color-opacity-input::-webkit-slider-thumb { -webkit-appearance:none; width:12px; height:12px; }
            .pnl-opacity-num {
                font-size:10px; color:var(--accent); width:34px; text-align:right;
                background:var(--pnl-bg-input); border:1px solid var(--pnl-border-row); border-radius:3px;
                outline:none; font-family:inherit; padding:3px 4px; cursor:ew-resize; transition:border-color .1s;
            }
            .pnl-opacity-num:hover { border-color:#555; }
            .pnl-opacity-num:focus { cursor:text; border-color:var(--accent); }
            .pnl-rgb-row-inner { display:flex; gap:4px; }
            .pnl-rgb-field { flex:1; display:flex; flex-direction:column; align-items:center; gap:3px; }
            .pnl-rgb-lbl { font-size:8px; color:var(--pnl-label); text-transform:uppercase; letter-spacing:.08em; }
            .pnl-rgb-inp {
                width:100%; background:var(--pnl-bg-input); border:1px solid var(--pnl-border-row); border-radius:3px;
                color:var(--accent); font-size:10px; font-family:inherit;
                text-align:center; padding:3px; outline:none; transition:border-color .1s;
            }
            .pnl-rgb-inp:hover { border-color:#555; }
            .pnl-rgb-inp:focus { border-color:var(--accent); }

            /* ── Select / List ── */
            .pnl-select, .pnl-list {
                flex:1; min-width:0; background:var(--pnl-bg-input); border:1px solid var(--pnl-border-row); color:var(--pnl-text);
                font-size:10px; font-family:inherit; padding:4px 20px 4px 7px; cursor:pointer;
                outline:none; appearance:none; -webkit-appearance:none; border-radius:3px;
                background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='7' height='4'%3E%3Cpath d='M0 0l3.5 4L7 0z' fill='%23666'/%3E%3C/svg%3E");
                background-repeat:no-repeat; background-position:right 7px center;
                transition:border-color .1s;
            }
            .pnl-select:hover, .pnl-list:hover { border-color:#555; }
            .pnl-select:focus, .pnl-list:focus { border-color:var(--accent); }

            /* ── Text input ── */
            .pnl-text-input {
                flex:1; min-width:0; background:var(--pnl-bg-input); border:1px solid var(--pnl-border-row); border-radius:3px;
                color:var(--accent); font-size:10px; font-family:inherit;
                padding:4px 7px; outline:none; transition:border-color .1s;
            }
            .pnl-text-input:hover { border-color:#555; }
            .pnl-text-input:focus { border-color:var(--accent); }

            /* ── Stepper ── */
            .pnl-stepper { display:flex; align-items:center; gap:4px; flex:1; justify-content:flex-end; }
            .pnl-stepper-btn {
                width:18px; height:18px; border-radius:3px;
                background:var(--pnl-bg-head); border:1px solid var(--pnl-border-row);
                color:#777; font-size:14px; line-height:1; cursor:pointer; user-select:none;
                display:flex; align-items:center; justify-content:center;
                transition:border-color .1s,color .1s,background .1s; flex-shrink:0;
            }
            .pnl-stepper-btn:hover { border-color:var(--accent); color:var(--accent); background:var(--pnl-bg); }
            .pnl-stepper-val { font-size:10px; color:var(--accent); min-width:40px; text-align:right; background:var(--pnl-bg-input); border:1px solid var(--pnl-border-row); border-radius:3px; outline:none; font-family:inherit; padding:2px 5px; cursor:ns-resize; transition:border-color .1s; }
            .pnl-stepper-val:hover { border-color:#555; }
            .pnl-stepper-val:focus { cursor:text; border-color:var(--accent); }

            /* ── Action button ── */
            .pnl-action-btn {
                display:block; width:calc(100% - 16px); margin:6px 8px;
                padding:6px 10px; background:var(--pnl-bg-head); border:1px solid var(--pnl-border-row); color:var(--pnl-text);
                font-size:9px; font-family:inherit; font-weight:700;
                text-transform:uppercase; letter-spacing:.1em;
                cursor:pointer; text-align:center; border-radius:3px;
                transition:border-color .15s,color .15s,background .15s;
            }
            .pnl-action-btn:hover { border-color:var(--accent); color:var(--accent); background:#202020; }
            .pnl-action-btn:active { opacity:.6; }

            /* ── Link / popup ── */
            .pnl-link, .pnl-popup-tag {
                display:block; width:calc(100% - 16px); margin:6px 8px; padding:6px 10px;
                background:var(--pnl-bg); border:1px solid var(--pnl-border); color:#666; font-size:10px;
                font-family:inherit; cursor:pointer; text-align:center; border-radius:3px;
                transition:color .15s,border-color .15s;
            }
            .pnl-link:hover, .pnl-popup-tag:hover { color:var(--accent); border-color:var(--accent); }

            .pnl-folder { border-bottom:1px solid var(--pnl-border-row); }
            .f-head {
                display:flex; align-items:center; justify-content:space-between;
                padding:0 10px 0 12px; height:28px; background:var(--pnl-bg-head); cursor:pointer;
                font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.09em;
                color:#666; border-bottom:1px solid var(--pnl-border-row); user-select:none; transition:color .1s;
            }
            .f-head:hover { color:#aaa; }
            .f-icon { font-size:9px; opacity:.7; }
            .f-body {
                display:grid; grid-template-rows:0fr;
                transition:grid-template-rows .25s cubic-bezier(.4,0,.2,1);
                border-left:2px solid var(--accent);
            }
            .f-body.is-open { grid-template-rows:1fr; }
            .f-body-inner { min-height:0; overflow:hidden; }

            /* ── Tabs ── */
            .pnl-tab-bar { display:flex; background:var(--pnl-bg-input); border-bottom:1px solid var(--pnl-border-row); }
            .pnl-tab {
                flex:1; padding:9px 4px; font-size:9px; font-weight:700; text-transform:uppercase;
                letter-spacing:.07em; cursor:pointer; color:#4a4a4a; text-align:center;
                border-bottom:2px solid transparent; transition:color .12s,border-color .12s; user-select:none;
            }
            .pnl-tab:hover { color:#888; }
            .pnl-tab.is-active { color:var(--accent); border-bottom-color:var(--accent); }
            .pnl-tab-panels { overflow:hidden; }
            .pnl-tab-panel { display:none; }
            .pnl-tab-panel.is-active { display:block; }
            .pnl-tab-panel.slide-left  { animation:tp-left  .18s cubic-bezier(.16,1,.3,1); }
            .pnl-tab-panel.slide-right { animation:tp-right .18s cubic-bezier(.16,1,.3,1); }
            @keyframes tp-left  { from{opacity:0;transform:translateX(8px)}  to{opacity:1;transform:none} }
            @keyframes tp-right { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:none} }

            /* ── Segment tabs ── */
            .pnl-seg-bar { display:flex; background:var(--pnl-bg-input); border-bottom:1px solid var(--pnl-border-row); padding:4px 8px; gap:3px; }
            .pnl-seg {
                flex:1; padding:4px; font-size:9px; font-weight:700; text-transform:uppercase;
                letter-spacing:.06em; cursor:pointer; color:#555; text-align:center;
                background:var(--pnl-bg-head); border:1px solid var(--pnl-border); border-radius:3px;
                transition:color .12s,background .12s,border-color .12s; user-select:none;
            }
            .pnl-seg:hover { color:#999; border-color:#555; }
            .pnl-seg.is-active { color:#111; background:var(--accent); border-color:var(--accent); }

            /* ── Point 2D ── */
            .pnl-point2d-wrap { padding:6px 10px 8px 12px; border-bottom:1px solid var(--pnl-border-row); }
            .pnl-point2d-top  { display:flex; align-items:center; gap:6px; margin-bottom:6px; }
            .pnl-point2d-lbl  { font-size:10px; color:var(--pnl-label); flex:1; }
            .pnl-xy-inp {
                width:54px; background:var(--pnl-bg-input); border:1px solid var(--pnl-border-row); border-radius:3px;
                color:var(--accent); font-size:10px; font-family:inherit; padding:3px 5px; outline:none;
                text-align:center; cursor:ns-resize; transition:border-color .1s;
            }
            .pnl-xy-inp:hover { border-color:#555; }
            .pnl-xy-inp:focus { border-color:var(--accent); cursor:text; }
            .pnl-xy-label { font-size:9px; color:#555; }
            .pnl-point2d-pad {
                position:relative; width:100%; height:100px;
                background:var(--pnl-bg-input); border:1px solid var(--pnl-border);
                cursor:crosshair; overflow:hidden; border-radius:3px;
            }
            .pnl-point2d-canvas { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; }
            /* ── HR ── */
            .pnl-hr { height:1px; background:var(--pnl-border-row); margin:0; border:none; }

            /* ── Screw ── */
            .pnl-screw-canvas { width:36px; height:36px; cursor:ns-resize; flex-shrink:0; }

            /* ── Bezier ── */
            .pnl-bezier-wrap { padding:6px 10px 8px 12px; border-bottom:1px solid var(--pnl-border-row); }
            .pnl-bezier-lbl-row { display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
            .pnl-bezier-canvas { display:block; width:100%; height:100px; background:var(--pnl-bg-input); border:1px solid var(--pnl-border); cursor:crosshair; border-radius:3px; }

            /* ── Console ── */
            .pnl-console-wrap { border-bottom:1px solid var(--pnl-border-row); }
            .pnl-console-head { display:flex; align-items:center; justify-content:space-between; padding:5px 10px 5px 12px; }
            .pnl-console-entries { background:var(--pnl-bg-input); max-height:90px; overflow-y:auto; font-size:9px; color:#666; font-family:inherit; }
            .pnl-console-entries::-webkit-scrollbar { width:4px; }
            .pnl-console-entries::-webkit-scrollbar-thumb { background:#444; border-radius:99px; }
            .pnl-console-entries::-webkit-scrollbar-thumb:hover { background:#555; }
            .pnl-console-entry { padding:2px 10px; border-bottom:1px solid var(--pnl-border-row); display:flex; justify-content:space-between; }
            .pnl-console-entry .val { color:var(--accent); }

            /* ── Display ── */
            .pnl-display-wrap { background:var(--pnl-bg-input); border-bottom:1px solid var(--pnl-border-row); padding:6px 10px 6px 12px; font-size:10px; }
            .pnl-display-lbl { color:var(--pnl-label); font-size:9px; margin-bottom:3px; letter-spacing:.05em; text-transform:uppercase; }
            .pnl-display-val { color:var(--accent); white-space:pre-wrap; word-break:break-all; line-height:1.6; }

            /* ── Point N-D ── */
            .pnl-pointnd-wrap { padding:5px 10px 7px 12px; border-bottom:1px solid var(--pnl-border-row); }
            .pnl-pointnd-top  { display:flex; align-items:center; gap:4px; margin-bottom:5px; }
            .pnl-pointnd-lbl  { font-size:10px; color:var(--pnl-label); flex:1; }
            .pnl-pointnd-row  { display:flex; gap:4px; }
            .pnl-pointnd-field{ flex:1; display:flex; flex-direction:column; gap:3px; }
            .pnl-pointnd-axis { font-size:8px; color:var(--pnl-label); text-transform:uppercase; text-align:center; letter-spacing:.08em; }

            /* ── Modal ── */
            .pnl-modal-overlay {
                position:fixed; inset:0; background:rgba(0,0,0,.75);
                backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
                display:none; align-items:center; justify-content:center; z-index:150000;
            }
            .pnl-modal {
                background:var(--pnl-bg); border:1px solid var(--accent); padding:20px; width:300px;
                font-family:'Geist Mono',ui-monospace,monospace; border-radius:4px;
                box-shadow:0 8px 32px rgba(0,0,0,.7);
            }
            .pnl-modal h3 { color:var(--accent); font-size:11px; text-transform:uppercase; letter-spacing:.08em; margin-bottom:10px; }
            .pnl-modal p  { font-size:10px; color:#888; line-height:1.6; margin-bottom:14px; }
            .pnl-modal-btns { display:flex; gap:8px; flex-wrap:wrap; border-top:1px solid var(--pnl-border-row); padding-top:12px; }
            .pnl-modal-btn {
                background:var(--pnl-bg-head); border:1px solid var(--pnl-border-row); color:var(--pnl-text);
                padding:5px 12px; cursor:pointer; font-size:10px; font-family:inherit;
                border-radius:3px; transition:border-color .1s,color .1s;
            }
            .pnl-modal-btn:hover { border-color:var(--accent); color:var(--accent); }
            .p-chevron { transition:transform .2s ease; display:block; }
            .pnl-main.is-minimized .p-chevron { transform:rotate(-90deg); }
            .f-chevron { transition:transform .2s ease; display:block; }
            .f-head.is-open .f-chevron { transform:rotate(180deg); }
            `;
            document.head.appendChild(s);
        }

        const accent = theme.accent || '#00ff88';
        const bindings = new Map();
        const changeCallbacks = new Map(); // key → [onChange fns]
        const proxy = new Proxy(state, {
            set(t, p, v) {
                t[p]=v;
                bindings.get(p)?.forEach(fn=>fn(v));
                changeCallbacks.get(p)?.forEach(fn=>fn({ value:v, key:p }));
                return true;
            }
        });
        window.pnlStates[index] = proxy;

        /* Register an onChange callback for a key */
        const onChange = (key, fn) => {
            if (!changeCallbacks.has(key)) changeCallbacks.set(key,[]);
            changeCallbacks.get(key).push(fn);
        };

        const win = document.createElement('div');
        win.className = `pnl-main${collapsed?' is-minimized':''}`;
        win.style.setProperty('--accent', accent);
        win.style.setProperty('--pnl-width', width + 'px');
        const themeVars = theme || {};
        win.style.setProperty('--pnl-bg',         themeVars.bg        || '#1e1e1e');
        win.style.setProperty('--pnl-bg-head',    themeVars.bgHead    || '#252525');
        win.style.setProperty('--pnl-bg-input',   themeVars.bgInput   || '#1a1a1a');
        win.style.setProperty('--pnl-border',     themeVars.border    || '#333');
        win.style.setProperty('--pnl-border-row', themeVars.borderRow || '#2a2a2a');
        win.style.setProperty('--pnl-text',       themeVars.text      || '#b0b0b0');
        win.style.setProperty('--pnl-label',      themeVars.label     || '#999');
        win.innerHTML = `<div class="pnl-head"><span class="pnl-title">${title}</span><span class="p-btn"><svg class="p-chevron" width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="2,3 5,7 8,3"/></svg></span></div><div class="pnl-body"></div>`;
        document.body.appendChild(win);

        const showModal = m => {
            const ov=document.createElement('div'); ov.className='pnl-modal-overlay'; ov.style.display='flex';
            ov.innerHTML=`<div class="pnl-modal"><h3>${m.title}</h3><p>${m.text||''}</p><div class="pnl-modal-btns"></div></div>`;
            m.buttons.forEach(b=>{ const btn=document.createElement('button'); btn.className='pnl-modal-btn'; btn.innerText=b.label; btn.onclick=()=>{if(b.action==='close')ov.remove();if(b.action==='popup')showModal(b.config);}; ov.querySelector('.pnl-modal-btns').appendChild(btn); });
            document.body.appendChild(ov);
        };

        const bind = (key, fn) => { if(!bindings.has(key)) bindings.set(key,[]); bindings.get(key).push(fn); };

        /* ── Scrub helper (drag left/right = decrease/increase, click = type) ── */
        const makeScrub = (el, getVal, setVal, step, min, max) => {
            const dec = String(step).includes('.') ? String(step).split('.')[1].length : 0;
            const clamp = v => Math.min(max??Infinity, Math.max(min??-Infinity, parseFloat(v.toFixed(dec+4))));
            let startY, startV, moved;
            el.addEventListener('mousedown', e => {
                if (document.activeElement === el) return;
                e.preventDefault();
                startY=e.clientY; startV=getVal(); moved=false;
                const onMove = e => {
                    if (Math.abs(e.clientY - startY) > 2) moved = true;
                    setVal(clamp(startV + (startY - e.clientY) * step));
                };
                const onUp = () => {
                    window.removeEventListener('mousemove', onMove);
                    window.removeEventListener('mouseup', onUp);
                    if (!moved && el.tagName==='INPUT') { el.focus(); el.select(); }
                };
                window.addEventListener('mousemove', onMove);
                window.addEventListener('mouseup', onUp);
            });
            el.addEventListener('change', e => { const v=parseFloat(e.target.value); if(!isNaN(v)) setVal(clamp(v)); });
            el.addEventListener('keydown', e => { if(e.key==='Enter') el.blur(); });
        };

        /* ── Tooltip helper ──────────────────────────────────────────────── */
        const addTip = (el, text) => {
            el.addEventListener('mouseenter', e => { tip.innerText=text; tip.style.visibility='visible'; });
            el.addEventListener('mousemove',  e => { tip.style.left=(e.clientX-200)+'px'; tip.style.top=(e.clientY-8)+'px'; });
            el.addEventListener('mouseleave', () => { tip.style.visibility='hidden'; });
        };

        /* ── Tabs (underline style) or Segments (filled box style) ───────── */
        const addTabs = (item, container) => {
            const isSeg = item.style==='segment';
            const bar=document.createElement('div'); bar.className=isSeg?'pnl-seg-bar':'pnl-tab-bar';
            const panels=document.createElement('div'); panels.className='pnl-tab-panels';
            let active=0; const tabEls=[], panelEls=[];
            const activate = i => {
                const dir=i>active?'slide-left':'slide-right';
                tabEls.forEach((t,ti)=>t.classList.toggle('is-active',ti===i));
                panelEls.forEach((p,pi)=>{ p.classList.remove('is-active','slide-left','slide-right'); if(pi===i){p.classList.add('is-active');if(i!==active)p.classList.add(dir);} });
                active=i;
            };
            item.tabs.forEach((tab,i)=>{
                const t=document.createElement('div'); t.className=`${isSeg?'pnl-seg':'pnl-tab'}${i===0?' is-active':''}`; t.innerText=tab.label; t.onclick=()=>activate(i); bar.appendChild(t); tabEls.push(t);
                const p=document.createElement('div'); p.className=`pnl-tab-panel${i===0?' is-active':''}`; tab.children.forEach(c=>addRow(c,p)); panels.appendChild(p); panelEls.push(p);
            });
            container.appendChild(bar); container.appendChild(panels);
        };

        /* ── Color picker ─────────────────────────────────────────────────── */
        const buildColorPicker = (item, container) => {
            const modes     = item.modes || ['number','slider'];
            const hasBox     = modes.includes('box');
            const hasSlider  = modes.includes('slider');
            const hasOpacity = modes.includes('opacity');
            const hasRgb     = modes.includes('rgb');
            const hasExtras  = hasBox || hasSlider || hasOpacity || hasRgb;

            let currentHex = proxy[item.key] || '#ff0000';
            let opacity = 1.0;
            let hue = 0;

            // ── init hue from starting color ─────────────────────────────
            const {r:ir,g:ig,b:ib}=hexToRgb(currentHex);
            const {h:ih}=rgbToHsl(ir,ig,ib); hue=ih;

            const block = document.createElement('div'); block.className='pnl-color-block';

            // ── Head row: label | swatch + hex ────────────────────────────
            const headRow = document.createElement('div'); headRow.className='pnl-color-head-row';
            const rowLbl  = document.createElement('div'); rowLbl.className='pnl-label'; rowLbl.innerText=item.label||item.key;
            if (item.info) { rowLbl.classList.add('has-tip'); addTip(rowLbl, item.info); }
            const inlineWrap = document.createElement('div'); inlineWrap.className='pnl-color-inline';
            const swatch = document.createElement('div'); swatch.className='pnl-color-swatch'; swatch.style.background=currentHex;
            const hexInp = document.createElement('input'); hexInp.className='pnl-color-hex-inp'; hexInp.type='text'; hexInp.value=currentHex; hexInp.spellcheck=false;
            inlineWrap.append(swatch, hexInp);
            headRow.append(rowLbl, inlineWrap);
            block.appendChild(headRow);

            // ── Extras panel (always visible when modes include them) ─────
            let expanderInner, canvas, ctx, boxHandle, hueSlider, swatchLg, opacityRange, opacityNum, opGrad, rInp, gInp, bInp;

            if (hasExtras) {
                expanderInner = document.createElement('div'); expanderInner.className='pnl-color-expander-inner';

                // ── Box picker ────────────────────────────────────────────
                if (hasBox) {
                    canvas = document.createElement('canvas'); canvas.className='pnl-color-canvas'; canvas.height=80;
                    boxHandle = document.createElement('div');
                    boxHandle.style.cssText='position:absolute;width:8px;height:8px;border-radius:50%;border:2px solid #fff;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 0 3px rgba(0,0,0,.6);';
                    const cWrap=document.createElement('div'); cWrap.style.cssText='position:relative;margin-bottom:4px;';
                    cWrap.append(canvas,boxHandle); expanderInner.appendChild(cWrap);

                    const drawBox = () => {
                        const w=canvas.offsetWidth||230, h=canvas.height; canvas.width=w;
                        ctx=canvas.getContext('2d'); ctx.clearRect(0,0,w,h);
                        ctx.fillStyle=`hsl(${hue},100%,50%)`; ctx.fillRect(0,0,w,h);
                        const wg=ctx.createLinearGradient(0,0,w,0); wg.addColorStop(0,'rgba(255,255,255,1)'); wg.addColorStop(1,'rgba(255,255,255,0)');
                        ctx.fillStyle=wg; ctx.fillRect(0,0,w,h);
                        const bg=ctx.createLinearGradient(0,0,0,h); bg.addColorStop(0,'rgba(0,0,0,0)'); bg.addColorStop(1,'rgba(0,0,0,1)');
                        ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
                    };
                    const pickFromBox = e => {
                        const r=canvas.getBoundingClientRect(), w=r.width, h=r.height;
                        const x=Math.max(0,Math.min(w,e.clientX-r.left));
                        const y=Math.max(0,Math.min(h,e.clientY-r.top));
                        boxHandle.style.left=x+'px'; boxHandle.style.top=y+'px';
                        const sat=(x/w)*100;
                        const lightness=100-(y/h)*50*(1+(1-x/w));
                        const {r:rr,g:gg,b:bb}=hslToRgb(hue,sat,Math.max(0,Math.min(100,lightness)));
                        updateDOM(rgbToHex(rr,gg,bb)); // DOM only, no proxy write
                        proxy[item.key]=currentHex;    // single proxy write
                    };
                    canvas.addEventListener('mousedown', e=>{
                        drawBox(); pickFromBox(e);
                        const mv=e2=>pickFromBox(e2);
                        const up=()=>{window.removeEventListener('mousemove',mv);window.removeEventListener('mouseup',up);};
                        window.addEventListener('mousemove',mv); window.addEventListener('mouseup',up);
                    });
                    // draw once inserted into DOM
                    requestAnimationFrame(drawBox);
                }

                // ── Hue slider ────────────────────────────────────────────
                if (hasSlider) {
                    const hueRow=document.createElement('div'); hueRow.className='pnl-color-hue-row';
                    swatchLg=document.createElement('div'); swatchLg.className='pnl-color-swatch-lg'; swatchLg.style.background=currentHex;
                    hueSlider=document.createElement('input'); hueSlider.type='range'; hueSlider.className='pnl-color-hue-slider';
                    hueSlider.min=0; hueSlider.max=360; hueSlider.step=1; hueSlider.value=Math.round(hue);
                    hueSlider.oninput = e => {
                        hue=parseInt(e.target.value);
                        const {r:rr,g:gg,b:bb}=hexToRgb(currentHex);
                        const {s,l}=rgbToHsl(rr,gg,bb);
                        const {r:nr,g:ng,b:nb}=hslToRgb(hue,s,l);
                        const newHex=rgbToHex(nr,ng,nb);
                        updateDOM(newHex);
                        proxy[item.key]=currentHex;
                        if(hasBox&&ctx) setTimeout(()=>{ const w=canvas.offsetWidth||230,h=canvas.height; canvas.width=w; ctx.clearRect(0,0,w,h); ctx.fillStyle=`hsl(${hue},100%,50%)`; ctx.fillRect(0,0,w,h); const wg=ctx.createLinearGradient(0,0,w,0);wg.addColorStop(0,'rgba(255,255,255,1)');wg.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=wg;ctx.fillRect(0,0,w,h);const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,'rgba(0,0,0,0)');bg.addColorStop(1,'rgba(0,0,0,1)');ctx.fillStyle=bg;ctx.fillRect(0,0,w,h); },0);
                    };
                    hueRow.append(swatchLg,hueSlider); expanderInner.appendChild(hueRow);
                }

                // ── Opacity ───────────────────────────────────────────────
                if (hasOpacity) {
                    const opRow=document.createElement('div'); opRow.className='pnl-color-opacity-row';
                    const track=document.createElement('div'); track.className='pnl-color-opacity-track';
                    const checker=document.createElement('div'); checker.className='pnl-color-opacity-checker';
                    opGrad=document.createElement('div'); opGrad.className='pnl-color-opacity-grad';
                    opacityRange=document.createElement('input'); opacityRange.type='range'; opacityRange.className='pnl-color-opacity-input'; opacityRange.min=0; opacityRange.max=1; opacityRange.step=0.01; opacityRange.value=1;
                    opacityNum=document.createElement('input'); opacityNum.className='pnl-opacity-num'; opacityNum.type='text'; opacityNum.value='1.00';
                    opGrad.style.background=`linear-gradient(to right,transparent,${currentHex})`;
                    opacityRange.oninput=e=>{ opacity=parseFloat(e.target.value); opacityNum.value=opacity.toFixed(2); if(item.onOpacity)item.onOpacity(opacity); };
                    makeScrub(opacityNum,()=>opacity,v=>{ opacity=Math.max(0,Math.min(1,v)); opacityRange.value=opacity; opacityNum.value=opacity.toFixed(2); if(item.onOpacity)item.onOpacity(opacity); },0.01,0,1);
                    track.append(checker,opGrad,opacityRange); opRow.append(track,opacityNum); expanderInner.appendChild(opRow);
                }

                // ── RGB ───────────────────────────────────────────────────
                if (hasRgb) {
                    const {r,g,b}=hexToRgb(currentHex);
                    const rgbEl=document.createElement('div'); rgbEl.className='pnl-rgb-row-inner';
                    const mkF=(l,v)=>{ const f=document.createElement('div'); f.className='pnl-rgb-field'; const lb=document.createElement('span'); lb.className='pnl-rgb-lbl'; lb.innerText=l; const i=document.createElement('input'); i.className='pnl-rgb-inp'; i.type='text'; i.value=v; f.append(lb,i); return {f,i}; };
                    const {f:rf,i:ri}=mkF('R',r); const {f:gf,i:gi}=mkF('G',g); const {f:bf,i:bi}=mkF('B',b);
                    rInp=ri; gInp=gi; bInp=bi;
                    const syncRgb=()=>{ const rv=parseInt(rInp.value),gv=parseInt(gInp.value),bv=parseInt(bInp.value); if(![rv,gv,bv].some(isNaN)){ updateDOM(rgbToHex(rv,gv,bv)); proxy[item.key]=currentHex; } };
                    [rInp,gInp,bInp].forEach(i=>{ i.addEventListener('change',syncRgb); i.addEventListener('keydown',e=>{if(e.key==='Enter')syncRgb();}); });
                    rgbEl.append(rf,gf,bf); expanderInner.appendChild(rgbEl);
                }

                block.appendChild(expanderInner);
            }

            // ── updateDOM: sync all widgets without touching proxy ────────
            // This is the key fix: separating "update widgets" from "https://esm.sh/write state"
            // so the proxy binding never re-enters this function
            const updateDOM = hex => {
                currentHex = hex;
                swatch.style.background = hex;
                if(document.activeElement!==hexInp) hexInp.value=hex;
                if(hueSlider){ const {r,g,b}=hexToRgb(hex); const {h}=rgbToHsl(r,g,b); hue=h; hueSlider.value=Math.round(h); }
                if(swatchLg) swatchLg.style.background=hex;
                if(rInp){ const {r,g,b}=hexToRgb(hex); if(document.activeElement!==rInp)rInp.value=r; if(document.activeElement!==gInp)gInp.value=g; if(document.activeElement!==bInp)bInp.value=b; }
                if(opGrad) opGrad.style.background=`linear-gradient(to right,transparent,${hex})`;
            };

            // ── Wire hex input ────────────────────────────────────────────
            hexInp.addEventListener('change', e => {
                const v=e.target.value.trim();
                if(isHex(v)){ updateDOM(v); proxy[item.key]=currentHex; } else hexInp.value=currentHex;
            });
            hexInp.addEventListener('keydown', e => {
                if(e.key==='Enter'){ const v=hexInp.value.trim(); if(isHex(v)){ updateDOM(v); proxy[item.key]=currentHex; } hexInp.blur(); }
            });

            // ── Bind: external state changes → updateDOM only (no proxy write) ──
            bind(item.key, v => updateDOM(v));

            container.appendChild(block);
        };

        /* ── Row renderer ─────────────────────────────────────────────────── */
        const addRow = (item, container) => {
            // Register onChange callback if declared on the item
            if (item.key && item.onChange) onChange(item.key, item.onChange);

            if (item.type==='tabs')   { addTabs(item, container); return; }
            if (item.type==='color')  { buildColorPicker(item, container); return; }

            // ── Separator (hard rule, no label) ──────────────────────────
            if (item.type==='separator') {
                const hr=document.createElement('hr'); hr.className='pnl-hr';
                container.appendChild(hr); return;
            }

            // ── Console log ──────────────────────────────────────────────
            if (item.type==='console') {
                const maxLines = item.rows ?? 5;
                const lines = [];
                const wrap  = document.createElement('div'); wrap.className='pnl-console-wrap';
                const head  = document.createElement('div'); head.className='pnl-console-head';
                const lbl   = document.createElement('div'); lbl.className='pnl-label'; lbl.innerText=item.label||item.key||'console';
                const clrBtn= document.createElement('span'); clrBtn.style.cssText='font-size:9px;color:#555;cursor:pointer;'; clrBtn.innerText='clear';
                const entries=document.createElement('div'); entries.className='pnl-console-entries';
                clrBtn.onclick=()=>{ lines.length=0; entries.innerHTML=''; };
                clrBtn.onmouseenter=()=>clrBtn.style.color='var(--accent)';
                clrBtn.onmouseleave=()=>clrBtn.style.color='#555';
                head.append(lbl,clrBtn); wrap.append(head,entries);
                container.appendChild(wrap);
                // expose a .log() method on the element for external use
                wrap._log = (msg) => {
                    const fmt = typeof msg==='object' ? JSON.stringify(msg) : String(msg);
                    lines.push(fmt);
                    if(lines.length>maxLines*3) lines.shift();
                    const row=document.createElement('div'); row.className='pnl-console-entry';
                    const t=document.createElement('span'); t.style.color='#555'; t.innerText=item.label||item.key||'log';
                    const v=document.createElement('span'); v.className='val'; v.innerText=fmt;
                    row.style.background=entries.children.length%2===0?'#1c1c1c':'var(--pnl-bg-input)';
                    row.append(t,v); entries.appendChild(row);
                    while(entries.children.length>maxLines) entries.removeChild(entries.firstChild);
                    entries.scrollTop=entries.scrollHeight;
                };
                // auto-sample if key is provided
                if(item.key){
                    bind(item.key, v => wrap._log(typeof v==='number'?v.toFixed(typeof item.step==='number'?String(item.step).split('.')[1]?.length??0:3):JSON.stringify(v)));
                    // expose log fn on state: state['key$log'](msg)
                    state[item.key+'$log'] = wrap._log;
                }
                return;
            }

            // ── Display (readonly value viewer) ──────────────────────────
            if (item.type==='display') {
                const wrap=document.createElement('div'); wrap.className='pnl-display-wrap';
                const lbl=document.createElement('div'); lbl.className='pnl-display-lbl'; lbl.innerText=item.label||item.key||'';
                const val=document.createElement('div'); val.className='pnl-display-val';
                const fmt=v=>typeof v==='object'?JSON.stringify(v,null,2):String(v);
                val.innerText=fmt(proxy[item.key]??'—');
                wrap.append(lbl,val); container.appendChild(wrap);
                if(item.key) bind(item.key,v=>val.innerText=fmt(v));
                // re-read after proxy is fully populated (ESM timing)
                setTimeout(()=>{ val.innerText=fmt(proxy[item.key]??'—'); },0);
                return;
            }

            // ── Point3D / Point4D ─────────────────────────────────────────
            if (item.type==='point3d'||item.type==='point4d') {
                const axes = item.type==='point4d' ? ['x','y','z','w'] : ['x','y','z'];
                const cur  = proxy[item.key] || Object.fromEntries(axes.map(a=>[a,0]));
                const step = item.step||0.01;
                const dec  = String(step).includes('.')?String(step).split('.')[1].length:0;
                const fmt  = v=>dec>0?Number(v).toFixed(dec):String(Math.round(v));
                const clamp= v=>{ const mn=item.min??-Infinity,mx=item.max??Infinity; return Math.min(mx,Math.max(mn,v)); };

                const wrap=document.createElement('div'); wrap.className='pnl-pointnd-wrap';
                const topRow=document.createElement('div'); topRow.className='pnl-pointnd-top';
                const lbl=document.createElement('span'); lbl.className='pnl-pointnd-lbl'; lbl.innerText=item.label||item.key;
                if(item.info){ lbl.classList.add('has-tip'); addTip(lbl,item.info); }
                topRow.appendChild(lbl);

                const fieldRow=document.createElement('div'); fieldRow.className='pnl-pointnd-row';
                const inputs={};
                axes.forEach(ax=>{
                    const field=document.createElement('div'); field.className='pnl-pointnd-field';
                    const axLbl=document.createElement('div'); axLbl.className='pnl-pointnd-axis'; axLbl.innerText=ax;
                    const inp=document.createElement('input'); inp.className='pnl-xy-inp'; inp.style.width='100%'; inp.type='text'; inp.value=fmt(cur[ax]??0);
                    const commit=()=>{ const v=parseFloat(inp.value); if(!isNaN(v)){ const s={...proxy[item.key]}; s[ax]=clamp(v); proxy[item.key]=s; } };
                    inp.addEventListener('change',commit); inp.addEventListener('keydown',e=>{if(e.key==='Enter')commit();});
                    makeScrub(inp,()=>proxy[item.key]?.[ax]??0,v=>{ const s={...proxy[item.key]}; s[ax]=clamp(v); proxy[item.key]=s; },step,item.min??-Infinity,item.max??Infinity);
                    inputs[ax]=inp; field.append(axLbl,inp); fieldRow.appendChild(field);
                });
                bind(item.key,v=>{ axes.forEach(ax=>{ if(document.activeElement!==inputs[ax])inputs[ax].value=fmt(v[ax]??0); }); });
                wrap.append(topRow,fieldRow); container.appendChild(wrap); return;
            }

            if (item.type==='button') {
                const btn=document.createElement('button'); btn.className='pnl-action-btn'; btn.innerText=item.label;
                btn.onclick=()=>item.onClick&&item.onClick(proxy); container.appendChild(btn); return;
            }
            if (item.type==='link'||item.type==='popup') {
                const btn=document.createElement('button'); btn.className=item.type==='link'?'pnl-link':'pnl-popup-tag'; btn.innerText=item.label;
                btn.onclick=()=>item.type==='link'?window.open(item.url,'_blank'):showModal(item.config); container.appendChild(btn); return;
            }
            if (item.type==='folder') {
                const f=document.createElement('div'); f.className='pnl-folder';
                const fh=document.createElement('div'); fh.className=`f-head${item.open?' is-open':''}`; fh.innerHTML=`<span>${item.label}</span><span class="f-icon"><svg class="f-chevron" width="9" height="9" viewBox="0 0 9 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><polyline points="1,3 4.5,6.5 8,3"/></svg></span>`;
                const fb=document.createElement('div'); fb.className=`f-body${item.open?' is-open':''}`;
                const fbInner=document.createElement('div'); fbInner.className='f-body-inner';
                fh.onclick=()=>{ fb.classList.toggle('is-open'); fh.classList.toggle('is-open'); updateStack(); };
                item.children.forEach(c=>addRow(c,fbInner)); fb.appendChild(fbInner); f.appendChild(fh); f.appendChild(fb); container.appendChild(f); return;
            }
            if (item.type==='text') {
                const sep=document.createElement('div'); sep.className='pnl-sep'; sep.innerText=item.label; container.appendChild(sep); return;
            }
            if (item.type==='point2d') {
                const xR=item.xRange||[-1,1], yR=item.yRange||[-1,1];
                const toPercX=v=>((v-xR[0])/(xR[1]-xR[0]))*100;
                const toPercY=v=>(1-(v-yR[0])/(yR[1]-yR[0]))*100;
                const fromPX=p=>xR[0]+(p/100)*(xR[1]-xR[0]);
                const fromPY=p=>yR[1]-(p/100)*(yR[1]-yR[0]);
                const fmtXY=v=>v.toFixed(2);

                const wrap=document.createElement('div'); wrap.className='pnl-point2d-wrap';
                const top=document.createElement('div'); top.className='pnl-point2d-top';
                const lbl=document.createElement('span'); lbl.className='pnl-point2d-lbl'; lbl.innerText=item.label||item.key;
                const xLbl=document.createElement('span'); xLbl.className='pnl-xy-label'; xLbl.innerText='x';
                const xInp=document.createElement('input'); xInp.className='pnl-xy-inp'; xInp.type='text';
                const yLbl=document.createElement('span'); yLbl.className='pnl-xy-label'; yLbl.innerText='y';
                const yInp=document.createElement('input'); yInp.className='pnl-xy-inp'; yInp.type='text';

                const pad=document.createElement('div'); pad.className='pnl-point2d-pad';
                const cv2=document.createElement('canvas'); cv2.className='pnl-point2d-canvas';
                pad.append(cv2);

                const drawPad = (hx, hy) => {
                    const w=pad.offsetWidth||230, h=pad.offsetHeight||100;
                    cv2.width=w; cv2.height=h;
                    const c=cv2.getContext('2d');
                    c.clearRect(0,0,w,h);
                    // dashed grid lines at center
                    c.strokeStyle=win.style.getPropertyValue('--pnl-border-row')||'#2a2a2a'; c.lineWidth=1; c.setLineDash([3,3]);
                    c.beginPath(); c.moveTo(w/2,0); c.lineTo(w/2,h); c.stroke();
                    c.beginPath(); c.moveTo(0,h/2); c.lineTo(w,h/2); c.stroke();
                    c.setLineDash([]);
                    // dotted line from center to handle
                    const px=hx/100*w, py=hy/100*h;
                    c.strokeStyle='rgba(200,200,210,0.35)'; c.lineWidth=1; c.setLineDash([2,3]);
                    c.beginPath(); c.moveTo(w/2,h/2); c.lineTo(px,py); c.stroke();
                    c.setLineDash([]);
                    // center dot
                    c.fillStyle='#444'; c.beginPath(); c.arc(w/2,h/2,2,0,Math.PI*2); c.fill();
                    // crosshair handle
                    const px2=hx/100*w, py2=hy/100*h;
                    const ha=win.style.getPropertyValue('--accent')||accent;
                    c.strokeStyle=ha; c.lineWidth=1; c.lineCap='round'; c.setLineDash([]);
                    c.beginPath(); c.arc(px2,py2,3,0,Math.PI*2); c.stroke();
                    c.beginPath(); c.moveTo(px2-7,py2); c.lineTo(px2+7,py2); c.stroke();
                    c.beginPath(); c.moveTo(px2,py2-7); c.lineTo(px2,py2+7); c.stroke();
                };

                const cur=proxy[item.key]||{x:0,y:0};
                const setHandle=(x,y)=>{
                    x=Math.max(xR[0],Math.min(xR[1],x)); y=Math.max(yR[0],Math.min(yR[1],y));
                    const hx=toPercX(x), hy=toPercY(y);
                    if(document.activeElement!==xInp)xInp.value=fmtXY(x);
                    if(document.activeElement!==yInp)yInp.value=fmtXY(y);
                    drawPad(hx,hy);
                };
                xInp.value=fmtXY(cur.x); yInp.value=fmtXY(cur.y);
                requestAnimationFrame(()=>setHandle(cur.x,cur.y));

                const commitXY=()=>{ const x=parseFloat(xInp.value),y=parseFloat(yInp.value); if(!isNaN(x)&&!isNaN(y))proxy[item.key]={x,y}; };
                xInp.addEventListener('change',commitXY); xInp.addEventListener('keydown',e=>{if(e.key==='Enter')commitXY();});
                yInp.addEventListener('change',commitXY); yInp.addEventListener('keydown',e=>{if(e.key==='Enter')commitXY();});
                const s2d=item.step||0.01;
                makeScrub(xInp,()=>proxy[item.key]?.x??0,v=>{proxy[item.key]={x:v,y:proxy[item.key]?.y??0};},s2d,xR[0],xR[1]);
                makeScrub(yInp,()=>proxy[item.key]?.y??0,v=>{proxy[item.key]={x:proxy[item.key]?.x??0,y:v};},s2d,yR[0],yR[1]);
                const onMove=e=>{ const r=pad.getBoundingClientRect(); const px=Math.max(0,Math.min(100,((e.clientX-r.left)/r.width)*100)); const py=Math.max(0,Math.min(100,((e.clientY-r.top)/r.height)*100)); proxy[item.key]={x:parseFloat(fromPX(px).toFixed(3)),y:parseFloat(fromPY(py).toFixed(3))}; };
                pad.onmousedown=e=>{ onMove(e); const up=()=>{window.removeEventListener('mousemove',onMove);window.removeEventListener('mouseup',up);}; window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',up); };
                bind(item.key,v=>setHandle(v.x,v.y));
                top.append(lbl,xLbl,xInp,yLbl,yInp); wrap.appendChild(top); wrap.appendChild(pad); container.appendChild(wrap); return;
            }

            // ── Screw / rotary knob ──────────────────────────────────────
            if (item.type==='screw') {
                const min=item.min??0, max=item.max??1, step=item.step||0.01;
                const dec=String(step).includes('.')?String(step).split('.')[1].length:0;
                const fmt=v=>dec>0?Number(v).toFixed(dec):String(Math.round(v));
                const clamp=v=>Math.min(max,Math.max(min,v));
                const valToAngle=v=>((v-min)/(max-min))*300-150; // -150° to +150°

                const row=document.createElement('div'); row.className='pnl-row';
                const lbl=document.createElement('div'); lbl.className='pnl-label'; lbl.innerText=item.label||item.key;
                if(item.info){ lbl.classList.add('has-tip'); addTip(lbl,item.info); }
                const ctrls=document.createElement('div'); ctrls.className='pnl-ctrls'; ctrls.style.gap='6px';

                const cv3=document.createElement('canvas'); cv3.className='pnl-screw-canvas'; cv3.width=36; cv3.height=36;
                const num=document.createElement('input'); num.className='pnl-num narrow'; num.type='text'; num.value=fmt(proxy[item.key]??min);

                const drawScrew=v=>{
                    const liveAccent=win.style.getPropertyValue('--accent')||accent;
                    const c=cv3.getContext('2d'); c.clearRect(0,0,36,36);
                    const cx=18,cy=18;
                    // track ring
                    c.strokeStyle=themeVars.borderRow||'#2a2a2a'; c.lineWidth=2;
                    c.beginPath(); c.arc(cx,cy,13,0,Math.PI*2); c.stroke();
                    // clock hand
                    const ang=valToAngle(v)*Math.PI/180;
                    c.strokeStyle=liveAccent; c.lineWidth=1.5; c.lineCap='round';
                    c.beginPath(); c.moveTo(cx,cy); c.lineTo(cx+Math.sin(ang)*9,cy-Math.cos(ang)*9); c.stroke();
                    // center dot
                    c.fillStyle='#555';
                    c.beginPath(); c.arc(cx,cy,2,0,Math.PI*2); c.fill();
                };
                drawScrew(proxy[item.key]??min);

                makeScrub(cv3,()=>proxy[item.key]??min,v=>{ proxy[item.key]=clamp(v); },step,min,max);
                makeScrub(num,()=>proxy[item.key]??min,v=>{ proxy[item.key]=clamp(v); },step,min,max);
                bind(item.key,v=>{ drawScrew(v); num.value=fmt(v); });
                ctrls.append(cv3,num); row.append(lbl,ctrls); container.appendChild(row); return;
            }

            // ── Cubic Bezier editor ──────────────────────────────────────
            if (item.type==='bezier') {
                // value: [x1,y1,x2,y2]  control points of cubic-bezier(x1,y1,x2,y2)
                const def=proxy[item.key]||[0.25,0.1,0.25,1.0];
                let [x1,y1,x2,y2]=def;
                const wrap=document.createElement('div'); wrap.className='pnl-bezier-wrap';
                const lblRow=document.createElement('div'); lblRow.className='pnl-bezier-lbl-row';
                const lbl=document.createElement('div'); lbl.className='pnl-label'; lbl.innerText=item.label||item.key;
                const valTxt=document.createElement('span'); valTxt.className='pnl-display-val'; valTxt.style.fontSize='9px';
                const fmtBez=()=>`${x1.toFixed(2)},${y1.toFixed(2)},${x2.toFixed(2)},${y2.toFixed(2)}`;
                valTxt.innerText=fmtBez();
                lblRow.append(lbl,valTxt); wrap.appendChild(lblRow);

                const cv4=document.createElement('canvas'); cv4.className='pnl-bezier-canvas'; cv4.height=100; wrap.appendChild(cv4);

                const PAD=12;
                const drawBez=()=>{
                    const W=cv4.offsetWidth||230, H=100; cv4.width=W;
                    const c=cv4.getContext('2d'); c.clearRect(0,0,W,H);
                    const bx=(t,p0,p1,p2,p3)=>3*(1-t)**2*t*p1+3*(1-t)*t**2*p2+t**3*p3;
                    const by=bx;
                    const tx=v=>PAD+v*(W-PAD*2);
                    const ty=v=>H-PAD-v*(H-PAD*2);
                    const cp1x=tx(x1),cp1y=ty(y1),cp2x=tx(x2),cp2y=ty(y2);
                    // grid
                    c.strokeStyle='#2a2a2f'; c.lineWidth=1; c.setLineDash([2,3]);
                    c.beginPath(); c.moveTo(tx(0),ty(0)); c.lineTo(tx(1),ty(1)); c.stroke();
                    c.setLineDash([]);
                    // control arm lines
                    c.strokeStyle='#444'; c.lineWidth=1;
                    c.beginPath(); c.moveTo(tx(0),ty(0)); c.lineTo(cp1x,cp1y); c.stroke();
                    c.beginPath(); c.moveTo(tx(1),ty(1)); c.lineTo(cp2x,cp2y); c.stroke();
                    // curve
                    c.strokeStyle=win.style.getPropertyValue('--accent')||accent; c.lineWidth=1.5;
                    c.beginPath(); c.moveTo(tx(0),ty(0));
                    c.bezierCurveTo(cp1x,cp1y,cp2x,cp2y,tx(1),ty(1)); c.stroke();
                    // handles
                    [[cp1x,cp1y],[cp2x,cp2y]].forEach(([hx,hy])=>{
                        c.fillStyle='#bbb'; c.strokeStyle='#444'; c.lineWidth=1;
                        c.beginPath(); c.arc(hx,hy,4,0,Math.PI*2); c.fill(); c.stroke();
                    });
                };
                requestAnimationFrame(drawBez);

                let dragging=null;
                cv4.addEventListener('mousedown',e=>{
                    const r=cv4.getBoundingClientRect(); const W=r.width, H=r.height;
                    const tx=v=>PAD+v*(W-PAD*2), ty=v=>H-PAD-v*(H-PAD*2);
                    const mx=e.clientX-r.left, my=e.clientY-r.top;
                    const d1=Math.hypot(mx-tx(x1),my-ty(y1));
                    const d2=Math.hypot(mx-tx(x2),my-ty(y2));
                    dragging = d1<d2 ? 1 : 2;
                    const onMove=e=>{
                        const r2=cv4.getBoundingClientRect(); const W2=r2.width, H2=r2.height;
                        const nx=Math.max(0,Math.min(1,(e.clientX-r2.left-PAD)/(W2-PAD*2)));
                        const ny=Math.max(-0.5,Math.min(1.5,1-(e.clientY-r2.top-PAD)/(H2-PAD*2)));
                        if(dragging===1){x1=nx;y1=ny;}else{x2=nx;y2=ny;}
                        proxy[item.key]=[x1,y1,x2,y2];
                        valTxt.innerText=fmtBez(); drawBez();
                    };
                    const onUp=()=>{ dragging=null; window.removeEventListener('mousemove',onMove); window.removeEventListener('mouseup',onUp); };
                    window.addEventListener('mousemove',onMove); window.addEventListener('mouseup',onUp);
                });
                bind(item.key,v=>{ [x1,y1,x2,y2]=v; valTxt.innerText=fmtBez(); drawBez(); });
                container.appendChild(wrap); return;
            }

            // ── Slider (full-width) ──────────────────────────────────────
            if (item.type==='slider') {
                const step=item.step||1;
                const dec=String(step).includes('.')?String(step).split('.')[1].length:0;
                const fmt=v=>dec>0?Number(v).toFixed(dec):String(Math.round(v));
                const clamp=v=>Math.min(item.max??100,Math.max(item.min??0,v));

                const block=document.createElement('div'); block.className='pnl-slider-row';
                const topRow=document.createElement('div'); topRow.className='pnl-slider-top';
                const lbl=document.createElement('div'); lbl.className='pnl-label'; lbl.innerText=item.label||item.key;
                if(item.info){ lbl.classList.add('has-tip'); addTip(lbl,item.info); }
                const num=document.createElement('input'); num.className='pnl-num wide'; num.type='text'; num.value=fmt(proxy[item.key]??0);

                const trackWrap=document.createElement('div'); trackWrap.className='pnl-slider-track-wrap';
                const range=document.createElement('input'); range.type='range';
                range.min=item.min??0; range.max=item.max??100; range.step=step; range.value=proxy[item.key]??0;
                const fill=document.createElement('div'); fill.className='pnl-slider-fill';
                const updateFill=v=>{ const pct=((v-(item.min??0))/((item.max??100)-(item.min??0)))*100; fill.style.width=pct+'%'; };
                updateFill(proxy[item.key]??0);

                makeScrub(num, ()=>parseFloat(proxy[item.key]??0), v=>{ proxy[item.key]=clamp(v); }, step, item.min??0, item.max??100);
                range.oninput=e=>{ proxy[item.key]=parseFloat(e.target.value); };
                bind(item.key, v=>{ range.value=v; num.value=fmt(v); updateFill(v); });

                topRow.append(lbl,num); trackWrap.append(fill,range);
                block.append(topRow,trackWrap); container.appendChild(block); return;
            }

            // ── Standard two-column rows ─────────────────────────────────
            const row=document.createElement('div'); row.className='pnl-row';
            const lbl=document.createElement('div'); lbl.className='pnl-label'; lbl.innerText=item.label||item.key;
            const ctrls=document.createElement('div'); ctrls.className='pnl-ctrls';
            if(item.info){ lbl.classList.add('has-tip'); addTip(lbl,item.info); }

            if (item.type==='toggle') {
                const tog=document.createElement('div'); tog.className=`pnl-toggle${proxy[item.key]?' on':''}`;
                tog.onclick=()=>proxy[item.key]=!proxy[item.key];
                bind(item.key,v=>tog.classList.toggle('on',!!v)); ctrls.appendChild(tog);
            } else if (item.type==='checkbox') {
                const cb=document.createElement('div'); cb.className=`pnl-checkbox${proxy[item.key]?' on':''}`;
                cb.onclick=()=>proxy[item.key]=!proxy[item.key];
                bind(item.key,v=>cb.classList.toggle('on',!!v)); ctrls.appendChild(cb);
            } else if (item.type==='select') {
                const sel=document.createElement('select'); sel.className='pnl-select';
                Object.entries(item.options).forEach(([val,label])=>{ const o=document.createElement('option'); o.value=val; o.innerText=label; if(String(proxy[item.key])===String(val))o.selected=true; sel.appendChild(o); });
                sel.onchange=e=>proxy[item.key]=e.target.value;
                bind(item.key,v=>sel.value=v); ctrls.appendChild(sel);
            } else if (item.type==='list') {
                // tweakpane-style: options is [{text:'Label', value: any}, ...]
                const sel=document.createElement('select'); sel.className='pnl-list';
                const opts = Array.isArray(item.options)
                    ? item.options
                    : Object.entries(item.options).map(([value,text])=>({text,value}));
                opts.forEach(({text,value})=>{ const o=document.createElement('option'); o.value=value; o.innerText=text; if(String(proxy[item.key])===String(value))o.selected=true; sel.appendChild(o); });
                sel.onchange=e=>{ const raw=e.target.value; const match=opts.find(o=>String(o.value)===raw); proxy[item.key]=match?match.value:raw; };
                bind(item.key,v=>sel.value=v); ctrls.appendChild(sel);
            } else if (item.type==='inputtext') {
                const inp=document.createElement('input'); inp.className='pnl-text-input'; inp.type='text';
                inp.value=proxy[item.key]||''; inp.placeholder=item.placeholder||'';
                inp.oninput=e=>proxy[item.key]=e.target.value;
                bind(item.key,v=>{ if(inp!==document.activeElement)inp.value=v; }); ctrls.appendChild(inp);
            } else if (item.type==='stepper') {
                const min=item.min??-Infinity,max=item.max??Infinity,step=item.step||1;
                const dec=String(step).includes('.')?String(step).split('.')[1].length:0;
                const fmt=v=>dec>0?v.toFixed(dec):String(v);
                const clamp=v=>Math.min(max,Math.max(min,parseFloat(v.toFixed(10))));
                const wrap=document.createElement('div'); wrap.className='pnl-stepper';
                const dBtn=document.createElement('button'); dBtn.className='pnl-stepper-btn'; dBtn.innerText='−';
                const valEl=document.createElement('input'); valEl.className='pnl-stepper-val'; valEl.type='text'; valEl.value=fmt(proxy[item.key]??0);
                const iBtn=document.createElement('button'); iBtn.className='pnl-stepper-btn'; iBtn.innerText='+';
                dBtn.onclick=()=>proxy[item.key]=clamp((proxy[item.key]??0)-step);
                iBtn.onclick=()=>proxy[item.key]=clamp((proxy[item.key]??0)+step);
                makeScrub(valEl,()=>proxy[item.key]??0,v=>proxy[item.key]=clamp(v),step,min,max);
                bind(item.key,v=>{ if(document.activeElement!==valEl) valEl.value=fmt(v); });
                wrap.append(dBtn,valEl,iBtn); ctrls.appendChild(wrap);
            }

            row.appendChild(lbl); row.appendChild(ctrls); container.appendChild(row);
        };

        layout.forEach(item => addRow(item, win.querySelector('.pnl-body')));

        // flush all bindings once after build so display/bezier/console show initial values
        setTimeout(() => {
            bindings.forEach((fns, key) => {
                if (state[key] !== undefined) fns.forEach(fn => fn(state[key]));
            });
        }, 0);

        const updateStack = () => { let o=20; document.querySelectorAll('.pnl-main').forEach(p=>{ p.style.top=o+'px'; o+=p.offsetHeight+8; }); };
        const toggle = () => {
            const body = win.querySelector('.pnl-body');
            const minimizing = !win.classList.contains('is-minimized');
            if (minimizing) {
                // lock current height before collapsing
                body.style.maxHeight = body.scrollHeight + 'px';
                requestAnimationFrame(() => {
                    win.classList.add('is-minimized');
                    setTimeout(updateStack, 300);
                });
            } else {
                win.classList.remove('is-minimized');
                body.style.maxHeight = '';
                setTimeout(updateStack, 300);
            }
        };
        win.querySelector('.p-btn').onclick = toggle;
        let _ckHandler;
        if (closeKey) { _ckHandler = e=>{ if(e.key===closeKey) toggle(); }; window.addEventListener('keydown', _ckHandler); }
        // clean up key listener when panel element is removed from DOM
        new MutationObserver((_, obs) => { if (!document.body.contains(win)) { if(_ckHandler) window.removeEventListener('keydown', _ckHandler); obs.disconnect(); } }).observe(document.body, {childList:true, subtree:true});
        setTimeout(updateStack, 0);
        return proxy;
    };

    /* ── Config normalizer: supports new {ui, controls} format ─────────── */
    const normalize = cfg => {
        if (!cfg.ui && !cfg.controls) return cfg; // old format, pass through
        const out = Object.assign({}, cfg);
        if (cfg.ui) {
            out.title     = cfg.ui.title     ?? out.title ?? 'Panel';
            out.collapsed = cfg.ui.collapsed ?? out.collapsed ?? false;
            out.closeKey  = cfg.ui.closeKey  ?? out.closeKey  ?? null;
            out.width     = cfg.ui.width     ?? out.width;
            out.theme     = { accent: cfg.ui.accent ?? '#00ff88', ...cfg.ui.theme };
        }
        out.layout = cfg.controls ?? [];
        out.state  = {};
        const collect = items => items.forEach(item => {
            if (item.default !== undefined && item.key) out.state[item.key] = item.default;
            else if ((item.type==='point3d'||item.type==='point4d') && item.key && !out.state[item.key]) {
                const axes=item.type==='point4d'?['x','y','z','w']:['x','y','z'];
                out.state[item.key]=Object.fromEntries(axes.map(a=>[a,0]));
            }
            if (item.children) collect(item.children);
            if (item.tabs) item.tabs.forEach(t => collect(t.children ?? []));
        });
        collect(out.layout);
        return out;
    };

    window.addEventListener('DOMContentLoaded', () => { if(window.pnlConfigs) window.pnlConfigs.forEach((c,i)=>builder(normalize(c),i)); });

    /* ── Container-mount helper (used by docs/demos/theme-creator) ─── */
    window._pnlBuilder = function(config, index, container) {
        const idx = index ?? window.pnlStates.length;
        const cfg = normalize(config);
        const proxy = builder(cfg, idx);
        if (container) {
            const panels = document.querySelectorAll('.pnl-main');
            const last = panels[panels.length - 1];
            if (last && !container.contains(last)) {
                last.style.cssText += ';position:relative!important;right:auto!important;top:auto!important;left:auto!important;z-index:1!important;width:100%!important;box-shadow:none!important;';
                container.appendChild(last);
            }
        }
        return proxy;
    };

export function cntrlPNL(config) {
        const index = pnlStates.length;
        return builder(normalize(config), index);
}
export default cntrlPNL;
