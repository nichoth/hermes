// @ts-check
import { h, render } from 'preact'
import * as wn from "webnative"
import { useEffect } from 'preact/hooks'
import { useSignal } from "@preact/signals"
import { Permissions } from "webnative/permissions.js"
import { FunctionComponent } from 'preact'
import { generateFromString } from 'generate-avatar'
import HamburgerWrapper from '@nichoth/components/hamburger.mjs'
import MobileNav from '@nichoth/components/mobile-nav-menu.mjs'
import Route from 'route-event'
import { USERNAME_STORAGE_KEY, getHumanName } from './username.js'
import Router from './router.jsx'
import { navList } from './navigation.js'
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

// const App: FunctionComponent<Props> = function App ({ permissions }) {
const App: FunctionComponent<Props> = function App () {
    const routeState = useSignal<string>(location.pathname)
    const appAvatar = useSignal<string|undefined>(undefined)
    const webnative = useSignal<wn.Program | null>(null)
    const session = useSignal<wn.Session | null>(null)
    const mobileNavOpen = useSignal(false)
    const fullUsername = useSignal<string|null>(null)

    // @ts-ignore
    window.webnative = webnative
    // @ts-ignore
    window.wn = wn

    function logout (ev) {
        ev.preventDefault()
        if (!webnative.value) return
        console.log('*logout*')
        webnative.value.session?.destroy()
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
    // * initialize webnative
    //   if/when permissions change
    // * redirect to '/login' if not authd
    //
    useEffect(() => {
        wn.program({
            namespace: { creator: "snail-situation", name: "hermes" },
            debug: true
            // permissions
        })
            .then(async program => {
                webnative.value = program

                console.log('**program**', program)
                console.log('program.session', program.session)

                session.value = program.session ?
                    program.session :
                    await program.auth.session()

                fullUsername.value = await program.components.storage.getItem(
                    USERNAME_STORAGE_KEY
                ) as string

                //
                // __not authed__ -- redirect to login
                //
                if (!session.value) {
                    console.log('...not session...', program)
                    // create-account is ok if you don't have a name
                    if (location.pathname === '/create-account') return
                    route.setRoute('/login')
                }
            })
    }, [])
    // }, [permissions])

    //
    // read the avatar, set it in app state
    //
    useEffect(() => {
        if (!session.value) return

        // username here is the preppedUsername
        const { fs, username } = session.value
        if (!fs) return

        const avatarPath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(CONSTANTS.avatarPath)
        )

        fs.cat(avatarPath)
            .then(content => {
                if (!content) return
                appAvatar.value = URL.createObjectURL(
                    new Blob([content as BlobPart], { type: 'image/*' })
                )
            })
            .catch(err => {
                // no avatar file, so set it to an auto generated value
                console.log('**cant read in index**', err)
                appAvatar.value = 'data:image/svg+xml;utf8,' +
                    generateFromString(username)

                if (!wn.path.appData) return
                console.log('the path we couldnt read...', avatarPath)
            })
    }, [session.value])

    // find the view for this route
    const match = router.match(routeState.value)
    const Node = match ?
        match.action(match.params) :
        () => (<p class="404">missing route</p>)

    function mobileNavHandler (ev:Event) {
        ev.preventDefault()
        mobileNavOpen.value = !mobileNavOpen.value
    }

    if (!webnative.value) return null

    return (<div class="shell">
        <HamburgerWrapper isOpen={mobileNavOpen} onClick={mobileNavHandler} />
        <MobileNav isOpen={mobileNavOpen}>
            {navList.map(item => {
                return <a className={'app-nav' + (routeState.value === item.href ?
                    ' active' : '')}
                    href={item.href}
                >
                    {item.body}
                </a>
            }).concat([<button onClick={logout}>Logout</button>])}
        </MobileNav>

        <div class="head-part">
            <a href="/whoami" class={'avatar' + (routeState.value === '/whoami' ?
                ' active' :
                '')}
            >
                <figure>
                    <img src={appAvatar.value}></img>
                </figure>
                <span>{getHumanName(fullUsername.value || '')}</span>
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

            <button onClick={logout} class="logout">Logout</button>
        </div>

        <div class="content">
            <Node webnative={webnative} appAvatar={appAvatar}
                params={match.params} session={session} setRoute={route.setRoute}
                fullUsername={fullUsername}
            />
        </div>
    </div>)
}

const el = document.getElementById('root')
if (el) render(<App permissions={PERMISSIONS} />, el)
