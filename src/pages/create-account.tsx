import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import * as wn from 'webnative'
import stringify from 'json-stable-stringify'
import timestamp from 'monotonic-timestamp'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid, isUsernameAvailable, createDID,
    USERDATA_STORAGE_KEY, prepareDid, UserData } from '../username.js'
import './centered.css'
import { URL_PREFIX } from '../CONSTANTS.js'
import { sign } from '../util.js'

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

        const isVal = await isUsernameValid(preppedDid, webnative.value)
        console.log('is valid', isVal)
        if (!isVal) return

        // probably don't need to check isAvailable, because the
        // username for fission *is always* unique
        const isAvailable = await isUsernameAvailable(
            preppedDid,
            webnative.value
        )
        if (!isAvailable) return console.log('not available', preppedDid)

        const newUserData:UserData = {
            humanName: username,
            did,
            hashedName: preppedDid,
            timestamp: timestamp()
        }

        await storage.setItem(USERDATA_STORAGE_KEY, JSON.stringify(newUserData))

        // * need to add a UCAN to the message
        // on the server,
        // * check that signature is valid for `value`
        // * validate the given UCAN -- 

        const sig = await sign(keystore, stringify(newUserData))
        const msg = { signature: sig, value: newUserData }

        // @TODO -- save to DB
        await fetch(URL_PREFIX + '/username', {
            method: 'POST',
            body: JSON.stringify(msg)
        })

        const { success } = await webnative.value.auth.register({
            username: preppedDid
        })

        if (success) {
            console.log('success!!!!!!!!!!!')
            const program = await wn.program({
                namespace: { creator: "snail-situation", name: "hermes" },
                debug: true,
                // permissions: PERMISSIONS
            })
            console.log('*program*', program)
            webnative.value = program
            userData.value = Object.assign({}, userData.value, {
                did,
                humanName: username
            })

            const _session = program.session
            console.log('__session__', _session)
            if (_session) session.value = _session

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
