import { FunctionComponent } from 'preact'
import * as wn from "webnative"
import { Signal } from '@preact/signals'

interface Props {
    session: Signal<wn.Session | null>,
    params: { humanName:string }
}

export const Username:FunctionComponent<Props> = function ({ session, params }) {
    
    // need to fetch this user's profile info
    console.log('params', params)

    return <div className="route-username">
        view of this user's public info
    </div>
}
