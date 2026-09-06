export function load({ runtime }) {
    runtime.metatext = content => {
        if (typeof content != 'string') {
            let err = new Error('Argument is not a string')
            err.origin = 'metatext'
            throw err
        }
        return content
		.replaceAll('<','<<')
		.replaceAll('>','>>')
		.replaceAll('<<','<s>')
		.replaceAll('>>','</s>')
		.replaceAll('{','<u>')
		.replaceAll('}','</u>')
		.replaceAll('(','<b>')
		.replaceAll(')','</b>')
		.replaceAll('[','<i>')
		.replaceAll(']','</i>')
		.replaceAll('|','<br>')
		.replaceAll('_','<hr>')
		.replaceAll('~','&nbsp;')
    }
    runtime.removeMetatext = (content) => {
        if (typeof content != 'string') {
			let err = new Error('Argument is not a string')
			err.origin = 'metatext'
			throw err
		}
        return content
        .replaceAll('<','')
        .replaceAll('>','')
        .replaceAll('{','')
        .replaceAll('}','')
        .replaceAll('(','')
        .replaceAll(')','')
        .replaceAll('[','')
        .replaceAll(']','')
        .replaceAll('|',' ')
        .replaceAll('_',' ')
        .replaceAll('~',' ')
    }
}

// v9 factory — load-only renderer (adds runtime.metatext helper). ADR-0010.
export function renderMetatext(options = {}) {
    return { name: options.name ?? 'metatext', options, load, module: import.meta.url }
}