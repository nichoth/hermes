import { h, render } from 'preact'
import * as wn from "webnative"
// import { WebnativeProvider } from "./context/webnative"
import { useEffect, useState } from 'preact/hooks'
import { Permissions } from "webnative/ucan/permissions"
import { FunctionComponent } from 'preact';

const folder = { directory: ['apps', 'snail-situation', 'hermes'] }
const PERMISSIONS = {
    app: {
        name: "Blog",
        creator: "Fission",
    },
    fs: {
        public: [folder]
        // public: [wn.path.directory("Apps", "Fission", "Blog")],
    },
}

interface Props {
    permissions?: Permissions
}

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

    return (<div class="testing">
        hello from here
    </div>)
}

const el = document.getElementById('root')
if (el) {
    render(<App permissions={PERMISSIONS} />, el);
}
