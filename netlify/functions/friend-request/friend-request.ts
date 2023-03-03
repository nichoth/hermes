import { Handler, HandlerEvent } from '@netlify/functions'
import { default as faunadb } from 'faunadb'
import stringify from 'json-stable-stringify'
import { verify } from '../../../src/util.js'

// @TODO -- encryption
// should keep friend request info private
// as is, anyone can send a get request with some query parameters and
//   see who your requests are going to

const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET || ''
})

export const handler:Handler = async function handler (ev:HandlerEvent) {
    if (ev.httpMethod === 'GET') {
        // get requests related to your account

        const qs = ev.queryStringParameters

        if (!qs) return {
            statusCode: 400,
            body: 'bad query parameters'
        }

        if (((!qs.to || !qs.from)) && !(qs.fromto)) return {
            statusCode: 400,
            body: 'bad query parameters'
        }

        if (qs.from && qs.to) {
            // qs.to and qs.from are defined
            // get requests from a user to a different user
            const res:{ data } = await client.query(
                q.Map(
                    q.Paginate(q.Match(q.Index('request'), [qs.from, qs.to])),
                    q.Lambda('profile', q.Get(q.Var('profile')))
                )
            )

            return responseFromData(res)
        }

        if (qs.to) {
            // only `qs.to` is defined
            const res:{ data } = await client.query(
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('requests-to'), [qs.to])
                    ),
                    q.Lambda('request', q.Get(q.Var('request')))
                )
            )

            return responseFromData(res)
        }

        if (qs.from) {
            // only `qs.from` is defined
            const res:{ data } = await client.query(
                q.Map(
                    q.Paginate(
                        q.Match(q.Index('requests-from'), [qs.from])
                    ),
                    q.Lambda('request', q.Get(q.Var('request')))
                )
            )

            return responseFromData(res)
        }

        if (qs.fromto) {
            // `fromto` is defined
            // get all requests from `username` || to `username`
            const res:{ data } = await client.query(
                q.Map(
                    q.Paginate(q.Union(
                        q.Match(q.Index('requests-from'), qs.fromto),
                        q.Match(q.Index('requests-to'), qs.fromto)
                    )),
                    q.Lambda('req', q.Get(q.Var('req')))
                ),
            )

            return responseFromData(res)
        }

        // default case
        if (!qs) return {
            statusCode: 400,
            body: 'no query parameters'
        }
    }

    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'Invalid http method'
        }
    }

    // -----------------------------
    // **method is POST**
    // -----------------------------

    let value, signature, author, method;
    try {
        const body = JSON.parse(ev.body || '')
        method = body.method
        signature = body.signature
        value = body.value
        author = body.value.author
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
    // see https://github.com/fission-codes/webnative/blob/bd236da96fb3ee4a97d6a95b39d32ca4ccc70da6/src/components/reference/dns-over-https.ts#L9
    // -- this is how they do the DNS lookup in fission/webnative

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

    if (method === 'DELETE') {
        console.log('.........is delete.......')
        // @TODO -- be sure the author is on the `to` or `from` side of friendship
        try {
            await client.query(
                q.Delete(
                    q.Select('ref', q.Get(
                        q.Match(q.Index('request'), [value.from, value.to])
                    ))
                )
            )

            return {
                statusCode: 204
            }
        } catch (err) {
            console.log('on no errr', err)
            return { statusCode: 500, body: err.toString() }
        }
    }

    try {
        // request is ok, write to the DB
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
                        { data: { signature, value } }
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

function responseFromData (res) {
    let doc
    try {
        doc = res.data.map(d => d.data)
    } catch (err) {
        console.log('there was an error', doc)
        return { statusCode: 500, body: JSON.stringify(err) }
    }

    if (!doc || (Array.isArray(doc) && !doc.length)) {
        return { statusCode: 404, body: JSON.stringify('Not found') }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(doc)
    }
}
