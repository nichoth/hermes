import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid, prepareUsername } from '../username.js'
import * as wn from 'webnative'
import './centered.css'

interface Props {
    webnative: Signal<wn.Program>
    session: Signal<wn.Session>
}

const LoginRoute:FunctionComponent<Props> = function ({ webnative, session }) {
    const [isValid, setValid] = useState<boolean>(false)
    const [authenticating, setAuthenticating] = useState<boolean>(false)
    const [displayPin, setDisplayPin] = useState<string>('');

    // **this is us**
    // On device without session:
    //     Somehow you'll need to get ahold of the username.
    //     Few ideas: URL query param, QR code, manual input.
    //  const consumer = await program.auth.accountConsumer(username)

    // * on new device, enter the username you are logging in with
    // * then you need to visit a URL on an already logged-in device, like
    //   your phone. This URL is `/link` in our case.
    // * the logged in device will detect the linking request and know the PIN
    // * on the already logged-in device, enter the PIN shown on the new device

    console.log('isValid...', isValid)

    async function handleSubmit (ev:TargetedEvent) {
        ev.preventDefault()
        const target = ev.target as HTMLFormElement
        const username = target.elements['username'].value
        console.log('on submit', username)

        const hashedUsername = await prepareUsername(username)
        const consumer = await webnative.value.auth.accountConsumer(hashedUsername)
        // const consumer = await createAccountLinkingConsumer(
        //     hashedUsername,
        //     webnative.value
        // )

        consumer.on('challenge', ({ pin }) => {
            // show pin in UI
            console.log('on challenge')
            setDisplayPin(pin.join(''))
        })

        consumer.on('link', async ({ username, approved }) => {
            console.log('on link', arguments)
            if (!approved) return console.log('fail!!!')
            console.log('approve account link...', username)
            const _session = await webnative.value.auth.session()
            if (_session) session.value = _session
        })
    }

    function nevermind (ev) {
        ev.preventDefault()
        const form = document.getElementById('login-form') as HTMLFormElement
        form.elements['username'].value = ''
        if (isValid) setValid(false)
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
                minlength={'3'} autoFocus
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
