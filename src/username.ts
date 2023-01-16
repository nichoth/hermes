import * as uint8arrays from "uint8arrays"
import { sha256 } from "webnative/components/crypto/implementation/browser"

export const prepareUsername = async (username: string): Promise<string> => {
    const normalizedUsername = username.normalize('NFD')
    const hashedUsername = await sha256(
        new TextEncoder().encode(normalizedUsername)
    )

    return uint8arrays.toString(hashedUsername, 'base32').slice(0, 32)
}
