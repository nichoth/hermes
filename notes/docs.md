# docs

## 1-3-2023

### working on profiles
* How to use private vs public files? Should use private by default.

--------------------

## 1-4-2023

### [the issue of setting an avatar](https://discord.com/channels/478735028319158273/901207734849011753/1059999722049376317)

Need to call `.publish()` after 'writing' a file.

started by looking at [webnative.fission.app](https://webnative.fission.app/modules.html)

But [this one was more helpful](https://guide.fission.codes/developers/webnative/file-system-wnfs)


## 1-7-2023

### profile info
There is nothing unique to fission about certain profile data, like a *description* or an avatar picture.

This means we save these as standard 'files' in wnfs. Here we use simple constants to record the file path. Like `CONSTANTS.profilePath`. And this path resolves to a unique file for any user, because `wnfs` is per user.

### how to set your username?

