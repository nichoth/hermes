import './button-two.css'
import { FunctionComponent, JSX, h } from 'preact'

interface Props {
    className?: string,
    isSpinning?: boolean,
    onClick: (ev:JSX.TargetedEvent<HTMLButtonElement>) => void
}

export const ButtonTwo:FunctionComponent<Props> = function (props) {
    const classAttr = 'button-two' + (props.className ?
        ` ${props.className}` :
        '') + (props.isSpinning ? ' spinning': '')

    return <span className="button-two">

        {props.isSpinning ?
            <button {...props} className={classAttr}
                disabled={true}
            >
                <span class="btn-content">{props.children}</span>
            </button> :
            <button {...props} className={classAttr}>
                {props.children}
            </button>
        }

    </span>
}

export default ButtonTwo
