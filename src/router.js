import Tonic from '@socketsupply/tonic'
import Router from 'ruta3'

class RouteHome extends Tonic {
    render () {
        return this.html`
            <p>this is the home route!</p>
            <a href="/fooo">fooo</a>
        `
    }
}
Tonic.add(RouteHome)

class FoooBar extends Tonic {
    render () {
        return this.html`
            <p>fooo</p>
            <a href="/">home</a>
        `
    }
}
Tonic.add(FoooBar)

export default function _Router () {
    const router = Router()
    router.addRoute('/', (init) => {
        console.log('init in home', init)
        return RouteHome
    })

    router.addRoute('/fooo', (init) => {
        console.log('init in fooo', init)
        return FoooBar
    })

    return router
}
