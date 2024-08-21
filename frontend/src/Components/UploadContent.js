import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PhotoUploadPage.css';

function UploadContent() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('image', file);

    const user = JSON.parse(localStorage.getItem('user'));
    formData.append('userId', user.id);

    try {
      const response = await fetch('http://localhost:4000/api/posts', {
        method: 'POST',
        body: formData,
      });
      if (response.ok) {
        navigate('/feed');
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading photo:', error);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload a Photo</h2>
      <form onSubmit={handleSubmit} className="upload-form">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/*"
          required
        />
        <button type="submit" className="upload-btn">Upload</button>
      </form>
    </div>
  );
}

export default UploadContent;