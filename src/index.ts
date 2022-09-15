// import { h, render } from 'preact';
import { render } from "preact";
import { html } from 'htm/preact';
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
	return (html`
		<div>
      <${WebnativeProvider} permissions=${PERMISSIONS}>
        <h1>Hello from Preact</h1>
      <//>
		</div>
	`);
}

render(html`<${App} />`, document.getElementById('content')!);
