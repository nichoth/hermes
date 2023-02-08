// @ts-check
require('dotenv').config()
const faunadb = require('faunadb')
// import('dotenv').then(dotenv => {
//     dotenv.config()
// })

// const faunadb = await import('faunadb')

const q = faunadb.query
const client = new faunadb.Client({
    secret: process.env.FAUNADB_SERVER_SECRET || ''
})

// a request is like
// { username, author }

// an "upsert" function
// create if it does not exist, update if it does exist
export const handler = async function (ev, ctx) {
    if (ev.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: 'invalid http method'
        }
    }

    let author, username
    try {
        const body = JSON.parse(ev.body)
        author = body.author
        username = body.username
    } catch (err) {
        return {
            statusCode: 422,
            body: 'invalid JSON'
        }
    }

    if (!author || !username) {
        return { statusCode: 400, body: JSON.stringify('invalid request params') }
    }

    const doc = await client.query(
        q.If(
            q.IsEmpty(q.Match(
                q.Index('username-by-hash'),
                author
            )),

            // is empty, so create the username
            'empty',

            // is not empty, so update the username
            q.Create(
                q.Collection('username'),
                { data: { author, username } }
            )
        )
    )

    return {
        statusCode: 200,
        body: JSON.stringify(doc)
    }
}
