import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import * as wn from 'webnative'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid, isUsernameAvailable, createDID,
    USERDATA_STORAGE_KEY, prepareDid, UserData } from '../username.js'
import './centered.css'

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
        console.log('is available', isAvailable)
        if (!isAvailable) return

        console.log('new user did, the hashed name', preppedDid)

        await storage.setItem(USERDATA_STORAGE_KEY, JSON.stringify({
            humanName: username,
            did,
            hashedName: preppedDid
        }))

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
            userData.value = Object.assign({}, userData.value, { did })

            // @TODO -- set userData on server

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
