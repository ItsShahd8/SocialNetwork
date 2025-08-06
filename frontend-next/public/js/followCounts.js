document.addEventListener('DOMContentLoaded', async () => {
  const followersEl = document.querySelector('#profilePageSection #userFollowers');
  const followingEl = document.querySelector('#profilePageSection #userFollowing');

  // Only run if you're on a page that needs this
  if (!followersEl && !followingEl) return;

  try {
    const res = await fetch('http://localhost:8080/api/follow/counts', {
      credentials: 'include'
    });
    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();

    if (followersEl) followersEl.innerHTML = data.followers;
    if (followingEl) followingEl.innerHTML = data.following;
  } catch (err) {
    console.error('Failed to load follow counts:', err);
  }
});
