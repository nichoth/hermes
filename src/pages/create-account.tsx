import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import * as wn from 'webnative'
import stringify from 'json-stable-stringify'
import timestamp from 'monotonic-timestamp'
import * as ucans from '@ucans/ucans'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid, isUsernameAvailable, createDID,
    USERDATA_STORAGE_KEY, prepareDid, UserData } from '../username.js'
import * as username from '../username.js'
import './centered.css'
import { URL_PREFIX } from '../CONSTANTS.js'
import { sign, toString } from '../util.js'

// @ts-ignore
window.ucans = ucans
// @ts-ignore
window.username = username

interface Props {
    webnative: Signal<wn.Program>,
    session: Signal<wn.Session>,
    setRoute: Function,
    userData: Signal<UserData>
}

const CreateAccount:FunctionComponent<Props> = function ({
    webnative,
    session,
    setRoute,
    userData
}) {
    const [usernameAvailable, setAvailable] = useState<boolean>(true)
    const [isValid, setValid] = useState<boolean>(false)

    // @ts-ignore
    window.states = [usernameAvailable, isValid]

    console.log('states -- available, valid...', usernameAvailable, isValid)

    async function handleSubmit (ev:TargetedEvent) {
        ev.preventDefault()
        const target = ev.target as HTMLFormElement
        const username = target.elements['username'].value
        const { crypto, storage } = webnative.value.components
        const { keystore } = crypto
        const did = await createDID(crypto)
        const preppedDid = await prepareDid(did) // the hashed DID

        console.log('prepped did', preppedDid)

        const isValid = await isUsernameValid(preppedDid, webnative.value)
        console.log('is valid', isValid)
        if (!isValid) return console.log('not valid!!!')

        // probably don't need to check isAvailable, because the
        // username for fission *is always* unique
        const isAvailable = await isUsernameAvailable(
            preppedDid,
            webnative.value
        )
        if (!isAvailable) return console.log('not available', preppedDid)

        const newUserData:UserData = {
            humanName: username,
            author: did,
            rootDid: did,
            hashedUsername: preppedDid,
            timestamp: timestamp()
        }

        // * need to add a UCAN to the message
        // on the server,
        // * check that signature is valid for `value`
        // * validate the given UCAN -- 

        const { success } = await webnative.value.auth.register({
            username: preppedDid
        })

        if (success) {
            console.log('success!!!!!!!!!!!')
            await storage.setItem(
                USERDATA_STORAGE_KEY,
                JSON.stringify(newUserData)
            )

            const program = await wn.program({
                namespace: { creator: "snail-situation", name: "hermes" },
                debug: true,
                fileSystem: {
                    loadImmediately: true
                }
                // permissions: PERMISSIONS
            })
            console.log('*program*', program)
            webnative.value = program
            userData.value = Object.assign({}, newUserData)

            const _session = program.session
            console.log('__session__', _session)
            if (!_session) return
            session.value = _session

            const ucan = Object.values(session.value.fs?.proofs || {})[0]
            console.log('**ucan**', ucan)
            console.log('**session proofs**', session.value.fs?.proofs)
            console.log('session', session.value)
            console.log('session', session.value.fs)
            console.log('session', session.value.fs?.proofs)
            // if (!ucan) throw new Error('no ucan')
            const sig = await sign(keystore, stringify(newUserData))
            const msg = { ucan, signature: toString(sig), value: newUserData }

            console.log('**msg**', msg)

            // save to DB
            const res = await (await fetch(URL_PREFIX + '/username', {
                method: 'POST',
                body: JSON.stringify(msg)
            })).json()

            console.log('save username response', res)

            return setRoute('/')
        }

        console.log('not success...')
    }

    function nevermind (ev) {
        ev.preventDefault()
        const form = document.getElementById('login-form') as HTMLFormElement
        form.elements['username'].value = ''
        setValid(false)
    }

    async function onFormInput (ev:TargetedEvent) {
        const { form, value } = ev.target as HTMLInputElement
        if (!form || !value) return
        const { crypto } = webnative.value.components
        const did = await createDID(crypto)
        const encodedDid = await prepareDid(did)

        // check is valid
        const _isValid = (
            form.checkValidity() &&
            await isUsernameValid(encodedDid, webnative.value)
        )
        if (_isValid !== isValid) setValid(_isValid)
        if (!_isValid) return

        const isAvailable = await isUsernameAvailable(
            encodedDid,
            webnative.value
        )
        console.log('is avail', isAvailable)
        console.log('is avail in state', usernameAvailable)
        if (isAvailable !== usernameAvailable) setAvailable(isAvailable)
    }

    const isResolving = false

    return (<div class="route route-create-account centered">
        <form onSubmit={handleSubmit} className="choose-username" id="login-form"
            onInput={onFormInput}
        >
            <h2>Create a new account</h2>
            <TextInput name="username" required={true} displayName="Username"
                minlength={'3'}
                autoFocus
            />

            <Button isSpinning={isResolving} type="submit"
                disabled={!isValid || !usernameAvailable}
            >
                Create
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </form>

        <a href="/login">login to an existing account</a>
    </div>)
}

export { CreateAccount }
