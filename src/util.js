"use strict";
exports.__esModule = true;
exports.sign = exports.didToPublicKey = exports.verify = void 0;
// @ts-check
var uint8arrays = require("uint8arrays");
var one_webcrypto_1 = require("one-webcrypto");
var utils = require("keystore-idb/utils.js");
var KEY_TYPE = {
    RSA: "rsa",
    Edwards: "ed25519",
    BLS: "bls12-381"
};
var ECC_WRITE_ALG = 'ECDSA';
var DEFAULT_HASH_ALG = 'SHA-256';
var DEFAULT_CHAR_SIZE = 16;
var EDWARDS_DID_PREFIX = new Uint8Array([0xed, 0x01]);
var BLS_DID_PREFIX = new Uint8Array([0xea, 0x01]);
var RSA_DID_PREFIX = new Uint8Array([0x00, 0xf5, 0x02]);
var BASE58_DID_PREFIX = 'did:key:z';
var verify = function (publicKey, sig, msg) {
    return one_webcrypto_1.webcrypto.subtle.verify({
        name: ECC_WRITE_ALG,
        hash: { name: DEFAULT_HASH_ALG }
    }, publicKey, utils.normalizeBase64ToBuf(sig), utils.normalizeUnicodeToBuf(msg, DEFAULT_CHAR_SIZE));
};
exports.verify = verify;
function didToPublicKey(did) {
    if (!did.startsWith(BASE58_DID_PREFIX)) {
        throw new Error("Please use a base58-encoded DID formatted `did:key:z...`");
    }
    var didWithoutPrefix = ('' + did.substr(BASE58_DID_PREFIX.length));
    var magicalBuf = uint8arrays.fromString(didWithoutPrefix, "base58btc");
    var _a = parseMagicBytes(magicalBuf), keyBuffer = _a.keyBuffer, type = _a.type;
    return {
        publicKey: arrBufToBase64(keyBuffer),
        type: type
    };
}
exports.didToPublicKey = didToPublicKey;
var arrBufs = {
    equal: function (aBuf, bBuf) {
        var a = new Uint8Array(aBuf);
        var b = new Uint8Array(bBuf);
        if (a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i])
                return false;
        }
        return true;
    }
};
/**
 * Parse magic bytes on prefixed key-buffer
 * to determine cryptosystem & the unprefixed key-buffer.
 */
function parseMagicBytes(prefixedKey) {
    // console.log('**magical buf**', prefixedKey)
    // RSA
    if (hasPrefix(prefixedKey, RSA_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(RSA_DID_PREFIX.byteLength),
            type: KEY_TYPE.RSA
        };
        // EDWARDS
    }
    else if (hasPrefix(prefixedKey, EDWARDS_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(EDWARDS_DID_PREFIX.byteLength),
            type: KEY_TYPE.Edwards
        };
        // BLS
    }
    else if (hasPrefix(prefixedKey, BLS_DID_PREFIX)) {
        return {
            keyBuffer: prefixedKey.slice(BLS_DID_PREFIX.byteLength),
            type: KEY_TYPE.BLS
        };
    }
    throw new Error("Unsupported key algorithm. Try using RSA.");
}
function hasPrefix(prefixedKey, prefix) {
    return arrBufs.equal(prefix, prefixedKey.slice(0, prefix.byteLength));
}
function arrBufToBase64(buf) {
    return uint8arrays.toString(new Uint8Array(buf), "base64pad");
}
function sign(keystore, msg) {
    return keystore.sign(uint8arrays.fromString(msg));
}
exports.sign = sign;
