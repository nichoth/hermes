import { useState, useEffect } from 'preact/hooks'
import { LOG_DIR_PATH, BLOB_DIR_PATH, APP_INFO } from '../CONSTANTS.js'
import * as wn from "webnative"
import './post.css'
import { Signal } from '@preact/signals'
import { FunctionComponent } from 'preact'

export interface Post {
    post: PostObject,
    imgUrl: string
}

interface PostObject {
    sequence: number,
    timestamp: number,
    author: string,  // the hashed username (not human readable)
    content: {
        type: 'post',
        text: string,
        alt: string,
        mentions: string[]
    }
}

interface Props {
    session: Signal<wn.Session|null>,
    params: { sequence: string, username: string }
}

export const Post: FunctionComponent<Props> = function ({ params, session }) {
    const { sequence, username } = params
    const [postContent, setPostContent] = useState<Post|null>(null)

    console.log('params in post route', params)

    useEffect(() => {
        readPost(session.value, username, sequence)
            .then((post) => {
                console.log('read post', post)
                setPostContent(post)
            })
    }, [sequence, username])


    if (!postContent) return null

    return <div className="route route-post">
        <img src={postContent.imgUrl} />
        <p>{postContent.post.content.text}</p>
    </div>
}

async function readPost (session, username, sequence):
Promise<{ post: PostObject, imgUrl:string } | null> {
    const { fs }:{ fs:wn.FileSystem } = session

    // @TODO -- request the userData from DB, or get it from cache

    if (username === session.username) {
        const postPath = wn.path.appData(
            APP_INFO,
            wn.path.file(LOG_DIR_PATH, sequence + '.json')
        )

        const imgPath = wn.path.appData(
            APP_INFO,
            // @TODO -- file extensions
            wn.path.file(BLOB_DIR_PATH, sequence + '-0.jpg')
        )

        const [post, imgUrl] = await Promise.all([
            fs.read(postPath).then(post => {
                return JSON.parse(new TextDecoder().decode(post))
            }),

            fs.read(imgPath).then(imgBlob => {
                const imgUrl = URL.createObjectURL(
                    new Blob([imgBlob as BlobPart], { type: 'image/jpeg' })
                )
                return imgUrl
            })
        ])

        return { post, imgUrl }
    }

    // else
    // need to get the other user's posts
    return null
}
