import { useState } from 'react'
import Icon from '../../components/Icon.jsx'

/** Upload and preview of setup photos. Photos live only in this session (object URLs); nothing is uploaded anywhere. */
export default function PhotoGallery() {
  const [photos, setPhotos] = useState([])

  const addPhotos = (event) => {
    const images = [...event.target.files].filter((file) => file.type.startsWith('image/'))
    setPhotos((current) => [...current, ...images.map((file) => ({ url: URL.createObjectURL(file), name: file.name }))])
    event.target.value = ''
  }
  const removePhoto = (index) => setPhotos((current) => { URL.revokeObjectURL(current[index].url); return current.filter((_, i) => i !== index) })

  return (
    <div className="card">
      <h3>Fotos del montaje</h3>
      <label className="drop">
        <input type="file" accept="image/*" multiple onChange={addPhotos} />
        <span>＋ Subir fotos del experimento</span>
      </label>
      {photos.length > 0 && (
        <div className="photos">{photos.map((photo, i) => (
          <figure key={photo.url}>
            <img src={photo.url} alt={`Montaje del experimento: ${photo.name}`} />
            <button aria-label={`Quitar foto ${photo.name}`} onClick={() => removePhoto(i)}><Icon name="close" size={14} /></button>
          </figure>
        ))}</div>
      )}
    </div>
  )
}
