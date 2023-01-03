import './text-input.css'

function TextInput (props) {
    var { name, displayName } = props
    var _props = {...props}
    delete _props.displayName

    return <div className="form-stuff">
        <div className={'input-group ' + name}>
            <input {..._props} name={name} type={props.type || 'text'}
                placeholder=" " required={props.required}
                minLength={props.minlength || props.minLength}
                maxLength={props.maxlength || props.maxLength}
                id={name}
                defaultValue={props.defaultValue || null}
            />
            <label htmlFor={name}>{displayName}</label>
        </div>
    </div>
}

export default TextInput
