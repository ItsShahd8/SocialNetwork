//  Comments.js - Handles loading and posting comments for a specific post
let thisPostId = 0; // Initialize thisPostId to 0

document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname === "/comments") {
        const interval = setInterval(() => {
            const section = document.getElementById("commentsSection");
            if (section) {
                clearInterval(interval); // stop checking
                const params = new URLSearchParams(window.location.search);
                const thisPostId = parseInt(params.get('post_id'));
                console.log("Loading comments for post:", thisPostId);
                loadCommentsForPost(thisPostId);
            }
        }, 100); // check every 100ms until the section is rendered
    }
});


function loadCommentsForPost(thisPostId) {
    fetch(`http://localhost:8080/comments?post_id=${thisPostId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
    })
        .then(response => {
            if (response.status === 404) {
                console.log(error);
                return;
            }
            if (!response.ok) {
                throw new Error('Failed to load comments');
            }
            return response.json();
        })
        .then(parsedResponse => {
            console.log(" Server Response:", parsedResponse);

            const commentsSection = document.getElementById("commentsSection");

            if (parsedResponse.error) {
                console.error(" Server Error:", parsedResponse.error);
                commentsSection.innerHTML = `<p>Error loading comments: ${parsedResponse.error}</p>`;
                return;
            }

            const post = parsedResponse.post;
            post.imgOrgif = post.imgOrgif ? `<img src="${post.imgOrgif}" alt="Post Image">` : '';
            const comments = parsedResponse.comments;

            commentsSection.innerHTML = `
        <div class="comment-post">
            <h2>${post.title}</h2>
            <p>${post.content}</p>
            ${post.imgOrgif}
            <small>Posted by <strong>${post.username}</strong> on ${post.createdAt} - ${post.categories.join(', ')} </small>
        </div>
        <div class="container-about">
            <h2>Comments</h2>
            <div id="commentsList"></div><br>
            <p id="errorMessage"></p>
            <form id="commentForm" encType="multipart/form-data">
                <textarea id="commentText" name="comment" placeholder="Write your comment here..."></textarea>
                <input
              type="file"
              id="imgOrgif"
              name="imgOrgif"
            /><br>
                <button id="sendCommentButton" class="button-main" type="submit">Post Comment</button>
            </form>
        </div>
    `;


            const commentsList = document.getElementById("commentsList");

            if (comments === undefined || comments === null) {
                commentsList.innerHTML = "<p>No comments available for this post.</p>";
            } else {
                comments.forEach(comment => {
                    console.log(" Loaded Comment ID:", comment.id);

                    let formattedDate = new Date(comment.created_at).toLocaleString();
                    const imgorgif = comment.imgOrgif ? `<img src="${comment.imgOrgif}" alt="Comment Image">` : '';
                    console.log(" Comment Image:", comment.imgOrgif);

                    commentsList.innerHTML += `
                <div id="comment-${comment.id}">
                    <p><strong>${comment.username}:</strong> ${comment.content}
                    <div class="post-image">
            ${imgorgif}
            </div>
                    <small>${formattedDate}</small></p>
                    <span class="material-icons" id="likeComment${comment.id}" onclick="likeDislikeComment(${comment.id}, true)"> thumb_up </span>
                    <span id="likesCountComment${comment.id}">0</span>
                    <span class="material-icons" id="dislikeComment${comment.id}" onclick="likeDislikeComment(${comment.id}, false)"> thumb_down </span>
                    <span id="dislikesCountComment${comment.id}">0</span>
                </div>
            `;

                    //  Fetch and update likes/dislikes for each comment
                    getInteractions(null, comment.id);
                });
            }


            // window.location.href=commentsSection, `/comment/${postId}`);

            if (document.getElementById("return-to-posts")) {
                document.getElementById("return-to-posts").addEventListener('click', () => {
                    window.location.href = `/posts`;
                });
            }

            document.getElementById('commentForm').addEventListener('submit', function (event) {
                event.preventDefault();  //  Prevent default form submission

                const form = event.target;
                const commentText = form.querySelector('#commentText').value.trim();
                const fileInput = form.querySelector('#imgOrgif');
                const errorMessage = document.getElementById("errorMessage");

                const hasText = commentText.length > 0;
                const hasImage = fileInput && fileInput.files.length > 0;

                // ✅ Validate: at least one of text or image is required
                if (!hasText && !hasImage) {
                    console.log(hasImage, hasText);
                    errorMessage.innerText = "Please write a comment or upload an image.";
                    errorMessage.style.color = "red";
                    return;
                }

                // Optional: validate image type and size
                if (hasImage) {
                    const file = fileInput.files[0];
                    const allowedTypes = ["image/png", "image/jpeg","image/jpg", "image/gif"];

                    console.log("Selected file type:", file.type);

                    if (!allowedTypes.includes(file.type)) {
                        errorMessage.innerText = "Only PNG, JPG, or GIF images are allowed.";
                        errorMessage.style.color = "red";
                        return;
                    }

                }

                const formData = new FormData(form);
                formData.append('post_id', thisPostId); // Add post_id to the form data

                console.log(" Form Data:", formData);


                fetch("http://localhost:8080/create-comment", {
                    method: 'POST',
                    credentials: 'include',
                    body: formData
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log("Server response:", data);

                        if (data.success) {
                            // Reset comment form
                            form.reset();
                            loadCommentsForPost(thisPostId); // Reload updated comments
                            // Optional: WebSocket notification here
                        } else {
                            const errM = document.getElementById("errorMessage");
                            if (errM) {
                                errM.innerHTML = `<p>Error: ${data.message || 'Something went wrong'}</p>`;
                                errM.style.color = "red";
                            } else {
                                console.error("Error message element not found in DOM.");
                            }
                            console.error("Error:", data.message);
                        }
                    })

                    .catch(err => {
                        console.error("Network or server error:", err);
                        const commentsSection = document.getElementById("commentsSection");
                        if (commentsSection) {
                            commentsSection.innerHTML = "<p style='color:red;'>Failed to submit comment. Please try again later.</p>";
                        }
                    });
            });
        })
        .catch(error => {
            console.error("Error fetching comments:", error);
            const commentsSection = document.getElementById("commentsSection");
            if (commentsSection) {
                commentsSection.innerHTML = `<p style='color:red;'>Error loading comments: ${error.message}</p>`;
            }

        });
}