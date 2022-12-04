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

const App: FunctionComponent<Props> = function App (props) {
    const { permissions } = props
    const routeState = useSignal<string>(location.pathname)
    const webnative = useSignal<wn.State | null>(null)

    console.log('render routeState', routeState.value)
    console.log('render webnative', webnative.value)

    // 
    // use route-event, because navigation API is chrome only
    // https://github.com/nichoth/hermes/discussions/10
    //
    useEffect(() => {
        const route = Route()
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

    const match = router.match(routeState.value)
    const Node = match ?
        match.action(webnative.value) :
        () => (<p>missing route</p>)

    return (<div class="testing">
        <p>the route is: {routeState}</p>
        <h2>hello, this is the app</h2>
        <Node />
    </div>)
}

const el = document.getElementById('root')
if (el) {
    render(<App permissions={PERMISSIONS} />, el)
}
