import Head from 'next/head';

export default function MyProfile() {


  return (
    <>
      <Head>
        <title>Welcome Page</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/style.css" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script src="/js/session.js" defer></script>
        <script src="/js/socket.js" defer></script>
        <script src="/js/posts.js" defer></script>
        <script src="/js/likes.js" defer></script>
        <script src="/js/comments.js" defer></script>
        <script src="/js/chat.js" defer></script>
        <script src="/js/followCounts.js" defer></script>
      </Head>

      <section id="show">

        <div className="sidebar-post right-sidebar">
          <button id="logoutButton" className="button-side" >Logout</button>
          <br />
          <button className="button-side" onClick={() => window.location.href = '/posts'}>Return</button>
          <br />
          <button onClick={() => window.location.href = '/'} className="button-side">Main</button><br />
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

      <section id="profilePageSection">
        <div className="container-main">
          <div className="profile-top">
            <img
              src="/img/avatars/images.png"
              alt= "Avatar"
              className="avatar-preview"
              id='avatar'
            />
            <div className="follow">
              <p id="myProfileUsername">Username</p>
              <p>Followers: <span id="userFollowers">0</span></p>
              <p>Following: <span id="userFollowing">0</span></p>
            </div>
          </div>

          <button id="editProfileButton" onClick={() => window.location.href = '/editProfile'} className="button-main">
            Edit Profile
          </button>

          <div>
            <p id="profileBio" className="bio"></p>
          </div>

          <section id="postPageSection">
            <button className="button-create" onClick={() => window.location.href = '/createPost'}>Create Post</button>
            <div className="container-profilePost">
            </div>
          </section>
        </div>
      </section>
    </>
  );
}
