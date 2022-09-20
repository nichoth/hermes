// @ts-check
import Tonic from '@socketsupply/tonic'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
import Router from './router'
import observ from 'observ'
import struct from 'observ-struct'
// const observ = require('observ')
// const struct = require('observ-struct')
const router = Router()

const PERMISSIONS = {
    app: {
        name: "Hermes",
        creator: "snail-situation",
    },
    fs: {
        public: [wn.path.directory("Apps", "snail-situation", "Hermes")],
    },
}

const state = struct({
    route: observ(location.pathname),
    wn: observ(null)
})

wn.initialise({ permissions: PERMISSIONS })
    .then(result => {
        state.wn.set(result)
        return result
    })
    .catch((err) => {
        console.log('errrrrrrrrr', err)
    })

// @ts-ignore
navigation.addEventListener('navigate', function onNavigate (ev) {
    console.log('navigate', ev)
    const url = new URL(ev.destination.url)
    console.log('url', url)
    console.log('location', location)

    if (url.host !== location.host) return

    ev.intercept({
        handler () {
            state.route.set(url.pathname)
        }
    })
})

function getTagName (camelName) {
    return camelName.match(/[A-Z][a-z0-9]*/g).join('-').toLowerCase()
}

class TheApp extends Tonic {
    constructor () {
        super()
        this.state = { route: null }
        state.route((newRoute) => {
            console.log('new route', newRoute)
            this.state.route = newRoute
            this.reRender()
        })
    }

    render () {
        const child = router.match(state().route).action(state.wn())

        return this.html`<div>
            <p>Hello, world</p>

            <${getTagName(child.name)}></${getTagName(child.name)}>
        </div>`
    }
}
Tonic.add(TheApp)
