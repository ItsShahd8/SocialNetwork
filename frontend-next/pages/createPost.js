import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';

export default function CreatePost() {
  const [followers, setFollowers] = useState([]);
  const [privacyLevel, setPrivacyLevel] = useState("0");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const titleRef = useRef();
  const contentRef = useRef();
  const formRef = useRef();

  useEffect(() => {
    console.log('Privacy level changed to:', privacyLevel);
    if (privacyLevel === "2") {
      loadFollowers();
    }
  }, [privacyLevel]);

  const loadFollowers = async () => {
    try {
      const response = await fetch('http://localhost:8080/get-followers', {
        method: 'GET',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Followers loaded:', data);
        setFollowers(data.followers || []);
      } else {
        showMessage('Failed to load followers', 'error');
      }
    } catch (err) {
      console.error(err);
      showMessage('Error loading followers', 'error');
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
      showMessage("Title and content are required", "error");
      return;
    }

    const categories = Array.from(
      formRef.current.querySelectorAll('input[name="category"]:checked')
    ).map(cb => cb.value);

    if (categories.length === 0) {
      showMessage("Please select at least one category", "error");
      return;
    }

    let selectedFollowers = [];
    if (privacyLevel === "2") {
      selectedFollowers = Array.from(
        formRef.current.querySelectorAll('input[name="selected_followers"]:checked')
      ).map(cb => cb.value);

      if (selectedFollowers.length === 0) {
        showMessage("Please select at least one follower", "error");
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    formData.append("privacy_level", privacyLevel);

    const imageFile = formRef.current.imgOrgif.files[0];
    if (imageFile) {
      formData.append("imgOrgif", imageFile);
    }

    categories.forEach(cat => formData.append("category", cat));
    selectedFollowers.forEach(followerId => formData.append("selected_followers", followerId));

    try {
      const res = await fetch("http://localhost:8080/create-post", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (data.success) {
        showMessage("Post created successfully!", "success");
        formRef.current.reset();
        setFollowers([]);
        setPrivacyLevel("0");

        const socket = window.getSocket?.();
        if (socket && socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: "new_post" }));
        }

        setTimeout(() => (window.history.back()), 1000);
      } else {
        showMessage(data.message || "Failed to create post", "error");
      }
    } catch (err) {
      console.error(err);
      showMessage("Error creating post. Please try again.", "error");
    }
  };


  return (
    <>
      <Head>
        <title>Create Post - Social Network</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/style.css" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script src="/js/session.js" defer></script>
        <script src="/js/socket.js" defer></script>
      </Head>
      <section id="show" >

        <div className="sidebar-post right-sidebar">
          <br />
          <button id="logoutButton" className="button-side" >Logout</button>
          <br />
          <button className="button-side" onClick={() => window.history.back()}>Return</button>
          <br />
          <button onClick={() => window.location.href = '/'} className="button-side">Main</button><br />
          <br />
          <ul id="userList"></ul>
        </div>

        <section className="chat-main" id="chat-main" hidden>

          <div className="chat-header">
            <h3 id="chatWithLabel">Chat</h3>
            <button id="closeChatButton" className="close-chat-button">x</button>
          </div>

          <div id="chatWindow" className="chat-window">
          </div>

          <form id="chatForm">
            <input type="text" id="chatInput" placeholder="Type a message..." required />
            <button type="submit" className="button-main">Send</button>
          </form>

        </section>
      </section>

      <section id="createPostSection">
        <button className="return-button" onClick={() => window.history.back()}>Return</button>
        <div className="container-create">
          <h1>Create a New Post</h1>

          {message && (
            <div className={`message ${messageType}`}>
              {message}
            </div>
          )}

          <form ref={formRef} onSubmit={handleSubmit}>
            <div className="form-section">
              <label htmlFor="title">Title:</label>
              <input type="text" id="title" name="title" ref={titleRef} required />
            </div>

            <div className="form-section">
              <label htmlFor="content">Content:</label>
              <textarea id="content" name="content" rows="6" ref={contentRef} required />
              <input
                type="file"
                id="imgOrgif"
                name="imgOrgif"
              />
            </div>

            <div className="form-section">
              <label>Category:</label>
              <div className="category-options">
                {["Nature", "Food", "Sport", "Travel"].map(cat => (
                  <label key={cat}>
                    <input type="checkbox" name="category" value={cat} />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label>Privacy:</label>
              <div className="privacy-options">
                <label>
                  <input
                    type="radio"
                    name="privacy_level"
                    value="0"
                    checked={privacyLevel === "0"}
                    onChange={e => setPrivacyLevel(e.target.value)}
                  />
                  Public
                </label>
                <label>
                  <input
                    type="radio"
                    name="privacy_level"
                    value="1"
                    checked={privacyLevel === "1"}
                    onChange={e => setPrivacyLevel(e.target.value)}
                  />
                  Followers Only
                </label>
                <label>
                  <input
                    type="radio"
                    name="privacy_level"
                    value="2"
                    checked={privacyLevel === "2"}
                    onChange={e => setPrivacyLevel(e.target.value)}
                  />
                  Selected Followers
                </label>
              </div>
            </div>

            {privacyLevel === "2" && (
              <div id="followers-selection">
                <label>Select Followers:</label>
                <div id="followers-list">
                  {followers.length === 0 ? (
                    <p>You have no followers yet.</p>
                  ) : (
                    followers.map(follower => (
                      <div key={follower.id} className="follower-item">
                        <input
                          type="checkbox"
                          id={`follower-${follower.id}`}
                          value={follower.id}
                          name="selected_followers"
                        />
                        <label htmlFor={`follower-${follower.id}`}>
                          {follower.username}
                        </label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            <input type="submit" value="Post it" className="button-create" />
          </form>
        </div>
      </section>
    </>
  );
}
