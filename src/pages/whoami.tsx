import { path } from "webnative"
import { generateFromString } from 'generate-avatar'

export const Whoami = function ({ webnative }) {
    const wn = webnative
    return <div class="route-whoami">
        <img class="whoami-avatar"
            src={`data:image/svg+xml;utf8,${generateFromString("example@test.com")}`}
        />


        <dl class="profile-info">
            <dt>Your username</dt>
            <dd>{wn.value.username}</dd>
        </dl>
    </div>
}
