import { h, render } from 'preact'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
import { useEffect, useState } from 'preact/hooks'
import { Permissions } from "webnative/ucan/permissions"
import { FunctionComponent } from 'preact';
import Router from './router'
import Route from 'route-event'

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

interface Props {
    permissions?: Permissions,
}

const App: FunctionComponent<Props> = function App (props) {
    const { permissions } = props
    const [state, setState] = useState({
        route: location.pathname,
        wn: null
    })

    // @ts-ignore
    window.state = state

    // 
    // new stuff with route-event, because navigation API is chrome only
    //
    useEffect(() => {
        const route = Route()
        const unlisten = route(function onRoute(path) {
            setState(Object.assign({}, state, { route: path }))
        })
        return unlisten
    }, [])

    // initialize webnative
    useEffect(() => {
        wn.initialise({ permissions })
            .then(result => {
                setState(Object.assign({}, state, { wn: result }))
            })
            .catch((err) => {
                console.log('errrrrrrrrr', err)
            })
    }, [permissions])

    console.log('**state**', state)

    const match = router.match(state.route)
    const Node = match ? match.action(state.wn) : () => (<p>missing route</p>)

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
