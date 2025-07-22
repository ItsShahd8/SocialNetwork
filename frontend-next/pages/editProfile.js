import Head from 'next/head';

export default function EditProfile() {
  return (
    <>
      <Head>
        <title>Edit Profile</title>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="/css/style.css" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <script src="/js/edit.js" defer></script>
        <script src="/js/socket.js" defer></script>
        <script src="/js/session.js" defer></script>
        <script src="/js/chat.js" defer></script>
      </Head>

      <section id="show" >
        <div className="sidebar-post right-sidebar">
          <br />
          <button id="logoutButton" className="button-side">Logout</button>
          <br />
          <button className="button-side" onClick={() => window.location.href = '/myProfile'}>Return</button>
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

          <div id="chatWindow" className="chat-window"></div>

          <form id="chatForm">
            <input type="text" id="chatInput" placeholder="Type a message..." required />
            <button type="submit" className="button-main">Send</button>
          </form>
        </section>
      </section>

      <section id="editPageSection">
        <div className="container-main">
          <div className="profile-top">
            <button id='removeAvatar' onClick={()=> remove()}>X</button>
            <img
              src="/img/images.png"
              alt="Avatar"
              className="avatar-preview"
              id='avatar'
              style={{ width: '100px', height: '100px', borderRadius: '50%' }}
            />
          </div>

          <h2>Edit Profile</h2>
          <p id="editProfileMessage" className="message"></p>

          <form id="editProfileForm" encType="multipart/form-data">
            <p className="feedback-message" id="feedbackMessage"></p>

            {/* Avatar upload input without handling */}
            <div className="form-group">
              <label htmlFor="avatar">Profile Picture:</label>
              <input
                type="file"
                id="avatarInput"
                name="avatarInput"
                accept="image/*"
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Bio:</label>
              <textarea id="bio" name="bio"></textarea>

              <label htmlFor="username">Username:</label>
              <input type="text" id="username" name="username" />

              <label htmlFor="fname">First name:</label>
              <input type="text" id="fname" name="fname" />

              <label htmlFor="lname">Last name:</label>
              <input type="text" id="lname" name="lname" />

              <label htmlFor="age">Age:</label>
              <input type="number" id="age" name="age" min="1" max="120" />
            </div>

            <div className="form-group">
              <label htmlFor="gender">Gender:</label>
              <select id="gender" name="gender">
                <option value="" disabled>Select your gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>

              <label htmlFor="email">Email:</label>
              <input type="email" id="email" name="email" placeholder="example@gmail.com" />

              <label htmlFor="password">Password:</label>
              <input type="password" placeholder="Password" id="password" name="password" />
            </div>


            <div className="form-group">
              <label htmlFor="isPrivate">Profile Privacy:</label>
              <input
                type="checkbox"
                id="isPrivate"
                name="isPrivate"
              />
              <span>Private</span>
            </div>

            <button type="submit" className="button-main">Update Profile</button>
          </form>
        </div>
      </section>
    </>
  );
}
