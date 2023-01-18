import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid, isUsernameAvailable } from '../username.js'
import * as wn from 'webnative'
import './login.css'
import { TargetedEvent } from 'preact/compat'

interface Props {
    webnative: Signal<wn.Program>
}

// function loginRoute ({ login }) {
const LoginRoute:FunctionComponent<Props> = function ({ webnative }) {
    const [usernameAvailable, setAvailable] = useState<boolean>(false)
    const [isValid, setValid] = useState<boolean>(false)

    console.log('states...', usernameAvailable, isValid)

    function handleSubmit (ev:TargetedEvent) {
        ev.preventDefault()
        const target = ev.target as HTMLFormElement
        const username = target.elements['username'].value
        console.log('new username', username)
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
        const isAvailable = await isUsernameAvailable(value, webnative.value)
        if (isAvailable !== usernameAvailable) setAvailable(isAvailable)
    }

    const isResolving = false

    return (<div class="route route-login">
        <form onSubmit={handleSubmit} className="choose-username" id="login-form"
            onInput={onFormInput}
        >
            <h2>Register</h2>
            <TextInput name="username" required={true} displayName="Username"
                minlength={'3'}
                autoFocus
            />

            <Button isSpinning={isResolving} type="submit"
                disabled={!isValid || !usernameAvailable}
            >
                Register
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </form>

        {/* <a href="/create-account">Create an account</a> */}
    </div>)
}

export { LoginRoute }
