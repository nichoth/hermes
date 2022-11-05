import { h } from 'preact'
import Router from 'ruta3'

export default function _Router () {
    const router = Router()

    router.addRoute('/', (wn) => {
        return function Home () {
            return [<p id="route-home">
                this is the home route!
            </p>,
            <a href="/fooo">fooo</a>]
        }
    })

    router.addRoute('/fooo', (wn) => {
        return function fooo () {
            return [<p>fooo route :tada</p>,
                <a href="/">home</a>]
        }
    })

    return router
}
