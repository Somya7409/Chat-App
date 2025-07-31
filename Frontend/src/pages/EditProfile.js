import React, { useState, useContext } from 'react';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { updateProfile, getAuth } from 'firebase/auth';
import { AuthContext } from '../context/AuthContext';
import { storage } from '../firebase';
import wavyAvatar from './wavy.avif';

const EditProfile = () => {
  const { user } = useContext(AuthContext);
  const auth = getAuth();

  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.photoURL || null);
  const [saving, setSaving] = useState(false);

  if (!user) return <p>Loading user data...</p>;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      let photoURL = user.photoURL;

      if (image) {
        const imageRef = ref(storage, `profileImages/${user.userId}-${image.name.replace(/\s/g, '_')}`);
        await uploadBytes(imageRef, image);
        photoURL = await getDownloadURL(imageRef);
      }

      await updateProfile(auth.currentUser, {
        photoURL,
        displayName: user.username || user.email.split('@')[0], // fallback
      });

      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Edit Profile</h2>

      <div>
        <label>Profile Picture:</label><br />
        <img
          src={previewUrl || wavyAvatar}
          alt="Profile Preview"
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            marginBottom: '10px',
            objectFit: 'cover',
          }}
        />
        <br />
        <input type="file" accept="image/*" onChange={handleImageChange} />
      </div>

      <div style={{ marginTop: '15px' }}>
        <label style={{ fontWeight: 'bold' }}>Username:</label><br />
        <p>{user.username || user.email.split('@')[0]}</p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        style={{ marginTop: '20px', padding: '10px 20px' }}
      >
        {saving ? 'Saving...' : 'Save'}
      </button>
    </div>
  );
};

export default EditProfile;
