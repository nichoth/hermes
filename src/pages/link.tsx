import { FunctionComponent, h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import * as wn from "webnative"
import { CopyBtn } from '../components/copy-btn.jsx'
import Button from '../components/button.jsx'
import './link.css'
import './common.css'

interface Props {
    webnative: Signal<wn.Program>
    session: Signal<wn.Session|null>
}

// **this is us**
// On device with existing session:
// const producer = await program.auth.accountProducer(program.session.username)

// see https://webnative.fission.app/index.html#creating-a-program
// On device without session:
//     Somehow you'll need to get ahold of the username.
//     Few ideas: URL query param, QR code, manual input.
//  const consumer = await program.auth.accountConsumer(username)

interface Challenge {
    pin: number[]
    confirmPin: () => void
    rejectPin: () => void
}

export const Link:FunctionComponent<Props> = function ({ webnative }) {
    const [challenge, setChallenge] = useState<Challenge|null>(null)
    const [validPin, setValidPin] = useState<boolean>(false)

    useEffect(() => {
        const { session } = webnative.value
        if (!session) return

        webnative.value.auth.accountProducer(session.username)
            .then(producer => {
                // this is the device that *is* logged in
                // which means we need to type a pin from the challenger,
                //   and check that it's ok
                producer.on('challenge', function handleChallenge (_challenge) {
                    // Either show `challenge.pin` or have the user input a PIN
                    //   and see if they're equal.
                    console.log('challenge', _challenge)
                    setChallenge(_challenge)
                })

                producer.on('link', function handleLink ({ approved }) {
                    console.log('*link*', arguments)
                    console.log('it was approved?', approved)
                    if (!approved) return
                    producer.cancel()
                    console.log('Device linked successfully')
                })
            })
    }, [webnative.value])

    function submitPin (ev:TargetedEvent) {
        ev.preventDefault()
        if (!ev.target || !challenge) return

        // have the user input a PIN and see if they're equal.
        const userInput = (ev.target as HTMLFormElement).elements['pin'].value
        console.log('user input', userInput)
        if (userInput === challenge.pin.join('')) challenge.confirmPin()
        else challenge.rejectPin()
    }

    const username = webnative.value.session?.username

    function pinInput (ev) {
        const el = ev.target
        el.value = el.value.slice(0, el.getAttribute('maxlength'))
        const max = parseInt(el.getAttribute('maxlength'))
        const min = parseInt(el.getAttribute('minlength'))
        const valid = (el.value.length >= min && el.value.length <= max)
        if (valid !== validPin) setValidPin(valid)
    }

    // show an input for a PIN number
    //   user types the PIN from new device,
    //   then we check if it is ok
    return <div className={'route link'}>
        <p>
            <span>Visit this link on the new device: </span>
        </p>

        <code>{location.origin + '/login?u=' + username}</code>

        <p>
            <span class={'form-stuff'}>
                <CopyBtn payload={(location.origin + '/login?u=' + username)}>
                    Copy to clipboard
                </CopyBtn>
            </span>
        </p>

        <hr />

        <p>Enter the PIN from the new device:</p>

        <form onSubmit={submitPin} className="pin-form">
            <input name="pin" className={'pin'} type="number" minLength={6}
                autoComplete="off"
                inputMode="numeric"
                id="pin-input"
                onInput={pinInput}
                maxLength={6}
            />

            <Button type="submit" disabled={!validPin}>Submit PIN</Button>
        </form>

    </div>
}
