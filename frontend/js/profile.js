async function loadProfile() {
      const res = await fetch("http://localhost:8080/api/profile/me", {
  credentials: "include",
});


      if (!res.ok) {
        document.getElementById("profile-info").innerText = "Please log in.";
        return;
      }

      const data = await res.json();
      document.getElementById("profile-info").innerHTML = `
        <p><strong>Username:</strong> ${data.username}</p>
        <p><strong>Full Name:</strong> ${data.first_name} ${data.last_name}</p>
        <p><strong>Nickname:</strong> ${data.username || "–"}</p>
        <p><strong>Bio:</strong> ${data.about_me || "–"}</p>
        <p><strong>Private Profile:</strong> ${data.is_private ? "Yes" : "No"}</p>
        <img src="${data.avatar_url || 'https://static.vecteezy.com/system/resources/previews/020/911/739/large_2x/user-profile-icon-profile-avatar-user-icon-male-icon-face-icon-profile-icon-free-png.png'}" width="100" />
      `;
    }

   