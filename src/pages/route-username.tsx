import { FunctionComponent } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import * as wn from "webnative"
import { Signal, useSignal } from '@preact/signals'
import stringify from 'json-stable-stringify'
import { publicKeyToDid } from "webnative/did/transformers";
import ky from 'ky'
import Button from '../components/button.jsx'
import { Friend } from '../friend.js'
import { sign, toString } from '../util.js'

function getProfile (humanName, i):Promise<Friend> {
    return ky.get('/api/username/' + humanName + (i ? `/${parseInt(i)}` : ''))
        .json()
}

interface BtnProps {
    isSpinning: boolean,
    session: wn.Session,
    profile: Signal<Friend>,
    onClick: Function
}

const FriendshipBtn:FunctionComponent<BtnProps> = function FriendshipBtn (props) {
    // @TODO -- check if you are friends already
    //   disable button if so
    const { isSpinning, session, profile, onClick } = props

    // don't show the button before the profile has resolved
    if (!(profile.value && profile.value['hashedUsername'])) return null

    // if we *are* this user, then don't show the button
    if (session.username === profile.value['hashedUsername']) return null

    return <Button isSpinning={isSpinning} className="friend-request"
        onClick={onClick}
    >
        request friendship
    </Button>
}

interface Props {
    session: Signal<wn.Session | null>,
    params: { username:string, index: string },
    webnative: Signal<wn.Program>
}

export const UserRoute:FunctionComponent<Props> =
function ({ webnative, session, params }) {
    const profile = useSignal<Friend|unknown>(null)
    const err = useSignal<string|null>(null)
    const [isResolving, setResolving] = useState<boolean>(false)

    if (!session.value) return null

    const { username, index } = params
    const { crypto } = webnative.value.components
    const { keystore } = crypto

    // get the hashed username for the given username
    // @TODO -- check if we have this profile already
    useEffect(() => {
        getProfile(username, (index || null))
            .then((userProfile) => {
                profile.value = userProfile
            })
            .catch(err => {
                console.log('in here', err.toString())
                err.value = err.toString()
            })
    }, [])

    async function requestFriend (ev:Event) {
        ev.preventDefault()
        if (!(profile.value && profile.value['hashedUsername'])) return

        // these are the hashed usernames
        const friendReq = {
            from: session.value?.username,  // us
            to: profile.value['hashedUsername']   // them
        }

        const pubKey = await keystore.publicWriteKey()
        const ksAlg = await keystore.getAlgorithm()
        const author = publicKeyToDid(crypto, pubKey, ksAlg)

        const sig = await sign(keystore, stringify(friendReq))
        const msg = { signature: toString(sig), author, value: friendReq }

        setResolving(true)
        try {
            const res = await ky.post('/api/friend-request', { json: msg }).json()
            console.log('ressssssssssss', res)
        } catch (err) {
            setResolving(false)
        }

        setResolving(false)
    }

    return <div className="route-username">
        <h1>{username}</h1>

        <ErrView err={err.value} />

        <FriendshipBtn session={session.value} profile={profile as Signal<Friend>}
            onClick={requestFriend} isSpinning={isResolving}
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
