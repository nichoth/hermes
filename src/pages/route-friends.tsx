import { useEffect } from 'preact/hooks'
import * as wn from "webnative"
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import { useSignal } from '@preact/signals'
import './route-friends.css'
import { APP_INFO, FRIENDS_PATH } from "../CONSTANTS.js"

interface Props {
    session: Signal<wn.Session | null>
}

interface Friend {
    humanName: string,
    hashedUsername: string
}

export const Friends:FunctionComponent<Props> = function ({ session }) {
    const friendsList = useSignal<Friend[] | []>([])
    const pendingFriends = useSignal<Friend[] | []>([])

    const listPath = wn.path.appData(
        APP_INFO,
        wn.path.file(FRIENDS_PATH)
    )

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
    }, [session])

    return <div className="route route-friends">
        <h1>Friendship information</h1>

        <p>
            <a href="/friends/request">Request a new friend</a>
        </p>

        <h2>Pending friends</h2>
        {!pendingFriends.value.length ?
            (<p><em>none</em></p>) :
            (<ul>
                {(pendingFriends.value.map(user => {
                    return <li className="friend">
                        {user.humanName}
                    </li>
                }))}
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
