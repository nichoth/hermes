import { FunctionComponent } from 'preact'
import './text-input.css'

interface Props {
    name: string,
    displayName: string,
    required?: boolean,
    type?: string,
    minLength?: string,
    maxLength?: string,
    minlength?: string,
    maxlength?: string,
    defaultValue?: string
}

const TextInput:FunctionComponent<Props> = function (props) {
    const { name, displayName } = props
    const _props:Partial<Props> = {...props}
    delete _props.displayName

    return <div className="form-stuff">
        <div className={'input-group ' + name}>
            <input {..._props}
                name={name}
                type={props.type || 'text'}
                placeholder=" "
                required={props.required}
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
