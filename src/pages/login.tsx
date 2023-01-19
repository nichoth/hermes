import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid, createAccountLinkingConsumer,
    prepareUsername } from '../username.js'
import * as wn from 'webnative'
import './centered.css'

interface Props {
    webnative: Signal<wn.Program>
}

const LoginRoute:FunctionComponent<Props> = function ({ webnative }) {
    const [isValid, setValid] = useState<boolean>(false)
    const [authenticating, setAuthenticating] = useState<boolean>(false)
    const [displayPin, setDisplayPin] = useState<string>('');


    console.log('states -- valid...', isValid)

    async function handleSubmit (ev:TargetedEvent) {
        ev.preventDefault()
        const target = ev.target as HTMLFormElement
        const username = target.elements['username'].value
        console.log('new username', username)

        const hashedUsername = await prepareUsername(username)
        const linkConsumer = await createAccountLinkingConsumer(
            hashedUsername,
            webnative.value
        )

        linkConsumer.on('challenge', ({ pin }) => {
            setDisplayPin(pin.join(''))
        })
    }

    function nevermind (ev) {
        ev.preventDefault()
        const form = document.getElementById('login-form') as HTMLFormElement
        form.elements['username'].value = ''
        setValid(false)
    }

    async function onFormInput (ev) {
        const { form, value } = ev.target

        // check is valid
        const _isValid = (
            form.checkValidity() &&
            await isUsernameValid(value, webnative.value)
        )
        if (_isValid !== isValid) setValid(_isValid)
    }

    return (<div class="route route-login centered">
        <form onSubmit={handleSubmit} className="link-form" id="link-form"
            onInput={onFormInput}
        >
            <h2>Login</h2>
            <TextInput name="username" required={true} displayName="Username"
                minlength={'3'}
                autoFocus
            />

            <Button isSpinning={false} type="submit" disabled={!isValid}>
                Link account
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </form>

        <a href="/create-account">Create an account</a>

        {displayPin ?
            <div class="pin">{displayPin}</div> :
            null
        }
    </div>)
}

export { LoginRoute }
