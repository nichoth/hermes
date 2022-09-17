import { h, render } from 'preact';
import * as wn from "webnative"
import { WebnativeProvider } from "./context/webnative"

const PERMISSIONS = {
    app: {
        name: "Hermes",
        creator: "snail-situation",
    },
    fs: {
        public: [wn.path.directory("Apps", "snail-situation", "Hermes")],
    },
}

function App () {
    return (<div>
        <WebnativeProvider permissions={PERMISSIONS}>
            <h1>Hello from Preact</h1>
        </WebnativeProvider>
    </div>)
}

const el = document.getElementById('root')
if (el) {
    render(<App />, el);
}
    