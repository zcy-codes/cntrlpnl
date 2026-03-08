---
title: layout & actions
layout: default
parent: Controls
nav_order: 8
---

# layout & actions

Controls that don't bind to state keys — they structure the panel or trigger actions.

---

## button

Full-width action button. `onClick` receives the reactive state proxy.

```js
{
  type:    'button',
  label:   'reset',
  onClick: s => { s.speed = 50; s.visible = true; }
}
```

---

## text

Section label / separator.

```js
{ type: 'text', label: 'rendering' }
```

---

## folder

Collapsible group. Panels reflow when a folder opens or closes.

```js
{
  type:     'folder',
  label:    'post fx',
  children: [
    { type: 'slider', key: 'bloom',   default: 0,   min: 0, max: 1, step: 0.01 },
    { type: 'slider', key: 'sharpen', default: 0.2, min: 0, max: 1, step: 0.01 },
  ]
}
```

---

## tabs

Tabbed sections. Each tab has its own `children` array.

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

## link

Opens a URL in a new tab.

```js
{ type: 'link', label: 'docs', url: 'https://example.com' }
```

---

## popup

Opens an in-panel modal dialog.

```js
{
  type:  'popup',
  label: 'about',
  config: {
    title:   'cntrlpnl',
    text:    'v2',
    buttons: [{ label: 'close', action: 'close' }]
  }
}
```
