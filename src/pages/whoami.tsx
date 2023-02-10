import * as wn from "webnative"
import { useState, useEffect } from 'preact/hooks'
import { FunctionComponent } from 'preact'
import { Signal, useSignal } from "@preact/signals"
// import { getHumanName } from "../username.js"
import { Pencil } from "../components/pencil-edit-button.jsx"
import EditableImg from '../components/editable-image.jsx'
import CONSTANTS from "../CONSTANTS.js"
import PERMISSIONS from '../permissions.js'
import TextInput from '../components/text-input.jsx'
import { createDID, prepareDid, isUsernameValid,
    USERDATA_STORAGE_KEY } from '../username.js'

import './whoami.css'

interface UserData {
    humanName: string
    did: string
}

interface Props {
    appAvatar: Signal<File|string|null>,
    session: Signal<wn.Session>,
    userData: Signal<UserData>
    webnative: Signal<wn.Program>
}

export const Whoami:FunctionComponent<Props> = function ({
    session,
    webnative,
    appAvatar,
    userData
}) {
    if (!session.value) return null
    const { fs } = session.value
    const humanName = (userData?.value)?.humanName 

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

    function editDescription (ev:MouseEvent) {
        ev.preventDefault()
        setEditingDesc(!isEditingDesc)
    }

    function editUsername (ev:MouseEvent) {
        ev.preventDefault()
        setEditingUsername(!isEditingUsername)
    }

    async function saveDescription (ev) {
        ev.preventDefault()
        if (!fs) return
        const els = ev.target.elements
        const description = els.description.value.trim()
        console.log('save profile', description)

        const filepath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(CONSTANTS.profilePath)
        )
        await fs.write(
            filepath,
            new TextEncoder().encode(JSON.stringify({ description }))
        )
        console.log('file path written...', filepath)
        await fs.publish()
        setEditingDesc(false)
        setProfile({ description })
    }

    async function saveUsername (ev:SubmitEvent) {
        ev.preventDefault()
        if (!ev.target) return
        if (!fs) return
        const { crypto, storage } = webnative.value.components
        const username = ev.target['username'].value
        const did = await createDID(crypto)
        // @TODO -- set username on server
        const newUserData = Object.assign({}, userData, {
            humanName: username,
            did
        })
        const preppedDid = await prepareDid(did)
        const isVal = await isUsernameValid(preppedDid, webnative.value)
        if (!isVal) {
            // @TODO -- show the user invalidness
            console.log('**invalid**')
            return
        }
        await storage.setItem(USERDATA_STORAGE_KEY, JSON.stringify(newUserData))
        setEditingUsername(false)
        userData.value = newUserData
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

                <dd className={'username-value' + (isEditingUsername ? ' editing' : '')}>
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
                            <form onSubmit={saveDescription}>
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
