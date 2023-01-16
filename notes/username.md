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
