import './editable-image.css'

function EditableImg (props) {
    var { url, onSelect, title, name, label } = props

    return <div>
        <label for={name || 'avatar-input'} class="editable-image"
            id={name+'-label' || 'avatar-label'}
            title={title}
        >
            <img class="whoami-avatar" src={url} title={title} />
            {label ? <span class="label-text">{label}</span> : null}
        </label>

        <input type="file" id={(name || 'avatar-input')} name={name}
            accept="image/png, image/jpeg"
            class="avatar-input"
            onchange={onSelect}
        />
    </div>
}

export default EditableImg