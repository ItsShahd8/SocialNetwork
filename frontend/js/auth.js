const BASE_URL = "http://localhost:8080"; // Go backend URL

// REGISTER
document.getElementById("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        email: document.getElementById("reg-email").value,
        password: document.getElementById("reg-password").value,
        username: document.getElementById("reg-username").value,
        first_name: document.getElementById("reg-fname").value,
        last_name: document.getElementById("reg-lname").value,
        dob: document.getElementById("reg-dob").value,
        avatar_url: document.getElementById("reg-avatar")?.value || "",
        nickname: document.getElementById("reg-nickname")?.value || "",
        about_me: document.getElementById("reg-about")?.value || "",
    };

    try {
        const res = await fetch(`${BASE_URL}/api/register`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
       if (res.ok) {
  window.location.href = "/login.html";
} else {
  alert(data.message || "Registration failed.");
  console.error("❌ Registration failed:", data);
}
    } catch (err) {
        alert("Registration failed.");
        console.error(err);
    }
});

// LOGIN
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

  const identifier= document.getElementById("login-identifier").value;
  const password= document.getElementById("login-password").value;

    try {
        const res = await fetch(`${BASE_URL}/api/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ identifier, password }),
        });

        const data = await res.json();
        if (res.ok) {
            // alert("Login successful!");
            console.log(res)
            window.location.href = "/home.html";
        } else {
            alert(data.message || "Login failed.");
        }
    } catch (err) {
        alert("Login error.");
        console.error(err);
    }
});

// LOGOUT
document.getElementById("logout-btn")?.addEventListener("click", async () => {
    try {
        const res = await fetch(`${BASE_URL}/api/logout`, {
            method: "POST",
            credentials: "include",
        });

        const data = await res.json();
        // alert(data.message || "Logged out");
            console.log(res)
        window.location.href = "/index.html";
    } catch (err) {
        alert("Logout error.");
        console.error(err);
    }
});
