import { FunctionComponent, JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import * as wn from "webnative"
import { Signal, useSignal } from '@preact/signals'
import stringify from 'json-stable-stringify'
import { TargetedEvent } from 'preact/compat'
import ky from 'ky'
import Button from '../components/button.jsx'
import { Friend } from '../friend.js'
import { sign, toString } from '../util.js'
import { Request } from '../friend.js'
import './route-username.css'

interface BtnProps {
    isSpinning: boolean,
    session: wn.Session,
    profile: Signal<Friend>,
    onClick: (ev:JSX.TargetedEvent<EventTarget>) => void
    disabled: boolean
}

const FriendshipBtn:FunctionComponent<BtnProps> = function FriendshipBtn (props) {
    // @TODO -- check if you are friends already
    //   disable button if so
    const { isSpinning, session, profile, onClick, disabled } = props

    // don't show the button before the profile has resolved
    if (!(profile.value && profile.value['hashedUsername'])) return null

    // if we *are* this user, then don't show the button
    if (session.username === profile.value['hashedUsername']) return null

    return <Button isSpinning={isSpinning} className="friend-request"
        onClick={onClick}
        disabled={disabled || false}
    >
        Request friendship
    </Button>
}

interface Props {
    session: Signal<wn.Session | null>,
    params: { username:string, index: string },
    webnative: Signal<wn.Program>,
    friendsList: Signal<Friend[]>
}

// we get the human name from thr URL
// get the Fission name from our own DB, by human name
export const UserRoute:FunctionComponent<Props> =
function ({ webnative, session, params, friendsList }) {
    const profile = useSignal<Friend|unknown>(null)
    const err = useSignal<string|null>(null)
    const pendingRequest = useSignal<unknown|null>(null)
    const [isResolving, setResolving] = useState<boolean>(false)

    if (!session.value) return null

    const { username, index } = params
    const { crypto } = webnative.value.components
    const { keystore } = crypto

    // get the hashed username for the given username
    // @TODO -- check if we have this profile cached locally already
    useEffect(() => {
        getProfile(username, (index || null))
            .then((userProfile) => {
                console.log('got user profile', userProfile)
                profile.value = userProfile
            })
            .catch(err => {
                console.log('err in here', err.toString())
                err.value = err.toString()
            })
    }, [])

    // get any existing friend requests from us to them
    useEffect(() => {
        if (!session.value) return
        if (!profile.value) return
        const myHashedName = session.value.username
        const qs = new URLSearchParams({
            from: myHashedName,
            to: (profile.value as Friend).hashedUsername
        }).toString()

        const url = '/api/friend-request' + '?' + qs
        ky.get(url).json()
            .then(res => {
                console.log('url', url)
                console.log('got friend requests', res)
                pendingRequest.value = res
            })
            .catch(err => {
                // window.err = err
                console.log('errr getting existing requests', err)
            })
    }, [profile.value])

    async function requestFriend (ev:TargetedEvent) {
        ev.preventDefault()
        if (!(profile.value && profile.value['hashedUsername'])) return

        const author = await webnative.value.agentDID()

        const friendReq = {
            from: session.value?.username,  // us
            to: profile.value['hashedUsername'],  // them
            author
        }

        const sig = await sign(keystore, stringify(friendReq))
        const msg = { signature: toString(sig), value: friendReq }

        setResolving(true)
        try {
            const res = await ky.post('/api/friend-request', { json: msg }).json()
            console.log('made a request', res)
            pendingRequest.value = res
            setResolving(false)
        } catch (err) {
            // @ts-ignore
            const { response:res } = err
            if (res.status === 409) {
                // @TODO -- should show a message to the user
                setResolving(false)
                return console.log('**there already is a request pending**')
            }

            // @ts-ignore
            console.log('errr', err, err.status)
        }

        if (isResolving) setResolving(false)
    }

    return <div className="route-username">
        <h1>{username}</h1>

        {pendingRequest.value ?
            (<div className="badges">
                <span>Request pending&hellip;</span>
            </div>) :
            null
        }

        <ErrView err={err.value} />

        <FriendshipBtn session={session.value} profile={profile as Signal<Friend>}
            onClick={requestFriend}
            isSpinning={isResolving}
            disabled={(!!pendingRequest.value)}
        />
    </div>
}

function ErrView ({ err }) {
    return err ?
        (<div className="error-msg">
            <p>{err}</p>
        </div>) :
        null
}

function getProfile (humanName, i):Promise<Friend> {
    return ky.get('/api/username/' + humanName + (i ? `/${parseInt(i)}` : ''))
        .json()
}
