// @ts-check
import { h, render } from 'preact'
import * as wn from "webnative"
import { useEffect } from 'preact/hooks'
import { useSignal } from "@preact/signals"
import { Permissions } from "webnative/permissions.js"
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
import './z-index.css'
import PERMISSIONS from './permissions.js'

const router = Router()

console.log('env', import.meta.env)

interface Props {
    permissions: Permissions,
}

const route = Route()

const App: FunctionComponent<Props> = function App ({ permissions }) {
    const routeState = useSignal<string>(location.pathname)
    const appAvatar = useSignal<string|undefined>(undefined)
    const webnative = useSignal<wn.Program | null>(null)
    const isOpen = useSignal(false)

    function login () {
        if (!webnative.value) return
        webnative.value.capabilities.request()
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
        if (!(webnative.value.session)) {
            route.setRoute('/login')
        }
    }, [webnative.value])

    //
    // initialize webnative
    // if/when permissions change
    //
    useEffect(() => {
        wn.program({
            namespace: { creator: "snail-situation", name: "hermes" },
            debug: true,
            permissions
        })
            .then(program => {
                webnative.value = program
            })
    }, [permissions])

    //
    // read the profile, set it in app state
    //
    useEffect(() => {
        if (!webnative.value?.session) return
        if (!('fs' in webnative.value.session) ||
            !('username' in webnative.value.session)) return

        const { fs, username } = webnative.value.session
        if (!fs) return

        const path = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(CONSTANTS.avatarPath)
        )

        fs.cat(path)
            .then(content => {
                if (!content) return
                appAvatar.value = URL.createObjectURL(
                    new Blob([content as BlobPart], { type: 'image/jpeg' })
                )
            })
            .catch(err => {
                // no avatar file, so set it to an auto generated value
                console.log('**cant read in index**', err)
                appAvatar.value = 'data:image/svg+xml;utf8,' +
                    generateFromString(username)

                if (!wn.path.appData) return
                console.log('the path we couldnt read...', path)
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
                    <img src={appAvatar.value}></img>
                </figure>
                {/* @ts-ignore */}
                <span>{webnative.value.session?.username || ''}</span>
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
