import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export default function CreateGroupPost() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const titleRef = useRef();
  const contentRef = useRef();
  const formRef = useRef();
  const router = useRouter();

  useEffect(() => {
    // Check session when component mounts
    checkSession();
    loadUserGroups();
    
    // Check if groupId is provided in query params
    if (router.query.groupId) {
      setSelectedGroup(router.query.groupId);
    }
  }, [router.query.groupId]);

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
    } catch (err) {
      console.error('Session check failed:', err);
      router.push('/login');
    }
  };

  const loadUserGroups = async () => {
    try {
      const response = await fetch('http://localhost:8080/get-user-groups', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('User groups loaded:', data);
        setGroups(data || []);
      } else {
        showMessage('Failed to load your groups', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Error loading groups', 'error');
    }
  };

  const showMessage = (text, type) => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const title = titleRef.current.value.trim();
    const content = contentRef.current.value.trim();

    if (!title || !content) {
      showMessage('Title and content are required', 'error');
      return;
    }

    if (!selectedGroup) {
      showMessage('Please select a group', 'error');
      return;
    }

    const formData = new FormData(formRef.current);
    formData.append('group_id', selectedGroup);

    try {
      const response = await fetch('http://localhost:8080/create-group-post', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        showMessage('Group post created successfully!', 'success');
        
        // Clear form
        formRef.current.reset();
        setSelectedGroup("");
        
        // Redirect to group after a short delay
        setTimeout(() => {
          router.push(`/groupDetails?id=${selectedGroup}`);
        }, 2000);
      } else {
        const errorText = await response.text();
        showMessage(errorText || 'Failed to create group post', 'error');
      }
    } catch (err) {
      console.error('Error creating group post:', err);
      showMessage('Network error occurred', 'error');
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

  return (
    <>
      <Head>
        <title>Create Group Post - Social Network</title>
        <meta name="description" content="Create a new post in your group" />
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
            <a href="/createGroupPost" className="nav-link active">Group Post</a>
            <button onClick={handleLogout} className="nav-link logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="create-post-container">
          <h1>Create Group Post</h1>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="create-post-form">
            <div className="form-group">
              <label htmlFor="group-select">Select Group:</label>
              <select 
                id="group-select"
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="form-control"
                required
              >
                <option value="">Choose a group...</option>
                {groups.map(group => (
                  <option key={group.id} value={group.id}>
                    {group.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                name="title"
                ref={titleRef}
                className="form-control"
                placeholder="Enter post title..."
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content:</label>
              <textarea
                id="content"
                name="content"
                ref={contentRef}
                className="form-control"
                rows="6"
                placeholder="What's on your mind?"
                required
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="imgOrgif">Image (optional):</label>
              <input
                type="file"
                id="imgOrgif"
                name="imgOrgif"
                className="form-control"
                accept=".jpg,.jpeg,.png,.gif"
              />
            </div>

            <div className="form-group">
              <label>Categories:</label>
              <div className="categories-grid">
                <label className="category-item">
                  <input type="checkbox" name="category" value="Technology" />
                  Technology
                </label>
                <label className="category-item">
                  <input type="checkbox" name="category" value="Sports" />
                  Sports
                </label>
                <label className="category-item">
                  <input type="checkbox" name="category" value="Music" />
                  Music
                </label>
                <label className="category-item">
                  <input type="checkbox" name="category" value="Art" />
                  Art
                </label>
                <label className="category-item">
                  <input type="checkbox" name="category" value="Food" />
                  Food
                </label>
                <label className="category-item">
                  <input type="checkbox" name="category" value="Travel" />
                  Travel
                </label>
                <label className="category-item">
                  <input type="checkbox" name="category" value="Gaming" />
                  Gaming
                </label>
                <label className="category-item">
                  <input type="checkbox" name="category" value="Movies" />
                  Movies
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                Create Group Post
              </button>
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => router.push('/groups')}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}