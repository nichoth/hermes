import { h } from 'preact'
import Router from '@nichoth/routes'
import { LoginRoute } from './pages/login.jsx'
import { Home } from './pages/home.jsx'
import { Whoami } from './pages/whoami.jsx'
import { NewPost } from './pages/new.jsx'
import { Post } from './pages/post.jsx'
import { CreateAccount } from './pages/create-account.jsx'
import { Link } from './pages/link.jsx'

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

    router.addRoute('/link', () => {
        return Link
    })

    router.addRoute('/login', () => {
        return LoginRoute
    })

    router.addRoute('/whoami', () => {
        return Whoami
    })

    router.addRoute('/new', () => {
        return NewPost
    })

    router.addRoute('/create-account', () => {
        return CreateAccount
    })

    router.addRoute('/@:username/:sequence', () => {
        return Post
    })

    return router
}
