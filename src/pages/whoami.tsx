import { generateFromString } from 'generate-avatar'
import * as wn from "webnative"
import EditableImg from '../components/editable-image.jsx'
import { useState, useEffect } from 'preact/hooks'
import CONSTANTS from "../CONSTANTS.jsx"

export const Whoami = function ({ webnative }) {
    const { fs, username } = webnative.value
    interface Profile {
        image: { type: string, name: string, file: string|ArrayBuffer|null };
        file: File;
        username: string | null;
    } 
    const [avatarImg, setAvatarImg] = useState<string | null>(null)
    const [pendingProfile, setPendingProfile] = useState<Profile | null>(null)

    useEffect(() => {
        if (!fs) return
        const filename = CONSTANTS.avatarPath
        fs.cat(fs.appPath(wn.path.file(filename)))
            .then(content => {
                console.log('*catted*', content)
                if (!content) return
                    setAvatarImg(URL.createObjectURL(
                        new Blob([content as BlobPart], { type: 'image/jpeg' })
                    ))
            })
            .catch(err => {
                // no avatar file, no nothing
                console.log('**cant read**', err)
            })
    }, [webnative.value])

    function selectImg (ev) {
        ev.preventDefault()
        // console.log('on image select', ev)
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
        const ext = pendingProfile?.image.name.split('.').pop()
        const filename = CONSTANTS.avatarPath + '.'+ ext
        // const filename = CONSTANTS.profilePath
        if (!pendingProfile) return

        try {
            await fs.write(fs.appPath(wn.path.file(filename)),
                pendingProfile.image.file)
            await fs.write(fs.appPath(wn.path.file('profile.json')), JSON.stringify({
                image: {
                    type: pendingProfile.image.type,
                    name: pendingProfile.image.name
                },
                username: pendingProfile.username
            }))
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
                url={pendingProfile?.image.file || avatarImg ||
                    `data:image/svg+xml;utf8,${generateFromString(username)}`}
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
