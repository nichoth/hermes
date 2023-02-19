import { FunctionComponent, h } from 'preact'
import { Signal } from '@preact/signals'
import * as wn from "webnative"
import { useState, useEffect } from 'preact/hooks'
import { APP_INFO, LOG_DIR_PATH, BLOB_DIR_PATH } from '../CONSTANTS.js'
import './home.css'

interface Props {
    session: Signal<wn.Session|null>
}

const Home:FunctionComponent<Props> = function ({ session }) {
    if (!session.value?.fs) return null
    const { fs } = session.value
    const [posts, setPosts] = useState<object[]>([])

    const logPath = wn.path.appData(APP_INFO, wn.path.directory(LOG_DIR_PATH))

    useEffect(() => {
        fs.ls(logPath)
            .then(async _posts => {
                const _files = Object.keys(_posts).map(async (filename) => {
                    // read the post JSON
                    const fullPath = wn.path.appData(
                        APP_INFO,
                        wn.path.file(LOG_DIR_PATH, filename)
                    )

                    const content = await fs.read(fullPath)
                    const post = JSON.parse(new TextDecoder().decode(content))

                    // get img URL
                    const n = post.sequence
                    const imgPath = wn.path.appData(
                        APP_INFO,
                        // @TODO -- file extensions
                        wn.path.file(BLOB_DIR_PATH, n + '-0.jpg')
                    )

                    let imgBlob
                    try {
                        imgBlob = await fs.read(imgPath)
                    } catch (err) {
                        // do nothing, just for development
                        console.log('caught error', err)
                    }
                    const imgUrl = URL.createObjectURL(
                        new Blob([imgBlob as BlobPart], { type: 'image/jpeg' })
                    )

                    return ({
                        post,
                        imgUrl
                    })
                })

                const files = await Promise.all(_files)
                setPosts(files)
            })
            .catch(err => {
                if (err.toString().includes('Path does not exist')) {
                    return console.log('couldnt get files, thats ok, do nothing')
                }

                console.log('err listing files', err)
            })
    }, [fs])

    return <div class="route home">
        <h2>hello, this is the app</h2>
        <p id="route-home">this is the home route!</p>

        <ul class="main-feed">
            {Object.keys(posts).map((key) => {
                const item = posts[key]
                return <li>
                    <a href={'/@' + item.post.author + '/' + item.post.sequence}>
                        <img src={item.imgUrl} alt={item.post.content.alt} />
                        <p>{item.post.content.text}</p>
                    </a>
                </li>
            })}
        </ul>
    </div>
}

export { Home }
export default Home
