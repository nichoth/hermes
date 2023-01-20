import { h } from 'preact'
import { useState } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import * as wn from 'webnative'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import { isUsernameValid, isUsernameAvailable, createDID,
    USERNAME_STORAGE_KEY, prepareUsername } from '../username.js'
import PERMISSIONS from '../permissions.js'
import './centered.css'

interface Props {
    webnative: Signal<wn.Program>,
    session: Signal<wn.Session>,
    setRoute: Function
}

const CreateAccount:FunctionComponent<Props> = function ({
    webnative,
    session,
    setRoute
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
        const fullUsername = `${username}#${did}`
        const preppedUsername = await prepareUsername(fullUsername)

        console.log('full username', fullUsername)
        console.log('prepped name', preppedUsername)

        const isVal = await isUsernameValid(preppedUsername, webnative.value)
        console.log('is valid', isVal)
        if (!isVal) return

        // probably don't need to check isAvailable, because the
        // username for fission *is always* unique
        const isAvailable = await isUsernameAvailable(
            preppedUsername,
            webnative.value
        )
        console.log('is available', isAvailable)
        if (!isAvailable) return

        console.log('new username', preppedUsername)

        await storage.setItem(USERNAME_STORAGE_KEY, fullUsername)
        const { success } = await webnative.value.auth.register({
            username: preppedUsername
        })
        if (success) {
            console.log('success!!!!!!!!!!!')
            const _session = await webnative.value.auth.session()
            const program = await wn.program({
                namespace: { creator: "snail-situation", name: "hermes" },
                debug: true,
                permissions: PERMISSIONS
            })
            console.log('*program*', program)
            webnative.value = program

            console.log('__session__', _session)
            if (_session) session.value = _session
            setRoute('/')
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
        // isUsernameAvailable(encodedUsernameLocal, webnative.value).then(avail => {
        //     console.log('is avail', avail)
        //     console.log('is avail in state', usernameAvailable)
        //     if (avail !== usernameAvailable) setAvailable(avail)
        // })

        const isAvailable = await isUsernameAvailable(
            encodedUsernameLocal,
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
