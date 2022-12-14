import { h } from 'preact'
import './login.css'

function loginRoute ({ login }) {
    return (<div class="route-login">
        <button onClick={login} className="btn login">
            <svg height="100%" width="100%" viewBox="0 0 98 94">
                <path
                d="M30 76a12 12 0 110 11H18a18 18 0 010-37h26l-4-6H18a18 18 0 010-37c6 0 11 2 15 7l3 5 10 14h33a8 8 0 000-15H68a12 12 0 110-11h11a18 18 0 010 37H53l4 6h22a18 18 0 11-14 30l-3-4-10-15H18a8 8 0 000 15h12zm41-6l2 4 6 2a8 8 0 000-15H65l6 9zM27 25l-3-5-6-2a8 8 0 000 15h15l-6-8z"
                fill="currentColor"
                fillRule="nonzero"
                ></path>
            </svg>
            <span>Sign in with Fission</span>
        </button>
    </div>)
}

export { loginRoute }
export default loginRoute
