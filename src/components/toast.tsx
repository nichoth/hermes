import { FunctionComponent, h } from 'preact'
import { CloseBtn } from './close-btn.jsx'

interface Props {
    onClick: (MouseEvent) => void
}

export const Toast:FunctionComponent<Props> = function Toast (props) {
    return <div className={'toast'}>
        {props.children}
        <CloseBtn onClick={props.onClick} />
    </div>
}

