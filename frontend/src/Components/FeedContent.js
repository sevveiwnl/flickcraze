import React, { useEffect, useState } from 'react';
import './FeedContent.css';

function FeedContent() {
  const [posts, setPosts] = useState([]); // State for storing posts
  const [savedPosts, setSavedPosts] = useState([]); // State for tracking saved posts by user
  const [isLoading, setIsLoading] = useState(true); // State for loading status
  const [error, setError] = useState(null); // State for error handling
  const user = JSON.parse(localStorage.getItem('user')); // Retrieving user details from local storage

  useEffect(() => {
    fetchPosts();
    fetchSavedPosts();
  }, []); // useEffect to load data on component mount

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/posts'); // Fetch posts from API
      if (!response.ok) throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setPosts(data); // Set posts data to state
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false); // Ensure loading is set to false after fetch
    }
  };

  const fetchSavedPosts = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/posts/saved/${user.id}`);
      if (!response.ok) throw new Error(`Failed to fetch saved posts: ${response.status} ${response.statusText}`);
      const data = await response.json();
      setSavedPosts(data.map(post => post.id)); // Map and store only post ids
    } catch (error) {
      console.error('Error fetching saved posts:', error);
    }
  };

  const handleSave = async (postId) => {
    try {
      const response = await fetch(`http://localhost:4000/api/posts/${postId}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }), // Send user ID with request
      });
      if (response.ok) {
        console.log('Post saved successfully');
        setSavedPosts([...savedPosts, postId]); // Add new post id to saved posts
      } else {
        console.error('Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <div className="feed-content">
      {isLoading && <div>Loading posts...</div>}
      {error && <div className="error-message">{error}</div>}
      {!isLoading && !error && posts.length === 0 && <div>No posts found.</div>}
      {!isLoading && !error && posts.length > 0 && (
        <div className="posts-grid">
          {posts.map(post => (
            <div key={post.id} className="post-item">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{post.description}</p>
              <img src={`http://localhost:4000${post.imageUrl}`} alt={post.title} />
              <div className="post-actions">
                <button 
                  onClick={() => handleSave(post.id)} 
                  className={`save-btn ${savedPosts.includes(post.id) ? 'saved' : ''}`}
                >
                  {savedPosts.includes(post.id) ? 'Saved' : 'Save'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FeedContent;
