// Metatext: a punctuation-only markup for text that comes from a CMS field
// where an author cannot be given HTML.
//
//   <x>  strike     {x}  underline   (x)  bold    [x]  italic
//   |    line break  _    rule        ~    nbsp
//
// The implementation is a chain of replaceAll calls, and both its ORDER and
// its doubling step are load-bearing in ways that are invisible from reading
// it quickly. That is what these tests hold still.

import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { renderMetatext, load } from '../index.js'

const runtime = {}
load({ runtime })
const { metatext, removeMetatext } = runtime

describe('the marks', () => {
    it('renders each pair', () => {
        assert.equal(metatext('<x>'), '<s>x</s>')
        assert.equal(metatext('{x}'), '<u>x</u>')
        assert.equal(metatext('(x)'), '<b>x</b>')
        assert.equal(metatext('[x]'), '<i>x</i>')
    })

    it('renders the singles', () => {
        assert.equal(metatext('a|b'), 'a<br>b')
        assert.equal(metatext('a_b'), 'a<hr>b')
        assert.equal(metatext('a~b'), 'a&nbsp;b')
    })

    it('leaves ordinary text alone', () => {
        assert.equal(metatext('plain words'), 'plain words')
        assert.equal(metatext(''), '')
    })
})

describe('why the angle brackets are doubled first', () => {
    it('does not corrupt the tag it just inserted', () => {
        // `<` becomes `<<` and only then `<s>`; `>` becomes `>>` and only then
        // `</s>`. Replacing `<` with `<s>` directly would leave a bare `>`
        // inside the new tag for the NEXT replacement to find, turning
        // `<x>` into `<s</s>x</s>`. The doubling is what keeps the two passes
        // from seeing each other's output.
        assert.equal(metatext('<x>'), '<s>x</s>')
        assert.equal(metatext('<a><b>'), '<s>a</s><s>b</s>')
    })

    it('survives an unbalanced mark rather than mangling the rest', () => {
        // Authors do write a stray bracket. It should produce a stray tag,
        // not eat the sentence.
        assert.equal(metatext('a < b'), 'a <s> b')
    })
})

describe('why the bracket marks come after', () => {
    it('inserts tags whose own punctuation is never re-read', () => {
        // (), {}, [] all expand to strings containing `<` and `>`. They run
        // AFTER the angle-bracket passes, so nothing rescans them. Reversing
        // the order would rewrite the `<` of `<b>` into `<s>`.
        assert.equal(metatext('(a){b}[c]'), '<b>a</b><u>b</u><i>c</i>')
    })

    it('handles marks nested inside each other', () => {
        assert.equal(metatext('(bold [and italic])'), '<b>bold <i>and italic</i></b>')
    })
})

describe('a value that is not a string', () => {
    it('throws, tagged with where it came from', () => {
        // The tag is the point: a render failure deep in a template needs to
        // name the helper that refused, or the author is left looking at a
        // stack trace through the renderer.
        for (const bad of [undefined, null, 42, {}, []]) {
            assert.throws(() => metatext(bad), (err) => {
                assert.equal(err.origin, 'metatext')
                assert.match(err.message, /not a string/)
                return true
            }, `metatext(${JSON.stringify(bad) ?? String(bad)}) should throw`)
        }
    })

    it('refuses the same way when stripping', () => {
        assert.throws(() => removeMetatext(null), (err) => err.origin === 'metatext')
    })
})

describe('removeMetatext', () => {
    it('takes the marks out and leaves the words', () => {
        assert.equal(removeMetatext('(bold) and [italic]'), 'bold and italic')
        assert.equal(removeMetatext('<struck>'), 'struck')
    })

    it('turns the spacing marks into actual spaces, not nothing', () => {
        // These separate words. Dropping them outright would run the
        // neighbouring words together in a plain-text summary or a meta
        // description.
        assert.equal(removeMetatext('a|b'), 'a b')
        assert.equal(removeMetatext('a_b'), 'a b')
        assert.equal(removeMetatext('a~b'), 'a b')
    })
})

describe('the plugin descriptor', () => {
    it('registers under `metatext` and carries load', () => {
        const d = renderMetatext()
        assert.equal(d.name, 'metatext')
        assert.equal(typeof d.load, 'function')
    })

    it('can be renamed', () => {
        assert.equal(renderMetatext({ name: 'mt' }).name, 'mt')
    })
})
