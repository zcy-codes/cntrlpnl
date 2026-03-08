---
title: point2d
layout: default
parent: Controls
nav_order: 7
---

# point2d

XY pad with a draggable handle. The coordinate inputs are also scrubable — drag up/down to adjust, click to type.

```js
{
  type:    'point2d',
  key:     'origin',
  label:   'origin',
  default: { x: 0, y: 0 },
  xRange:  [-1, 1],
  yRange:  [-1, 1],
  step:    0.01
}
```

State value is always `{ x: number, y: number }`.

```js
const s = window.pnlStates[0];
s.origin.x;              // read
s.origin = { x: 0.5, y: -0.3 };  // write
```

| property | type | default | description |
|---|---|---|---|
| `key` | string | — | state key |
| `label` | string | key | display label |
| `default` | `{x,y}` | `{x:0,y:0}` | initial position |
| `xRange` | `[min,max]` | `[-1,1]` | horizontal bounds |
| `yRange` | `[min,max]` | `[-1,1]` | vertical bounds |
| `step` | number | `0.01` | scrub increment |
