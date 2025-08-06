import Head from 'next/head';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function GroupDetails() {
  const [group, setGroup] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const { id: groupId } = router.query;

  useEffect(() => {
    if (groupId) {
      checkSession();
      loadGroupDetails();
      loadGroupPosts();
    }
  }, [groupId]);

  const checkSession = async () => {
    try {
      const response = await fetch('http://localhost:8080/check-session', {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json();
      if (!data.loggedIn) {
        router.push('/login');
        return;
      }
      setCurrentUser(data);
    } catch (err) {
      console.error('Session check failed:', err);
      router.push('/login');
    }
  };

  const loadGroupDetails = async () => {
    try {
      const response = await fetch(`http://localhost:8080/group-details/${groupId}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setGroup(data);
      } else {
        setError('Failed to load group details');
      }
    } catch (err) {
      console.error('Error loading group details:', err);
      setError('Error loading group details');
    } finally {
      setLoading(false);
    }
  };

  const loadGroupPosts = async () => {
    try {
      const response = await fetch(`http://localhost:8080/group-posts/${groupId}`, {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setPosts(data || []);
      } else if (response.status === 403) {
        setError('You must be a member of this group to view posts');
      } else {
        setError('Failed to load group posts');
      }
    } catch (err) {
      console.error('Error loading group posts:', err);
      setError('Error loading group posts');
    }
  };

  const handleLike = async (postId, isLike) => {
    try {
      const response = await fetch('http://localhost:8080/likeDislikePost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          post_id: postId,
          is_like: isLike
        })
      });

      if (response.ok) {
        // Reload posts to get updated counts
        loadGroupPosts();
      }
    } catch (err) {
      console.error('Error liking/disliking post:', err);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include'
      });
      if (response.ok) {
        router.push('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Head>
          <title>Group Details - Social Network</title>
          <link rel="stylesheet" href="/css/style.css" />
        </Head>
        
        <div className="navbar">
          <div className="nav-container">
            <div className="nav-logo">
              <a href="/posts">SocialNet</a>
            </div>
            <div className="nav-menu">
              <a href="/posts" className="nav-link">Posts</a>
              <a href="/groups" className="nav-link">Groups</a>
              <a href="/myProfile" className="nav-link">Profile</a>
              <a href="/createPost" className="nav-link">Create Post</a>
              <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
            </div>
          </div>
        </div>

        <div className="container">
          <div className="error-message">{error}</div>
          <button onClick={() => router.push('/groups')} className="btn btn-secondary">
            Back to Groups
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{group?.title || 'Group Details'} - Social Network</title>
        <meta name="description" content="View group details and posts" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/css/style.css" />
      </Head>

      <div className="navbar">
        <div className="nav-container">
          <div className="nav-logo">
            <a href="/posts">SocialNet</a>
          </div>
          <div className="nav-menu">
            <a href="/posts" className="nav-link">Posts</a>
            <a href="/groups" className="nav-link">Groups</a>
            <a href="/myProfile" className="nav-link">Profile</a>
            <a href="/createPost" className="nav-link">Create Post</a>
            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        {group && (
          <div className="group-header">
            <h1>{group.title}</h1>
            <p className="group-description">{group.description}</p>
            <div className="group-info">
              <span>Created by: {group.creator}</span>
              <span>Members: {group.member_count}</span>
              <span>Created: {formatDate(group.created_at)}</span>
            </div>
            
            <div className="group-actions">
              <button 
                onClick={() => router.push(`/createGroupPost?groupId=${groupId}`)}
                className="btn btn-primary"
              >
                Create Post
              </button>
              <button 
                onClick={() => router.push('/groups')}
                className="btn btn-secondary"
              >
                Back to Groups
              </button>
            </div>
          </div>
        )}

        <div className="posts-section">
          <h2>Group Posts</h2>
          
          {posts.length === 0 ? (
            <div className="no-posts">
              <p>No posts in this group yet.</p>
              <button 
                onClick={() => router.push(`/createGroupPost?groupId=${groupId}`)}
                className="btn btn-primary"
              >
                Create the first post!
              </button>
            </div>
          ) : (
            <div className="posts-container">
              {posts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <strong>{post.firstname} {post.lastname}</strong>
                      <span className="username">@{post.username}</span>
                    </div>
                    <div className="post-date">{formatDate(post.created_at)}</div>
                  </div>
                  
                  <div className="post-content">
                    <h3>{post.title}</h3>
                    <p>{post.content}</p>
                    
                    {post.imgOrgif && (
                      <img 
                        src={post.imgOrgif} 
                        alt="Post image" 
                        className="post-image"
                      />
                    )}
                    
                    {post.categories && post.categories.length > 0 && (
                      <div className="post-categories">
                        {post.categories.map((category, index) => (
                          <span key={index} className="category-tag">
                            {category}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="post-actions">
                    <button 
                      onClick={() => handleLike(post.id, true)}
                      className={`like-btn ${post.user_reaction === 1 ? 'active' : ''}`}
                    >
                      👍 {post.like_count || 0}
                    </button>
                    <button 
                      onClick={() => handleLike(post.id, false)}
                      className={`dislike-btn ${post.user_reaction === 0 ? 'active' : ''}`}
                    >
                      👎 {post.dislike_count || 0}
                    </button>
                    <button 
                      onClick={() => router.push(`/comments?postId=${post.id}`)}
                      className="comment-btn"
                    >
                      💬 {post.comment_count || 0}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .group-header {
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 2rem;
        }
        
        .group-description {
          font-size: 1.1rem;
          margin: 1rem 0;
          color: #666;
        }
        
        .group-info {
          display: flex;
          gap: 2rem;
          margin: 1rem 0;
          font-size: 0.9rem;
          color: #888;
        }
        
        .group-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        
        .posts-section h2 {
          margin-bottom: 1rem;
        }
        
        .no-posts {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .post-card {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          margin-bottom: 1rem;
          padding: 1.5rem;
        }
        
        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #eee;
        }
        
        .post-author .username {
          color: #666;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }
        
        .post-date {
          color: #888;
          font-size: 0.8rem;
        }
        
        .post-content h3 {
          margin-bottom: 0.5rem;
          color: #333;
        }
        
        .post-image {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
          margin: 1rem 0;
        }
        
        .post-categories {
          margin: 1rem 0;
        }
        
        .category-tag {
          display: inline-block;
          background: #e3f2fd;
          color: #1976d2;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          margin-right: 0.5rem;
        }
        
        .post-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }
        
        .like-btn, .dislike-btn, .comment-btn {
          background: none;
          border: 1px solid #ddd;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }
        
        .like-btn:hover, .dislike-btn:hover, .comment-btn:hover {
          background: #f5f5f5;
        }
        
        .like-btn.active {
          background: #4caf50;
          color: white;
          border-color: #4caf50;
        }
        
        .dislike-btn.active {
          background: #f44336;
          color: white;
          border-color: #f44336;
        }
        
        .error-message {
          background: #ffebee;
          color: #c62828;
          padding: 1rem;
          border-radius: 4px;
          margin-bottom: 1rem;
        }
        
        .loading {
          text-align: center;
          padding: 3rem;
          font-size: 1.2rem;
        }
      `}</style>
    </>
  );
}