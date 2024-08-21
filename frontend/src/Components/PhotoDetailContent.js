import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './PhotoDetailContent.css';

function PhotoDetailContent() {
  const { id } = useParams();
  const [photo, setPhoto] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchPhotoDetails();
  }, [id]);

  const fetchPhotoDetails = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/posts/${id}`);
      const data = await response.json();
      setPhoto(data);
    } catch (error) {
      console.error('Error fetching photo details:', error);
    }
  };

  const handleLike = async () => {
    try {
      await fetch(`http://localhost:4000/api/posts/${id}/like`, { method: 'POST' });
      fetchPhotoDetails(); // Refresh to update like count
    } catch (error) {
      console.error('Error liking photo:', error);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://localhost:4000/api/posts/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment }),
      });
      setComment('');
      fetchPhotoDetails(); // Refresh to show new comment
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  if (!photo) {
    return <div>Loading...</div>;
  }

  return (
    <div className="photo-detail-container">
      <img src={photo.imageUrl} alt={photo.title} className="detail-image" />
      <div className="photo-info">
        <h2>{photo.title}</h2>
        <p>{photo.description}</p>
        <div className="photo-actions">
          <button onClick={handleLike} className="action-btn">Like ({photo.likes})</button>
        </div>
        <div className="comments-section">
          <h3>Comments</h3>
          <ul className="comments-list">
            {photo.comments && photo.comments.map(comment => (
              <li key={comment.id} className="comment-item">
                <Link to={`/user/${comment.user_id}`} className="user-link">
                  <img src={comment.user_profile_picture || '/default-profile.jpg'} alt="Profile" className="comment-profile-pic" />
                  <span>{comment.username}</span>
                </Link>
                <p>{comment.text}</p>
              </li>
            ))}
          </ul>
          <form onSubmit={handleComment} className="comment-form">
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            <button type="submit" className="comment-btn">Post</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default PhotoDetailContent;