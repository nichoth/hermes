// @ts-check
import { h, render } from 'preact'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
import { useEffect } from 'preact/hooks'
import { useSignal } from "@preact/signals"
import { Permissions } from "webnative/ucan/permissions.js"
import { FunctionComponent } from 'preact'
import Router from './router.jsx'
import Route from 'route-event'
import './index.css'

const router = Router()

console.log('env', import.meta.env)

const PERMISSIONS = {
    app: {
        name: "hermes",
        creator: "snail-situation",
    },
    fs: {
        public: [wn.path.directory("Apps", "snail-situation", "hermes")],
    },
}

interface Props {
    permissions: Permissions,
}

const route = Route()

const App: FunctionComponent<Props> = function App ({ permissions }) {
    const routeState = useSignal<string>(location.pathname)
    const webnative = useSignal<wn.State | null>(null)

    console.log('render routeState', routeState.value)
    console.log('render webnative', webnative.value)

    function login () {
        wn.redirectToLobby(permissions)
    }

    //
    // componentDidMount
    //
    useEffect(() => {
        const unlisten = route(function onRoute (path:string) {
            routeState.value = path
        })

        return unlisten
    }, [])

    //
    // when webnative changes
    // check the `authenticated` status, and redirect to `/login` if necessary
    //
    useEffect(() => {
        if (!webnative.value) return
        if (!(webnative.value.authenticated)) {
            route.setRoute('/login')
        }
    }, [webnative.value])

    //
    // initialize webnative
    // if/when permissions change
    //
    useEffect(() => {
        wn.initialise({ permissions })
            .then(wnState => {
                webnative.value = wnState
            })
            .catch(err => {
                console.log('errrrrrrrrrrrr', err)
            })
    }, [permissions])

    // find the view for this route
    const match = router.match(routeState.value)
    const Node = match ?
        match.action({ login }, webnative.value) :
        () => (<p class="404">missing route</p>)

    return (<div class="testing">
        <p>the route is: {routeState}</p>
        <Node login={login} webnative={webnative} />
    </div>)
}

const el = document.getElementById('root')
if (el) {
    render(<App permissions={PERMISSIONS} />, el)
}
