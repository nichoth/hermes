import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useSignal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid } from '../username.js'
import { CopyBtn, CopyIconBtn } from '../components/copy-btn.jsx'
import * as wn from 'webnative'
import './centered.css'
import './login.css'
import '../components/copy-btn.css'

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
    const [isValid, setValid] = useState<boolean>(query.u?.length > 2)
    const [authenticating, setAuthenticating] = useState<boolean>(false)
    const [displayPin, setDisplayPin] = useState<string>('')
    const resolvingPin = useSignal<boolean>(false)

    console.log('query', query)

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

    console.log('isValid...', isValid)

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

    const linkingLink = location.origin + '/link'

    return (<div class="route route-login centered">
        <h2>Login</h2>

        {!query.u ?
            (<p>
                Visit <code>{linkingLink}</code>
                <CopyIconBtn title="copy" payload={linkingLink} />
                on a device that is already logged in to your account.
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

                <Button isSpinning={resolvingPin.value} type="submit" disabled={!isValid}>
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

// function CopyIconBtn (props) {
//     return <button {...props} className="copy-icon-btn">
//         <svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 115.77 122.88" style="enable-background:new 0 0 115.77 122.88" xmlSpace="preserve"><g><path class="st0" d="M89.62,13.96v7.73h12.19h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02v0.02 v73.27v0.01h-0.02c-0.01,3.84-1.57,7.33-4.1,9.86c-2.51,2.5-5.98,4.06-9.82,4.07v0.02h-0.02h-61.7H40.1v-0.02 c-3.84-0.01-7.34-1.57-9.86-4.1c-2.5-2.51-4.06-5.98-4.07-9.82h-0.02v-0.02V92.51H13.96h-0.01v-0.02c-3.84-0.01-7.34-1.57-9.86-4.1 c-2.5-2.51-4.06-5.98-4.07-9.82H0v-0.02V13.96v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07V0h0.02h61.7 h0.01v0.02c3.85,0.01,7.34,1.57,9.86,4.1c2.5,2.51,4.06,5.98,4.07,9.82h0.02V13.96L89.62,13.96z M79.04,21.69v-7.73v-0.02h0.02 c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v64.59v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h12.19V35.65 v-0.01h0.02c0.01-3.85,1.58-7.34,4.1-9.86c2.51-2.5,5.98-4.06,9.82-4.07v-0.02h0.02H79.04L79.04,21.69z M105.18,108.92V35.65v-0.02 h0.02c0-0.91-0.39-1.75-1.01-2.37c-0.61-0.61-1.46-1-2.37-1v0.02h-0.01h-61.7h-0.02v-0.02c-0.91,0-1.75,0.39-2.37,1.01 c-0.61,0.61-1,1.46-1,2.37h0.02v0.01v73.27v0.02h-0.02c0,0.91,0.39,1.75,1.01,2.37c0.61,0.61,1.46,1,2.37,1v-0.02h0.01h61.7h0.02 v0.02c0.91,0,1.75-0.39,2.37-1.01c0.61-0.61,1-1.46,1-2.37h-0.02V108.92L105.18,108.92z"/></g></svg>
//     </button>
// }
