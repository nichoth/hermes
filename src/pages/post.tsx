import { useState, useEffect } from 'preact/hooks'
import PERMISSIONS from '../permissions.js'
import CONSTANTS from '../CONSTANTS.js'
import * as wn from "webnative"
import './post.css'

interface Post {
    post: PostObject,
    imgUrl: string
}

interface PostObject {
    sequence: number,
    timestamp: number,
    author: string,
    content: {
        type: 'post',
        text: string,
        alt: string,
        mentions: string[]
    }
}

export function Post ({ params, webnative }) {
    const { sequence, username } = params
    const [postContent, setPostContent] = useState<Post|null>(null)

    useEffect(() => {
        readPost(webnative.value, username, sequence)
            .then((post) => {
                console.log('read post', post)
                setPostContent(post)
            })
    }, [params.sequence, params.username])


    if (!postContent) return null

    return <div className="route route-post">
        <img src={postContent.imgUrl} />
        <p>{postContent.post.content.text}</p>
    </div>
}

async function readPost (webnative, username, sequence) {
    const { fs } = webnative.session

    if (username === webnative.session.username) {
        const postPath = wn.path.appData(
            PERMISSIONS.app,
            wn.path.file(CONSTANTS.logDirPath, sequence + '.json')
        )

        const imgPath = wn.path.appData(
            PERMISSIONS.app,
            // @TODO -- file extensions
            wn.path.file(CONSTANTS.blobDirPath, sequence + '-0.jpg')
        )

        const [post, imgUrl] = await Promise.all([
            fs.cat(postPath).then(post => {
                return JSON.parse(new TextDecoder().decode(post))
            }),

            fs.cat(imgPath).then(imgBlob => {
                const imgUrl = URL.createObjectURL(
                    new Blob([imgBlob as BlobPart], { type: 'image/jpeg' })
                )
                return imgUrl
            })
        ])

        return { post, imgUrl }
    }

    return { post: null, imgUrl: null }
}
