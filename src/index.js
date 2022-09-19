// @ts-check
import Tonic from '@socketsupply/tonic'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
import Router from './router'
import { Permissions } from "webnative/ucan/permissions"
const observ = require('observ')
const struct = require('struct')
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

wn.initialise({ PERMISSIONS })
    .then(result => {
        state.wn.set(result)
    })
    .catch((err) => {
        console.log('errrrrrrrrr', err)
    })

navigation.addEventListener('navigate', function onNavigate (ev) {
    console.log('navigate', ev)
    const url = new URL(ev.destination.url)
    console.log('url', url)
    console.log('location', location)

    if (url.host !== location.host) return

    ev.intercept({
        handler () {
            setState(Object.assign({}, state, { route: url.pathname }))
        }
    })
})

state.route(function onChange (newRoute) {

})

class App extends Tonic {
    render () {
        return this.html`<div>Hello, world</div>`
    }
}

Tonic.add(App)
