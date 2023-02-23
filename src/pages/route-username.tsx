import { FunctionComponent } from 'preact'
import { useEffect, useState } from 'preact/hooks'
import * as wn from "webnative"
import { Signal, useSignal } from '@preact/signals'
import Button from '../components/button.jsx'
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
    const profile = useSignal<Friend|unknown>(null)
    const err = useSignal<string|null>(null)

    const { username, index } = params

    // @TODO -- check if we have this profile already
    useEffect(() => {
        getProfile(username, (index || null))
            .then((userProfile) => {
                profile.value = userProfile

                // use the hashedUsername to get their photos, etc
            })
            .catch(err => {
                console.log('in here', err)
                console.log('in here', err.toString())
                err.value = err.toString()
            })
    }, [session])

    console.log('user profile', profile.value)
    
    // need to fetch this user's profile info
    console.log('props', params, session.value)

    return <div className="route-username">
        <h1>{username}</h1>

        {err.value ?
            (<div className="error-msg">
                <p>{err.value}</p>
            </div>) :
            FrienshipButton()
        }
    </div>
}

function FrienshipButton () {
    // @TODO -- check if you are friends already

    return <div className="profile-route">
        <Button className="friend-request">
            request friendship
        </Button>
    </div>
}
