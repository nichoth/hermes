import { h } from 'preact'

function Home () {
    return [
        <h2>hello, this is the app</h2>,
        <p id="route-home">this is the home route!</p>,
        <a href="/fooo">fooo</a>
    ]
}

export { Home }
export default Home
