const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// First, connect without specifying a database
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

// Configure multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') // make sure this folder exists
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + path.extname(file.originalname)) // appending extension
    }
  });
  
  const upload = multer({ storage: storage });
  
  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

connection.connect(err => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL successfully');
    
    // Create the new database
    connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`, (err) => {

        if (err) {
            console.error('Error creating database:', err);
            return;
        }
        console.log('Database "photoshare_new" ensured');
        
        // Switch to the new database
        connection.changeUser({database: process.env.DB_NAME}, (err) => {
            if (err) {
                console.error('Error switching to new database:', err);
                return;
            }
            console.log('Switched to "photoshare_new" database');
            initializeDatabase();
        });
    });
});

function initializeDatabase() {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            contact VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            fullname VARCHAR(100) NOT NULL
        )
    `;

    connection.query(createUsersTable, (err) => {
        if (err) {
            console.error('Error creating users table:', err);
        } else {
            console.log('Users table created/checked');
        }
    });

    const createPostsTable = `
    CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        imageUrl VARCHAR(255),
        likes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )
`;

    connection.query(createPostsTable, (err) => {
        if (err) {
            console.error('Error creating posts table:', err);
        } else {
            console.log('Posts table created/checked');
        }
});





const createSavesTable = `
CREATE TABLE IF NOT EXISTS saves (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  post_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (post_id) REFERENCES posts(id),
  UNIQUE KEY unique_save (user_id, post_id)
)
`;

connection.query(createSavesTable, (err) => {
if (err) {
  console.error('Error creating saves table:', err);
} else {
  console.log('Saves table created/checked');
}
});

}

app.post('/api/users', (req, res) => {
    console.log('Received registration request:', req.body);
    const { contact, username, password, fullname } = req.body;
    
    const INSERT_USER_QUERY = `INSERT INTO users (contact, username, password, fullname) VALUES (?, ?, ?, ?)`;
    
    connection.query(INSERT_USER_QUERY, [contact, username, password, fullname], (err, results) => {
        if (err) {
            console.error('Database error during user registration:', err);
            return res.status(500).json({ error: 'Error registering user', details: err.message });
        }
        console.log('User registered successfully:', results);
        return res.status(201).json({ message: 'User registered successfully', userId: results.insertId });
    });
});

