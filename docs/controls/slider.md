---
title: slider
layout: default
parent: Controls
nav_order: 1
---

# slider

Full-width track with a scrubable number readout. Drag the number up/down to scrub, click to type an exact value.

```js
{
  type:    'slider',
  key:     'exposure',
  label:   'exposure',
  default: 1.0,
  min:     0,
  max:     2,
  step:    0.01,
  info:    'scene exposure multiplier'
}
```

| property | type | default | description |
|---|---|---|---|
| `key` | string | — | state key |
| `label` | string | key | display label |
| `default` | number | — | initial value |
| `min` | number | `0` | minimum |
| `max` | number | `100` | maximum |
| `step` | number | `1` | increment; decimal steps auto-format the readout |
| `info` | string | — | tooltip on hover |
