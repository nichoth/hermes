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

    // **method is POST**
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

    //
    // @TODO
    // need to map the given message author to the given username...
    //
    // resolve the rootDID from a UCAN
    // verify that the given author has been authorized by the rootDID
    //

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

    console.log('*in ss fn*', Date.now())
    console.log('ev.httpMethod', ev.httpMethod)

    // ALSO -- check if the friend request already exists,
    // return 204 if so

    try {
        // request is ok, write to the DB
        // const doc:({ data }) = await client.query(q.Create(
        //     q.Collection('friend-request'),
        //     { data: value }
        // ))

        const { from, to } = value

        const doc:({ data } | string) = await client.query(
            q.Let(
                {
                    match: q.Match(q.Index('request'), [from, to])
                },
                q.If(
                    q.Exists(q.Var('match')),
                    'Already exists',
                    q.Create(
                        q.Collection('friend-request'),
                        { data: value }
                    )
                )
            )
        )

        if (typeof doc === 'string') {
            return { statusCode: 409, body: doc }
        }

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
