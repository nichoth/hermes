you get back an object `shareDetails` like this
```js
{
    "shareId": "1",
    "sharedBy": {
        "rootDid": "did:key:z13V3Sog2YaUKhdGCmgx9UZuW1o1ShFJYc6DvGYe7NTt689NoL3EonfJd28wXPPS3AeF95ecQZ1fKRigwwJYRACbMLA8w7FLRL6YjjNJDoTJZ7UxNBxpFLGDvPrC6EaykhVEMhWaVJVtRuT3yTsQG8b2orCo5dozX4pzyEpDBvDQCdWgnDB2uFYSeUNKdrYK1jhrkCNtZE9xxrFL1YGtP8WatRx7ogXeAxwnvv77JBGngrBgzPfbFmsKMfeWecgj9EpbUWqfRa7vKsUT6mjrbTmNPzRGPCLmykHWKY15A9DMRFd1A7YpnoA7VJctNUdpzc2Y17HR4bvYVNZKkHnmFoECmsFr3toRHJsYPKMSHqJGKCoDoHd4vroqr3s5ZqdMHL1nNoB8J8wxDJ5ZmpdTiRW",
        "username": "7sn4sgizp2sh3qinhgv5rrgatyqqzl5d"
    }
}
```
has keys `username` and `rootDid`


from the `sharePrivate` function call
```js
const shareDetails = await fs.sharePrivate(
    [
        wn.path.appData(APP_INFO, wn.path.directory(LOG_DIR_PATH)),
        wn.path.appData(APP_INFO, wn.path.directory(BLOB_DIR_PATH))
    ],
    // alternative: list of usernames, or sharing/exchange DID(s)
    { shareWith: req.value.from } 
)
```

```js

const shareDetails = await fs.sharePrivate()
```

-------

`sharePrivate` is called by the side accepting the friend request


--------------------------------


In accepting side, we call `fs.sharePrivate`

In the originating side, you want to call `fs.acceptShare`, with data returned by `sharePrivate`:
```js
fs.acceptShare({
  shareId: shareDetails.shareId,
  sharedBy: shareDetails.sharedBy.username
})
```

This means we need to write the `shareDetails` object to the DB, or send it in another message.


