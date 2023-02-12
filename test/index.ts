// server side tests -- running in a node environment
import test from 'tape'
import { handler } from '../netlify/functions/username/username.js'

test('set username', t => {
    // { value, ucan, signature }
    const ev = {
        httpMethod: 'POST',
        body: JSON.stringify({
            value: '',
            ucan: '',
            signature: ''
        })
    }

    handler(ev)
})
