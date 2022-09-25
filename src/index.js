// @ts-check
import Tonic from '@socketsupply/tonic'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
import Router from './router'
import observ from 'observ'
import struct from 'observ-struct'
import { getTagName } from './util'
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
    wn: observ(wn.initialise({ permissions: PERMISSIONS }))
})

// @ts-ignore
navigation.addEventListener('navigate', function onNavigate (ev) {
    console.log('navigate', ev)
    const url = new URL(ev.destination.url)

    if (url.host !== location.host) return

    ev.intercept({
        handler () {
            console.log('route change', url.pathname)
            state.route.set(url.pathname)
        }
    })
})

class TheApp extends Tonic {
    constructor () {
        super()
        this.state = { route: null }
        state.route((newRoute) => {
            this.state.route = newRoute
            this.reRender()
        })
    }

    async render () {
        const wn = await state.wn()
        const child = router.match(state().route).action(wn)

        return this.html`<div>
            <p>Hello, world</p>

            <${getTagName(child.name)}></${getTagName(child.name)}>
        </div>`
    }
}

Tonic.add(TheApp)
