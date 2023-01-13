import { h } from 'preact'
import './button.css'

export function Button (props) {
    return <span class="form-stuff">
        {props.isSpinning ?
            <button {...props} class={props.class || '' + ' spinning'}
                disabled={true}
            >
                <span class="btn-content">{props.children}</span>
            </button> :
            <button {...props}>
                {props.children}
            </button>
        }
        </span>
}

export default Button
