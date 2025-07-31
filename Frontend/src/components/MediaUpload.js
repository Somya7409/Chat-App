import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import './MediaUpload.css';

const MediaUpload = ({ onUploadComplete }) => {
    const [previews, setPreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(null);

    const storage = getStorage();

    const onDrop = useCallback((acceptedFiles) => {
        acceptedFiles.forEach((file) => {
            const url = URL.createObjectURL(file);
            const type = file.type.split('/')[0]; // image, video, audio

            setPreviews((prev) => [...prev, { file, url, type }]);

            const uniqueName = `${uuidv4()}-${file.name}`;
            const storageRef = ref(storage, `media/${uniqueName}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress.toFixed(0));
                },
                (error) => console.error('❌ Upload error:', error),
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        console.log('✅ Uploaded:', downloadURL);
                        if (onUploadComplete) {
                            onUploadComplete({
                                url: downloadURL,
                                name: file.name,
                                type: type,
                                mimetype: file.type,
                            });
                        }
                    });
                }
            );
        });
    }, [onUploadComplete]);

    // Clean up blob URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            previews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [previews]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'video/*': [],
            'audio/*': [],
        },
    });

    return (
        <div className="dropzone-container" {...getRootProps()}>
            <input {...getInputProps()} />
            <div className={`dropzone ${isDragActive ? 'active' : ''}`}>
                📁 Drag & drop media or click to upload
            </div>

            {uploadProgress && (
                <div className="progress">Uploading: {uploadProgress}%</div>
            )}

            <div className="preview-container">
                {previews.map((p, idx) => (
                    <div key={idx} className="preview">
                        {/* Media Viewer */}
                        {p.type === 'image' && <img src={p.url} alt="preview" style={{ maxWidth: '150px' }} />}
                        {p.type === 'video' && (
                            <video controls width="150">
                                <source src={p.url} type={p.file?.type || "video/mp4"} />
                            </video>
                        )}
                        {p.type === 'audio' && (
                            <audio controls>
                                <source src={p.url} type={p.file?.type || "audio/mpeg"} />
                            </audio>
                        )}

                        {/* Download Button (for preview) */}
                        <a href={p.url} download={p.file?.name || `media-${idx}`} className="download-btn">
                            ⬇ Download
                        </a>
                    </div>
                ))}
            </div>

        </div>
    );
};

export default MediaUpload;