app.post('/api/login', (req, res) => {
    console.log('Received login request:', req.body);
    const { contact, password } = req.body;
    
    const SELECT_USER_QUERY = `SELECT * FROM users WHERE contact = ? AND password = ?`;
    
    connection.query(SELECT_USER_QUERY, [contact, password], (err, results) => {
        if (err) {
            console.error('Database error during login:', err);
            return res.status(500).json({ error: 'Error logging in', details: err.message });
        }
        if (results.length > 0) {
            console.log('User logged in successfully:', results[0]);
            // Don't send the password back to the client
            const { password, ...userWithoutPassword } = results[0];
            return res.status(200).json({ message: 'Login successful', user: userWithoutPassword });
        } else {
            console.log('Login failed: Invalid credentials');
            return res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.get('/api/posts', (req, res) => {
    console.log('Received request for posts');
    const FETCH_POSTS_QUERY = `SELECT * FROM posts ORDER BY created_at DESC LIMIT 10`;
    connection.query(FETCH_POSTS_QUERY, (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching posts', details: err.message });
      }
      console.log('Query results:', results);
      res.json(results || []);
    });
  });


  app.get('/api/debug/raw-posts', (req, res) => {
    const query = 'SELECT * FROM posts ORDER BY created_at DESC';
    connection.query(query, (err, results) => {
      if (err) {
        console.error('Error fetching raw posts:', err);
        res.status(500).json({ error: 'Error fetching raw posts' });
      } else {
        console.log('All raw posts in database:', results);
        res.json(results);
      }
    });
  });

// Modify the post upload endpoint to ensure it's connecting to the database
app.post('/api/posts', upload.single('image'), (req, res) => {
    const { title, description, userId } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
  
    console.log('Received post data:', { title, description, userId, imageUrl });
  
    const INSERT_POST_QUERY = `INSERT INTO posts (user_id, title, description, imageUrl) VALUES (?, ?, ?, ?)`;
    
    connection.query(INSERT_POST_QUERY, [userId, title, description, imageUrl], (err, result) => {
      if (err) {
        console.error('Error creating post:', err);
        return res.status(500).json({ error: 'Error creating post', details: err.message });
      }
      console.log('Post inserted successfully:', result);
      res.status(201).json({ message: 'Post created successfully', postId: result.insertId });
    });
  });

app.use('/uploads', express.static('uploads'));

app.get('/api/debug/posts', (req, res) => {
  const query = 'SELECT * FROM posts';
  connection.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching all posts:', err);
      res.status(500).json({ error: 'Error fetching all posts' });
    } else {
      console.log('All posts in database:', results);
      res.json(results);
    }
  });
});

  
  // Like a post
  app.post('/api/posts/:id/like', (req, res) => {
    const postId = req.params.id;
    const UPDATE_LIKES_QUERY = `UPDATE posts SET likes = likes + 1 WHERE id = ?`;
    connection.query(UPDATE_LIKES_QUERY, [postId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error liking post' });
      }
      res.json({ message: 'Post liked successfully' });
    });
  });
  
  // Comment on a post
  app.post('/api/posts/:id/comment', (req, res) => {
    const postId = req.params.id;
    const { userId, comment } = req.body;
    const ADD_COMMENT_QUERY = `INSERT INTO comments (post_id, user_id, comment) VALUES (?, ?, ?)`;
    connection.query(ADD_COMMENT_QUERY, [postId, userId, comment], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error adding comment' });
      }
      res.json({ message: 'Comment added successfully' });
    });
  });
  
  // Search posts
  app.get('/api/posts/search', (req, res) => {
    const { term } = req.query;
    const SEARCH_POSTS_QUERY = `SELECT * FROM posts WHERE title LIKE ? OR description LIKE ? ORDER BY created_at DESC LIMIT 10`;
    connection.query(SEARCH_POSTS_QUERY, [`%${term}%`, `%${term}%`], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error searching posts' });
      }
      // Ensure we always return an array, even if it's empty
      res.json(results || []);
    });
  });
  
  // Fetch user profile
  app.get('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    const SELECT_USER_QUERY = `SELECT id, username, contact, fullname FROM users WHERE id = ?`;
    
    connection.query(SELECT_USER_QUERY, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching user data' });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(results[0]);
    });
  });

  app.get('/api/posts/user/:userId', (req, res) => {
    const userId = req.params.userId;
    const FETCH_USER_POSTS_QUERY = `SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC`;
    
    connection.query(FETCH_USER_POSTS_QUERY, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching user posts' });
      }
      res.json(results);
    });
  });
  
  // Send friend request
  app.post('/api/friend-requests', (req, res) => {
    const { senderId, receiverId } = req.body;
    const SEND_REQUEST_QUERY = `INSERT INTO friend_requests (sender_id, receiver_id) VALUES (?, ?)`;
    connection.query(SEND_REQUEST_QUERY, [senderId, receiverId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error sending friend request' });
      }
      res.json({ message: 'Friend request sent successfully' });
    });
  });
  
  // Accept friend request
  app.put('/api/friend-requests/:id', (req, res) => {
    const requestId = req.params.id;
    const ACCEPT_REQUEST_QUERY = `UPDATE friend_requests SET status = 'accepted' WHERE id = ?`;
    connection.query(ACCEPT_REQUEST_QUERY, [requestId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Error accepting friend request' });
      }
      res.json({ message: 'Friend request accepted successfully' });
    });
  });

const port = process.env.PORT || 4000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

