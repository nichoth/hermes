import { useEffect } from 'preact/hooks'
import * as wn from "webnative"
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useSignal } from '@preact/signals'
import ky from 'ky'
import './route-friends.css'
import { Friend, listPath, Request } from '../friend.js'

interface Props {
    session: Signal<wn.Session | null>
}

export const Friends:FunctionComponent<Props> = function ({ session }) {
    const friendsList = useSignal<Friend[] | []>([])
    const incomingRequests = useSignal<Request[]>([])
    const outgoingRequests = useSignal<Request[]>([])

    // get friend list
    useEffect(() => {
        const fs = session.value?.fs
        if (!fs) return

        fs.read(listPath)
            .then(_friendsList => {
                const list = JSON.parse(new TextDecoder().decode(_friendsList))
                friendsList.value = list
            })
            .catch(err => {
                console.log('*could not read friend list*', err)
            })
    }, [session.value])

    // get incoming and outgoing friend requests
    useEffect(() => {
        if (!session.value?.username) return
        const qs = new URLSearchParams({ fromto: session.value.username }).toString()
        ky.get(`/api/friend-request?${qs}`).json()
            .then((res) => {
                console.log('got friend requests', res)
                const outgoing = (res as Array<Request>).filter(msg => {
                    return msg.value.from === session.value?.username
                })
                if (outgoing.length) outgoingRequests.value = outgoing

                const incoming = (res as Array<Request>).filter(msg => {
                    return msg.value.to === session.value?.username
                })
                if (incoming.length) incomingRequests.value = incoming
            })
            .catch(err => {
                console.log('errrrr', err)
            })
    }, [session.value])

    // // get outgoing friend requests
    // useEffect(() => {
    //     if (!session.value?.username) return
    //     const qs = new URLSearchParams({ from: session.value.username }).toString()
    //     ky.get(`/api/friend-request?${qs}`).json()
    //         .then(res => {
    //             console.log('got outfoing requests', res)
    //             outgoingRequests.value = (res as [])
    //         })
    //         .catch(err => {
    //             console.log('errr', err)
    //             // do nothing
    //         })
    // }, [session.value])

    // // get incoming friend requests
    // useEffect(() => {
    //     if (!session.value?.username) return
    //     const qs = new URLSearchParams({ to: session.value.username }).toString()
    //     ky.get(`/api/friend-request?${qs}`).json()
    //         .then(res => {
    //             console.log('got incoming requests', res)
    //             incomingRequests.value = (res as [])
    //         })
    //         .catch(err => {
    //             console.log('errr incoming requests', err)
    //             // do nothing
    //         })
    // }, [session.value])

    return <div className="route route-friends">
        <h1>Friendship information</h1>

        <p>
            <a href="/friends/request">Request a new friend</a>
        </p>

        <h2>Incoming friend requests</h2>
        {!(incomingRequests.value).length ?
            (<p><em>none</em></p>) :
            (<ul>
                {(incomingRequests.value.map(req => {
                    return <li className="friend-request">
                        {req.value.from}
                    </li>
                }))}
            </ul>)
        }

        <h2>Outgoing friend requests</h2>
        {!outgoingRequests.value.length ?
            (<p><em>none</em></p>) :
            (<ul>
                {outgoingRequests.value.map(req => {
                    return <li className="friend-request">{req.value.to}</li>
                })}
            </ul>)
        }

        <h2>Friends</h2>
        {!friendsList.value.length ?
            (<p><em>none</em></p>) :
            (<ul>
                {friendsList.value.map(friend => {
                    return <li className="friend">
                        {friend.humanName}
                    </li>
                })}
            </ul>)
        }
    </div>
}
