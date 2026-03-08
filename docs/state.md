---
title: State
layout: default
nav_order: 3
---

# State

Each panel exposes its state as a reactive `Proxy` on `window.pnlStates[index]`.

```js
const s = window.pnlStates[0];

s.speed;                         // read
s.speed = 75;                    // write — slider updates instantly
s.tint  = '#ff0000';             // color swatch updates
s.origin = { x: 0.5, y: -0.3 }; // point2d handle moves
```

Writing to the proxy updates the panel in real time. Reading from it always gives the current value.

---

## Multiple panels

```js
window.pnlConfigs = [
  { ui: { title: 'scene',   accent: '#00ff88' },                  controls: [...] },
  { ui: { title: 'post fx', accent: '#ff6600', collapsed: true }, controls: [...] },
];

window.pnlStates[0].speed = 10;
window.pnlStates[1].bloom = 0.4;
```

---

## Using state in a render loop

```js
function render() {
  const s = window.pnlStates?.[0];
  if (s) {
    myMesh.rotation.y += s.speed * 0.01;
    myMesh.visible = s.visible;
    renderer.setClearColor(s.bgColor);
  }
  requestAnimationFrame(render);
}
render();
```

The `?.` guard handles the brief moment before the panel initialises.