app.delete('/api/debug/clear-posts', (req, res) => {
  
    const CLEAR_POSTS_QUERY = 'TRUNCATE TABLE posts';
    connection.query(CLEAR_POSTS_QUERY, (err) => {
      if (err) {
        console.error('Error clearing posts table:', err);
        return res.status(500).json({ error: 'Failed to clear posts table' });
      }
      res.json({ message: 'Posts table cleared successfully' });
    });
  });


  app.post('/api/posts/:id/save', (req, res) => {
    const postId = req.params.id;
    const { userId } = req.body;
  
    const SAVE_POST_QUERY = `INSERT INTO saves (user_id, post_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE id=id`;
    
    connection.query(SAVE_POST_QUERY, [userId, postId], (err, result) => {
      if (err) {
        console.error('Error saving post:', err);
        return res.status(500).json({ error: 'Error saving post', details: err.message });
      }
      res.status(200).json({ message: 'Post saved successfully' });
    });
  });

  app.get('/api/posts/created/:userId', (req, res) => {
    const userId = req.params.userId;
    const FETCH_CREATED_POSTS_QUERY = `SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC`;
    
    connection.query(FETCH_CREATED_POSTS_QUERY, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching created posts' });
      }
      res.json(results);
    });
  });
  
  app.get('/api/posts/saved/:userId', (req, res) => {
    const userId = req.params.userId;
    const FETCH_SAVED_POSTS_QUERY = `
      SELECT p.* FROM posts p
      JOIN saves s ON p.id = s.post_id
      WHERE s.user_id = ?
      ORDER BY s.created_at DESC
    `;
    
    connection.query(FETCH_SAVED_POSTS_QUERY, [userId], (err, results) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Error fetching saved posts' });
      }
      res.json(results);
    });
  });

  app.delete('/api/posts/:id', (req, res) => {
    const postId = req.params.id;
    const userId = req.body.userId;
    const action = req.query.action; // 'delete' or 'unsave'
  
    console.log(`Attempting to ${action} post ${postId} for user ${userId}`);
  
    if (action === 'unsave') {
      // Remove the post from user's saved posts
      const UNSAVE_POST_QUERY = `DELETE FROM saves WHERE post_id = ? AND user_id = ?`;
      connection.query(UNSAVE_POST_QUERY, [postId, userId], (err, results) => {
        if (err) {
          console.error('Error unsaving post:', err);
          return res.status(500).json({ error: 'Error unsaving post', details: err.message });
        }
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: 'Post not found in saved posts' });
        }
        res.json({ message: 'Post unsaved successfully' });
      });
    } else {
      // Check if the user is the creator of the post
      const CHECK_CREATOR_QUERY = `SELECT user_id FROM posts WHERE id = ?`;
      connection.query(CHECK_CREATOR_QUERY, [postId], (err, results) => {
        if (err) {
          console.error('Error checking post creator:', err);
          return res.status(500).json({ error: 'Error checking post creator', details: err.message });
        }
        if (results.length === 0) {
          return res.status(404).json({ error: 'Post not found' });
        }
        if (results[0].user_id != userId) {
          return res.status(403).json({ error: 'Unauthorized to delete this post' });
        }
  
        // User is the creator, proceed with deletion
        // First, remove all saves associated with this post
        const DELETE_SAVES_QUERY = `DELETE FROM saves WHERE post_id = ?`;
        connection.query(DELETE_SAVES_QUERY, [postId], (saveErr) => {
          if (saveErr) {
            console.error('Error removing post from saved posts:', saveErr);
            return res.status(500).json({ error: 'Error removing saves', details: saveErr.message });
          }
          
          // Now delete the post
          const DELETE_POST_QUERY = `DELETE FROM posts WHERE id = ?`;
          connection.query(DELETE_POST_QUERY, [postId], (err, results) => {
            if (err) {
              console.error('Error deleting post:', err);
              return res.status(500).json({ error: 'Error deleting post', details: err.message });
            }
            
            res.json({ message: 'Post deleted and unsaved successfully' });
          });
        });
      });
    }
  });

  
  


