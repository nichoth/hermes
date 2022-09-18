import { h, render } from 'preact'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
// import { WebnativeProvider } from "./context/webnative"
import { useEffect, useState } from 'preact/hooks'
import { Permissions } from "webnative/ucan/permissions"
// import observ from 'observ'
// import struct from 'observ-struct'
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

// const state = struct({
//     route: observ(location.pathname),
//     init: observ({})
// })

// state(function onChange (_state) {
//     const el = document.getElementById('root')
//     if (!el) return
//     render(<App {..._state} permissions={PERMISSIONS} />, el)
// })

interface Props {
    // route: string,
    permissions?: Permissions,
    // init?: wn.State
}

const App: FunctionComponent<Props> = function App (props) {
    // const { permissions, route, init } = props
    const { permissions } = props
    const [state, setState] = useState({
        route: location.pathname,
        init: null
    })

    // listen for route change events
    useEffect(() => {
        // @ts-ignore
        navigation.addEventListener('navigate', ev => {
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
    }, [])

    // initialize webnative
    useEffect(() => {
        wn.initialise({ permissions })
            .then(result => {
                setState(Object.assign({}, state, { init: result }))
            })
            .catch((err) => {
                console.log('errrrrrrrrr', err)
            })
    }, [permissions])

    console.log('**state**', state)

    const match = router.match(state.route)
    const Node = match ? match.action(state.init) : () => (<p>missing route</p>)

    return (<div class="testing">
        <p>the route is: {state.route}</p>
        <h2>hello, this is the app</h2>
        <Node />
    </div>)
}

const el = document.getElementById('root')
if (el) {
    render(<App permissions={PERMISSIONS} />, el)
}
