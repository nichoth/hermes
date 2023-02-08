```
Type '({ permissions, loading, children, }: RenderableProps<Props, any>) =>
    Component<{}, {}> | Element'

is not assignable to type 'FunctionComponent<Props>'.

  Type 'Component<{}, {}> | Element' is not assignable to type 'VNode<any> | null'.

    Type 'Component<{}, {}>' is missing the following properties from type 'VNode<any>': type, keyts(2322)
```

----------------

## signals

https://preactjs.com/guide/v10/signals/#local-state-with-signals


> there are many scenarios where components have their own internal state that is specific to that component. Since there is no reason for this state to live as part of the app's global business logic, it should be confined to the component that needs it. In these scenarios, we can create signals as well as computed signals directly within components using the `useSignal()` and `useComputed()` hooks


----------------


hmm… there is a `rootDID` property I see. Maybe that will work for validation
purposes
```js
program.session.fs.account.rootDID
```





Need to check that a message was written by who it says it is. This is done by checking the signature.

* need to get the DID of the current device
* need to check that the given DID is linked to the right username, via UCAN

How to keep a record of the UCAN chain?

---

**Get the DID for the current device:**
```js
await webnative.value.agentDID(webnative.value.components.crypto)
```

**Decode the `prf` chain in the UCAN**
Do this in the *new device*, the device that has been linked from the original device.

```js
const ucan = Object.entries(session.fs.proofs)[0][1]
const split = ucan.payload.prf.split('.')

const proof = JSON.parse( atob(split[1]) )  // decode the base64 encoded UCAN
```

You will notice that the `iss` field in the resulting UCAN is equal to the DID of the originating account, which is equal to `session.fs.account.rootDID`.

And the `aud` field is equal to your DID on the new device, or 
```js
await webnative.value.agentDID(webnative.value.components.crypto)
```


