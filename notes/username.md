See [username system in the app templates](https://github.com/webnative-examples/webnative-app-template-react/blob/5ac6b05b1a87e8c49cad2e4f42aee04bf2c596f7/src/components/auth/register/Register.tsx#L37)

------------

onInput -> `handleCheckUsername`

```js
const fullUsername = `${value}#${did}`
```

```js
const encodedUsernameLocal = await prepareUsername(fullUsername);
// => hash of username
```

```js
// => hash of username
const prepareUsername = async (username: string): Promise<string> => {
  const normalizedUsername = username.normalize("NFD");
  const hashedUsername = await sha256(
    new TextEncoder().encode(normalizedUsername)
  );

  return uint8arrays.toString(hashedUsername, "base32").slice(0, 32);
};
```

```js
const usernameValidLocal = await isUsernameValid(encodedUsernameLocal);
// -> session.authStrategy.isUsernameValid(username);
```

```js
// isUsernameValid
/* => */ session.authStrategy.isUsernameValid(username);
```


---------------------------------------------


## 1-18-2023

### login screen

You can either link a device, or you are already logged in, or you can create a new account

--------------------

Use the username that is entered in `/login` page to link to an existing account

* take the entered username, and convert that to the 'real' username, used in Fission backend
* then we show a URL, and you have to go to that URL on the other device

for example:
- on your phone, go to a device linking page, and that authenticates the computer app on the library computer you are using

Or you can show a code on the primary device (the phone), then you have to enter the same code in the library computer.

[See the template app for device linking](https://github.com/webnative-examples/webnative-app-template-react/blob/main/src/routes/LinkDeviceRoute.tsx)



----------------------


in template repo,
[call `program.auth.register` with `prepare(fullUsername)`](https://github.com/webnative-examples/webnative-app-template-react/blob/0930e1b3e7ae2e7ee32d68852e56f8f268b27089/src/components/auth/register/Register.tsx#L64)



------------------



https://guide.fission.codes/developers/webnative/requesting-capabilities

> Authentication strategies are designed for use within a single web app across multiple devices.

> Capabilities are an API for linking between apps. One app requests permission to access some set of resources from a second app with capability equal to or greater than the requested permissions. On user approval, the second app returns capability to the first app in the form of UCANs and file system secrets. On user approval, the second app returns capability to the first app in the form of UCANs and file system secrets.


## session
> A session is an authenticated interaction between a user and a Webnative program. Sessions are typically long-lived and are based on a user controlling a key pair.


> An authentication strategy is a set of functions for registering and linking a user's account across devices. 



--------------------------------

https://guide.fission.codes/developers/webnative/authentication-strategies#device-linking

> When a user links a device, they should open a linking page on the authed device and the device they would like to link

> During device linking, interfaces must present the user with a PIN challenge. 

> An account producer emits challenge and link events. The challenge is a PIN sent by the consumer.

----------------

> account producer (an authed device) 

> account consumer (a device that would like to be linked)

> During device linking, interfaces must present the user with a PIN challenge


------------------------

See [signing a message in ssc](https://github.com/nichoth/ssc/blob/main/index.js#L268)

```js
async function signObj (keys, hmac_key, obj) {
    if (!obj) {
        obj = hmac_key
        hmac_key = null
    }
    var _obj = clone(obj)
    const msgStr = stringify(_obj)
    _obj.signature = await sign(keys, msgStr)
    return _obj
}
```

`obj` here is the entire `value` field in an ssb message.

```js
{
  previous: null,
  sequence: 1,
  author: 'did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH',
  // author: '@IGrkmx/GjfzaOLNjTpdmmPWuTj5xeSv/2pCP+yUI8eo=.ed25519',
  timestamp: 1608054728047,
  hash: 'sha256',
  content: {
    type: 'post',
    text: 'woooo',
    mentions: ['&my-hash.sha256']
  },
  signature: 'LJUQXvR6SZ9lQSlF1w1RFQi3GFIU4B/Cc1sP6kjxnMZn3YW8X7nj9/hlWiTF3cJbWkc9xHvApJ+9uRtHxicXAQ==.sig.ed25519'
}
```



----------------


See [verifying ucan invocations](https://github.com/ucan-wg/ts-ucan#verifying-ucan-invocations)

```js
// verify an invocation of a UCAN on another machine (in this example a service)
const result = await ucans.verify(encoded, {
  // to make sure we're the intended recipient of this UCAN
  audience: serviceDID,
  // A callback for figuring out whether a UCAN is known to be revoked
  isRevoked: async ucan => false // as a stub. Should look up the UCAN CID in a DB.
  // capabilities required for this invocation & which owner we expect for each capability
  requiredCapabilities: [
    {
      capability: {
        with: { scheme: "mailto", hierPart: "boris@fission.codes" },
        can: { namespace: "msg", segments: [ "SEND" ] }
      },
      rootIssuer: borisDID, // check against a known owner of the boris@fission.codes email address
    }
  ],
)

if (result.ok) {
  // The UCAN authorized the user
} else {
  // Unauthorized
}
```


-----------------------------------------------

```js
JSON.parse(atob(split[1]))
```
(this is the `prf` UCAN in the new machine)
looks like this:

```js
{
    "aud": "did:key:z13V3Sog2YaUKhdGCmgx9UZuW1o1ShFJYc6DvGYe7NTt689NoL3akb5o25jHfeQuYX4iG7JsLrZ6fuTpWRhvYsv5zXT7RgoFwayHKUZ6RV3zp5hSw8gvZzrrEyLtGCwJWqUVd5XVfeCncXUALTSManfG5kb918SvpmT7s4jGg5a8pxMQ3jpJEBbeNy3paNsujdWLfcQkrjHi9cf6vhjMMdum7xGcQQWe23RfpJbNqS64t1LTvDsRm4RiGifo4RX4Z5imezuZMqk2L94pLCJLxTygu4hiNDkyALHYDWk4faAVioayT9scEeeGopCCWfXMmY9RxFNXZEU8urvxy7nLDmPhYz6y4twZURDTKbUsfV12S8N39oXxEWt31d596Qbcis5gg5TRyFAdHifhm9Bdrbi",
    "exp": 32779842817,
    "fct": [],
    "iss": "did:key:z13V3Sog2YaUKhdGCmgx9UZuW1o1ShFJYc6DvGYe7NTt689NoL3su6x2PsEDDQ4sWUWFLp6QRYcib5WeFmh5qheZ3T8CZDyHEcrtAV62qC6rdNu2Ji6FZxVqR7f9Fp1NwL5tWT4htE9Rsd1xQ1yVjgNvF6rGrrT61JAe2aZbJVqXffWeG7ceFDw5MEcPNDSiidM63C7nGHjVUJfDAYUoRFF3RxZCyHfPNs4AhFETpnMpBGkE8sUy8nBPMgByeji6GQyaBcxtHfha9jVuU3cd61JphecT7GEUee6ZU2BoJJTagaDTBLhoJppcrBbdAUg8DWoRsm2XwwpytXSi1xfnE7ZZbty3vwJhezB2qzCHtM13KWmPv3byPVACtqScia8xaHEkse9bQHgSqwA1b7SqYZN",
    "nbf": 1675842757,
    "prf": null,
    "ptc": "SUPER_USER",
    "rsc": "*"
}
```

the ucan for the new device looks like this
```js
{
    "header": {
        "alg": "RS256",
        "typ": "JWT",
        "uav": "1.0.0"
    },
    "payload": {
        "aud": "did:key:z13V3Sog2YaUKhdGCmgx9UZuW1o1ShFJYc6DvGYe7NTt689NoL3akb5o25jHfeQuYX4iG7JsLrZ6fuTpWRhvYsv5zXT7RgoFwayHKUZ6RV3zp5hSw8gvZzrrEyLtGCwJWqUVd5XVfeCncXUALTSManfG5kb918SvpmT7s4jGg5a8pxMQ3jpJEBbeNy3paNsujdWLfcQkrjHi9cf6vhjMMdum7xGcQQWe23RfpJbNqS64t1LTvDsRm4RiGifo4RX4Z5imezuZMqk2L94pLCJLxTygu4hiNDkyALHYDWk4faAVioayT9scEeeGopCCWfXMmY9RxFNXZEU8urvxy7nLDmPhYz6y4twZURDTKbUsfV12S8N39oXxEWt31d596Qbcis5gg5TRyFAdHifhm9Bdrbi",
        "exp": 32779842817,
        "fct": [],
        "iss": "did:key:z13V3Sog2YaUKhdGCmgx9UZuW1o1ShFJYc6DvGYe7NTt689NoL3akb5o25jHfeQuYX4iG7JsLrZ6fuTpWRhvYsv5zXT7RgoFwayHKUZ6RV3zp5hSw8gvZzrrEyLtGCwJWqUVd5XVfeCncXUALTSManfG5kb918SvpmT7s4jGg5a8pxMQ3jpJEBbeNy3paNsujdWLfcQkrjHi9cf6vhjMMdum7xGcQQWe23RfpJbNqS64t1LTvDsRm4RiGifo4RX4Z5imezuZMqk2L94pLCJLxTygu4hiNDkyALHYDWk4faAVioayT9scEeeGopCCWfXMmY9RxFNXZEU8urvxy7nLDmPhYz6y4twZURDTKbUsfV12S8N39oXxEWt31d596Qbcis5gg5TRyFAdHifhm9Bdrbi",
        "nbf": 1675843492,
        "prf": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsInVhdiI6IjEuMC4wIn0.eyJhdWQiOiJkaWQ6a2V5OnoxM1YzU29nMllhVUtoZEdDbWd4OVVadVcxbzFTaEZKWWM2RHZHWWU3TlR0Njg5Tm9MM2FrYjVvMjVqSGZlUXVZWDRpRzdKc0xyWjZmdVRwV1JodllzdjV6WFQ3UmdvRndheUhLVVo2UlYzenA1aFN3OGd2WnpyckV5THRHQ3dKV3FVVmQ1WFZmZUNuY1hVQUxUU01hbmZHNWtiOTE4U3ZwbVQ3czRqR2c1YThweE1RM2pwSkVCYmVOeTNwYU5zdWpkV0xmY1FrcmpIaTljZjZ2aGpNTWR1bTd4R2NRUVdlMjNSZnBKYk5xUzY0dDFMVHZEc1JtNFJpR2lmbzRSWDRaNWltZXp1Wk1xazJMOTRwTENKTHhUeWd1NGhpTkRreUFMSFlEV2s0ZmFBVmlvYXlUOXNjRWVlR29wQ0NXZlhNbVk5UnhGTlhaRVU4dXJ2eHk3bkxEbVBoWXo2eTR0d1pVUkRUS2JVc2ZWMTJTOE4zOW9YeEVXdDMxZDU5NlFiY2lzNWdnNVRSeUZBZEhpZmhtOUJkcmJpIiwiZXhwIjozMjc3OTg0MjgxNywiZmN0IjpbXSwiaXNzIjoiZGlkOmtleTp6MTNWM1NvZzJZYVVLaGRHQ21neDlVWnVXMW8xU2hGSlljNkR2R1llN05UdDY4OU5vTDNzdTZ4MlBzRUREUTRzV1VXRkxwNlFSWWNpYjVXZUZtaDVxaGVaM1Q4Q1pEeUhFY3J0QVY2MnFDNnJkTnUySmk2Rlp4VnFSN2Y5RnAxTndMNXRXVDRodEU5UnNkMXhRMXlWamdOdkY2ckdyclQ2MUpBZTJhWmJKVnFYZmZXZUc3Y2VGRHc1TUVjUE5EU2lpZE02M0M3bkdIalZVSmZEQVlVb1JGRjNSeFpDeUhmUE5zNEFoRkVUcG5NcEJHa0U4c1V5OG5CUE1nQnllamk2R1F5YUJjeHRIZmhhOWpWdVUzY2Q2MUpwaGVjVDdHRVVlZTZaVTJCb0pKVGFnYURUQkxob0pwcGNyQmJkQVVnOERXb1JzbTJYd3dweXRYU2kxeGZuRTdaWmJ0eTN2d0poZXpCMnF6Q0h0TTEzS1dtUHYzYnlQVkFDdHFTY2lhOHhhSEVrc2U5YlFIZ1Nxd0ExYjdTcVlaTiIsIm5iZiI6MTY3NTg0Mjc1NywicHJmIjpudWxsLCJwdGMiOiJTVVBFUl9VU0VSIiwicnNjIjoiKiJ9.Rm_rCg-NPByqpHeKxOhJmOQJqaDvd3tmgM6xRi0g6l0ko1BjrOp5RbJ4DH0vg2zVxIvjg9Dz0cOWx2t3BBz3OGK3ZYhXG4TeJOoJyiqm6DMBOcseDDwDJqV1DreZFR484tr4YX3JKkAxruAkGugh-HfuQRr4LG0TQ0qhv6KuKx2dX16yB00v8Qh1fpemYSAXx9EeOtq_7GK2k9kk7IBUqeOHhqlR1F-7UKv1q10xEKVXn9B_7rBkdm2bvPNm_XL-jOBXsm4HHicDyHZVrtSX1--Cd9_QxepCkPzJx_F9jZFHcRHRpBnBIGXqNP0HjOz4MldjIVRSKp6_PcdJtM3hqQ",
        "ptc": "APPEND",
        "rsc": "*"
    },
    "signature": "RRI16p2QYraUl8nl6mH6u_ebwKRb9ZVhAkF4bTYwbq8fSnHotMzL67OJE75qq7GkG4SyX6I6Rek_ajbHMvVCLr7l-KX-bGneaACd4dsMceexDhnxjJnJ2QUclkz4ObIrwAiLbEWKyxG2N2_XB8d1FdBHGsTC6CfuqY7miEYEx-UYCCYY_lUSeUnu4j6M4fTaFGX0dojQN50SM_Ro7Sn0OtLBFu5lgIUivMUd60_fWqXF0Bkd-Dgca0zabHBtYOtmhhYExOhNpEIU0tmo330rkJ2dIWM9lMCNaJzxgfp2uKNug2H7m4eO1v2a8142qycUsb5T1f6Yygi4n9JEDF1nxA"
}
```



----------------

