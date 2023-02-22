import { FunctionComponent } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import * as wn from "webnative"
import { useSignal, Signal } from '@preact/signals'
import { Friend } from '../friend.js'
import ky from 'ky'

interface Props {
    session: Signal<wn.Session | null>,
    params: { username:string, index: string }
}

function getProfile (humanName, i) {
    return ky.get('/api/username/' + humanName + (i ? `/${parseInt(i)}` : ''))
        .json()
}

export const UserRoute:FunctionComponent<Props> = function ({ session, params }) {
    const [profile, setProfile] = useState<Friend | unknown>(null)
    const [err, setErr] = useState<string | null>(null)

    const { username, index } = params

    // @TODO -- check if we have this profile already
    useEffect(() => {
        getProfile(username, (index || null))
            .then((userProfile) => {
                setProfile(userProfile)
            })
            .catch(err => {
                console.log('in here', err)
                console.log('in here', err.toString())
                setErr(err.toString())
            })
    }, [session])

    console.log('user profile', profile)
    
    // need to fetch this user's profile info
    console.log('props', params, session.value)

    return <div className="route-username">
        <h1>{username}</h1>

        {err ?
            <p>{err}</p> :
            null
        }
    </div>
}
