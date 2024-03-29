// @ts-check
import * as uint8arrays from 'uint8arrays'
import { Implementation } from 'webnative/components/crypto/implementation'
// import Crypto from 'crypto'
type KeyStore = Implementation['keystore']

// import * as BrowserCrypto from 'webnative/components/crypto/implementation/browser.js'
import * as BrowserCrypto from 'webnative/components/crypto/implementation/browser'

// import * as components from 'webnative/components'
// import * as crypto from 'webnative/components/crypto/'
// const { crypto } = BrowserCrypto


const KEY_TYPE = {
    RSA: "rsa",
    Edwards: "ed25519",
    BLS: "bls12-381"
}

const ECC_WRITE_ALG = 'ECDSA'
const DEFAULT_HASH_ALG = 'SHA-256'
const DEFAULT_CHAR_SIZE = 16
const EDWARDS_DID_PREFIX = new Uint8Array([ 0xed, 0x01 ])
const BLS_DID_PREFIX = new Uint8Array([ 0xea, 0x01 ])
const RSA_DID_PREFIX = new Uint8Array([ 0x00, 0xf5, 0x02 ])
const BASE58_DID_PREFIX = 'did:key:z'

export function sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

// export const verify = (publicKey, sig, msg) => {
//     const keyType = BrowserCrypto.did.keyTypes['']

//     return webcrypto.subtle.verify(
//         {
//             name: ECC_WRITE_ALG,
//             hash: { name: DEFAULT_HASH_ALG }
//         },
//         publicKey,
//         utils.normalizeBase64ToBuf(sig),
//         utils.normalizeUnicodeToBuf(msg, DEFAULT_CHAR_SIZE)
//     )
// }

export const verify = async (did:string, sig:string, msg:string) => {
    const { publicKey, type } = didToPublicKey(did)
    const keyType = BrowserCrypto.did.keyTypes[type]

    const res = await keyType.verify({
        message: uint8arrays.fromString(msg),
        publicKey,
        signature: uint8arrays.fromString(sig, 'base64url')
    })

    return res
}

export function didToPublicKey (did:string): ({ publicKey:Uint8Array, type:string }) {
    if (!did.startsWith(BASE58_DID_PREFIX)) {
        throw new Error(
            "Please use a base58-encoded DID formatted `did:key:z...`")
    }

    const didWithoutPrefix = ('' + did.substr(BASE58_DID_PREFIX.length))
    const magicalBuf = uint8arrays.fromString(didWithoutPrefix, "base58btc")
    const { keyBuffer, type } = parseMagicBytes(magicalBuf)

    // const pubKey = await webcrypto.subtle.importKey('raw', keyBuffer,
    //     type, false, ['verify'])
  
    return {
        // publicKey: pubKey,
        publicKey: keyBuffer,
        type
    }
}

const arrBufs = {
    equal: (aBuf, bBuf) => {
        const a = new Uint8Array(aBuf)
        const b = new Uint8Array(bBuf)
        if (a.length !== b.length) return false
            for (let i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) return false
        }
        return true
    }
}

/**
 * Parse magic bytes on prefixed key-buffer
 * to determine cryptosystem & the unprefixed key-buffer.
 */
function parseMagicBytes (prefixedKey) {
    // RSA
    if (hasPrefix(prefixedKey, RSA_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(RSA_DID_PREFIX.byteLength),
            type: KEY_TYPE.RSA
        }
    // EDWARDS
    } else if (hasPrefix(prefixedKey, EDWARDS_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(EDWARDS_DID_PREFIX.byteLength),
            type: KEY_TYPE.Edwards
        }
    // BLS
    } else if (hasPrefix(prefixedKey, BLS_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(BLS_DID_PREFIX.byteLength),
            type: KEY_TYPE.BLS
        }
    }
  
    throw new Error("Unsupported key algorithm. Try using RSA.")
}

function hasPrefix (prefixedKey, prefix) {
    return arrBufs.equal(prefix, prefixedKey.slice(0, prefix.byteLength))
}

// function arrBufToBase64 (buf:Buffer) {
//     return uint8arrays.toString(new Uint8Array(buf), 'base64pad')
// }

export function sign (keystore:KeyStore, msg:string) {
    return keystore.sign(uint8arrays.fromString(msg))
}

export function toString (arr:Uint8Array) {
    return uint8arrays.toString(arr, 'base64url')
}
