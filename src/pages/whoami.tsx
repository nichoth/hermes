import { path } from "webnative"
import { generateFromString } from 'generate-avatar'
import EditableImg from '../components/editable-image.jsx'
import { useState, useEffect } from 'preact/hooks'

export const Whoami = function ({ webnative }) {
    const wn = webnative.value
    const { fs } = wn
    const [avatarImg, setAvatarImg] = useState<string | null>(null)
    const [pendingProfile, setPendingProfile] = useState<{
        image:(string | ArrayBuffer | null),
        username:string | null
    } | null>(null)

    useEffect(() => {
        // const { filename, type } = item.image
        if (!wn.fs) return
        const filename = 'test.jpg'
        fs.cat(fs.appPath(path.file(filename)))
            .then(content => {
                console.log('*catted*', content)
                if (!content) return
                    setAvatarImg(URL.createObjectURL(
                    new Blob([content as BlobPart], { type: 'image/jpeg' })
                ))
            })
            .catch(err => {
                console.log('*cant read*', err)
            })
    }, [wn])

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
                url={pendingProfile?.image || avatarImg ||
                    `data:image/svg+xml;utf8,${generateFromString(wn.username)}`}
                title="Set your avatar"
            />

            {/* <img class="whoami-avatar"
                src={`data:image/svg+xml;utf8,${generateFromString("example@test.com")}`}
            /> */}

            <dl class="profile-info">
                <dt>Your username</dt>
                <dd>{wn.username}</dd>

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
