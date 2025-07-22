import Head from 'next/head'
import Script from 'next/script'
import { useEffect, useState } from 'react'

// Fetch profile data and follow state on each request using dynamic route param
export async function getServerSideProps({ params, req }) {
  const { user } = params
  const cookie = req.headers.cookie || ''

  // 1) Fetch profile and counts from Go backend
  const profileRes = await fetch(
    `http://localhost:8080/get-otherPosts/${encodeURIComponent(user)}`,
    { headers: { cookie } }
  )
  if (!profileRes.ok) return { notFound: true }
  const { profile } = await profileRes.json()

  // 2) Check if the current user already follows this profile
  let isFollowing = false
  try {
    const followRes = await fetch(
      `http://localhost:8080/api/users/${profile.id}/isFollowing`,
      { headers: { cookie } }
    )
    if (followRes.ok) {
      const json = await followRes.json()
      isFollowing = json.isFollowing
    }
  } catch (err) {
    console.error('Error fetching follow state:', err)
  }

  return {
    props: { profile, isFollowing }
  }
}

export default function TheirProfile({ profile, isFollowing: initialFollow }) {
  const [isFollowing, setIsFollowing] = useState(initialFollow)

  // Push attributes and update button text on mount and state change
  useEffect(() => {
    const btn = document.getElementById('followButton')
    if (!btn) return
    btn.dataset.profileId  = profile.id
    btn.dataset.following  = String(isFollowing)
    btn.textContent = isFollowing ? 'Unfollow' : 'Follow'
  }, [profile.id, isFollowing])

  return (
    <>
      <Head>
        <title>{profile.username} – Profile</title>
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
      </Head>

      <Script src="/js/follow.js" strategy="afterInteractive" />
      <section id="show">

        <div className="sidebar-post right-sidebar">
          <button id="logoutButton" className="button-side" >Logout</button>
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

      <section id="theirProfilePageSection">
        <div className="profile-top">
          <img src="/css/logo.png" alt="Logo" />
          <div className="follow">
            <p id="profileUsername">{profile.username}</p>
            <p>Followers: <span id="userFollowers">{profile.followerCount}</span></p>
            <p>Following: <span id="userFollowing">{profile.followingCount}</span></p>
          </div>
        </div>

        <button
          id="followButton"
          className="button-main"
        >
          {initialFollow ? 'Unfollow' : 'Follow'}
        </button>

        <div>
          <p id="profileBio" className="bio">{profile.bio}</p>
        </div>

        <section id="postPageSection">
            
            <div className="container-theirProfilePost">
              <div id="postsContainer"></div>
            </div>
          </section>
      </section>
    </>
  )
}
