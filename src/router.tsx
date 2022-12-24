import { h } from 'preact'
import Router from 'ruta3'
import { loginRoute } from './pages/login'

export default function _Router () {
    const router = Router()

    router.addRoute('/', () => {
        return function Home () {
            return [
                <h2>hello, this is the app</h2>,
                <p id="route-home">this is the home route!</p>,
                <a href="/fooo">fooo</a>
            ]
        }
    })

    router.addRoute('/fooo', () => {
        return function fooo () {
            return [
                <p>fooo route :tada</p>,
                <a href="/">home</a>
            ]
        }
    })

    router.addRoute('/login', () => {
        return loginRoute
    })

    return router
}
