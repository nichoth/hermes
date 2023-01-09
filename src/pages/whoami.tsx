import * as wn from "webnative"
import { useState, useEffect } from 'preact/hooks'
import { useSignal } from "@preact/signals"
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

    const [isEditingDesc, setEditingDesc] = useState<boolean>(false)
    const [profile, setProfile] = useState<Profile|null>(null)
    // const [pendingProfile, setPendingProfile] = useState<Profile | null>(null)
    const [pendingImage, setPendingImage] = useState<Avatar | null>(null)
    const pendingDesc = useSignal<string|undefined>(undefined)

    // componentDidMount
    useEffect(() => {
        if (!fs) return
        if (!('fs' in webnative.value.session) ||
            !('username' in webnative.value.session)) return

        const filepath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(CONSTANTS.avatarPath)
        )

        fs.cat(filepath)
            .then(content => {
                if (!content) return
                setProfile(JSON.parse(content))
            }).catch(err => {
                console.log('errrrr reading file', err)
            })
    }, [])

    function selectImg (ev) {
        ev.preventDefault()
        const file = ev.target.files[0]

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

            await fs.publish()

            // read the file we just wrote
            try {
                const content = await fs.cat(filepath)
                appAvatar.value = URL.createObjectURL(
                    new Blob([content as BlobPart], { type: 'image/jpeg' })
                )

                setPendingImage(null)
            } catch (err) {
                console.log('**err reading**', err)
            }
        } catch (err) {
            console.log('could not write file...')
            console.log('errrrrrrrrrrr', err)
        }
    }

    function editDescription (ev) {
        ev.preventDefault()
        console.log('editing')
        setEditingDesc(!isEditingDesc)
    }

    async function saveProfile (ev) {
        ev.preventDefault()
        const els = ev.target.elements
        const value = els.description.value.trim()
        console.log('save profile', value)

        const filepath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(CONSTANTS.profilePath)
        )
        await fs.write(filepath, JSON.stringify({ description: value }))
        console.log('file path written...', filepath)
        await fs.publish()
        setEditingDesc(false)
    }

    function setPendingDesc (ev) {
        ev.preventDefault()
        pendingDesc.value = ev.target.value
    }

    return <div class="route-whoami">
        <h1>{username}</h1>
        <div class="whoami-content">
            {/* var { url, onChange, title, name, label } = props */}
            <div class="image-input">
                <EditableImg
                    onChange={selectImg}
                    name="whoami-avatar"
                    url={pendingImage?.image.blob || appAvatar.value}
                    title="Set your avatar"
                />

                <div class="image-controls">
                    <button
                        disabled={!(pendingImage?.image.blob) ||
                            (pendingImage?.image.blob === appAvatar.value)}
                        onClick={saveImg}
                    >
                        Save
                    </button>
                </div>
            </div>

            <dl class="profile-info">
                <dt>Your username</dt>
                <dd>{username}</dd>

                <dt>
                    Description
                    <button class={'edit-btn' + (isEditingDesc ? ' is-editing' : '')}
                        onClick={editDescription}
                        title={isEditingDesc ?
                            'Stop editing' :
                            'Edit description'}
                    >
                        <Pencil />
                    </button>
                </dt>

                <dd class={isEditingDesc ? 'editing-dd' : null}>
                    {isEditingDesc ?
                        <div class="editing-text">
                            <form onSubmit={saveProfile}>
                                <textarea name="description" autoFocus
                                    value={pendingDesc ?
                                        pendingDesc :
                                        null}
                                    onInput={setPendingDesc}
                                />

                                <button type="submit"
                                    disabled={!pendingDesc.value?.trim() ||
                                        (pendingDesc.value.trim() == profile?.description)}
                                >
                                    save
                                </button>
                            </form>
                        </div> :
                        <p>{profile ? profile.description : <em>none</em>}</p>
                    }
                </dd>
            </dl>
        </div>

    </div>
}
