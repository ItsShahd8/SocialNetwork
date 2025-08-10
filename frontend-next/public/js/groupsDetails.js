// Groups functionality
function initializeGroupsPage() {
    // Check session on page load
    checkSession();
    //get the groups name from the id in the url
    const urlParams = new URLSearchParams(window.location.search);
    const groupId = urlParams.get('id');
    setupGroupName(groupId);
    setupTabs();
    setupModal();
    setupGroupChat();
    setupGroupPosts();
    setupGroupEvents();
    setupCreateEventForm()
    setupLogout();
}

// Initialize when DOM is ready or immediately if already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGroupsPage);
} else {
    // DOM is already loaded
    initializeGroupsPage();
}

// Global variable to store current user info
let currentUser = null;

function checkSession() {
    fetch('http://localhost:8080/check-session', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (!data.loggedIn) {
                window.location.href = '/login';
                return;
            }
            console.log('User logged in:', data.username);
            // Store current user info globally
            currentUser = {
                id: data.userID,
                username: data.username
            };
        })
        .catch(error => {
            console.error('Session check failed:', error);
            window.location.href = '/login';
        });
}

function setupGroupName(groupId) {
    // Fetch group details using the groupId
    fetch(`http://localhost:8080/group-details/${groupId}`, {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log('Group details:', data);
            
            if (data.group) {
                const groupName = data.group.title || 'Group';
                document.querySelector('.groups-header h1').textContent = groupName;
            } else {
                console.error('Failed to fetch group details:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching group details:', error);
        });
}

function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {

            const targetTab = button.getAttribute('data-tab');

            // Remove active class from all tabs and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

function setupModal() {
    const modal = document.getElementById('create-event-modal');
    const createBtn = document.getElementById('create-btn');
    const closeBtn = document.querySelector('.close');
    const cancelBtn = document.getElementById('cancel-create');

    console.log('Modal elements:', { modal, createBtn, closeBtn, cancelBtn });

    if (createBtn) {
        createBtn.addEventListener('click', () => {
            console.log('Create button clicked');
            if (createBtn.innerHTML === 'Create Event') {
                if (modal) {
                    modal.style.display = 'block';
                }
            } else if (createBtn.innerHTML === 'Create Post') {
                //todo: open or go to create post
            }

        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function setupCreateEventForm() {
    const form = document.getElementById('create-event-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const title = document.getElementById('Event-title').value.trim();
        const description = document.getElementById('event-description').value.trim();

        if (!title || !description) {
            alert('Please fill in all fields');
            return;
        }

        const groupData = {
            title: title,
            description: description
        };

        //todo: crete-event endpoint not done yet in backend
        fetch('http://localhost:8080/create-event', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(groupData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Event created successfully!');
                    document.getElementById('create-event-modal').style.display = 'none';
                    form.reset();
                } else {
                    alert('Error creating event: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error creating event:', error);
                alert('Error creating event');
            });
    });
}

function loadUserGroups() {
    fetch('http://localhost:8080/get-user-groups', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(groups => {
            displayGroups(groups, 'user-groups-list');
        })
        .catch(error => {
            console.error('Error loading user groups:', error);
        });
}

function setupGroupChat() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const createBtn = document.getElementById('create-btn');
    const chatMain = document.getElementById('chat-main');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            // Show chat section only if "chat" tab is selected
            if (targetTab === 'chat') {
                createBtn.style.display = 'none';
                chatMain.style.display = 'block';
            } else {
                createBtn.style.display = 'block';
                chatMain.style.display = 'none';
            }
        });
    });

    //todo: get all users in the group and display them in the chat section
    //todo: implement real-time chat functionality
}

function setupGroupPosts() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const createBtn = document.getElementById('create-btn');
    const postsList = document.getElementById('posts-list');

    const urlParams = new URLSearchParams(window.location.search);
    const groupId = parseInt(urlParams.get('id'));

    async function loadPosts() {
        try {
            const res = await fetch(`http://localhost:8080/group/posts?group_id=${groupId}`, { credentials: 'include' });
            if (!res.ok) throw new Error('failed to load posts');
            const posts = await res.json();
            postsList.innerHTML = '';
            if (!posts || posts.length === 0) {
                postsList.innerHTML = '<p>No posts yet.</p>';
                return;
            }
            posts.forEach(post => {
                const el = document.createElement('div');
                el.className = 'post-card';
                const imageHtml = post.imgOrgif ? `<img src="${post.imgOrgif}" alt="Post Image" class="post-image"/>` : '';
                el.innerHTML = `
                    <div class="comment-post">
                        <h2>${post.title}</h2>
                        <p>${post.content}</p>
                        ${imageHtml}
                        <small>By <strong>${post.username}</strong> on ${post.createdAt}</small>
                        <div class="post-actions">
                            <button class="btn btn-secondary comment-toggle" data-post-id="${post.id}">Comment</button>
                        </div>
                        <div class="comment-form" id="comment-form-${post.id}" style="display:none; margin-top:8px;">
                            <input type="text" class="comment-input" id="comment-input-${post.id}" placeholder="Write a comment..." />
                            <button class="btn btn-primary" data-post-id="${post.id}">Send</button>
                        </div>
                    </div>
                `;
                postsList.appendChild(el);
            });

            // wire comment buttons
            postsList.querySelectorAll('.comment-toggle').forEach(btn => {
                btn.addEventListener('click', () => {
                    const pid = btn.dataset.postId;
                    const frm = document.getElementById(`comment-form-${pid}`);
                    frm.style.display = frm.style.display === 'none' ? 'block' : 'none';
                });
            });
            postsList.querySelectorAll('.comment-form .btn.btn-primary').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const pid = parseInt(btn.getAttribute('data-post-id'));
                    const input = document.getElementById(`comment-input-${pid}`);
                    const content = input.value.trim();
                    if (!content) { alert('Please write a comment'); return; }
                    const res = await fetch('http://localhost:8080/group/create-comment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ post_id: pid, content })
                    });
                    const data = await res.json();
                    if (data.success) {
                        input.value = '';
                        alert('Comment posted');
                    } else {
                        alert(data.message || 'Failed to create comment');
                    }
                });
            });
        } catch (e) {
            console.error(e);
            postsList.innerHTML = '<p>Error loading posts.</p>';
        }
    }

    // initial load
    loadPosts();

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            if (targetTab === 'all-posts') {
                createBtn.innerHTML = 'Create Post';
            }
        });
    });

    // clicking create opens inline modal to create a post
    createBtn.addEventListener('click', async () => {
        if (createBtn.innerHTML !== 'Create Post') return;
        const title = prompt('Title');
        if (!title) return;
        const content = prompt('Content');
        if (!content) return;
        const categoriesInput = prompt('Categories (comma separated)');
        const categories = categoriesInput ? categoriesInput.split(',').map(s => s.trim()).filter(Boolean) : [];

        const res = await fetch('http://localhost:8080/group/create-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ group_id: groupId, title, content, categories })
        });
        const data = await res.json();
        if (data.success) {
            alert('Post created successfully!');
            loadPosts();
        } else {
            alert('Failed to create post');
        }
    });
}

function setupGroupEvents() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const createBtn = document.getElementById('create-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            // Show chat section only if "chat" tab is selected
            if (targetTab === 'events') {
                createBtn.innerHTML = 'Create Event';
            }
        });
    });
}

// Logout functionality
function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function () {
            fetch('http://localhost:8080/logout', {
                method: 'POST',
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    console.log(data.message);
                    window.location.href = '/'; // Redirect to main page instead of login
                })
                .catch(error => console.log(error));
        });
    }
}
