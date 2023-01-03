import { path } from "webnative"
import { generateFromString } from 'generate-avatar'
import EditableImg from '../components/editable-image.jsx'
import { useState } from 'preact/hooks'

export const Whoami = function ({ webnative }) {
    const wn = webnative
    const [pendingProfile, setPendingProfile] = useState<{
        image:(string | ArrayBuffer | null),
        username:string | null
    } | null>(null)

    function selectImg (ev) {
        ev.preventDefault()
        console.log('on image select', ev)
        var file = ev.target.files[0]
        console.log('*file*', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            console.log('*done reading file*')
            setPendingProfile({
                image: reader.result,
                username: (pendingProfile && pendingProfile.username) || null
            })

            console.log('*reader.result*', reader.result)
        }

        // this gives us base64
        reader.readAsDataURL(file)
    }

    return <div>
        <div class="route-whoami">
            {/* var { url, onSelect, title, name, label } = props */}
            <EditableImg
                onSelect={selectImg}
                name="whoami-avatar"
                url={pendingProfile?.image || `data:image/svg+xml;utf8,${generateFromString("example@test.com")}`}
                title="Set your avatar"
            />

            {/* <img class="whoami-avatar"
                src={`data:image/svg+xml;utf8,${generateFromString("example@test.com")}`}
            /> */}

            <dl class="profile-info">
                <dt>Your username</dt>
                <dd>{wn.value.username}</dd>

                <dt>Description</dt>
                <dd>flob bar bla bla</dd>
            </dl>

        </div>

        <div class="profile-controls">
            <button
                disabled={!(pendingProfile?.image)}
            >
                Save
            </button>
        </div>
    </div>
}
