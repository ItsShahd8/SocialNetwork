import Head from 'next/head';
import { useEffect } from 'react';

export default function GroupDetails() {
  useEffect(() => {
    // Check session when component mounts
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = '/js/groupsDetails.js';
      script.onload = () => {
        console.log('Groups script loaded');
      };
      document.head.appendChild(script);

      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    }
  }, []);

  return (
    <>
      <Head>
        <title>Groups - Social Network</title>
        <meta name="description" content="Browse and join groups" />
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
            <a href="/groups" className="nav-link active">Groups</a>
            <a href="/myProfile" className="nav-link">Profile</a>
            <a href="/createPost" className="nav-link">Create Post</a>
            <button id="logout-btn" className="nav-link logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="groups-header">
          {/* //todo: change the title to groups title */}
          <h1>Group</h1>
          <button id="create-btn" className="btn btn-primary">Create</button>
        </div>

        {/* Create Event Modal */}
        <div id="create-event-modal" className="modal" style={{ display: 'none' }}>
          <div className="modal-content">
            <span className="close">&times;</span>
            <h2>Create New Event</h2>
            {/* //todo: do the event creation here */}
            <form id="create-event-form">
              <div className="form-group">
                <label htmlFor="event-title">Event Title:</label>
                <input type="text" id="event-title" name="title" required />
              </div>
              <div className="form-group">
                <label htmlFor="event-description">Description:</label>
                <textarea id="event-description" name="description" rows="4" required></textarea>
              </div>
              <div className="form-group">
                {/* //todo: add options (going / not going) + add fields for date/time */}
                <button type="submit" className="btn btn-primary">Create Event</button>
                <button type="button" className="btn btn-secondary" id="cancel-create">Cancel</button>
              </div>
            </form>
          </div>
        </div>

        {/* Groups Section */}
        <div className="groups-section">
          <div className="tabs">
            <button className="tab-button active" data-tab="all-posts">Posts</button>
            <button className="tab-button" data-tab="chat">Chat</button>
            <button className="tab-button" data-tab="events">Events</button>
          </div>

          <div id="all-posts" className="tab-content active">
            <h2>All Posts</h2>
            <div id="posts-list" className="groups-grid">
              {/* Groups will be loaded here */}
            </div>
          </div>

          <div id="chat" className="tab-content">
            <h2>Chat</h2>
            {/* <div id="user-groups-list" className="groups-grid">

            </div> */}
          </div>

          <div id="events" className="tab-content">
            <h2>Group Events</h2>
            <div id="events-list" className="events-list">
              {/* Invitations will be loaded here */}
            </div>
          </div>
        </div>

        {/*Group Chat */}
        <section className="chat-main" id="chat-main">



          <div id="chatWindow" className="chat-window">
          </div>

          <form id="chatForm">
            <input type="text" id="chatInput" placeholder="Type a message..." required />
            <button type="submit" className="button-main">Send</button>
          </form>

        </section>
      </div>
    </>
  );
}
