document.addEventListener('DOMContentLoaded', () => {
  const followButton = document.getElementById('followButton');
  if (!followButton) return; // no button found

//todo: get the username from url.
  let isFollowing = followButton.dataset.following === 'true';

  // Update the button text and styling based on follow state
  function updateButton() {
    followButton.textContent = isFollowing ? 'Unfollow' : 'Follow';
    followButton.classList.toggle('following', isFollowing);
  }

  // Send request to backend to follow or unfollow
  async function toggleFollow() {
    const url = `http://localhost:8080/follow/${profileId}`;
    const method = isFollowing ? 'DELETE' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      // Flip state and update UI
      isFollowing = !isFollowing;
      followButton.dataset.following = isFollowing;
      updateButton();
    } catch (err) {
      console.error('Failed to toggle follow status:', err);
      // Optionally show user feedback here
    }
  }

  // Attach click handler
  followButton.addEventListener('click', toggleFollow);

  // Initialize button on load
  updateButton();
});
