import * as dotenv from 'dotenv'
dotenv.config()
import { default as faunadb } from 'faunadb'
import { Handler, HandlerEvent } from '@netlify/functions'

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

export const handler:Handler = async function hanlder (ev:HandlerEvent) {
    if (ev.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            body: JSON.stringify('invalid HTTP method')
        }
    }

    console.log('ev.qs', ev.queryStringParameters)

    const qs = ev.queryStringParameters
    if (!qs) return {
        statusCode: 422,
        body: JSON.stringify('Need a query string')
    }

    const hashArr = qs.names?.split(',')

    return {
        statusCode: 200,
        body: JSON.stringify(JSON.stringify(hashArr))
    }
}
