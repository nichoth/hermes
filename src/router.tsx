import { h } from 'preact'
import Router from '@nichoth/routes'
import { loginRoute } from './pages/login.jsx'
import { Home } from './pages/home.jsx'
import { Whoami } from './pages/whoami.jsx'
import { NewPost } from './pages/new.jsx'
import { Post } from './pages/post.jsx'

export default function _Router () {
    const router = Router()

    router.addRoute('/', () => {
        return Home
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

    // ({ login }, webnative)
    router.addRoute('/whoami', (_, webnative) => {
        if (!webnative || !webnative.session?.username) return () => null
        return Whoami
    })

    router.addRoute('/new', () => {
        return NewPost
    })

    router.addRoute('/@:username/:sequence', () => {
        return Post
    })

    return router
}
