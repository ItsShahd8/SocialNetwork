const editProfileForm = document.getElementById('editProfileForm');
const editProfileMessage = document.getElementById('editProfileMessage');
// const username = localStorage.getItem('username') || ''; // Replace with actual username retrieval logic

function submitProfile(username) {
    const form = document.getElementById('editProfileForm');
    const formData = new FormData(form);

    fetch(`http://localhost:8080/editPost/${username}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
    })
        .then(async res => {
            const ct = res.headers.get('Content-Type') || '';
            if (!res.ok && ct.includes('application/json')) {
                const { message } = await res.json();
                throw new Error(message);
            } else if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            // 2xx:
            return res.json();
        })
        .then(res => {
            if (!res.success) {
                throw new Error(res.message || 'Update failed');
            }
            editProfileMessage.textContent = 'Profile updated successfully!';
            editProfileMessage.className = 'message success';
            window.location.href = '/editProfile';  // Redirect to the same page to refresh the profile data
        })
        .catch(err => {
            editProfileMessage.textContent = 'Error updating profile: ' + err.message;
            editProfileMessage.className = 'message error';
        });
}



function fetchUserProfile(username) {
    fetch("http://localhost:8080/editGet/" + username, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch profile data');
            }
            return response.json();
        })
        .then(profile => {
            document.getElementById('username').value = profile.username || '';
            document.getElementById('bio').value = profile.bio || '';
            document.getElementById('fname').value = profile.fname || '';
            document.getElementById('lname').value = profile.lname || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('gender').value = profile.gender || '';
            document.getElementById('email').value = profile.email || '';
            document.getElementById('age').value = profile.age || '';
            document.getElementById('avatar').src = profile.avatar || '/img/avatars/images.png'; 
            document.getElementById('isPrivate').value = profile.isPrivate || false;
            console.log("Profile data fetched successfully:", profile);
        })
        .catch(error => {
            editProfileMessage.textContent = 'Error fetching profile data: ' + error.message;
            editProfileMessage.className = 'message error';
        });
}


document.addEventListener('DOMContentLoaded', () => {
    checkSession().then(() => {
        const username = mycurrentUsername();
        console.log("Current username after session check:", username);
        fetchUserProfile(username);

        editProfileForm.addEventListener('submit', (event) => {
            event.preventDefault();
            submitProfile(username);
        });
    });
});

//todo: reset to avatar:
function remove() {
    // 1. Reset UI
    const avatar = document.getElementById('avatar');
    avatar.src = '/img/images.png';
    document.getElementById('avatarInput').value = '';
    console.log("Avatar reset in UI");

    // 2. Build FormData with a special flag
    const formData = new FormData();
    formData.append('resetAvatar', 'true');
    // (if you have other profile fields you’re submitting, append them here too)

    // 3. POST to your edit endpoint
    fetch(`http://localhost:8080/editPost/` + mycurrentUsername(), {
        method: 'POST',
        credentials: 'include',
        body: formData
    })
        .then(async res => {
            const ct = res.headers.get('Content-Type') || '';
            if (!res.ok && ct.includes('application/json')) {
                const { message } = await res.json();
                throw new Error(message);
            } else if (!res.ok) {
                const text = await res.text();
                throw new Error(text);
            }
            return res.json();
        })
        .then(res => {
            if (!res.success) throw new Error(res.message || 'Update failed');
            console.log("Avatar reset successfully:", res);
            editProfileMessage.textContent = 'Avatar removed successfully!';

        })
        .catch(err => {
            editProfileMessage.textContent = 'Error updating profile: ' + err.message;
            editProfileMessage.className = 'message error';
        });
}
