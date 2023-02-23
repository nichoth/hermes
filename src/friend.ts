import * as wn from "webnative"
import { APP_INFO, FRIENDS_PATH } from "./CONSTANTS.js"

export const listPath = wn.path.appData(
    APP_INFO,
    wn.path.file(FRIENDS_PATH)
)

export interface Friend {
    humanName: string,
    hashedUsername: string
}
