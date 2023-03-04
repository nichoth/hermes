import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import dragDrop from 'drag-drop'
import { FunctionComponent } from 'preact'
import { Signal } from '@preact/signals'
import * as wn from "webnative"
import timestamp from 'monotonic-timestamp'
import Button from '../components/button.jsx'
import TextInput from '../components/text-input.jsx'
import { LOG_DIR_PATH, BLOB_DIR_PATH, APP_INFO } from '../CONSTANTS.js'
import './new.css'

interface NewPostProps {
    webnative: Signal<wn.Program>,
    session: Signal<wn.Session>
}

const NewPost:FunctionComponent<NewPostProps> = function (props) {
    return <div class="route new-post">
        <PostInput {...props} />
    </div>
}

interface InputProps {
    webnative: Signal<wn.Program>,
    session: Signal<wn.Session>
}

const PostInput:FunctionComponent<InputProps> = function PostInput (props) {
    const [pendingImage, setPendingImage] = useState<File|null>(null)
    const [isValid, setValid] = useState<boolean>(false)
    const [isResolving, setResolving] = useState<boolean>(false)
    const { fs, username } = (props.session.value || {})

    function checkIsValid () {
        var el = document.getElementById('new-post-form') as HTMLFormElement
        var _isValid = el.checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    // setup drag & drop
    // componentDidMount
    useEffect(function didMount () {
        const cleanup = dragDrop('.file-inputs', (files, _, fileList) => {
            const input = document.getElementById('image-input') as HTMLInputElement
            const form = document.getElementById('new-post-form')
            if (!input || !form) return

            input.files = fileList
            setPendingImage(files[0])
            // emit an 'input' event for form validation
            var event = new Event('input');
            form.dispatchEvent(event);
        })

        return cleanup
    }, [])

    function formInput () {
        checkIsValid()
    }

    async function handleSubmit (ev) {
        if (!fs) return
        ev.preventDefault()
        const file:File = ev.target.elements.image.files[0]
        const text:string = ev.target.elements.text.value

        setResolving(true)

        // find latest sequence number
        const logPath = wn.path.appData(
            APP_INFO,
            wn.path.directory(LOG_DIR_PATH)
        )
        // @NOTE -- this is like `mkdir -p` -- doesn't throw if the dir exists
        await fs.mkdir(logPath)
        const posts = await fs.ls(logPath)
        console.log('posts', posts)

        // posts names are like `1.json`
        const ns = (Object.keys(posts) || [])
            .map(key => parseInt(key.split('.')[0]))
            .sort((a,b) => b - a) // sort descending order
        
        const n = ns.length ? (ns[0] + 1) : 0

        console.log('ns', ns)

        // get filepath for the post JSON
        const postPath = wn.path.appData(
            APP_INFO,
            wn.path.file(LOG_DIR_PATH, n + '.json')
        )

        // write the JSON
        const newPost = createPostFromString(text, {
            sequence: n,
            alt: ev.target.elements['alt-text'].value,
            author: username // @TODO -- should use the user's DID
        })
        const res = await fs.write(
            postPath,
            new TextEncoder().encode(JSON.stringify(newPost))
        )

        // write the image
        const imgFilepath = wn.path.appData(
            APP_INFO,
            // __@TODO__ -- handle other file extensions
            wn.path.file(BLOB_DIR_PATH, n + '-0.jpg')
            // ^ we are only supporting single image per post for now
        )
        const reader = new FileReader()
        reader.onloadend = async () => {
            await fs.write(imgFilepath, reader.result as Uint8Array)
            console.log('img path written...', imgFilepath)
            await fs.publish()
            setResolving(false)
            // __@TODO__
            // should redirect to your profile view after posting
        }

        reader.readAsArrayBuffer(file)
    }

    function chooseFile (ev) {
        var file = ev.target.files[0]
        setPendingImage(file)
    }

    function nevermind (ev) {
        ev.preventDefault()
        const els = [document.getElementById('image-input') as HTMLInputElement,
            document.getElementById('caption') as HTMLInputElement]
        els.forEach(el => el.value = '')
        checkIsValid()
        setPendingImage(null)
    }

    return <form class="file-preview" id="new-post-form"
        onInput={formInput} onSubmit={handleSubmit}
    >
        <div class="file-inputs">
            {pendingImage ?
                (<div class="image-preview">
                    <img src={URL.createObjectURL(pendingImage)} />
                </div>) :
                (<div>
                    <p>Drop images here</p>
                    <label for="image-input">Choose a picture</label>
                </div>)
                
            }

            <input type="file" name="image" id="image-input" placeholder=" "
                accept="image/*"
                onChange={chooseFile}
                required={true}
                capture="environment"
            />
        </div>

        <label for="caption">caption</label>
        <textarea name="text" placeholder=" " id="caption" />

        <TextInput name="alt-text" required={true} displayName="Alt Text" />

        <div class="controls">
            <Button isSpinning={isResolving} type="submit" disabled={!isValid}>
                Save
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </div>

    </form>
}

function createPostFromString (content, { sequence, alt, author }) {
    return {
        sequence,
        timestamp: +timestamp(),
        author,
        content: {
            type: 'post',
            text: content,
            alt: alt || '',
            // handle 1 image per post
            mentions: [sequence + '-0.jpg']
        }
    }
}

export { NewPost }
export default NewPost
