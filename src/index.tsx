import { h, render } from 'preact'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
import { useEffect, useState } from 'preact/hooks'
import { Permissions } from "webnative/ucan/permissions"
import observ from 'observ'
import struct from 'observ-struct'
import { FunctionComponent } from 'preact';
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

state(function onChange (newState) {
    const el = document.getElementById('root')
    if (!el) return
    render(<App {...newState} permissions={PERMISSIONS} />, el)
})

interface Props {
    route: string,
    permissions: Permissions,
    init?: wn.State
}


// @ts-ignore
const navListener = window.navListener = ev => {
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
}


const App: FunctionComponent<Props> = function App (props) {
    const { permissions, route, init } = props

    // initialize webnative
    useEffect(() => {
        wn.initialise({ permissions })
            .then(result => {
                state.init.set(result)
                // setState(Object.assign({}, state, { init: result }))
            })
            .catch((err) => {
                console.log('errrrrrrrrr', err)
            })
    }, [permissions])


    console.log('**render | state**', state())

    const match = router.match(route)
    const Node = match ? match.action(init) : () => (<p>missing route</p>)

    return (<div class="testing">
        <p>the route is: {route}</p>
        <h2>hello, this is the app</h2>
        <Node />
    </div>)
}

const el = document.getElementById('root')
if (el) {
    render(<App {...state()} permissions={PERMISSIONS} />, el)
}
