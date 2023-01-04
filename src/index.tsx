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
import Router from './router.jsx'
import Route from 'route-event'
import { navList } from './navigation.js'
import { generateFromString } from 'generate-avatar'
import CONSTANTS from './CONSTANTS.jsx'
import './index.css'
import '@nichoth/components/hamburger.css'
import '@nichoth/components/mobile-nav-menu.css'
import '@nichoth/components/z-index.css'
import './pages/whoami.css'

const router = Router()

console.log('env', import.meta.env)

const PERMISSIONS = {
    app: {
        name: "hermes",
        creator: "snail-situation",
    },
    fs: {
        public: [wn.path.directory('Apps', 'snail-situation', 'hermes')],
        private: [wn.path.directory('Apps', 'snail-situation', 'hermes')]
    },
}

interface Props {
    permissions: Permissions,
}

const route = Route()

const App: FunctionComponent<Props> = function App ({ permissions }) {
    const routeState = useSignal<string>(location.pathname)
    const appAvatar = useSignal<string|undefined>(undefined)
    const webnative = useSignal<wn.State | null>(null)
    const isOpen = useSignal(false)

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

    //
    // read the profile, set it in app state
    //
    useEffect(() => {
        if (!webnative.value) return
        // @ts-ignore
        const { fs, username } = webnative.value
        if (!fs) return
        fs.cat(fs.appPath(wn.path.file(CONSTANTS.avatarPath)))
            .then(content => {
                console.log('*catted*', content)
                if (!content) return
                    appAvatar.value = URL.createObjectURL(
                        new Blob([content as BlobPart], { type: 'image/jpeg' })
                    )
            })
            .catch(err => {
                // no avatar file, no nothing
                console.log('**cant read in index**', err)
                console.log('the path we couldnt read...',
                    fs.appPath(wn.path.file(CONSTANTS.avatarPath)))
                
                appAvatar.value = 'data:image/svg+xml;utf8,' +
                    generateFromString(username)
            })
    }, [webnative.value])

    // find the view for this route
    const match = router.match(routeState.value)
    const Node = match ?
        match.action({ login }, webnative.value) :
        () => (<p class="404">missing route</p>)

    function mobileNavHandler (ev) {
        ev.preventDefault()
        isOpen.value = !isOpen.value
    }

    if (!webnative.value) return null

    return (<div class="shell">
        <HamburgerWrapper isOpen={isOpen} onClick={mobileNavHandler} />
        <MobileNav isOpen={isOpen} navList={navList} />

        <div class="head-part">
            <a href="/whoami" class={'avatar' + (routeState.value === '/whoami' ?
                ' active' :
                '')}
            >
                <figure>
                    {/* @ts-ignore */}
                    {/* <img src={`data:image/svg+xml;utf8,${generateFromString(webnative.value.username)}`} /> */}
                    {/* <img src={appAvatar.value || ('data:image/svg+xml;utf8,' +
                        generateFromString(webnative.value.username || ''))}></img> */}
                    <img src={appAvatar.value}></img>
                </figure>
                {/* @ts-ignore */}
                <span>{webnative.value.username || ''}</span>
            </a>

            <nav>
                {navList.map(item => {
                    return <a className={'app-nav' + (routeState.value === item.href ?
                        ' active' : '')}
                        href={item.href}
                    >
                        {item.body}
                    </a>
                })}
            </nav>
        </div>

        <div class="content">
            <Node login={login} webnative={webnative} appAvatar={appAvatar} />
        </div>
    </div>)
}

const el = document.getElementById('root')
if (el) render(<App permissions={PERMISSIONS} />, el)
