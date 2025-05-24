// Registration
document.getElementById("register-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            email: document.getElementById("reg-email").value,
            username: document.getElementById("reg-username").value,
            password: document.getElementById("reg-password").value,
            first_name: document.getElementById("reg-fname").value,
            last_name: document.getElementById("reg-lname").value,
            dob: document.getElementById("reg-dob").value,
        }),
    });
    const data = await res.json();
    alert(data.message || "Registered");
});

// Login
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
            emailOruser: document.getElementById("login-emailOruser").value,
            password: document.getElementById("login-password").value,
        }),
    });
    const data = await res.json();
    alert(data.message || "Logged in");
});

// Logout
document.getElementById("logout-btn")?.addEventListener("click", async () => {
    const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
    });
    const data = await res.json();
    alert(data.message || "Logged out");
});