# mikser-io-render-metatext

Metatext helpers for [Mikser](https://github.com/almero-digital-marketing/mikser-io). Adds two functions to the render runtime — `metatext` and `removeMetatext` — for converting a compact bracket-based markup into HTML (or stripping it out).

## Install

```bash
npm install mikser-io-render-metatext
```

## Usage

```js
// mikser.config.js
export default {
  plugins: ['render-metatext']
}
```

In any template the helpers are available on the render runtime:

```hbs
{{metatext "[italic] (bold) {underline}"}}
{{removeMetatext meta.summary}}
```

## Mapping

| Source | Becomes |
|--------|---------|
| `< … >` | `<s>…</s>` (strikethrough) |
| `{ … }` | `<u>…</u>` (underline) |
| `( … )` | `<b>…</b>` (bold) |
| `[ … ]` | `<i>…</i>` (italic) |
| `\|`     | `<br>` |
| `_`     | `<hr>` |
| `~`     | `&nbsp;` |

`removeMetatext` strips the same characters, replacing `\|`, `_`, and `~` with a single space.

Both helpers throw if their input is not a string.

## License

ISC
