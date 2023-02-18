import { FunctionComponent } from "preact"
import { Signal } from "@preact/signals"
import { Session } from "webnative"
import './friend-request.css'
import { TextInput } from "../components/text-input.jsx"
import { Button } from '../components/button.jsx'

interface Props {
    session: Signal<Session|null>
}

export const FriendsRequest:FunctionComponent<Props> = function ({ session }) {
    return <div className={'route friends-request'}>
        <h1>Request a new friend</h1>

        <form>
            <TextInput name="friend-name" displayName="Friend hashed username" />
            <Button type={'submit'} isSpinning={false}>Submit</Button>
        </form>
    </div>
}
