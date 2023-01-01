// @ts-check
import { h, render } from 'preact'
import * as wn from "webnative"
wn.setup.debug({ enabled: true })
import { useEffect } from 'preact/hooks'
import { useSignal } from "@preact/signals"
import { Permissions } from "webnative/ucan/permissions.js"
import { FunctionComponent } from 'preact'
import HamburgerWrapper from '@nichoth/components/hamburger.mjs'
import MobileNav from '@nichoth/components/mobile-nav-menu.mjs'
import '@nichoth/components/hamburger.css'
import '@nichoth/components/mobile-nav-menu.css'
import '@nichoth/components/z-index.css'
import Router from './router.jsx'
import Route from 'route-event'
import { navList } from './navigation.js'
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
    const isOpen = useSignal(false)

    console.log('*render routeState*', routeState.value)
    console.log('*render webnative*', webnative.value)

    function login () {
        wn.redirectToLobby(permissions)
    }

    //
    // componentDidMount
    // listen for route changes
    //
    useEffect(() => {
        return route(function onRoute (path:string) {
            routeState.value = path
        })
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

    function mobileNavHandler (ev) {
        ev.preventDefault()
        isOpen.value = !isOpen.value
    }

    return (<div class="shell">
        <HamburgerWrapper isOpen={isOpen} onClick={mobileNavHandler} />
        <MobileNav isOpen={isOpen} navList={navList} />

        <div class="head-part">
            <figure>
                <img src="favicon-16x16.png" alt="The beautiful MDN logo." />
            </figure>

            <nav>
                {navList.map(item => {
                    return <a href={item.href}>{item.body}</a>
                })}
            </nav>
        </div>

        <div class="content">
            <p>the route is: {routeState}</p>
            <Node login={login} webnative={webnative} />
        </div>
    </div>)
}

const el = document.getElementById('root')
if (el) render(<App permissions={PERMISSIONS} />, el)
