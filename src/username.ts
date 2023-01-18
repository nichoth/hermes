import * as uint8arrays from "uint8arrays"
import * as wn from "webnative";
import { sha256 } from "webnative/components/crypto/implementation/browser"

export const prepareUsername = async (username: string): Promise<string> => {
    const normalizedUsername = username.normalize('NFD')
    const hashedUsername = await sha256(
        new TextEncoder().encode(normalizedUsername)
    )

    return uint8arrays.toString(hashedUsername, 'base32').slice(0, 32)
}

export const isUsernameAvailable = async (
    username: string,
    webnative: wn.Program
): Promise<boolean> => {
    return webnative.auth.isUsernameAvailable(username)
}

export const isUsernameValid = async (
    username: string,
    webnative: wn.Program
): Promise<boolean> => {
    return webnative.auth.isUsernameValid(username)
}
