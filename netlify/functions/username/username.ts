import * as dotenv from 'dotenv'
dotenv.config()
import { default as faunadb } from 'faunadb'
import { default as stringify } from 'json-stable-stringify'
import * as ucans from '@ucans/ucans'
import { didToPublicKey, verify } from '../../../src/util.js'

const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET || ''
})

// a request is like
// { ucan, value: { signature, username, author, rootDID, hashedUsername,
//   timestamp } }
// `author` is the DID from the device that is writing the message
// `username` is the new human-readable username
// `hashedUsername` -- the hash of the `rootDID` -- this is unique per account

export const handler = async function hanlder (ev) {
    if ((ev.httpMethod !== 'POST') && (ev.httpMethod !== 'PUT')) {
        return {
            statusCode: 405,
            body: JSON.stringify('invalid http method')
        }
    }

    // humanName: username,
    // author: did,
    // hashedName: preppedDid,
    // timestamp: timestamp()

    let author, humanName, hashedUsername, signature, ucan, value, timestamp,
        rootDID;
    try {
        const body = JSON.parse(ev.body);
        ({ value, ucan, signature } = body);
        ({ author, rootDID, humanName, hashedUsername, timestamp } = value);
    } catch (err:any) {
        return {
            statusCode: 422,
            body: 'invalid JSON'
        }
    }

    if (!author || !humanName || !hashedUsername || !rootDID || !timestamp) {
        return {
            statusCode: 400,
            body: JSON.stringify('invalid request params')
        }
    }

    //
    // @TODO
    // see https://github.com/ucan-wg/ts-ucan#verifying-ucan-invocations
    // need to check the UCAN -- `author` in the message is authorized by
    // the `rootDID`
    //
    const result = await ucans.verify(ucan, {
        audience: author,
        requiredCapabilities: [
            {
                capability: {
                    with: { scheme: 'my', hierPart: '*' },
                    can: '*'
                },
                rootIssuer: rootDID
            }
        ]
    })

    if (!result.ok) {
        return {
            statusCode: 401,
            body: JSON.stringify('Not authorized')
        }
    }

    //
    // check the signature
    //
    let isOk:boolean
    try {
        const pubKey = didToPublicKey(author).publicKey
        isOk = await verify(pubKey, signature, stringify(value))
    } catch (err:any) {
        return {
            statusCode: 400,
            body: JSON.stringify(err.message)
        }
    }

    if (!isOk) {
        return {
            statusCode: 400,
            body: JSON.stringify('Invalid signature')
        }
    }

    interface DbResponse {
        type?: number
        message?: string
    }

    if (ev.httpMethod === 'POST') {
        // create a new user
        const doc:DbResponse = await client.query(q.Create(
            q.Collection('username'),
            { data: { humanName, hashedUsername, timestamp, rootDID } }
        ))

        // everything went ok
        // we created a new user record
        return {
            statusCode: 201,
            body: JSON.stringify(doc)
        }
    }

    // method is PUT
    // update an existing user
    const doc:DbResponse = await client.query(
        q.Let(
            {
                match: q.Match(q.Index('username-by-hash'), hashedUsername)
            },
            q.If(
                q.Exists(q.Var('match')),
                q.Update(q.Select('ref', q.Get(q.Var('match'))), { data: {
                    humanName,
                    timestamp
                }}),
                { type: 404, message: 'not found' }
            )
        )
    )

    // if we can't find the given hashed username,
    // it means there is no `username` record for the given id
    if (doc.type && doc.type === 404) {
        return {
            statusCode: 404,
            body: JSON.stringify(doc.message)
        }
    }

    // everything went ok
    // we updated a record with a new username
    return {
        statusCode: 204,
        body: JSON.stringify(doc)
    }
}
