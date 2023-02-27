import * as wn from "webnative"
import { APP_INFO, FRIENDS_PATH } from "./CONSTANTS.js"

export const listPath = wn.path.appData(
    APP_INFO,
    wn.path.file(FRIENDS_PATH)
)

export interface Request {
    value: {
        humanName: string  // the requester's human name
        from: string  // the requester's hashed DID
        to: string  // recipient's hashed DID
    }
}

export interface Friend {
    humanName: string,
    hashedUsername: string,
    rootDid: string
}
