import { h, render } from 'preact'
import * as wn from "webnative"
import { WebnativeProvider } from "./context/webnative"
import { useEffect, useState } from 'preact/hooks'
import { Permissions } from "webnative/ucan/permissions"
import { FunctionComponent } from 'preact';
import { useWebnative } from "./context/webnative"
// var route = require('route-event')()
// @ts-ignore
import Route from 'route-event'
const route = Route()

console.log('Route', Route)

// const PERMISSIONS = {
//   app: {
//     name: "Hermes",
//     creator: "snail-situation",
//   },
//   fs: {
//     public: [wn.path.directory("Apps", "snail-situaion", "Hermes")],
//   }
// }

// interface Props {
//     permissions?: Permissions
// }

// const App: FunctionComponent<Props> = function App (props)  {
//     const arr = useWebnative()
//     console.log('arr', arr)
//     // console.log('...props...', props, fs, username)
//     return (<div>hello from here</div>)
// }

// const el = document.getElementById('root')
// if (el) {
//     render(
//         <WebnativeProvider permissions={PERMISSIONS}>
//             <App />
//         </WebnativeProvider>,
//         el
//     )
// }




// navigation.addEventListener('navigate', navigateEvent => {
//     // Exit early if this navigation shouldn't be intercepted.
//     // The properties to look at are discussed later in the article.
//     if (shouldNotIntercept(navigateEvent)) return
//     console.log('navigate', navigateEvent)
  
//     const url = new URL(navigateEvent.destination.url)
//     console.log('url', url)
  
//     if (url.pathname === '/') {
//       navigateEvent.intercept({handler: loadIndexPage})
//     } else if (url.pathname === '/cats/') {
//       navigateEvent.intercept({handler: loadCatsPage})
//     }
// })


const state = { route: null }
route(function onRoute (path:string) {
    console.log('**on route**', path)
    state.route = path
    window.scrollTo(0, 0)
    console.log('***state', state)
})


const PERMISSIONS = {
    app: {
        name: "Hermes",
        creator: "snail-situation",
    },
    fs: {
        public: [wn.path.directory("apps", "snail-situation", "hermes")],
    },
}

interface Props {
    permissions?: Permissions
}

// function login () {
//     wn.redirectToLobby(state.permissions)
// }

const App: FunctionComponent<Props> = function App ({ permissions })  {
    const [state, setState] = useState<wn.State>()
    const [error, setError] = useState()

    useEffect(() => {
        async function getState() {
            const result = await wn.initialise({ permissions })
                .catch((err) => {
                    setError(err)
                    return undefined
                })
            
            setState(result)
        }
        getState()
    }, [permissions])

    console.log('state', state)
    console.log('errrrr', error)

    if (!state) return null

    if (!state?.authenticated) {
        // go to login page
        return (<div>
            <p>need to auth</p>
            <a href="/fooo">fooo</a>
        </div>)
    }

    return (<div class="testing">
        hello, this is the app
    </div>)
}

async function start () {
    const res = await wn.initialise({ permissions: PERMISSIONS })
    console.log('res', res)
}

start().then()


// render(<${Connector} emit=${emit} state=${state}
//     setRoute=${route.setRoute} client=${client}
// />, document.getElementById('content'))


const el = document.getElementById('root')
if (el) {
    render(<App permissions={PERMISSIONS} />, el);
}
