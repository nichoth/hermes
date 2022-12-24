# hermes

<div>
    <img style="width: 15vw" src="./hermes_logo_edit.png" alt="Hermes logo"
        title="Hermes logo"
    >
</div>

[![Netlify Status](https://api.netlify.com/api/v1/badges/f66ada49-9361-4e73-abee-1d538e3b59a3/deploy-status)](https://app.netlify.com/sites/ssc-hermes/deploys)

## Focus on privacy and sharing data with known people

This project is designed to share images via a social network. It started with using services that are more traditional — a DB and blob host, + UCANs for ID.

In the interest of dogfood though, I've realized that what I'm really looking for is a small scale way to share images with specific people, and I've discovered that [wnfs](https://guide.fission.codes/developers/webnative/file-system-wnfs) already has a way to do read permissions on a per-user basis. It's kind of interesting because it's all based on decryption capabilities instead of access control.

And `wnfs` gives us a common backend / ID-source for users, which makes identity easier, since `webCrypto` private keys cannot be cross-domain.

--------------

> to share private files with a group of people, you would need to write down the list of people in the group. Then call `fs.sharePrivate` and pass it the list of other users.

So `wnfs` I think has everything needed for this usecase. At this point it's more a matter of finding time to try this & build some UI for it.

-----------------

The way I've been thinking about this at a high level is that it's like *Signal*, the messaging app, in the sense that no one is able to read your messages except the recipients, but with an added social network aspect. 

The social part is all configurable too, at a pretty granular level. So you can configure things like -- do you want to let your friends see who your other friends are? Or hide that info from everyone? In any case, you *get to choose* who can read that. Not even the server-operator is able to read that info, unless you allow them to.

This is a big difference from traditional social networks, like *Instagram*, where the server reads/knows all your data.

## notes
The `events` module is required by our dependencies. It wasn't included so we have added it here.

## relevant links

* [Fission docs -- sharing private data](https://guide.fission.codes/developers/webnative/sharing-private-data)
* [discord talk](https://discord.com/channels/478735028319158273/678353918752718848/996476638697099294)
* [version 1 -- ssc](https://github.com/nichoth/ssc-server)


## develop
This is an example of using `wnfs` + `preact` & [@preact/signals](https://preactjs.com/blog/introducing-signals/). We are using client side routing via the browser's history API in [route-event](https://github.com/nichoth/route-event), because [the navigation API is chrome only](https://github.com/nichoth/hermes/discussions/10).

--------------

Start a local development server:
```
npm start
```

### About the dev setup

#### [public dir](https://vitejs.dev/guide/assets.html#the-public-directory)

> you can place the asset in a special public directory under your project root

This is [configured as _public](https://github.com/nichoth/hermes/blob/main/vite.config.js#L24)
