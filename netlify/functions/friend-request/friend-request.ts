import { Handler, HandlerEvent } from '@netlify/functions'
import { default as faunadb } from 'faunadb'
import stringify from 'json-stable-stringify'
import { verify } from '../../../src/util.js'

const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET || ''
})

export const handler:Handler = async function handler (ev:HandlerEvent) {
    if (ev.httpMethod === 'GET') {
        // get requests related to your account
    }

    if (ev.httpMethod !== 'POST' || !ev.body) {
        return ev.body ? ({
            statusCode: 405,
            body: 'Invalid http method'
        }) : ({
            statusCode: 400,
            body: 'Invalid request'
        })
    }

    // method is POST
    // verify that the request came from who it says it did
    // write a new friendship request to the DB

    let value, signature, author;
    try {
        const body = JSON.parse(ev.body || '');
        ({ value, signature, author } = body);
    } catch (err:any) {
        return {
            statusCode: 422,
            body: 'invalid JSON'
        }
    }

    let isOk:boolean
    try {
        isOk = await verify(author, signature, stringify(value))
    } catch (err:any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ msg: err.message })
        }
    }

    if (!isOk) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                msg: 'Invalid signature',
                originalMessage: ev.body
            })
        }
    }

    console.log('*in ss fn*')

    try {
        // request is ok, write to the DB
        const doc:({ data }) = await client.query(q.Create(
            q.Collection('friend-request'),
            { data: value }
        ))

        return {
            statusCode: 201,
            body: JSON.stringify(doc.data)
        }
    } catch (err) {
        return {
            statusCode: 500,
            body: err.toString()
        }
    }
}
