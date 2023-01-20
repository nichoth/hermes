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

