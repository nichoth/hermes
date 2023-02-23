import * as uint8arrays from "uint8arrays"
import * as wn from "webnative";
import { sha256 } from "webnative/components/crypto/implementation/browser"
import type { Crypto } from "webnative";
import { publicKeyToDid } from "webnative/did/transformers";

// this returns a hash of the user's DID
// a 'true' username, that cannot be edited
// export const prepareUsername = async (did:string): Promise<string> => {
export const prepareDid = async (did:string): Promise<string> => {
    const normalizedDid = did.normalize('NFD')
    const hashedUsername = await sha256(
        new TextEncoder().encode(normalizedDid)
    )

    return uint8arrays.toString(hashedUsername, 'base32').slice(0, 32)
}

export const isUsernameAvailable = (
    username: string,
    webnative: wn.Program
): Promise<boolean> => {
    return webnative.auth.isUsernameAvailable(username)
}

export const isUsernameValid = (
    username: string,
    webnative: wn.Program
): Promise<boolean> => {
    return webnative.auth.isUsernameValid(username)
}

export const USERDATA_STORAGE_KEY = 'userData'

// this is only used for creating the hasehd username in Fission
export const createDID = async (
    crypto: Crypto.Implementation
): Promise<string> => {
    const pubKey = await crypto.keystore.publicExchangeKey()
    const ksAlg = await crypto.keystore.getAlgorithm()
    return publicKeyToDid(crypto, pubKey, ksAlg)
}

export const authorDID = async (
    crypto: Crypto.Implementation
): Promise<string> => {
    const pubKey = await crypto.keystore.publicWriteKey()
    const ksAlg = await crypto.keystore.getAlgorithm()
    return publicKeyToDid(crypto, pubKey, ksAlg)
}

export interface UserData {
    humanName: string
    description: string,
    hashedUsername: string
    rootDid: string
    author: string
    timestamp: number
}

// export const createAccountLinkingConsumer = async (
//     username: string,
//     program: wn.Program
// ): Promise<wn.AccountLinkingConsumer> => {
//     return program.auth.accountConsumer(username)

//     // if (webnative.auth) return webnative.auth.accountConsumer(username)
  
//     // // Wait for program to be initialised
//     // return new Promise(function (resolve) {
//     //     (function waitForAuthStrategy() {
//     //         if (webnative.auth) {
//     //             return resolve(webnative.auth.accountConsumer(username))
//     //         }
    
//     //         setTimeout(waitForAuthStrategy, 30);
//     //     })()
//     // })
// }

export const createAccountLinkingProducer = async (
    username: string,
    webnative: wn.Program
): Promise<wn.AccountLinkingProducer> => {
    return webnative.auth.accountProducer(username)
}
