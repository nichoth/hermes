// server side tests -- running in a node environment
import { test } from 'tapzero'
import { handler } from '../netlify/functions/username/username.js'

test('set username', async t => {
    // { value, ucan, signature }
    const ev = {
        httpMethod: 'POST',
        body: JSON.stringify({
            value: '',
            ucan: '',
            signature: ''
        })
    }

    const res = await handler(ev)
    t.equal(res.statusCode, 400)
    console.log('ressssssssssssss', res)
})
