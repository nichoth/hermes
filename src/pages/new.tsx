import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import dragDrop from 'drag-drop'
import { FunctionComponent } from 'preact'
import * as wn from "webnative"
import Button from '../components/button.jsx'
import './new.css'
import { Signal } from '@preact/signals'
import { PERMISSIONS } from '../permissions.js'

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
        // const file = ev.target.elements.image.files[0]
        const text = ev.target.elements.text.value

        // const reader = new FileReader()

        setResolving(true)

        // __@TODO__
        //
        // write the JSON post
        //
        // need to read the files & find your latest sequence number
        //

        //
        // write the image
        //
        // const filepath = 'foo'
        const filepath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file('foo')
        )
        await fs.write(filepath, pendingImage as File)
        console.log('file path written...', filepath)
        await fs.publish()

        
        // pendingImage

        // reader.onloadend = () => {
        //     // const prev = feed.posts.length ?
        //     //     (feed.posts[0]).value :
        //     //     null


        //     //
        //     // @TODO -- write files to wnfs
        //     //
        //     console.log('load end', reader.result)


        //     // client.createPost({
        //     //     files: [reader.result],
        //     //     content: { text },
        //     //     prev
        //     // })
        //     //     .then(res => {
        //     //         emit(evs.post.new, res)
        //     //         setResolving(false)
        //     //         setRoute('/post/' + encodeURIComponent(res.key))
        //     //     })
        //     //     .catch(err => {
        //     //         // @TODO -- show error to user
        //     //         console.log('err', err)
        //     //     })
        // }

        // // this gives us base64
        // reader.readAsDataURL(file)
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
                    <p>Drop pictures here</p>
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

export { NewPost }
export default NewPost