import { h, render } from 'preact';
import * as wn from "webnative"
import { WebnativeProvider } from "./context/webnative"

const PERMISSIONS = {
  app: {
    name: "Blog",
    creator: "Fission",
  },
  fs: {
    public: [wn.path.directory("Apps", "Fission", "Blog")],
  },
}

function App () {
	return (<div>
      <WebnativeProvider permissions={PERMISSIONS}>
        <h1>Hello from Preact</h1>
      </WebnativeProvider>
  </div>)
}

render(<App />, document.getElementById('content')!);
