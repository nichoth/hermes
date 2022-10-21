# shared private files

https://guide.fission.codes/developers/webnative/sharing-private-data

[see `addPublicExchangeKey`](https://github.com/fission-codes/webnative/blob/2d0a93e4f435a51a7618ce47544fb17b391352ad/src/fs/filesystem.ts#L699)

`did.exchange` resolves to [src/did/local.ts](https://github.com/fission-codes/webnative/blob/2d0a93e4f435a51a7618ce47544fb17b391352ad/src/did/local.ts#L9)

->

[`crypto.keystore.publicExchangeKey`](https://github.com/fission-codes/webnative/blob/2d0a93e4f435a51a7618ce47544fb17b391352ad/src/crypto/index.ts#L127)

->

[impl.keystore.publicExchangeKey](https://github.com/fission-codes/webnative/blob/2d0a93e4f435a51a7618ce47544fb17b391352ad/src/crypto/browser.ts#L20)

->

['keystore-idb'.publicExchangeKey](https://github.com/fission-codes/keystore-idb/blob/7b9baf1b36e129cbfe60a293e3bdb959a73ab39c/src/ecc/keystore.ts#L96)

->

[KeyStoreBase.exchangeKey](https://github.com/fission-codes/keystore-idb/blob/7b9baf1b36e129cbfe60a293e3bdb959a73ab39c/src/keystore/base.ts#L23)

->

[idb.getKeypair(this.cfg.exchangeKeyName, this.store)](https://github.com/fission-codes/keystore-idb/blob/7b9baf1b36e129cbfe60a293e3bdb959a73ab39c/src/keystore/base.ts#L24)

------------------

[example passing in exchange key name](https://github.com/fission-codes/keystore-idb/blob/1d702dafd0d1a15a7b70837668f6580f8553f4c2/test/ecc.keystore.test.ts#L38)


[exchange key in keystore-idb](https://github.com/fission-codes/keystore-idb/blob/1d702dafd0d1a15a7b70837668f6580f8553f4c2/test/ecc.keystore.test.ts#L38)


[exchange key docs](https://guide.fission.codes/developers/webnative/sharing-private-data#exchange-keys)


