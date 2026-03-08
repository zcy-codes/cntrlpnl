---
title: Theming
layout: default
nav_order: 4
---

# Theming

One accent color per panel. It drives everything — slider thumbs, toggle fill, tab underline, folder border, glow on inputs.

```js
ui: { accent: '#ff6600' }   // orange
ui: { accent: '#a855f7' }   // purple
ui: { accent: '#00d4ff' }   // cyan
ui: { accent: '#00ff88' }   // green (default)
```

Set it in `ui.accent` (new format) or `theme.accent` (legacy).

---

## Keyboard toggle

Assign a key to collapse/expand the panel:

```js
ui: { closeKey: 'h' }
```

Press `h` anywhere on the page to toggle the panel.

---

## Start collapsed

```js
ui: { collapsed: true }
```
