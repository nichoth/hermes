import './button-two.css'
import { h } from 'preact'

export function ButtonTwo (props) {
    const classAttr = 'button-two' + (props.className ?
        ` ${props.className}` :
        '')

    return <span className="button-two">
        <button {...props} className={classAttr}>
            {props.children}
        </button>
    </span>
}

export default ButtonTwo
