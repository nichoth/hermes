import { render, FunctionComponent } from 'preact'
import * as wn from 'webnative'
import { useEffect } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import { generateFromString } from 'generate-avatar'
import HamburgerWrapper from '@nichoth/components/hamburger.mjs'
import MobileNav from '@nichoth/components/mobile-nav-menu.mjs'
import Route from 'route-event'
import ky from 'ky'
import Router from './router.jsx'
import { navList } from './navigation.js'
import { AVATAR_PATH, BLOB_DIR_PATH, FRIENDS_PATH, LOG_DIR_PATH } from './CONSTANTS.js'
import { UserData } from './username.js'
import { Request } from './friend.js'
import '@nichoth/components/hamburger.css'
import '@nichoth/components/mobile-nav-menu.css'
import '@nichoth/components/z-index.css'
import './index.css'
import './z-index.css'

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
    const friendsList = useSignal<Request[]>([])
    const friendProfiles = useSignal<{ [key:string]:UserData }|unknown>({})

    // @ts-ignore
    window.webnative = webnative.value
    // @ts-ignore
    window.wn = wn
    // @ts-ignore
    window.session = session.value
    // @ts-ignore
    window.userData = userData.value
    // @ts-ignore
    window.__crypto = webnative.value?.components.crypto

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
            debug: true,
            fileSystem: {
                loadImmediately: true
            }
        })
            .then(async program => {
                webnative.value = program
                session.value = (program.session ?? await program.auth.session())

                //
                // __not authed__ -- redirect to login
                //
                if (!session.value) {
                    console.log('...not session...', program)
                    if (location.pathname === '/create-account') return
                    if (location.pathname.includes('login')) return
                    return route.setRoute('/login')
                }

                try {

                    // // @TODO -- use the remote DB to fetch any updates to username,
                    // //   and synchronize the data


                    const qs = new URLSearchParams({
                        names: session.value?.username
                    })
                    const url = ('/api/username-by-hash' + '?' + qs)
                    const profile = await ky.get(url).json()
                    userData.value = profile as UserData
                } catch (err) {
                    console.log('errrrrrrrr, parsing json', err)
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

        fs.read(avatarPath)
            .then(content => {
                if (!content) return
                appAvatar.value = URL.createObjectURL(
                    new Blob([content as BlobPart], { type: 'image/*' })
                )
            })
            .catch(err => {
                // no avatar file, so set it to an auto generated value
                console.log('the avatar path we couldnt read...', avatarPath)
                appAvatar.value = 'data:image/svg+xml;utf8,' +
                    generateFromString(username)

                if (!wn.path.appData) return
            })
    }, [session.value])

    //
    // make all filepaths necessary
    //
    useEffect(() => {
        const fs = session.value?.fs
        if (!fs) return
        const logDirPath = wn.path.appData(APP_INFO, wn.path.directory(LOG_DIR_PATH))
        fs.mkdir(logDirPath)
            .then(updatedFs => {
                console.log('success making directory', updatedFs)
            })
            .catch(err => {
                console.log('error making dir', err)
            })

        const blobDirPath = wn.path.appData(APP_INFO, wn.path.directory(BLOB_DIR_PATH))
        fs.mkdir(blobDirPath)
            .then(updatedFs => {
                console.log('success making blob path', updatedFs)
            })
            .catch(err => {
                console.log('err making blob path', err)
            })
    }, [session.value])

    //
    // get the friends list
    //
    useEffect(() => {
        if (!session.value) return
        const friendsListData = wn.path.appData(
            APP_INFO,
            wn.path.file(FRIENDS_PATH)
        )

        session.value.fs?.read(friendsListData)
            .then(async listData => {
                friendsList.value = JSON.parse(
                    new TextDecoder().decode(listData)
                )
            })
            .catch(async err => {
                console.log('reading friend list error', err)
                if ((err as Error).toString().includes('Path does not exist')) {
                    // create the file
                    await session.value?.fs?.write(
                        friendsListData,
                        new TextEncoder().encode(JSON.stringify([]))
                    )
                    await session.value?.fs?.publish()
                }
            })
    }, [session.value])

    //
    // get profiles from friends list
    //
    useEffect(() => {
        if (!friendsList.value.length) return
        const friendsSet = new Set(friendsList.value.map(item => item.value.from))
        const friends = Array.from(friendsSet)  // deduplicate
        ky.post('/api/username-by-hash', { json: { hashes: friends } }).json()
            .then(res => {
                friendProfiles.value = res
            })
    }, [friendsList.value])

    //
    // find the view for this route
    //
    const match = router.match(routeState.value)
    const Node = (match ?
        match.action(match.params) :
        () => (<p class="404">missing route</p>))

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
                <span>{userData.value?.humanName}</span>
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
                friendsList={friendsList} friendProfiles={friendProfiles}
            />
        </div>
    </div>)
}

const el = document.getElementById('root')
if (el) render(<App />, el)
