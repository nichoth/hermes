import { FunctionComponent, h } from 'preact'
import { Signal, useSignal } from '@preact/signals'
import * as wn from "webnative"
import { useState, useEffect } from 'preact/hooks'
import { APP_INFO, LOG_DIR_PATH, BLOB_DIR_PATH } from '../CONSTANTS.js'
import './home.css'
import { Post } from './post.jsx'
import { UserData } from '../username.js'

interface Props {
    session: Signal<wn.Session|null>
}

// should maybe fetch all your friend's userData right away

const Home:FunctionComponent<Props> = function ({ session }) {
    if (!session.value?.fs) return null
    const { fs } = session.value
    const [posts, setPosts] = useState<object[]>([])
    // @TODO -- should cache this
    const users = useSignal<UserData[]>([])

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
                        // do nothing
                        // @TODO -- show an error message
                        console.log('caught error', err)
                    }
                    const imgUrl = URL.createObjectURL(
                        new Blob([imgBlob as BlobPart], { type: 'image/jpeg' })
                    )

                    return ({ post, imgUrl })
                })

                const files = await Promise.all(_files)

                // const authors:string[] = Array.from(new Set(files.map(file => {
                //     return file.post.author
                // })))

                // const authorQuery = new URLSearchParams({
                //     names: authors.concat(['foo']).toString()
                // })

                // we are getting profiles by requesting the authors of the files
                // * should do this by requesting based on our friend list,
                //   which is a private file
                // const profiles = await fetch('/api/username-by-hash?' +
                //     authorQuery.toString()).then(res => res.json())

                // console.log('profiles response', profiles)

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
                const item:Post = posts[key]
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
