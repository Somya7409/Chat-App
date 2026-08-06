import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import './MediaUpload.css';

const MediaUpload = ({ onUploadComplete, clearMedia }) => {
    const [previews, setPreviews] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(null);



    const onDrop = useCallback(async (acceptedFiles) => {
        for (const file of acceptedFiles) {
            const url = URL.createObjectURL(file);
            const type = file.type.split('/')[0]; // image, video, audio

            setPreviews((prev) => [...prev, { file, url, type }]);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const res = await axios.post(
                    'http://localhost:5000/api/media/upload',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );

                const mediaUrl = `http://localhost:5000${res.data.url}`;

                console.log('✅ Uploaded:', mediaUrl);

                if (onUploadComplete) {
                    onUploadComplete({
                        url: mediaUrl,
                        name: file.name,
                        type,
                        mimetype: file.type,
                    });
                }
            } catch (error) {
                console.error('❌ Upload error:', error);
            }
        }
    }, [onUploadComplete]);

    // Clean up blob URLs to avoid memory leaks
    useEffect(() => {
        return () => {
            previews.forEach((p) => URL.revokeObjectURL(p.url));
        };
    }, [previews]);

    useEffect(() => {
        if (clearMedia) {
            setPreviews([]);
        }
    }, [clearMedia]);

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
