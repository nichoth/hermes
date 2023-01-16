import { h } from 'preact'
import { useState } from 'preact/hooks'
import TextInput from '../components/text-input.jsx'
import Button from '../components/button.jsx'
import './login.css'

// function loginRoute ({ login }) {
function loginRoute () {
    const [usernameAvailable, setAvailable] = useState<boolean>(false)
    const [isValid, setValid] = useState<Boolean>(false)
    // const [postContent, setPostContent] = useState<Post|null>(null)

    function handleSubmit (ev) {
        ev.preventDefault()
        console.log('submit', ev.target.value)
    }

    function nevermind (ev) {
        ev.preventDefault()
        const form = document.getElementById('login-form') as HTMLFormElement
        form.elements['username'].value = ''
        if (form.checkValidity() !== isValid) setValid(form.checkValidity())
        console.log('nevermind')
    }

    function formInput (ev) {
        const { form, value } = ev.target
        const _isValid = form.checkValidity()
        if (_isValid !== isValid) setValid(_isValid)
    }

    const isResolving = false

    return (<div class="route route-login">
        <form onSubmit={handleSubmit} className="choose-username" id="login-form"
            onInput={formInput}
        >
            <h2>Login</h2>
            <TextInput name="username" required={true} displayName="Username"
                minLength='3'
            />

            <Button isSpinning={isResolving} type="submit" disabled={!isValid}>
                Login
            </Button>
            <Button onClick={nevermind}>Nevermind</Button>
        </form>

        {/* <a href="/create-account">Create an account</a> */}
    </div>)
}

export { loginRoute }
export default loginRoute
