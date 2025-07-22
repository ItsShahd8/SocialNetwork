let currentusername = '';
let counter = 0;

console.log(" Current pathname:", window.location.pathname);

function checkSession() {
    return fetch('http://localhost:8080/check-session', {
        method: 'GET',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log("SESSION CHECK RESPONSE:", data);
            userID = data.userID;
            window.userID = userID;
            
            connectWebSocket(userID);
            const show = document.getElementById('show');
            const signUpButton = document.getElementById('signUpButton');
            const logInButton = document.getElementById('logInButton');
            const postsButton = document.getElementById('postsButton');
            const groupsButton = document.getElementById('groupsButton');
            const logoutButton = document.getElementById('logoutButton');

            if (data.loggedIn && typeof data.userID !== "undefined") {
                console.log(" User is logged in:", data.userID);
                localStorage.setItem('username', data.username);
                currentusername = data.username;
                
                if (window.location.pathname === "/index" || window.location.pathname === "/") {
                    if (signUpButton) signUpButton.style.display = "none";
                    if (logInButton) logInButton.style.display = "none";
                }
                if(show) show.hidden = false;
                if (postsButton) postsButton.style.display = "inline-block";
                if (groupsButton) groupsButton.style.display = "inline-block";
                if (logoutButton) {logoutButton.style.display = "inline-block";
                    logoutButton.addEventListener('click', logout);
                }

            } else {
                console.log(" User is not logged in.");

                if (window.location.pathname === "/index" || window.location.pathname === "/") {
                    if (signUpButton) signUpButton.style.display = "inline-block";
                    if (logInButton) logInButton.style.display = "inline-block";
                }

                if (logoutButton) logoutButton.style.display = "none";
                if (postsButton) postsButton.style.display = "none";
                if (groupsButton) groupsButton.style.display = "none";
                if(show) show.hidden = true;
                if (
                    window.location.pathname !== "/index" &&
                    window.location.pathname !== "/" &&
                    window.location.pathname !== "/login"&&
                    window.location.pathname !== "/signUp" &&
                     window.location.pathname !== "/aboutUs"
                ) {
                    window.location.href = '/'; // Redirect to main page
                }
            }
        })
        .catch(error => console.log(error));
}


function logout() {
    fetch('http://localhost:8080/logout', {
        method: 'POST',
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            // disconnectWeb();
            checkSession(); // Refresh UI
            localStorage.removeItem('username');
            window.location.href = '/'; // Redirect to main page
        })
        .catch(error => console.log(error));

}

function mycurrentUsername() {
    console.log("Sending username:", currentusername);
    return currentusername;
}

checkSession();
window.checkSession = checkSession;
window.mycurrentUsername = mycurrentUsername;
