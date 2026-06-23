# checkselect.js

A small jQuery plugin that replaces a `<select>` element with a group of
checkboxes (for `multiple` selects) or radio buttons (for single selects), while
keeping the original `<select>` in sync underneath. It supports `<optgroup>`
labels, an optional "select all" control, and an optional maximum-selection limit
with inline tooltip feedback.

> **Dependency:** jQuery only. There is **no Bootstrap (or jQuery UI)
> dependency** — `checkselect.js` can be used on its own, independently of the
> rest of this suite.

---

## Table of contents

- [Why](#why)
- [Installation](#installation)
- [Usage](#usage)
- [How it works](#how-it-works)
- [Options](#options)
- [Maximum selections (`selectMax`)](#maximum-selections-selectmax)
- [Generated markup](#generated-markup)
- [Styling](#styling)
- [Notes & limitations](#notes--limitations)

---

## Why

A native `<select multiple>` is awkward to use (ctrl-click, easy to lose a
selection) and a single `<select>` can't be styled as a radio group.
`checkselect` renders an accessible checkbox/radio group in its place but leaves
the underlying `<select>` as the real, submitted form control — so server-side
code needs no changes.

---

## Installation

Include jQuery, then `checkselect.js`:

```html
<script src="jquery.min.js"></script>
<script src="js/checkselect.js"></script>
```

The plugin registers `$.fn.checkselect` and a single delegated `change` handler
on `document`, so it works for elements added after page load too.

---

## Usage

Mark up a normal `<select>` (give it an `id` and a `name`), then call the plugin:

```html
<select id="colours" name="colours" class="checkselect" multiple>
  <option>Red</option>
  <option selected>Green</option>
  <option value="b">Blue</option>
</select>

<script>
  $('.checkselect').checkselect({
    inline: false,
    selectAll: true,
    hideOriginal: false
  });
</script>
```

- A `multiple` select renders as **checkboxes**.
- A single (non-`multiple`) select renders as **radio buttons**.
- `<optgroup>`s render with a group label heading.

`<option>`s with no `value` attribute fall back to using their text as the value
(the original `<option>`'s `value` is set to its text so submission still works).

---

## How it works

1. For each matched `<select>`, the plugin builds a container (`<div class="checkselect">`
   by default) and inserts it directly after the select.
2. Each `<option>` becomes a `<label>` wrapping an `<input>` (checkbox or radio).
   Pre-`selected` options are pre-checked.
3. The original `<select>` is hidden (unless `hideOriginal: false`) but stays in
   the DOM as the canonical, submitted field.
4. A delegated `change` handler keeps them in sync: ticking/unticking a generated
   input flips `selected` on the matching `<option>` and fires `change` on the
   `<select>`, so any code already listening to the select keeps working.

The underlying `<select>` is the source of truth — bind your own logic to it, not
to the generated inputs.

---

## Options

Pass any of these to `$.fn.checkselect(options)`:

| Option | Default | Description |
|--------|---------|-------------|
| `container` | `"<div></div>"` | Markup for the wrapper element created around the generated controls. |
| `containerClass` | `"checkselect"` | Class added to the wrapper. The `change` handler and "select all" both key off this class, so changing it changes the selector the plugin looks for internally. |
| `inputContainer` | `"<label></label>"` | Markup wrapping each generated input (and the select-all control). |
| `inputContainerClass` | `""` | Extra class added to every label (per-option **and** the select-all label). |
| `inputClass` | `""` | Extra class added to every generated `<input>` (per-option **and** the select-all checkbox). |
| `selectAll` | `false` | Adds a "select all" checkbox. Applies to checkbox (i.e. `multiple`) groups only. |
| `selectAllText` | `"Select All"` | Label/title text for the select-all control. |
| `inline` | `true` | Lay options out inline. `false` stacks them (`display:block; width:100%`). |
| `hideOriginal` | `true` | Hide the underlying `<select>`. Set `false` to keep it visible (useful for debugging). |
| `selectMax` | `false` | Maximum number of checkboxes that may be ticked. `false` = no limit. Checkbox groups only. |
| `selectMaxMessage` | `"Maximum options reached."` | Text shown in the tooltip when the limit is exceeded. |
| `selectMaxMarkup` | `""` | Optional HTML inserted next to the rendered group (e.g. a hint like *"Pick up to 3"*). Only inserted when `selectMax` is set and this is non-empty. |
| `selectMaxMarkupPosition` | `"after"` | Where `selectMaxMarkup` is inserted relative to the group: `"before"` or `"after"`. |
| `selectMaxDelay` | `1500` | Milliseconds the "max reached" tooltip stays before fading. |
| `selectMaxFadeDuration` | `400` | Tooltip fade-out duration in milliseconds. |
| `selectMaxTipClass` | `"cs-max-tip"` | Class applied to the tooltip `<div>` (style it yourself — see [Styling](#styling)). |

---

## Maximum selections (`selectMax`)

When `selectMax` is set on a **checkbox** group, ticking a box that would take the
group over the limit is reverted (the box is unchecked) and a small tooltip with
`selectMaxMessage` appears next to the input, then fades out. Radio groups ignore
`selectMax` entirely.

There are two ways to set the limit, in priority order:

1. **A `data-checkselect-max` attribute on the original `<select>`** — wins if
   present. Handy when the limit lives in the markup:
   ```html
   <select id="toppings" name="toppings" class="checkselect" multiple
           data-checkselect-max="3"> … </select>
   ```
2. **The `selectMax` option** — used as the fallback when the select has no
   `data-checkselect-max` attribute:
   ```js
   $('#toppings').checkselect({ selectMax: 3 });
   ```

The message, delay, fade duration and tooltip class always come from the plugin
options (stored on the container at build time). Optionally show a static hint
alongside the group:

```js
$('#toppings').checkselect({
  selectMax: 3,
  selectMaxMarkup: '<small class="text-muted">Choose up to 3</small>',
  selectMaxMarkupPosition: 'before',
  selectMaxMessage: 'You can only pick 3 toppings.'
});
```

---

## Generated markup

For a `multiple` select `#colours` with options Red / Green / Blue, with
`selectAll: true`, the plugin produces roughly:

```html
<div class="checkselect">
  <label for="colours-select-all" class="check-select-all" title="Select All">
    <input id="colours-select-all" type="checkbox" data-target="colours"> Select All
  </label>

  <label for="colours-Red" class="check" title="">
    <input name="_checkselect_colours" class="checkselectcolours checkbox"
           value="Red" id="colours-Red"
           data-toggle="checkselect" data-target="colours" type="checkbox"> Red
  </label>
  <!-- …one label/input per option… -->
</div>
```

Key hooks:

- Container: `div.checkselect` (or your `containerClass`).
- Each input carries `data-toggle="checkselect"` and `data-target="<select id>"` —
  this is the internal wiring the `change` handler uses (set and read by the
  plugin; you don't author these).
- Per-option inputs also get the class `checkbox` or `radio`, plus
  `checkselect<name>`.
- Generated inputs are named `_checkselect_<name>` (a visual proxy). The
  **original `<select>` remains the real submitted field** and is kept in sync.
- `<optgroup>`s emit a `<label class="checkselect-optgroup-label">` heading.

---

## Styling

The plugin ships no CSS — style the generated classes to taste. The pieces you'll
typically want to style:

| Class | What it is |
|-------|------------|
| `.checkselect` | The wrapper around the whole group. |
| `.check` | Each per-option label. |
| `.check-select-all` | The "select all" label. |
| `.checkselect-optgroup-label` | An optgroup heading. |
| `.cs-max-tip` (or your `selectMaxTipClass`) | The "maximum reached" tooltip. The plugin only positions it (`position:absolute`, near the input) — give it your own colours, padding, border, etc. |

Example tooltip style:

```css
.cs-max-tip {
  background: #b00020;
  color: #fff;
  padding: 2px 8px;
  border-radius: 3px;
  font-size: 0.85em;
}
```

---

## Notes & limitations

- **Checkbox vs radio** is decided by the select's `multiple` attribute — there's
  no option to force one or the other.
- **`selectAll` and `selectMax` are checkbox-only.** Both are ignored for single
  (radio) selects.
- **Select-all + selectMax:** clicking "select all" ticks every option and fires
  `change` on each, so if the group has a `selectMax`, every over-limit option is
  individually reverted (and can momentarily flash multiple tooltips). Treat
  "select all" and a hard `selectMax` as a slightly awkward combination.
- **Re-running on the same select** appends a second control group; the plugin
  doesn't tear down a previous render. Initialise each select once.
- The plugin reads the live `<option>` set at init time. It does **not** yet
  auto-detect later changes to the underlying `<select>`'s options (see the TODO
  at the top of the source).
