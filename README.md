# hermes

## Focus on privacy and sharing data with known people

This project is designed to share images via a social network. It started with using services that are more traditional — a DB and blob host, + UCANs for ID.

In the interest of dogfood though, I've realized that what I'm really looking for is a small scale way to share images with specific people, and I've discovered that `wnfs` already has a way to do read permissions on a per-user basis. That's kind of interesting because it's all based on decryption capabilities instead of access control.

And wnfs gives us a common backend/ID-source for users, which makes identity easier.

> to share private files with a group of people, you would need to write down the list of people in the group. Then call `fs.sharePrivate` and pass it the list of other users.

So `wnfs` I think has everything needed for this usecase. At this point it's more a matter of finding time to try this & build some UI for it.

## relevant links:

* https://guide.fission.codes/developers/webnative/sharing-private-data
* https://discord.com/channels/478735028319158273/678353918752718848/996476638697099294
