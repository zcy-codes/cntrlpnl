---
title: color
layout: default
parent: Controls
nav_order: 3
---

# color

Hex input by default. Add `modes` to expand into a full picker.

```js
{
  type:      'color',
  key:       'bg',
  label:     'background',
  default:   '#1a1a2e',
  modes:     ['slider', 'box', 'rgb', 'opacity'],
  onOpacity: val => { myAlpha = val; }
}
```

## modes

| mode | what it adds |
|---|---|
| `slider` | hue bar + live swatch |
| `box` | saturation/brightness canvas picker |
| `rgb` | individual R G B number inputs |
| `opacity` | alpha slider with checkerboard preview |

Omit `modes` entirely for a compact hex-only row.

## onOpacity

`onOpacity(value)` fires when the opacity slider moves. It's a separate callback because opacity isn't encoded in the hex value — store it yourself and use it however you need.

```js
let alpha = 1.0;

{
  type: 'color', key: 'fill', label: 'fill',
  default: '#ff0000',
  modes: ['slider', 'opacity'],
  onOpacity: v => { alpha = v; }
}
```

| property | type | description |
|---|---|---|
| `key` | string | state key (hex string) |
| `label` | string | display label |
| `default` | string | initial hex value |
| `modes` | string[] | picker modes to show |
| `onOpacity` | function | called with `(number)` on alpha change |
| `info` | string | tooltip on hover |
