import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useSignal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import * as wn from 'webnative'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid } from '../username.js'
import { CopyBtn, CopyIconBtn } from '../components/copy-btn.jsx'
import '../components/copy-btn.css'
import './centered.css'
import './login.css'

interface Props {
    webnative: Signal<wn.Program>,
    session: Signal<wn.Session>,
    setRoute: (path:string) => void,
    params: { query:string }
}

//
// this route is for if you have a new device, and you want to use
// an existing account
// You would go to this route on the new device
//
const LoginRoute:FunctionComponent<Props> = function (props) {
    const { webnative, session, params, setRoute } = props
    const query = Object.fromEntries(new URLSearchParams(params.query))
    const [isValid, setValid] = useState<boolean>(query.u?.length > 2)
    const [displayPin, setDisplayPin] = useState<string>('')
    const resolvingPin = useSignal<boolean>(false)

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
    // type the username, it is hashed with a DID, so not human readable
    //

    console.log('isValid in the main route', isValid)

    async function linkAccount (ev:TargetedEvent) {
        ev.preventDefault()
        const target = ev.target as HTMLFormElement
        const username = target.elements['username'].value
        console.log('on submit', username)

        const consumer = await webnative.value.auth.accountConsumer(username)
        resolvingPin.value = true

        consumer.on('challenge', ({ pin }) => {
            // show pin in UI
            console.log('on challenge', pin)
            resolvingPin.value = false
            setDisplayPin(pin.join(''))
        })

        consumer.on('link', async ({ username, approved }) => {
            if (!approved) return console.log('fail!!!')
            console.log('approve account link...', username, approved)
            const _session = await webnative.value.auth.session()
            if (_session) session.value = _session
            consumer.cancel()
            // @TODO
            // need to fetch userData from server
            // need to save the session.username locally
            setRoute('/')
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

    const linkingLink = location.origin + '/link'

    return (<div class="route route-login centered">
        <h2>Login</h2>

        {!query.u ?
            (<p>
                Visit <code>{linkingLink}</code>
                <CopyIconBtn title="copy" payload={linkingLink} />
                on a device that is already-logged in to your account.
            </p>) :

            (<form onSubmit={linkAccount} className="login-form" id="login-form"
                onInput={onFormInput}
            >
                <TextInput defaultValue={query.u} name="username" required={true}
                    displayName="Account name" minlength={'3'} autoFocus
                />

                <p>Your account name is a non human-readable string.</p>
                <p>
                    After clicking the "link account" button below, you will see a PIN
                    here that you need to enter in your already connected device.
                </p>

                <Button isSpinning={resolvingPin.value} type="submit"
                    disabled={!isValid}
                >
                    Link account
                </Button>
                <Button onClick={nevermind}>Nevermind</Button>
            </form>)
        }


        <a href="/create-account">Create a new account</a>

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
