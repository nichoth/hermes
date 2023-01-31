import { FunctionComponent, h } from 'preact'
import { useState, useEffect } from 'preact/hooks'
import { Signal } from '@preact/signals'
import * as wn from "webnative"
import { TargetedEvent } from 'preact/compat'

interface Props {
    webnative: Signal<wn.Program>
    session: Signal<wn.Session|null>
}

// **this is us**
// On device with existing session:
// const producer = await program.auth.accountProducer(program.session.username)

// see https://webnative.fission.app/index.html#creating-a-program
// On device without session:
//     Somehow you'll need to get ahold of the username.
//     Few ideas: URL query param, QR code, manual input.
//  const consumer = await program.auth.accountConsumer(username)

interface Challenge {
    pin: number[]
    confirmPin: () => void
    rejectPin: () => void
}

export const Link:FunctionComponent<Props> = function ({ webnative }) {
    const [challenge, setChallenge] = useState<Challenge|null>(null)

    useEffect(() => {
        const { session } = webnative.value
        if (!session) return

        webnative.value.auth.accountProducer(session.username)
            .then(producer => {
                // this is the device that *is* logged in
                // which means we need to type a pin from the challenger,
                //   and check that it's ok
                producer.on('challenge', challenge => {
                    // Either show `challenge.pin` or have the user input a PIN
                    //   and see if they're equal.
                    setChallenge(challenge)
                })

                producer.on('link', ({ approved }) => {
                    if (!approved) return
                    console.log('Device linked successfully')
                })
            })
    }, [webnative.value])

    function submitPin (ev:TargetedEvent) {
        ev.preventDefault()
        if (!ev.target || !challenge) return

        // have the user input a PIN and see if they're equal.
        const userInput = (ev.target as HTMLFormElement).elements['pin']
        console.log('user input', userInput)
        if (userInput === challenge.pin.join('')) challenge.confirmPin()
        else challenge.rejectPin()
    }

    // show an input for a PIN number
    //   user types the PIN from new device,
    //   then we check if it is ok
    return <div className={'route link'}>
        account linking
        <form onSubmit={submitPin} className="pin-form">
            <input name="pin" className={'pin'} type="text" minLength={4}
                maxLength={4}
            />
        </form>

        <button type="submit">submit pin</button>
    </div>
}

// import { FunctionComponent, h } from 'preact'
// import { Signal } from '@preact/signals'
// import * as wn from "webnative"
// import { useState, useEffect } from 'preact/hooks'
// import CONSTANTS from '../CONSTANTS.jsx'
// import { PERMISSIONS } from '../permissions.js'
// import './home.css'

// interface Props {
//     webnative: Signal<wn.Program>
//     session: Signal<wn.Session|null>
// }

// const Home:FunctionComponent<Props> = function ({ webnative, session }) {
//     if (!session.value?.fs) return null
//     const { fs } = session.value
//     const [posts, setPosts] = useState<object[]>([])

//     const logPath = wn.path.appData(
//         PERMISSIONS.app,
//         wn.path.directory(CONSTANTS.logDirPath)
//     )

//     useEffect(() => {
//         fs.ls(logPath).then(async _posts => {
//             const _files = Object.keys(_posts).map(async (filename, i) => {
//                 // read the post JSON
//                 const fullPath = wn.path.appData(
//                     PERMISSIONS.app,
//                     wn.path.file(CONSTANTS.logDirPath, filename)
//                 )

//                 const content = await fs.cat(fullPath)
//                 const post = JSON.parse(new TextDecoder().decode(content))

//                 // get img URL
//                 const n = post.sequence
//                 const imgPath = wn.path.appData(
//                     PERMISSIONS.app,
//                     // @TODO -- file extensions
//                     wn.path.file(CONSTANTS.blobDirPath, n + '-0.jpg')
//                 )

//                 let imgBlob
//                 try {
//                     imgBlob = await fs.cat(imgPath)
//                 } catch (err) {
//                     // do nothing, just for development
//                     console.log('caught error err')
//                 }
//                 const imgUrl = URL.createObjectURL(
//                     new Blob([imgBlob as BlobPart], { type: 'image/jpeg' })
//                 )

//                 return ({
//                     post,
//                     imgUrl
//                 })
//             })

//             const files = await Promise.all(_files)
//             setPosts(files)
//         })
//     }, [fs])

//     return <div class="route home">
//         <h2>hello, this is the app</h2>
//         <p id="route-home">this is the home route!</p>

//         <ul class="main-feed">
//             {Object.keys(posts).map((key) => {
//                 const item = posts[key]
//                 return <li>
//                     <a href={'/@' + item.post.author + '/' + item.post.sequence}>
//                         <img src={item.imgUrl} alt={item.post.content.alt} />
//                         <p>{item.post.value?.content.text || item.post.content.text}</p>
//                     </a>
//                 </li>
//             })}
//         </ul>
//     </div>
// }

// export { Home }
// export default Home

