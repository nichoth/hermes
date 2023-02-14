import { FunctionComponent, h } from 'preact'
import { CloseBtn } from './close-btn.jsx'
import { GreenCheck } from './green-check.jsx'
import './toast.css'

export enum Type {
    success = 'success'
}

interface Props {
    onClose: (MouseEvent) => void
    type: Type
}

export const Toast:FunctionComponent<Props> = function Toast (props) {
    return <div className={'toast'}>
        <div className={'toast-body'}>
            {props.type === Type.success ?
                (<>
                    <span class="green-check">
                        <GreenCheck />
                    </span>
                    <span>{props.children}</span>
                </>) :
                <span>{props.children}</span>
            }
        </div>

        <CloseBtn onClick={props.onClose} />
    </div>
}
