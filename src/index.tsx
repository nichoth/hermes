// @ts-check
import { h, render } from 'preact'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
import { useEffect } from 'preact/hooks'
import { useSignal } from "@preact/signals";
import { Permissions } from "webnative/ucan/permissions"
import { FunctionComponent } from 'preact';
import Router from './router'
import Route from 'route-event'
import './index.css'

const router = Router()

console.log('env', import.meta.env)

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
    permissions: Permissions,
}

const App: FunctionComponent<Props> = function App ({ permissions }) {
    const routeState = useSignal<string>(location.pathname)
    const webnative = useSignal<wn.State | null>(null)

    console.log('render routeState', routeState.value)
    console.log('render webnative', webnative.value)

    function login () {
        wn.redirectToLobby(permissions)
    }

    function logout () {
        wn.leave()
    }

    // let fs, username

    // switch ((webnative.value || {}).scenario) {
    //     case wn.Scenario.AuthCancelled:
    //       // User was redirected to lobby,
    //       // but cancelled the authorisation
    //       break

    //     case wn.Scenario.NotAuthorised:

      
    //     case wn.Scenario.AuthSucceeded:
    //     case wn.Scenario.Continuation:
    //       fs = webnative?.permissions.fs
    //       username = webnative.username
    //       break
    // }

    // 
    // use `route-event`, because navigation API is chrome only
    // https://github.com/nichoth/hermes/discussions/10
    //
    let route
    useEffect(() => {
        route = Route()
        const unlisten = route(function onRoute (path:string) {
            routeState.value = path
        })
        return unlisten
    }, [])

    //
    // initialize webnative
    //
    useEffect(() => {
        wn.initialise({ permissions })
            .then(res => {
                webnative.value = res
            })
            .catch(err => {
                console.log('errrrrrrrrrrrr', err)
            })
    }, [permissions])

    //
    // componenet did mount
    //
    useEffect(() => {
        if ((webnative.value && !webnative.value.authenticated)) {
            route.setRoute('/login')
        }
    }, [])

    // find the view for this route
    const match = router.match(routeState.value)
    const Node = match ?
        match.action({ login }, webnative.value) :
        () => (<p class="404">missing route</p>)

    return (<div class="testing">
        <p>the route is: {routeState}</p>
        <h2>hello, this is the app</h2>
        <Node login={login} webnative={webnative} />
    </div>)
}

const el = document.getElementById('root')
if (el) {
    render(<App permissions={PERMISSIONS} />, el)
}
