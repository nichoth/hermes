import { path } from "webnative"

export const Whoami = function ({ webnative }) {
    const wn = webnative
    return <div class="route-whoami">
        <dl>
            <dt>Your username</dt>
            <dd>{wn.value.username}</dd>
        </dl>
    </div>
}
