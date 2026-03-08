---
title: select
layout: default
parent: Controls
nav_order: 4
---

# select

Dropdown menu. Keys become option values, values become display labels.

```js
{
  type:    'select',
  key:     'blend',
  label:   'blend mode',
  default: 'add',
  options: {
    normal:   'Normal',
    add:      'Additive',
    multiply: 'Multiply',
    screen:   'Screen',
  }
}
```

| property | type | description |
|---|---|---|
| `key` | string | state key |
| `label` | string | display label |
| `default` | string | initial option key |
| `options` | object | `{ value: 'Label' }` pairs |
| `info` | string | tooltip on hover |
