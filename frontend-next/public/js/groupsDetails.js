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

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            // Show chat section only if "chat" tab is selected
            if (targetTab === 'all-posts') {
                createBtn.innerHTML = 'Create Post';
            }
        });
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
