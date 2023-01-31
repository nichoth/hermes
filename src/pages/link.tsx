import { FunctionComponent, h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Signal } from '@preact/signals'
import { TargetedEvent } from 'preact/compat'
import * as wn from "webnative"
import clipboardCopy from "clipboard-copy";
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
    const [hasCopied, setCopied] = useState<boolean>(false)

    useEffect(() => {
        const { session } = webnative.value
        if (!session) return
        console.log('*username*', session.username)

        webnative.value.auth.accountProducer(session.username)
            .then(producer => {
                // this is the device that *is* logged in
                // which means we need to type a pin from the challenger,
                //   and check that it's ok
                producer.on('challenge', challenge => {
                    // Either show `challenge.pin` or have the user input a PIN
                    //   and see if they're equal.
                    console.log('challenge', arguments)
                    setChallenge(challenge)
                })

                producer.on('link', ({ approved }) => {
                    console.log('link', arguments)
                    if (!approved) return
                    console.log('Device linked successfully')
                })
            })
    }, [webnative.value])

    function submitPin (ev:TargetedEvent) {
        ev.preventDefault()
        if (!ev.target || !challenge) return
        console.log('aaaaaaaaaa', ev)

        // have the user input a PIN and see if they're equal.
        const userInput = (ev.target as HTMLFormElement).elements['pin']
        console.log('user input', userInput)
        if (userInput === challenge.pin.join('')) challenge.confirmPin()
        else challenge.rejectPin()
    }

    const username = webnative.value.session?.username

    function copyLink (ev:MouseEvent) {
        ev.preventDefault()
        clipboardCopy(location.origin + '/login?u=' + username)
        setCopied(true)
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
            <button className={'copy-btn'} onClick={copyLink}>
                {hasCopied ? '✅ \u00A0copied' : 'Copy to clipboard'} 
            </button>
        </p>

        <hr />

        <p>Enter the pin from the new device:</p>

        <form onSubmit={submitPin} className="pin-form">
            <input name="pin" className={'pin'} type="text" minLength={4}
                maxLength={4}
            />

            <button type="submit">submit pin</button>
        </form>

    </div>
}
