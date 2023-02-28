import { useEffect } from 'preact/hooks'
import * as wn from "webnative"
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useSignal } from '@preact/signals'
import ky from 'ky'
import './route-friends.css'
import { Friend, listPath, Request } from '../friend.js'
import ButtonTwo from '../components/button-two.jsx'
import { APP_INFO, FRIENDS_PATH } from '../CONSTANTS.js'

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
        const qs = new URLSearchParams({
            fromto: session.value.username
        }).toString()

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

    async function accept (req:Request, ev:Event) {
        ev.preventDefault()
        console.log('accept friend', req)
        // @TODO
        // set up shared private files here
        // see https://guide.fission.codes/developers/webnative/sharing-private-data
        // see https://github.com/users/nichoth/projects/4/views/1?pane=issue&itemId=20845590


        const friendsListPath = wn.path.appData(
            APP_INFO,
            wn.path.file(FRIENDS_PATH)
        )

        let friendList:Request[] = []
        try {
            const data = new TextDecoder().decode(
                await session.value?.fs?.read(friendsListPath)
            )
            friendList = JSON.parse(data)
            console.log('*friend list*', friendList)
        } catch (err) {
            console.log('reading friend list error', err)
            if ((err as Error).toString().includes('Path does not exist')) {
                // do nothing
            }
        }

        friendList.push(req)
        const filepath = wn.path.appData(
            APP_INFO,
            wn.path.file(FRIENDS_PATH)
        )
        const fs = session.value?.fs
        if (!fs) return console.log('oh on')

        await fs.write(
            filepath,
            new TextEncoder().encode(JSON.stringify(friendList))
        )
        await fs.publish()
    }

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
                        <span>{req.value.from}</span>
                        <ButtonTwo onClick={accept.bind(null, req)}>
                            Accept friendship
                        </ButtonTwo>
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
                        {friend.humanName || 'someone'}
                    </li>
                })}
            </ul>)
        }
    </div>
}
