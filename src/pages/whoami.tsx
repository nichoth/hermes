import * as wn from "webnative"
import { useState, useEffect } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal, useSignal } from "@preact/signals"
import { getHumanName } from "../username.js"
import { Pencil } from "../components/pencil-edit-button.jsx"
import EditableImg from '../components/editable-image.jsx'
import CONSTANTS from "../CONSTANTS.jsx"
import PERMISSIONS from '../permissions.js'
import TextInput from '../components/text-input.jsx'

import './whoami.css'

interface Props {
    appAvatar: Signal<File|string|null>,
    session: Signal<wn.Session>,
    fullUsername: Signal<string>
}

export const Whoami:FunctionComponent<Props> = function ({
    session,
    appAvatar,
    fullUsername
}) {
    if (!session.value) return null
    const { fs } = session.value
    const humanName = getHumanName(fullUsername?.value || '')

    interface Profile {
        description: string | null;
    }

    interface Avatar {
        image: { type: string, name: string, blob: string|ArrayBuffer|null };
        file: File;
    }

    const [isEditingDesc, setEditingDesc] = useState<boolean>(false)
    const [profile, setProfile] = useState<Profile|null>(null)
    const [pendingImage, setPendingImage] = useState<Avatar | null>(null)
    const pendingDesc = useSignal<string|null>(null)
    const [isEditingUsername, setEditingUsername] = useState<boolean>(false)
    const usernameValid = useSignal<boolean>(false)

    function checkValidUsername (ev:InputEvent) {
        const form = ev.target as HTMLFormElement
        const isValid = form.checkValidity()
        if (usernameValid.value !== isValid) usernameValid.value = isValid
    }

    // set profile
    useEffect(() => {
        if (!fs || !session) return

        const profilePath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(CONSTANTS.profilePath)
        )

        fs.cat(profilePath)
            .then(content => {
                if (!content) return
                const str = new TextDecoder().decode(content)
                setProfile(JSON.parse(str))
            }).catch(err => {
                console.log('errrrr reading file', err)
            })
    }, [fs])

    function selectImg (ev) {
        ev.preventDefault()
        const file:File = ev.target.files[0]

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

        reader.readAsArrayBuffer(file)
    }

    async function saveImg (ev) {
        ev.preventDefault()
        if (!pendingImage) return
        if (!fs) return

        try {
            const filepath = wn.path.appData(
                PERMISSIONS.app,
                wn.path.file(CONSTANTS.avatarPath)
            )
            // write the file as the `file` element that is submitted with
            //   the form -- `ev.target.files[0]`
            await fs.write(filepath, pendingImage.image.blob as Uint8Array)
            console.log('file path written...', filepath)

            await fs.publish()

            // read the file we just wrote
            try {
                const content = await fs.cat(filepath)
                appAvatar.value = URL.createObjectURL(
                    new Blob([content as BlobPart], { type: 'image/*' })
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
        setEditingDesc(!isEditingDesc)
    }

    function editUsername (ev) {
        ev.preventDefault()
        setEditingUsername(!isEditingUsername)
    }

    async function saveUsername (ev) {
        ev.preventDefault()
        if (!fs) return
    }

    async function saveProfile (ev) {
        ev.preventDefault()
        if (!fs) return
        const els = ev.target.elements
        const value = els.description.value.trim()
        console.log('save profile', value)

        const filepath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(CONSTANTS.profilePath)
        )
        await fs.write(
            filepath,
            new TextEncoder().encode(JSON.stringify({ description: value }))
        )
        console.log('file path written...', filepath)
        await fs.publish()
        setEditingDesc(false)
    }

    function setPendingDesc (ev) {
        ev.preventDefault()
        pendingDesc.value = ev.target.value
    }

    return <div class="route route-whoami">
        <h1>{humanName}</h1>
        <div class="whoami-content">
            <div class="image-input">
                <EditableImg
                    onChange={selectImg}
                    name="whoami-avatar"
                    url={pendingImage ?
                        URL.createObjectURL(
                            new Blob([pendingImage.image.blob as BlobPart], {
                                type: 'image/*'
                            })
                        ) :
                        appAvatar.value
                    }
                    title="Set your avatar"
                    capture="user"
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
                <dt>
                    Your username
                    
                    <EditBtn
                        isEditing={isEditingUsername}
                        onClick={editUsername}
                        aria-label={isEditingUsername ?
                            'Stop editing your username' :
                            'Edit your username'
                        }
                        title={isEditingDesc ?
                            'Stop editing' :
                            'Edit username'
                        }
                    />
                </dt>

                <dd className={"username-value"}>
                    {!isEditingUsername ?
                        humanName :
                        (<form onSubmit={saveUsername} onInput={checkValidUsername}>
                            <TextInput
                                name="username"
                                required={true}
                                displayName="Username"
                                minlength={'3'}
                                autoFocus={true}
                            />

                            <button type="submit"
                                disabled={!(usernameValid.value)}
                            >
                                save
                            </button>
                        </form>)
                    }
                </dd>

                <dt>
                    Description

                    <EditBtn
                        isEditing={isEditingDesc}
                        aria-label={isEditingDesc ?
                            'Stop editing your description' :
                            'Edit your description'}
                        onClick={editDescription}
                        title={isEditingDesc ?
                            'Stop editing' :
                            'Edit description'}
                    />
                </dt>

                <dd class={isEditingDesc ? 'editing-dd' : null}>
                    {isEditingDesc ?
                        <div class="editing-text">
                            <form onSubmit={saveProfile}>
                                <textarea name="description" autoFocus
                                    value={pendingDesc.value === null ?
                                        (profile && profile.description || null) :
                                        pendingDesc.value
                                    }
                                    onInput={setPendingDesc}
                                />

                                <button type="submit"
                                    disabled={!pendingDesc.value?.trim() ||
                                        (pendingDesc.value.trim() ==
                                            profile?.description)}
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

function EditBtn (props) {
    const { isEditing, onClick } = props

    return <button {...props}
        class={'edit-btn' + (isEditing ? ' is-editing' : '')}
        onClick={onClick}
    >
        <Pencil />
    </button>
}
