import { h } from 'preact'
import * as wn from "webnative"
import { useState, useEffect } from 'preact/hooks'
import CONSTANTS from '../CONSTANTS.jsx'
import { PERMISSIONS } from '../permissions.js'
import './home.css'

function Home ({ webnative }) {
    const { fs } = webnative.value.session
    const [posts, setPosts] = useState<object[]>([])

    const logPath = wn.path.appData(
        PERMISSIONS.app,
        wn.path.directory(CONSTANTS.logDirPath)
    )

    useEffect(() => {
        fs.ls(logPath).then(async _posts => {
            const _files = Object.keys(_posts).map(async (filename, i) => {
                // read the post JSON
                const fullPath = wn.path.appData(
                    PERMISSIONS.app,
                    wn.path.file(CONSTANTS.logDirPath, filename)
                )

                const content = await fs.cat(fullPath)
                const post = JSON.parse(new TextDecoder().decode(content))

                // get img URL
                const n = post.sequence
                const imgPath = wn.path.appData(
                    PERMISSIONS.app,
                    // @TODO -- file extensions
                    wn.path.file(CONSTANTS.blobDirPath, n + '-0.jpg')
                )

                let imgBlob
                try {
                    imgBlob = await fs.cat(imgPath)
                } catch (err) {
                    // do nothing, just for development
                    console.log('caught error err')
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
    }, [fs])

    console.log('posts', posts)

    return <div class="route home">
        <h2>hello, this is the app</h2>
        <p id="route-home">this is the home route!</p>

        <ul class="main-feed">
            {Object.keys(posts).map((key) => {
                const item = posts[key]
                return <li>
                    <a href={'/@' + item.post.author + '/' + item.post.sequence}>
                        <img src={item.imgUrl} alt={item.post.content.alt} />
                        <p>{item.post.value?.content.text || item.post.content.text}</p>
                    </a>
                </li>
            })}
        </ul>
    </div>
}

export { Home }
export default Home
