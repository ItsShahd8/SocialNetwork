import Head from 'next/head';

export default function AboutUs() {
  return (
    <>
      <Head>
        <title>About Us</title>
        <link rel="stylesheet" href="/css/style.css" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script src="/js/main.js" defer></script>
        <script src="/js/socket.js" defer></script>
        <script src="/js/session.js" defer></script>
        <script src="/js/chat.js" defer></script>
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
      <section id="aboutUsSection">
        <div className="container-about">
          <div className="box-about">
            <h2>About This Site</h2>
            <p>We are a group of 5 that created a site that does the following:</p>
            <h4>Technology Stack</h4>
            <p>We use <strong>SQLite</strong> to store data like users, posts, and comments.</p>
            <h4>Authentication</h4>
            <p>Users can register and log in, creating a session with cookies. Passwords are securely stored and
              checked against the database.</p>
            <h4>Communication Features</h4>
            <p>Only registered users can create posts and comments. Non-registered users can view posts.</p>
            <h4>Likes and Dislikes</h4>
            <p>Registered users can like/dislike posts and comments.</p>
            <h4>Filtering Options</h4>
            <p>Users can filter displayed posts by categories, created posts, and liked posts.</p>
            <h4>Containerization</h4>
            <p>We utilize <strong>Docker</strong> to manage our application environment.</p>
          </div>
        </div>
      </section>
    </>
  );
}