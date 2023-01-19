import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid, isUsernameAvailable, createDID,
    USERNAME_STORAGE_KEY, prepareUsername } from '../username.js'
import * as wn from 'webnative'
import './centered.css'

interface Props {
    webnative: Signal<wn.Program>
    session: Signal<wn.Session>
}

const CreateAccount:FunctionComponent<Props> = function ({ webnative, session }) {
    const [usernameAvailable, setAvailable] = useState<boolean>(true)
    const [isValid, setValid] = useState<boolean>(false)

    console.log('states -- available, valid...', usernameAvailable, isValid)

    async function handleSubmit (ev:TargetedEvent) {
        ev.preventDefault()
        const target = ev.target as HTMLFormElement
        const username = target.elements['username'].value
        const { crypto, storage } = webnative.value.components
        const did = await createDID(crypto)
        const fullUsername = `${username}#${did}`
        const preppedUsername = await prepareUsername(fullUsername)

        const isVal = await isUsernameValid(preppedUsername, webnative.value)
        if (!isVal) return

        // probably don't need to check isAvailable, because the
        // username for fission *must* be unique
        const isAvailable = await isUsernameAvailable(
            preppedUsername,
            webnative.value
        )
        if (!isAvailable) return

        console.log('new username', fullUsername)

        await storage.setItem(USERNAME_STORAGE_KEY, fullUsername)
        const { success } = await webnative.value.auth.register({
            username: preppedUsername
        })
        if (success) {
            const _session = await webnative.value.auth.session()
            if (_session) session.value = _session
        }
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
        const fullUsername = `${value}#${did}`
        const encodedUsernameLocal = await prepareUsername(fullUsername);

        // check is valid
        const _isValid = (
            form.checkValidity() &&
            await isUsernameValid(encodedUsernameLocal, webnative.value)
        )
        if (_isValid !== isValid) setValid(_isValid)
        if (!_isValid) return

        // check is available
        // @TODO -- need to check the hashed name + DID
        // see format in the template repo
        const isAvailable = await isUsernameAvailable(
            encodedUsernameLocal,
            webnative.value
        )
        console.log('is avail', isAvailable)
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
