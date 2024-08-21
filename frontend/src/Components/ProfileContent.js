import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { User, Grid, Bookmark } from 'react-feather';
import './ProfileContent.css';

function ProfileContent() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('created');
  const { id } = useParams();
  const currentUser = JSON.parse(localStorage.getItem('user'));
  const userId = id || currentUser?.id;

  useEffect(() => {
    if (userId) {
      fetchUserData();
      fetchPosts();
    } else {
      setError("No user ID available");
      setLoading(false);
    }
  }, [userId, activeTab]);

  const fetchUserData = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/users/${userId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/posts/${activeTab}/${userId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${activeTab} posts`);
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error(`Error fetching ${activeTab} posts:`, error);
      setPosts([]);
    }
  };

  const handleAction = async (postId) => {
    const isCreator = activeTab === 'created';
    const action = isCreator ? 'delete' : 'unsave';
    const confirmMessage = isCreator 
      ? 'Are you sure you want to delete this post? This will also remove it from all users who have saved it.'
      : 'Are you sure you want to unsave this post?';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/posts/${postId}?action=${action}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });
      const data = await response.json();
      if (response.ok) {
        console.log(action === 'unsave' ? 'Post unsaved successfully' : 'Post deleted successfully');
        fetchPosts(); // Refresh the posts after deletion or unsaving
        setError(null); // Clear any previous errors
      } else {
        console.error('Failed to perform action:', data.error, data.details);
        setError(`Failed to ${action} post: ${data.error}. ${data.details || ''}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing post:`, error);
      setError(`Error ${action}ing post: ${error.message}`);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!user) return <div className="not-found">User not found</div>;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-picture">
          <User size={80} />
        </div>
        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          <div className="profile-stats">
            <div className="stat"><strong>{posts.length}</strong> posts</div>
          </div>
          <p className="profile-fullname">{user.fullname}</p>
        </div>
      </header>
      
      <div className="profile-tabs">
        <button 
          onClick={() => setActiveTab('created')} 
          className={`tab-button ${activeTab === 'created' ? 'active' : ''}`}
        >
          <Grid size={16} /> Created
        </button>
        <button 
          onClick={() => setActiveTab('saved')} 
          className={`tab-button ${activeTab === 'saved' ? 'active' : ''}`}
        >
          <Bookmark size={16} /> Saved
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <main className="profile-main">
        {posts.length === 0 ? (
          <p className="no-posts">No posts yet.</p>
        ) : (
          <div className="posts-grid">
            {posts.map(post => (
              <div key={post.id} className="post-item">
                <img src={`http://localhost:4000${post.imageUrl}`} alt={post.title} />
                <button 
                  onClick={() => handleAction(post.id)} 
                  className="action-btn"
                >
                  {activeTab === 'created' ? 'Delete' : 'Unsave'}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default ProfileContent;