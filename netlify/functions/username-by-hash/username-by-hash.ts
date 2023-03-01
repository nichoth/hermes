import * as dotenv from 'dotenv'
dotenv.config()
import { default as faunadb } from 'faunadb'
import { Handler, HandlerEvent } from '@netlify/functions'

const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET || ''
})

export const handler:Handler = async function hanlder (ev:HandlerEvent) {
    if ((ev.httpMethod !== 'GET') && (ev.httpMethod !== 'POST')) {
        return {
            statusCode: 405,
            body: JSON.stringify('invalid HTTP method')
        }
    }

    if (ev.httpMethod === 'POST') {
        let hashes
        // handle a request for multiple profiles
        try {
            const body = JSON.parse(ev.body || '')
            hashes = body.hashes
        } catch (err:any) {
            return {
                statusCode: 422,
                body: 'invalid JSON'
            }
        }

        // query DB
        const res:{ data } = await client.query(
            q.Map(
                q.Paginate(q.Union(
                    ...(hashes.map((hash => {
                        return q.Match(q.Index('profile-by-hash'), hash)
                    })))
                )),
                q.Lambda('profile', q.Get(q.Var('profile')))
            ),
        )

        console.log('res.data', res.data.map(item => item.data))

        return {
            statusCode: 200,
            // map of hashedName => profile
            body: JSON.stringify(
                res.data
                    .map(item => item.data)
                    .reduce((acc, profile) => {
                        acc[profile.hashedUsername] = profile
                        return acc
                    }, {})
            )
        }
    }


    // ------------------------------------
    // method is GET
    // ------------------------------------

    const qs = ev.queryStringParameters
    if (!qs || !qs.names) return {
        statusCode: 422,
        body: JSON.stringify('Need a query string')
    }

    const hashArr = qs.names?.split(',')

    const res:{ data } = await client.query(
        q.Map(
            q.Paginate(q.Union(
                ...(hashArr.map((hash => {
                    return q.Match(q.Index('profile-by-hash'), hash)
                })))
            )),
            q.Lambda('req', q.Get(q.Var('req')))
        ),
    )

    return {
        statusCode: 200,
        body: (hashArr.length === 1 ?
            JSON.stringify(res.data[0].data) :
            JSON.stringify(res.data.map(item => {
                return item.data
            }))
        )
    }
}
