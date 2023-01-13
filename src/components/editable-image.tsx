import './editable-image.css'

function EditableImg (props) {
    var { url, onChange, title, name, label, capture } = props

    return <div class="editable-image-wrapper">
        <label for={name || 'avatar-input'} class="editable-image"
            id={name+'-label' || 'avatar-label'}
            title={title}
        >
            <img class="whoami-avatar" src={url} title={title} />
            {label ? <span class="label-text">{label}</span> : null}
        </label>

        <input type="file" id={(name || 'avatar-input')} name={name}
            accept="image/*"
            class="avatar-input"
            onchange={onChange}
            capture={capture}
        />
    </div>
}

export default EditableImg
