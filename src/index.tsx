import { render, FunctionComponent } from 'preact'
import * as wn from 'webnative'
import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
// import { Permissions } from 'webnative/permissions.js'
import { generateFromString } from 'generate-avatar'
import HamburgerWrapper from '@nichoth/components/hamburger.mjs'
import MobileNav from '@nichoth/components/mobile-nav-menu.mjs'
import Route from 'route-event'
import { USERDATA_STORAGE_KEY } from './username.js'
// import { URL_PREFIX } from './CONSTANTS.js'
import Router from './router.jsx'
import { navList } from './navigation.js'
// import CONSTANTS from './CONSTANTS.js'
import { AVATAR_PATH } from './CONSTANTS.js'
import { UserData } from './username.js'
import '@nichoth/components/hamburger.css'
import '@nichoth/components/mobile-nav-menu.css'
import '@nichoth/components/z-index.css'
import './index.css'
import './z-index.css'

// http://localhost:9999/.netlify/functions/username

const APP_INFO = { name: 'hermes', creator: 'snail-situation' }

const { location, Blob } = window

const router = Router()

console.log('env', import.meta.env)

interface Props {
    // permissions: Permissions,
}

const route = Route()

const App: FunctionComponent<Props> = function App () {
    const routeState = useSignal<string>(location.pathname + location.search)
    const appAvatar = useSignal<string|undefined>(undefined)
    const webnative = useSignal<wn.Program | null>(null)
    const session = useSignal<wn.Session | null>(null)
    const mobileNavOpen = useSignal<boolean>(false)
    const userData = useSignal<UserData|null>(null)

    // @ts-ignore
    window.webnative = webnative
    // @ts-ignore
    window.wn = wn
    // @ts-ignore
    window.session = session
    // @ts-ignore
    window.userData = userData.value

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
            // if (!session.value) {
            //     if (location.pathname === '/create-account') return
            //     if (location.pathname.includes('login')) return
            //     route.setRoute('/login')
            // }
        })
    }, [])

    //
    // componentDidMount
    //
    // * initialize webnative,
    // * redirect to '/login' if not authed
    //
    useEffect(() => {
        wn.program({
            namespace: { creator: 'snail-situation', name: 'hermes' },
            debug: true
            // permissions
        })
            .then(async program => {
                webnative.value = program
                session.value = (program.session ?? await program.auth.session())

                try {

                    // @TODO -- use the remote DB to fetch any updates to username,
                    //   and synchronize the data
                    // const res = await fetch(URL_PREFIX + '/username')
                    //     .then(res => res.json())

                    // userData.value = res

                    const data = await program.components.storage.getItem(
                        USERDATA_STORAGE_KEY
                    ) as string

                    userData.value = JSON.parse(data) as UserData
                    if (!userData.value) {
                        // @TODO
                        // we dont have the userData locally, need to fetch
                        // this happens if you are on a new device
                        //
                    }
                } catch (err) {
                    console.log('errrrrrrrr, parsing json', err)
                }

                //
                // __not authed__ -- redirect to login
                //
                if (!session.value) {
                    console.log('...not session...', program)
                    if (location.pathname === '/create-account') return
                    if (location.pathname.includes('login')) return
                    route.setRoute('/login')
                }
            })
    }, [])

    //
    // read the avatar, set it in app state
    //
    useEffect(() => {
        if (!session.value) return

        // username here is the preppedUsername
        const { fs, username } = session.value
        if (!fs) return

        const avatarPath = wn.path.appData(
            APP_INFO,
            wn.path.file(AVATAR_PATH)
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
                console.log('the path we couldnt read...', avatarPath)
                appAvatar.value = 'data:image/svg+xml;utf8,' +
                    generateFromString(username)

                if (!wn.path.appData) return
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
            {session.value ? (navList.map(item => {
                return <a className={'app-nav' + (routeState.value === item.href ?
                    ' active' : '')}
                    href={item.href}
                >
                    {item.body}
                </a>
            }).concat([<button onClick={logout}>Logout</button>])) :
            []}
        </MobileNav>

        <div class="head-part">
            <a href="/whoami" class={'avatar' + (routeState.value === '/whoami' ?
                ' active' :
                '')}
            >
                <figure>
                    <img src={appAvatar.value}></img>
                </figure>
                <span>{userData.value?.humanName || ''}</span>
            </a>

            <nav>
                {session.value ? (navList.map(item => {
                    return <a className={'app-nav' + (routeState.value === item.href ?
                        ' active' : '')}
                        href={item.href}
                    >
                        {item.body}
                    </a>
                })) : null}
            </nav>

            {session.value ?
                <button onClick={logout} class="logout">Logout</button> :
                null
            }
        </div>

        <div class="content">
            <Node webnative={webnative} appAvatar={appAvatar} session={session} 
                params={match?.params} setRoute={route.setRoute}
                splats={match?.splats} userData={userData}
            />
        </div>
    </div>)
}

const el = document.getElementById('root')
if (el) render(<App />, el)
