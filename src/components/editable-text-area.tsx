import './text-input.css'

export const EditableTextArea = function (props) {
    return <div class="editable-text-area">
        {props.children}
    </div>
}

export default EditableTextArea
