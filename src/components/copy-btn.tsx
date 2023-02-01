import { FunctionComponent, h } from 'preact'
import { useSignal } from "@preact/signals"
import clipboardCopy from "clipboard-copy";

interface Props {
    className?: string,
    payload: string,
    onClick?: (ev:MouseEvent) => void
}

export const CopyBtn:FunctionComponent<Props> = function CopyBtn (props) {
    const hasCopied = useSignal<boolean>(false)

    function onClick (ev:MouseEvent) {
        ev.preventDefault()
        clipboardCopy(props.payload)
        hasCopied.value = true
        if (props.onClick) props.onClick(ev)
    }

    return <button {...props}
        className={('copy-btn ' + props.className || '').trim()}
        onClick={onClick}
    >
        {hasCopied.value ? ('✅ \u00A0' + 'copied!') : props.children}
    </button>
}
