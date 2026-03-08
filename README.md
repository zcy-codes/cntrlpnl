# cntrlpnl

Floating debug panels for the browser. Drop in the script, write a config object, done — no build tools, no npm, no framework.

![](https://img.shields.io/badge/zero_deps-pure_JS-00ff88?style=flat-square) ![](https://img.shields.io/badge/license-MIT-555?style=flat-square)

---

## Install

```html
<script src="cntrlpnl.js"></script>
```

Set `window.pnlConfigs` before or after load — either works:

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

## Config

Two formats, both supported.

**New** — defaults inline, less boilerplate:

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

---

## Controls

Every control takes `key`, `label`, and an optional `info` string (shown as a tooltip on hover).

---

### slider

Full-width track with a scrubable readout. Drag the number up/down to scrub, click to type.

```js
{
  type: 'slider', key: 'exposure', label: 'exposure',
  default: 1.0, min: 0, max: 2, step: 0.01,
  info: 'scene exposure multiplier'
}
```

---

### toggle

```js
{ type: 'toggle', key: 'wireframe', label: 'wireframe', default: false }
```

---

### color

Hex input by default. Add `modes` to expand it.

```js
{
  type: 'color', key: 'bg', label: 'background', default: '#1a1a2e',
  modes: ['slider', 'box', 'rgb', 'opacity'],
  onOpacity: val => { ... }
}
```

| mode | what it adds |
|---|---|
| `slider` | hue bar + swatch |
| `box` | saturation/brightness canvas |
| `rgb` | R G B number inputs |
| `opacity` | alpha slider with checker preview |

`onOpacity` fires separately because opacity isn't part of the hex value.

---

### select

```js
{
  type: 'select', key: 'blend', label: 'blend mode', default: 'add',
  options: { normal: 'Normal', add: 'Additive', multiply: 'Multiply' }
}
```

---

### stepper

```js
{ type: 'stepper', key: 'layers', label: 'layers', default: 3, min: 1, max: 16 }
```

---

### inputtext

```js
{ type: 'inputtext', key: 'title', label: 'title', default: 'untitled', placeholder: '...' }
```

---

### point2d

XY pad with a draggable handle. Coordinate inputs are also scrubable.

```js
{
  type: 'point2d', key: 'origin', label: 'origin',
  default: { x: 0, y: 0 }, xRange: [-1, 1], yRange: [-1, 1], step: 0.01
}
```

State is always `{ x, y }`.

---

### button

```js
{
  type: 'button', label: 'reset',
  onClick: s => { s.speed = 50; s.visible = true; }
}
```

`onClick` gets the state proxy.

---

### text

Section label / separator.

```js
{ type: 'text', label: 'rendering' }
```

---

### folder

Collapsible group.

```js
{
  type: 'folder', label: 'post fx',
  children: [
    { type: 'slider', key: 'bloom',   default: 0,   min: 0, max: 1, step: 0.01 },
    { type: 'slider', key: 'sharpen', default: 0.2, min: 0, max: 1, step: 0.01 },
  ]
}
```

---

### tabs

```js
{
  type: 'tabs',
  tabs: [
    { label: 'light',  children: [ ...items ] },
    { label: 'shadow', children: [ ...items ] },
  ]
}
```

---

### link / popup

```js
{ type: 'link', label: 'docs', url: 'https://example.com' }

{
  type: 'popup', label: 'about',
  config: {
    title: 'cntrlpnl', text: 'v2',
    buttons: [{ label: 'close', action: 'close' }]
  }
}
```

---

## Multiple panels

Panels stack and reflow automatically.

```js
window.pnlConfigs = [
  { ui: { title: 'scene',   accent: '#00ff88' },                 controls: [...] },
  { ui: { title: 'post fx', accent: '#ff6600', collapsed: true }, controls: [...] },
];

window.pnlStates[0].speed = 10;
window.pnlStates[1].bloom = 0.4;
```

---

## Theming

One accent color per panel controls everything — slider thumbs, toggle fill, tab underline, folder border, glow.

```js
ui: { accent: '#ff6600' }
ui: { accent: '#a855f7' }
ui: { accent: '#00d4ff' }
```

---

## Example

```html
<!DOCTYPE html>
<html>
<body>
<canvas id="c" width="800" height="600"></canvas>
<script src="cntrlpnl.js"></script>
<script>
  window.pnlConfigs = [{
    ui: { title: 'renderer', accent: '#00ff88', closeKey: 'h' },
    controls: [
      { type: 'text',    label: 'scene' },
      { type: 'toggle',  key: 'paused',     label: 'paused',     default: false },
      { type: 'color',   key: 'background', label: 'background', default: '#111122', modes: ['slider'] },
      { type: 'text',    label: 'camera' },
      { type: 'point2d', key: 'pan',        label: 'pan',        default: { x: 0, y: 0 } },
      { type: 'slider',  key: 'zoom',       label: 'zoom',       default: 1, min: 0.1, max: 5, step: 0.1 },
      {
        type: 'folder', label: 'post fx',
        children: [
          { type: 'slider', key: 'bloom',    label: 'bloom',    default: 0,   min: 0, max: 1, step: 0.01 },
          { type: 'slider', key: 'vignette', label: 'vignette', default: 0.3, min: 0, max: 1, step: 0.01 },
        ]
      },
      { type: 'button', label: 'reset', onClick: s => { s.zoom = 1; s.pan = { x: 0, y: 0 }; } }
    ]
  }];

  function render() {
    const s = window.pnlStates?.[0];
    if (!s?.paused) {
      // your draw code
    }
    requestAnimationFrame(render);
  }
  render();
</script>
</body>
</html>
```

---

## License

MIT
