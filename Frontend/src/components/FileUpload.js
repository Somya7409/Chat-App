// components/FileUpload.js
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileUpload() {
  const onDrop = async (acceptedFiles) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData);
      alert('Uploaded successfully');
    } catch (err) {
      console.error(err);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} style={{ border: '2px dashed gray', padding: '20px', textAlign: 'center' }}>
      <input {...getInputProps()} />
      <p>Drag & drop file here, or click to select file</p>
    </div>
  );
}

export default FileUpload;
