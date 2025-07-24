import Head from 'next/head';
import { useRouter } from 'next/navigation';
export default function Comments() {
  return (
    <>
      <Head>
        <title>Comments</title>
        <link rel="stylesheet" href="/css/style.css" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script src="/js/session.js" defer></script>
        <script src="/js/socket.js" defer></script>
        <script src="/js/comments.js" defer></script>
        <script src="/js/likes.js" defer></script>
        <script src="/js/chat.js" defer></script>
      </Head>
      <section id="show">

        <div className="sidebar-post right-sidebar">
          <br />
          <button id="logoutButton" className="button-side" onClick={() => logout()}>Logout</button>
          <br />
          <button onClick={() => window.history.back()} className="button-side" >Return</button>
          <br />
          <button onClick={() => window.location.href = '/'} className="button-side">Main</button>
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

          <form id="chatForm" encType="multipart/form-data">
            <input type="text" id="chatInput" placeholder="Type a message..." />
            <input
              type="file"
              id="imgOrgif"
              name="imgOrgif"
            /> 
            <button type="submit" className="button-main">Send</button>
          </form>

        </section>
      </section>

      <section id="commentsSection">
      </section>
    </>
  );
}