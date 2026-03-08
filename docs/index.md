---
title: Overview
layout: default
nav_order: 1
---

# cntrlpnl

Floating debug panels for the browser. Drop in the script, write a config object, done — no build tools, no npm, no framework.

---

## Install

```html
<script src="cntrlpnl.js"></script>
```

Set `window.pnlConfigs` before or after load:

```html
<script>
  window.pnlConfigs = [{ ui: { title: 'dev' }, controls: [] }];
</script>
```

---

## Quickstart

```html
<script src="cntrlpnl.js"></script>
<script>
  window.pnlConfigs = [
    {
      ui: { title: 'scene', accent: '#00aaff' },
      controls: [
        { type: 'slider', key: 'speed',   label: 'speed',   default: 50, min: 0, max: 100 },
        { type: 'toggle', key: 'visible', label: 'visible', default: true },
        { type: 'color',  key: 'tint',    label: 'tint',    default: '#ff4400' },
      ]
    }
  ];
</script>
```

State is a reactive proxy on `window.pnlStates[n]`. Write to it and the panel updates live:

```js
const s = window.pnlStates[0];
s.speed;        // 50
s.speed = 75;   // slider moves
```

---

## Config formats

Two formats, both supported.

**New** — defaults inline:

```js
{
  ui: {
    title:     'panel',
    accent:    '#00ff88',
    collapsed: false,
    closeKey:  'h',
  },
  controls: [ ...items ]
}
```

**Legacy** — explicit state object:

```js
{
  title:    'panel',
  theme:    { accent: '#00ff88' },
  closeKey: 'h',
  state:    { speed: 50 },
  layout:   [ ...items ]
}
```
