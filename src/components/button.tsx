import { FunctionalComponent, JSX, h } from 'preact'
import './button.css'

interface Props extends JSX.HTMLAttributes {
    isSpinning?: boolean,
    className?: string,
    // onClick: (ev:JSX.TargetedEvent<HTMLButtonElement>) => void
}

export const Button:FunctionalComponent<Props> = function (props) {
    return <span class="form-stuff">
        {props.isSpinning ?
            <button {...props} class={props.className || '' + ' spinning'}
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
