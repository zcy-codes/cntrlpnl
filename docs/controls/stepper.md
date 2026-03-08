---
title: stepper
layout: default
parent: Controls
nav_order: 5
---

# stepper

Increment/decrement buttons.

```js
{ type: 'stepper', key: 'layers', label: 'layers', default: 3, min: 1, max: 16, step: 1 }
```

| property | type | description |
|---|---|---|
| `key` | string | state key |
| `label` | string | display label |
| `default` | number | initial value |
| `min` | number | lower bound (optional) |
| `max` | number | upper bound (optional) |
| `step` | number | increment per click |
