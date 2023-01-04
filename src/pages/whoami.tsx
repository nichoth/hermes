import * as wn from "webnative"
import EditableImg from '../components/editable-image.jsx'
import { useState } from 'preact/hooks'
import CONSTANTS from "../CONSTANTS.jsx"

export const Whoami = function ({ webnative, appAvatar }) {
    const { fs, username } = webnative.value
    interface Profile {
        image: { type: string, name: string, file: string|ArrayBuffer|null };
        file: File;
        username: string | null;
    } 
    const [pendingProfile, setPendingProfile] = useState<Profile | null>(null)

    function selectImg (ev) {
        ev.preventDefault()
        const file = ev.target.files[0]
        console.log('*file*', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            setPendingProfile({
                image: {
                    file: reader.result,
                    type: file.type,
                    name: file.name
                },
                file: file,
                username: (pendingProfile && pendingProfile.username) || null
            })
        }

        // this gives us base64
        reader.readAsDataURL(file)
    }

    async function saveImg (ev) {
        ev.preventDefault()
        if (!pendingProfile) return

        try {
            const filepath = fs.appPath(wn.path.file(CONSTANTS.avatarPath))
            console.log('file path written...', filepath)
            console.log('the pending stuff...', pendingProfile)
            await fs.write(filepath, pendingProfile.image.file)
            await fs.write(fs.appPath(wn.path.file('profile.json')), JSON.stringify({
                image: {
                    type: pendingProfile.image.type,
                    name: pendingProfile.image.name
                },
                username: pendingProfile.username || null
            }))

            const content = await fs.cat(filepath)
            appAvatar.value = URL.createObjectURL(
                new Blob([content as BlobPart], { type: 'image/jpeg' })
            )
        } catch (err) {
            if (err) console.log('errrrrrrrrrrr', err)
        }
    }

    return <div>
        <div class="route-whoami">
            {/* var { url, onSelect, title, name, label } = props */}
            <EditableImg
                onSelect={selectImg}
                name="whoami-avatar"
                url={pendingProfile?.image.file || appAvatar.value}
                // url={pendingProfile?.image.file || avatarImg ||
                //     `data:image/svg+xml;utf8,${generateFromString(username)}`}
                title="Set your avatar"
            />

            {/* <img class="whoami-avatar"
                src={`data:image/svg+xml;utf8,${generateFromString("example@test.com")}`}
            /> */}

            <dl class="profile-info">
                <dt>Your username</dt>
                <dd>{username}</dd>

                <dt>Description</dt>
                <dd>flob bar bla bla</dd>
            </dl>

        </div>

        <div class="profile-controls">
            <button
                disabled={!(pendingProfile?.image)}
                onClick={saveImg}
            >
                Save
            </button>
        </div>
    </div>
}
