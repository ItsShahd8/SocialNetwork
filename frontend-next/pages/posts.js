import Head from 'next/head';

export default function Posts() {
  const handleCategoryClick = (value) => {
    const current = new URLSearchParams(window.location.search);
    current.set('category', value);
    window.location.search = current.toString();
  };

  return (
    <>
      <Head>
        <title>Posts</title>
        <link rel="stylesheet" href="/css/style.css" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script src="/js/session.js" defer></script>
        <script src="/js/posts.js" defer></script>
        <script src="/js/socket.js" defer></script>
        <script src="/js/likes.js" defer></script>
        <script src="/js/chat.js" defer></script>
      </Head>

      <section id="show" hidden>

        <div className="sidebar-post right-sidebar">
          <br />
          <button id="logoutButton" className="button-side" >Logout</button>
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
      <section id="postPageSection">
        <div className="sidebar-post left-sidebar">
          <br />
          <h2>Filter</h2>
          <br />
          <button className="button-side" onClick={() => toggleDropdown('categoryOptions')}>
            Categories
          </button>
          <div className="dropdown-post" id="categoryOptions">
            {['Travel', 'Sport', 'Food', 'Nature', 'Liked'].map((category) => (
              <button key={category} className="button-side" onClick={() => handleCategoryClick(category)}>
                {category}
              </button>
            ))}
          </div>
          <br />
          <button id="postsButton" className="button-side" onClick={() => window.history.pushState(null, '', '/posts')} >Posts</button><br />
          <button className="button-side" onClick={() => window.location.href = '/myProfile'}>Profile</button><br />
        </div>

        <div className="container-main">
          <button className="button-create" onClick={() => window.location.href = '/createPost'}>Create Post</button>
        </div>

        <div className="container-post">
          <div id="postsContainer"></div>
        </div>

      </section>
    </>
  );
}
