import * as wn from "webnative"
import { useState } from 'preact/hooks'
import { Pencil } from "../components/pencil-edit-button.jsx"
import EditableImg from '../components/editable-image.jsx'
import CONSTANTS from "../CONSTANTS.jsx"
import PERMISSIONS from '../permissions.js'
import './whoami.css'

export const Whoami = function ({ webnative, appAvatar }) {
    const { fs, username } = webnative.value.session
    interface Profile {
        description: string | null;
    }

    interface Avatar {
        image: { type: string, name: string, blob: string|ArrayBuffer|null };
        file: File;
    }

    const [pendingProfile, setPendingProfile] = useState<Profile | null>(null)
    const [pendingImage, setPendingImage] = useState<Avatar | null>(null)

    function selectImg (ev) {
        ev.preventDefault()
        const file = ev.target.files[0]
        console.log('*file*', file)

        const reader = new FileReader()

        reader.onloadend = () => {
            setPendingImage({
                file,
                image: {
                    blob: reader.result,
                    type: file.type,
                    name: file.name
                }
            })
        }

        // this gives us base64
        reader.readAsDataURL(file)
    }

    async function saveImg (ev) {
        ev.preventDefault()
        if (!pendingImage) return

        try {
            const filepath = wn.path.appData(
                PERMISSIONS.app,
                wn.path.file(CONSTANTS.avatarPath)
            )
            await fs.write(filepath, pendingImage.file)
            console.log('file path written...', filepath)

            // read the file we just wrote
            const content = await fs.cat(filepath)
            appAvatar.value = URL.createObjectURL(
                new Blob([content as BlobPart], { type: 'image/jpeg' })
            )

            await fs.publish()

            setPendingImage(null)
        } catch (err) {
            console.log('could not write file...')
            console.log('errrrrrrrrrrr', err)
        }
    }

    return <div class="route-whoami">
        <h1>{username}</h1>
        <div class="whoami-content">
            {/* var { url, onChange, title, name, label } = props */}
            <EditableImg
                onChange={selectImg}
                name="whoami-avatar"
                url={pendingImage?.image.blob || appAvatar.value}
                title="Set your avatar"
            />

            <dl class="profile-info">
                <dt>Your username</dt>
                <dd>{username}</dd>

                <dt>Description <Pencil /></dt>
                <dd>flob bar bla bla</dd>
            </dl>
        </div>

        <div class="profile-controls">
            <button
                disabled={!(pendingImage?.image.blob) ||
                    (pendingImage?.image.blob === appAvatar.value)}
                onClick={saveImg}
            >
                Save
            </button>
        </div>
    </div>
}
