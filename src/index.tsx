import { h, render } from 'preact'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
// import { WebnativeProvider } from "./context/webnative"
import { useEffect, useState } from 'preact/hooks'
import { Permissions } from "webnative/ucan/permissions"
import observ from 'observ'
import struct from 'observ-struct'
import { FunctionComponent } from 'preact';
// import { useWebnative } from "./context/webnative"
import Router from './router'

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
    init: observ({})
})

// @ts-ignore
navigation.addEventListener('navigate', ev => {
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

state(function onChange (_state) {
    const { route, init } = _state
    const el = document.getElementById('root')
    if (!el) return
    const match = router.match(route)
    const Node = match ? match.action() : () => (<p>missing route</p>)
    render(<App init={init} route={route} permissions={PERMISSIONS}>
        <Node init={init} />
    </App>, el)
})

interface Props {
    route: string,
    permissions?: Permissions,
    init?: wn.State
}

const App: FunctionComponent<Props> = function App (props) {
    const { permissions, route, init, children } = props

    useEffect(() => {
        wn.initialise({ permissions })
            .then(result => {
                state.init.set(result)
            })
            .catch((err) => {
                console.log('errrrrrrrrr', err)
            })
    }, [permissions])

    if (!init?.authenticated) {
        // go to login page
        return (<div>
            <p>the route is: {route}</p>
            <p>need to auth</p>
            {children}
        </div>)
    }

    return (<div class="testing">
        <p>the route is: {route}</p>
        <h2>hello, this is the app</h2>
        {children}
    </div>)
}

const el = document.getElementById('root')
const Node = router.match(state().route).action()
if (el) {
    render(<App route={state().route} permissions={PERMISSIONS}>
        <Node />
    </App>, el)
}
