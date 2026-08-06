import React, { useState, useContext, useEffect, useRef } from 'react';

import { AuthContext } from '../context/AuthContext';

import wavyAvatar from './wavy.avif';
import "./EditProfile.css";
const EditProfile = () => {
  const { user, setUser } = useContext(AuthContext);


  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  useEffect(() => {
    if (user?.photo) {
      setPreviewUrl(user.photo);
    }
  }, [user]);
  if (!user) return <p>Loading user data...</p>;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };


  const handleSave = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("profilePic", image);

      const response = await fetch(
        "http://localhost:5000/api/profile/upload-profile",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          },
          body: formData
        }
      );

      const data = await response.json();

      console.log("UPLOAD RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Upload failed");
      }

      // ✅ Update localStorage user
      const updatedUser = {
        ...user,
        photo: data.imageUrl
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );
      setUser(updatedUser);

      // ✅ Update preview immediately
      setPreviewUrl(data.imageUrl);

      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error updating profile");
    } finally {
      setSaving(false);
    }
  };
  console.log("PREVIEW URL:", previewUrl);
  console.log("USER PHOTO:", user?.photo);
  
  return (
    <div className="profile-page">
      <div className="profile-container">

        <h2>{user.username || user.email.split("@")[0]}'s Profile</h2>

        <div className="profile-image-section">

          <div
            className="profile-image-wrapper"
            onClick={() => fileInputRef.current.click()}
          >
            <img
              src={previewUrl || wavyAvatar}
              alt="Profile Preview"
              className="profile-picture-preview"
            />

            <div className="edit-overlay">
              Edit
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            hidden
          />

        </div>

        <button
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save"}
        </button>

      </div>
    </div>
  );
};

export default EditProfile;
