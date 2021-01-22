---
layout: page.11ty.cjs
title: <my-element> ⌲ Home
---

# &lt;dharpa-\*>

A collection of reusable components for applications in the field of digital humanities. Built for [DHARPA Project](https://dharpa.org/).

## Visualization

### Chord Diagram

<section class="columns">
  <div>

`<dharpa-chord-diagram>` is just an HTML element. You can it anywhere you can use HTML!

```html
<dharpa-chord-diagram />
```

  </div>
  
  <div class="section-dharpa-chord-diagram">

<dharpa-chord-diagram width="600" height="600"></dharpa-chord-diagram>

<script>
document.querySelector('.section-dharpa-chord-diagram dharpa-chord-diagram').data = Object.assign([
[0, 9, 4, 3, 4, 2],
[9, 0, 2, 3, 0, 4],
[4, 2, 0, 10, 8, 2],
[3, 3, 10, 0, 18, 11],
[4, 0, 8, 18, 0, 7],
[2, 4, 2, 11, 7, 0]], {
names: ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5', 'Topic 6'],
colors: ["#c4c4c4", "#69b40f", "#ec1d25", "#c8125c", "#008fc8", "#10218b", "#134b24", "#737373"]
})
</script>
  </div>
</section>

<!-- ## Configure with attributes

<section class="columns">
  <div>

`<my-element>` can be configured with attributed in plain HTML.

```html
<my-element name="HTML"></my-element>
```

  </div>
  <div>

<my-element name="HTML"></my-element>

  </div>
</section>

## Declarative rendering

<section class="columns">
  <div>

`<my-element>` can be used with declarative rendering libraries like Angular, React, Vue, and lit-html

```js
import { html, render } from 'lit-html'

const name = 'lit-html'

render(
  html`
    <h2>This is a &lt;my-element&gt;</h2>
    <my-element .name=${name}></my-element>
  `,
  document.body
)
```

  </div>
  <div>

<h2>This is a &lt;my-element&gt;</h2>
<my-element name="lit-html"></my-element>

  </div>
</section> -->
