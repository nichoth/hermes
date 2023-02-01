import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid } from '../username.js'
import { CopyBtn } from '../components/copy-btn.jsx'
import * as wn from 'webnative'
import './centered.css'
import './login.css'

interface Props {
    webnative: Signal<wn.Program>
    session: Signal<wn.Session>
    params: { query:string }
}

//
// this route is for if you have a new device, and you want to use
// an existing account
// You would go to this route on the new device
//
const LoginRoute:FunctionComponent<Props> = function ({ webnative, session, params }) {
    const query = Object.fromEntries(new URLSearchParams(params.query))
    const [isValid, setValid] = useState<boolean>(query.u.length > 2)
    const [authenticating, setAuthenticating] = useState<boolean>(false)
    const [displayPin, setDisplayPin] = useState<string>('')

    // see https://webnative.fission.app/index.html#creating-a-program
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

    //
    // need to pass the username as a query param, because we are not able to
    // type the username b/c it is hashed with a DID
    //

    console.log('isValid...', isValid)

    async function handleSubmit (ev:TargetedEvent) {
        ev.preventDefault()
        const target = ev.target as HTMLFormElement
        const username = target.elements['username'].value
        console.log('on submit', username)

        // const hashedUsername = await prepareUsername(username)
        // const consumer = await webnative.value.auth.accountConsumer(hashedUsername)
        // const consumer = await createAccountLinkingConsumer(
        //     hashedUsername,
        //     webnative.value
        // )

        const consumer = await webnative.value.auth.accountConsumer(username)

        consumer.on('challenge', ({ pin }) => {
            // show pin in UI
            console.log('on challenge', pin)
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
        <form onSubmit={handleSubmit} className="login-form" id="login-form"
            onInput={onFormInput}
        >
            <h2>Login</h2>

            <TextInput defaultValue={query.u} name="username" required={true}
                displayName="Account name" minlength={'3'} autoFocus
            />

            <Button isSpinning={false} type="submit" disabled={!isValid}>
                Link account
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </form>

        <a href="/create-account">Create an account</a>

        {displayPin ?
            (<div className="display-pin">
                <span className="pin"><code>{displayPin}</code></span>
                <CopyBtn className="copy-pin" payload={displayPin}>
                    Copy PIN
                </CopyBtn>
            </div>) :
            null
        }
    </div>)
}

export { LoginRoute }
