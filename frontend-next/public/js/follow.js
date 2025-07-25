// public/js/follow.js

(function () {
  const btn = document.getElementById('followButton');
  if (!btn) return;

  // Only update the profile's follower count
  const followersCountEl = document.getElementById('userFollowers');

  const profileId   = btn.dataset.profileId;
  let   isFollowing = btn.dataset.following === 'true';

  function updateButton() {
    btn.textContent = isFollowing ? 'Unfollow' : 'Follow';
    btn.classList.toggle('following', isFollowing);
  }

  function updateFollowersCount(delta) {
    if (!followersCountEl) return;
    const current = parseInt(followersCountEl.textContent, 10) || 0;
    followersCountEl.textContent = current + delta;
  }

  async function toggleFollow() {
    // Send requests directly to the Go backend
    const url    = `http://localhost:8080/api/users/${profileId}/follow`;
    const method = isFollowing ? 'DELETE' : 'POST';

    try {
      const res = await fetch(url, { method, credentials: 'include' });
      if (!res.ok) throw new Error(res.status);

      // Toggle state
      isFollowing = !isFollowing;
      btn.dataset.following = String(isFollowing);
      updateButton();

      // Adjust only the profile's follower count
      updateFollowersCount(isFollowing ? 1 : -1);
    } catch (e) {
      console.error('Toggle follow failed', e);
    }
  }

  btn.addEventListener('click', toggleFollow);
  updateButton();
})();
