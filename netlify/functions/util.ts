import { HandlerEvent } from '@netlify/functions'

export function parsePath (ev:HandlerEvent) {
    const path = ev.path.replace(/\/\.netlify\/functions\/[^/]*\//, '')
    const pathParts = (path) ? path.split('/') : []
    return pathParts
}
