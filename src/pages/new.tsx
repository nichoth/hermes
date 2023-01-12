import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import dragDrop from 'drag-drop'
import { FunctionComponent } from 'preact'
import * as wn from "webnative"
import Button from '../components/button.jsx'
import './new.css'
import { Signal } from '@preact/signals'
import { PERMISSIONS } from '../permissions.js'
import CONSTANTS from '../CONSTANTS.jsx'
const { logDirPath, blobDirPath } = CONSTANTS

function NewPost (props) {
    return <div class="route new-post">
        <PostInput {...props} />
    </div>

    // use
    // <form>
    //   <FilePicker />
    //   <caption input />
    // </form>
}

interface Props {
    webnative: Signal<wn.Program>
}

const PostInput:FunctionComponent<Props> = function PostInput (props) {
    const [pendingImage, setPendingImage] = useState<File|null>(null)
    const [isValid, setValid] = useState<Boolean>(false)
    const [isResolving, setResolving] = useState<Boolean>(false)
    const { fs } = (props.webnative.value.session || {})

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

        // __@TODO__
        //
        // need to read the files & find your latest sequence number
        //

        // find latest sequence number
        const logPath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.directory(logDirPath)
        )
        await fs.mkdir(logPath)
        const posts = await fs.ls(logPath)
        console.log('posts', posts)

        // posts are like `1.json`
        const ns = (Object.keys(posts) || [])
            .map(key => parseInt(key.split('.')[0]))
            .sort((a,b) => b - a) // sort descending order
        
        const n = ns.length ? (ns[0] + 1) : 0

        console.log('ns', ns)

        // get filepath for the post JSON
        // let filepath = wn.path.file(logDirPath, '0.json')
        const filepath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(logDirPath, n + '.json')
        )

        // __@TODO__
        // * [ ] `createPostFromContent` takes a sequence number, which is
        //        used to make the filename of the related image

        const newPost = createPostFromContent(text, { sequence: n })

        // write the JSON
        const res = await fs.write(
            filepath,
            new TextEncoder().encode(JSON.stringify(newPost))
        )

        await fs.publish()

        setResolving(false)
        console.log('wrote the JSON file', res)

        // __@TODO__
        // should redirect to your profile view after posting

        // __@TODO__
        // write the image
        // const filepath = wn.path.appData(
        //     PERMISSIONS.app,
        //     wn.path.file(blobDirPath, '0-0.jpg')
        // )
        // const reader = new FileReader()
        // reader.onloadend = async () => {
        //     reader.result
        //     await fs.write(filepath, reader.result as Uint8Array)
        //     console.log('file path written...', filepath)
        //     await fs.publish()
        // }

        // reader.readAsArrayBuffer(file)
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

        <div class="controls">
            <Button isSpinning={isResolving} type="submit" disabled={!isValid}>
                Save
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </div>

    </form>
}

function createPostFromContent (content, { sequence }) {
    return {
        value: {
            sequence,
            content: {
                type: 'post',
                text: content,
                // handle 1 image per post
                mentions: [sequence + '-0.jpg']
            }
        }
    }
}

export { NewPost }
export default NewPost
