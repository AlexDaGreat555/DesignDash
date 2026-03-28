// File upload area; disabled after submission or when timer hits 0:00
export default function UploadZone({ onUpload, disabled }) {
  const handleChange = (e) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
  }
  return (
    <div className="upload-zone">
      <input type="file" accept="image/*" onChange={handleChange} disabled={disabled} />
    </div>
  )
}
