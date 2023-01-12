import { h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import dragDrop from 'drag-drop'
import Button from '../components/button.jsx'
import './new.css'

function NewPost () {
    return <div class="route new-post">
        <FilePicker />
    </div>

    // use
    // <form>
    //   <FilePicker />
    //   <caption input />
    // </form>
}

function FilePicker (props) {
    const [pendingImage, setPendingImage] = useState(null)
    const [isValid, setValid] = useState(false)
    const [isResolving, setResolving] = useState(false)
    // const { me, feeds, client, emit, setRoute } = props
    // const feed = feeds[me.did]

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

    function handleSubmit (ev) {
        ev.preventDefault()
        const file = ev.target.elements.image.files[0]
        const text = ev.target.elements.text.value

        const reader = new FileReader()

        setResolving(true)

        reader.onloadend = () => {
            // const prev = feed.posts.length ?
            //     (feed.posts[0]).value :
            //     null

            console.log('log end', reader.result)

            // client.createPost({
            //     files: [reader.result],
            //     content: { text },
            //     prev
            // })
            //     .then(res => {
            //         emit(evs.post.new, res)
            //         setResolving(false)
            //         setRoute('/post/' + encodeURIComponent(res.key))
            //     })
            //     .catch(err => {
            //         // @TODO -- show error to user
            //         console.log('err', err)
            //     })
        }

        // this gives us base64
        reader.readAsDataURL(file)
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
                accept="image/png,image/jpeg,image/jpg;capture=camera"
                onChange={chooseFile}
                required={true}
                capture="true"
            />
        </div>

        <label for="caption">caption</label>
        <textarea name="text" placeholder=" " id="caption" />

        <div class="controls">
            <Button isSpinning={isResolving} type="submit"
                disabled={!isValid}
            >
                Save
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </div>

    </form>
}

export { NewPost }
export default NewPost
