import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './SearchContent.css';

function SearchContent() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const searchTerm = searchParams.get('q') || '';
    
    const filtered = posts.filter(post =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPosts(filtered);
  }, [location.search, posts]);

  const fetchPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:4000/api/posts');
      if (!response.ok) {
        throw new Error(`Failed to fetch posts: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setPosts(data);
      setFilteredPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (postId) => {
    const user = JSON.parse(localStorage.getItem('user'));
    try {
      const response = await fetch(`http://localhost:4000/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (response.ok) {
        console.log('Post saved successfully');
        // You might want to update the UI to reflect the saved state
      } else {
        console.error('Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  return (
    <div className="search-content">
      <h2>Search Results</h2>
      {isLoading && <div>Loading posts...</div>}
      {error && <div className="error-message">{error}</div>}
      {!isLoading && !error && filteredPosts.length === 0 && <div>No posts found.</div>}
      {!isLoading && !error && filteredPosts.length > 0 && (
        <div className="posts-grid">
          {filteredPosts.map(post => (
            <div key={post.id} className="post-item">
              <h3 className="post-title">{post.title}</h3>
              <p className="post-description">{post.description}</p>
              <img src={`http://localhost:4000${post.imageUrl}`} alt={post.title} />
              <div className="post-actions">
                <button onClick={() => handleSave(post.id)} className="save-btn">Save</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchContent;