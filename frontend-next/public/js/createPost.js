document.addEventListener('DOMContentLoaded', () => {
    const returnToPost = document.getElementById("return-to-post");
    const messageDiv = document.getElementById('message');
    const followersSelection = document.getElementById('followers-selection');
    const followersList = document.getElementById('followers-list');
    const createPostForm = document.getElementById('createPostForm');
    let followers = [];

    // Navigation handler
    if (returnToPost) {
        returnToPost.addEventListener('click', () => window.location.href = '/posts');
    }

    // Show/hide followers selection based on privacy level
    const privacyRadios = document.querySelectorAll('input[name="privacy_level"]');
    privacyRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            if (this.value === '2') { // Private posts
                followersSelection.style.display = 'block';
                loadFollowers();
            } else {
                followersSelection.style.display = 'none';
                followersList.innerHTML = '';
            }
        });
    });

    // Load user's followers for private post selection
    async function loadFollowers() {
        try {
            const response = await fetch('http://localhost:8080/api/followers', {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                followers = data.followers || [];
                displayFollowers();
            } else {
                console.error('Failed to load followers');
                showMessage('Failed to load followers', 'error');
            }
        } catch (error) {
            console.error('Error loading followers:', error);
            showMessage('Error loading followers', 'error');
        }
    }

    // Display followers as checkboxes
    function displayFollowers() {
        if (!followersList) return;

        if (followers.length === 0) {
            followersList.innerHTML = '<p>You have no followers yet.</p>';
            return;
        }

        followersList.innerHTML = followers.map(follower => `
            <div class="follower-item">
                <input type="checkbox" id="follower-${follower.id}" value="${follower.id}" name="selected_followers">
                <label for="follower-${follower.id}">${follower.username}</label>
            </div>
        `).join('');
    }

    // Show message
    function showMessage(text, type) {
        if (messageDiv) {
            messageDiv.textContent = text;
            messageDiv.className = `message ${type}`;
            messageDiv.style.display = 'block';
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        } else {
            console.log(`${type.toUpperCase()}: ${text}`);
        }
    }

    // Handle form submission using FormData
    if (createPostForm) {
        createPostForm.addEventListener('submit', function (event) {
            event.preventDefault();

            const title = document.getElementById('title').value.trim();
            const content = document.getElementById('content').value.trim();

            if (!title || !content) {
                showMessage('Title and content are required', 'error');
                return;
            }

            const selectedCategories = Array.from(
                document.querySelectorAll('input[name="category"]:checked')
            ).map(cb => cb.value);

            if (selectedCategories.length === 0) {
                showMessage('Please select at least one category', 'error');
                return;
            }

            const privacyLevel = document.querySelector('input[name="privacy_level"]:checked').value;

            let selectedFollowers = [];
            if (privacyLevel === "2") {
                selectedFollowers = Array.from(
                    document.querySelectorAll('input[name="selected_followers"]:checked')
                ).map(cb => cb.value);

                if (selectedFollowers.length === 0) {
                    showMessage('Please select at least one follower for private posts', 'error');
                    return;
                }
            }

            // Build FormData
            const formData = new FormData();
            formData.append("title", title);
            formData.append("content", content);
            formData.append("privacy_level", privacyLevel);

            const imgFile = createPostForm.imgOrgif.files[0];
            if (imgFile) {
                formData.append("imgOrgif", imgFile);
            }

            selectedCategories.forEach(cat => formData.append("category", cat));
            selectedFollowers.forEach(followerID => formData.append("selected_followers", followerID));

            // Submit using multipart/form-data
            fetch('http://localhost:8080/api/create-post', {
                method: 'POST',
                body: formData,
                credentials: 'include'
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        showMessage('Post created successfully!', 'success');
                        createPostForm.reset();
                        followersSelection.style.display = 'none';
                        followersList.innerHTML = '';

                        const socket = window.getSocket?.();
                        if (socket && socket.readyState === WebSocket.OPEN) {
                            socket.send(JSON.stringify({ type: "new_post" }));
                        }

                        setTimeout(() => window.location.href = '/', 1500);
                    } else {
                        showMessage(data.message || 'Failed to create post', 'error');
                    }
                })
                .catch(err => {
                    console.error(err);
                    showMessage('Error creating post. Please try again.', 'error');
                });
        });
    }
});
