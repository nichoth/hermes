# hermes

## Focus on privacy and sharing data with known people

I've discovered that wnfs already has a way to do read permissions on a per-user basis. That's kind of interesting because it's all based on decryption capabilities instead of access control.

And wnfs gives us a common backend for users, which makes identity easier.

> to share private files with a group of people, you would need to write down the list of people in the group. Then call `fs.sharePrivate` and pass it the list of other users.

So wnfs I think has everything needed for this usecase. At this point it's more a matter of finding time to try this & build some UI for it.

## relevant links:

* https://guide.fission.codes/developers/webnative/sharing-private-data
* https://discord.com/channels/478735028319158273/678353918752718848/996476638697099294
* https://github.com/wnfs-wg/spec/discussions/22#discussioncomment-3312330
* [this document also was also written here](https://github.com/nichoth/ssc-server/blob/main/version-two.md)
