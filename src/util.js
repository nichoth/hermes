export function getTagName (camelName) {
    return camelName.match(/[A-Z][a-z0-9]*/g).join('-').toLowerCase()
}

