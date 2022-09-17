import { h, render } from 'preact'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
// import { WebnativeProvider } from "./context/webnative"
import { useEffect, useState } from 'preact/hooks'
import { Permissions } from "webnative/ucan/permissions"
// @ts-ignore
import observ from 'observ'
// @ts-ignore
import struct from 'observ-struct'
import { FunctionComponent } from 'preact';
// import { useWebnative } from "./context/webnative"

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

// @ts-ignore
state(function onChange (_state) {
    const { route, init } = _state
    // console.log('state change', _state)
    const el = document.getElementById('root')
    if (!el) return
    render(<App init={init} route={route} permissions={PERMISSIONS} />, el);
})

interface Props {
    route: string,
    permissions?: Permissions,
    init?: wn.State
}

const App: FunctionComponent<Props> = function App ({ permissions, route, init })  {
    useEffect(() => {
        async function getState() {
            const result = await wn.initialise({ permissions })
                .catch((err) => {
                    if (err) console.log('errrrrrrrrr', err)
                    return undefined
                })
            
            state.init.set(result)
        }
        getState()
    }, [permissions])

    if (!init?.authenticated) {
        // go to login page
        return (<div>
            <p>the route is: {route}</p>
            <p>need to auth</p>
            <a href="/fooo">fooo</a>
        </div>)
    }

    return (<div class="testing">
        <p>the route is: {route}</p>
        <p>hello, this is the app</p>
    </div>)
}

const el = document.getElementById('root')
if (el) {
    render(<App route={''} permissions={PERMISSIONS} />, el)
}
