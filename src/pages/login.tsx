import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid } from '../username.js'
import * as wn from 'webnative'
import './login.css'

interface Props {
    webnative: Signal<wn.Program>
}

// function loginRoute ({ login }) {
const LoginRoute:FunctionComponent<Props> = function loginRoute ({ webnative }) {
    const [usernameAvailable, setAvailable] = useState<boolean>(false)
    const [isValid, setValid] = useState<boolean>(false)
    // const [postContent, setPostContent] = useState<Post|null>(null)

    console.log('in login', webnative.value.auth)

    console.log('valid???', isValid)

    function handleSubmit (ev) {
        ev.preventDefault()
        console.log('submit', ev.target.value)
    }

    function nevermind (ev) {
        ev.preventDefault()
        const form = document.getElementById('login-form') as HTMLFormElement
        form.elements['username'].value = ''
        setValid(false)
        console.log('nevermind')
    }

    async function onFormInput (ev) {
        const { form, value } = ev.target

        // check is valid
        const _isValid = (
            form.checkValidity() &&
            await isUsernameValid(value, webnative.value)
        )
        if (_isValid !== isValid) setValid(_isValid)

        // check is available
    }

    const isResolving = false

    return (<div class="route route-login">
        <form onSubmit={handleSubmit} className="choose-username" id="login-form"
            onInput={onFormInput}
        >
            <h2>Login</h2>
            <TextInput name="username" required={true} displayName="Username"
                minlength={'3'}
                autoFocus
            />

            <Button isSpinning={isResolving} type="submit" disabled={!isValid}>
                Login
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </form>

        {/* <a href="/create-account">Create an account</a> */}
    </div>)
}

export { LoginRoute }
