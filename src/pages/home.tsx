import { h } from 'preact'
import * as wn from "webnative"
import { useState, useEffect } from 'preact/hooks'
import CONSTANTS from '../CONSTANTS.jsx'
import { PERMISSIONS } from '../permissions.js'

function Home ({ webnative }) {
    const { fs } = webnative.value.session
    const [posts, setPosts] = useState<object[]>([])

    const logPath = wn.path.appData(
        PERMISSIONS.app,
        wn.path.directory(CONSTANTS.logDirPath)
    )

    useEffect(() => {
        fs.ls(logPath).then(async posts => {
            console.log('posts', posts)

            const _files = Object.keys(posts).map(async (filename) => {
                const fullPath = wn.path.appData(
                    PERMISSIONS.app,
                    wn.path.file(filename)
                )
                console.log('full path', fullPath)
                const content = await fs.cat(fullPath)
                return content
            })

            const files = await Promise.all(_files)

            setPosts(files)
        })
    }, [fs])


    return [
        <h2>hello, this is the app</h2>,
        <p id="route-home">this is the home route!</p>,
        <a href="/fooo">fooo</a>,

        <ul>
            {Object.keys(posts).map(key => {
                const post = posts[key]
                return <li></li>
            })}
        </ul>
    ]
}

export { Home }
export default Home
