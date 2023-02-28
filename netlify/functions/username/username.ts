import * as dotenv from 'dotenv'
dotenv.config()
import { default as faunadb } from 'faunadb'
import { default as stringify } from 'json-stable-stringify'
import { Handler, HandlerEvent } from '@netlify/functions'
// import * as ucans from '@ucans/ucans'
import { verify } from '../../../src/util.js'
import { parsePath } from '../util.js'

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

export const handler:Handler = async function handler (ev:HandlerEvent) {
    // look up a *fission* user profile by human name
    if (ev.httpMethod === 'GET') {
        const [name, seq] = parsePath(ev)

        // @TODO -- be sure to sort them by date created
        const res:{ data } = await client.query(
            q.Map(
                q.Paginate(q.Match(q.Index('profile-by-humanName'), name)),
                q.Lambda('profile', q.Get(q.Var('profile')))
            )
        )

        let doc
        try {
            doc = res.data[seq ? parseInt(seq) : 0]
        } catch (err) {
            return { statusCode: 400, body: JSON.stringify(err) }
        }

        if (!doc) {
            return { statusCode: 404, body: JSON.stringify('Not found') }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(doc.data)
        }
    }

    if ((ev.httpMethod !== 'POST') && (ev.httpMethod !== 'PUT')) {
        return {
            statusCode: 405,
            body: JSON.stringify('invalid http method')
        }
    }

    //
    // method is POST or PUT now
    //

    let author, humanName, hashedUsername, signature, value, timestamp,
        rootDid;
    try {
        const body = JSON.parse(ev.body || '');
        ({ value, signature } = body);
        ({ author, rootDid, humanName, hashedUsername, timestamp } = value);
    } catch (err:any) {
        return {
            statusCode: 422,
            body: 'invalid JSON'
        }
    }

    const vals = { author, humanName, hashedUsername,
        signature, timestamp, rootDid }

    if (!author || !humanName || !hashedUsername || !rootDid ||
    !signature || !timestamp) {
        return {
            statusCode: 400,
            body: JSON.stringify({ msg: 'invalid request params', vals })
        }
    }

    // ucan stuff
    // ------------------------------------------------------------
    //
    // @TODO
    // see https://github.com/ucan-wg/ts-ucan#verifying-ucan-invocations
    // need to check the UCAN -- `author` in the message is authorized by
    // the `rootDID`
    //
    // const result = await ucans.verify(ucan, {
    //     audience: author,
    //     requiredCapabilities: [
    //         {
    //             capability: {
    //                 with: { scheme: 'my', hierPart: '*' },
    //                 can: '*'
    //             },
    //             rootIssuer: rootDID
    //         }
    //     ]
    // })

    // if (!result.ok) {
    //     return {
    //         statusCode: 401,
    //         body: JSON.stringify('Not authorized')
    //     }
    // }
    // ------------------------------------------------------------


    //
    // check the signature
    // check that `author` + `signature` are ok together
    //
    let isOk:boolean
    try {
        isOk = await verify(author, signature, stringify(value))
    } catch (err:any) {
        return {
            statusCode: 500,
            body: err.toString()
        }
    }

    if (!isOk) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: 'Invalid signature',
                originalMessage: stringify(value)
            })
        }
    }

    // method is POST -- create a new user
    if (ev.httpMethod === 'POST') {

        // @TODO -- should check the `accountDID` for the given username
        //   matches the given author,
        //   it *must* match because POST request means we are creating a new account
        //   need to lookup the accountDID via
        //     `await webnative.accountDID('name')` --  be sure it is the same
        //     as the given author/rootDid

        if (author !== rootDid) {
            return {
                statusCode: 422,
                body: 'author should match rootDid in a POST request'
            }
        }

        try {
            const doc:{ data } = await client.query(q.Create(
                q.Collection('profile'),
                { data: { humanName, hashedUsername, timestamp, rootDid } }
            ))
            return {
                statusCode: 201,
                body: JSON.stringify(doc.data)
            }
        } catch (err) {
            return { statusCode: 500, body: err.toString() }
        }
    }

    interface DbResponse {
        type?: number,
        message?: string,
        data?: object
    }

    // method is PUT -- so update an existing user
    // @TODO -- need to check the author is allowed to write this username
    // `program.accountDID()` should resolve via UCAN + the given author
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
        body: JSON.stringify(doc.data)
    }
}
