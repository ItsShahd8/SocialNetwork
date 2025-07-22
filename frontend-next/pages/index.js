import Head from 'next/head';

export default function MainPage() {
  return (
    <>
      <Head>
        <title>Main Page</title>
        <link rel="stylesheet" href="/css/style.css" />
        <script src="/js/socket.js" defer></script>
        <script src="/js/main.js" defer></script>
        <script src="/js/session.js" defer></script>
        <script src="/js/chat.js" defer></script>
      </Head>
      <section id="show">

        <div className="sidebar-post right-sidebar">
          <br />
          <button id="logoutButton" className="button-side" >Logout</button>
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
      <section id="mainSection">
        <div className="container-main">
          <div className="profile-top">
            <img src="/css/logo.png" alt="Logo" />
          </div>
          <div>
            <button id="signUpButton" className="button-main" onClick={() => window.location.href = '/signUp'}>Sign Up</button>
            <button id="logInButton" className="button-main" onClick={() => window.location.href = '/login'}>Log In</button>
            <button id="postsButton" className="button-main" onClick={() => window.location.href = '/posts'}>Posts</button>
            <button id="groupsButton" className="button-main" onClick={() => window.location.href = '/groups'}>Groups</button>
          </div>
        </div>
      </section>
    </>
  );
}