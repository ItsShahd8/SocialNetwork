const returnToPost = document.getElementById("return-to-post");
if (returnToPost) returnToPost.addEventListener('click', () => window.location.href = '/posts');
// Create form submission
const createPostForm = document.getElementById('createPostForm');

//Create form
if (createPostForm) {
    createPostForm.addEventListener('submit', e => {
        e.preventDefault();
        const form = document.getElementById('createPostForm');
        const data = new FormData(form);

        fetch('http://localhost:8080/create-post', {
            method: 'POST',
            credentials: 'include',
            body: data
        })
            .then(response => response.json())
            .then(data => {
                console.log(data.success ? "Post created successfully!" : "Error: " + data.message);
                if (data.success) createPostForm.reset();
                const socket = window.getSocket?.();
                if (socket && socket.readyState === WebSocket.OPEN) {
                    socket.send(JSON.stringify({ type: "new_post" }));
                    // socket.send(JSON.stringify({ from: userID, type: "notif" }));
                }
                window.location.href = '/posts';
            })
            .catch(error => console.log(error));
    });
}
