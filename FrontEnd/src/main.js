const API_URL = "https://localhost:7095/api/Auth";

// ---------- HELPERS ----------

function parseJwt(token) {
    try {
        const payload = token.split('.')[1];
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(Array.prototype.map.call(decoded, c => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')));
    } catch {
        return null;
    }
}

function getToken() {
    return localStorage.getItem("token");
}

function getTokenExpiry(token) {
    const claims = parseJwt(token);
    if (!claims || !claims.exp) return null;
    return new Date(claims.exp * 1000);
}

function isTokenExpired(token) {
    const expiry = getTokenExpiry(token);
    if (!expiry) return true;
    return Date.now() >= expiry.getTime();
}

function getRole() {
    return localStorage.getItem("role");
}

function setMessage(text, isError = true) {
    const message = document.getElementById("message");
    if (!message) return;
    message.innerText = text;
    message.className = isError ? "text-danger text-center" : "text-success text-center";
}

function saveAuth(data) {
    const token = data.accessToken;
    const payload = parseJwt(token) || {};

    const role =
        payload.role ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/roles"];

    const userId =
        payload.nameid ||
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        payload.sub;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role || "User");
    localStorage.setItem("userId", userId || "");
}

function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

window.logout = logout;

function showLoginForm() {
    const loginPanel = document.getElementById("login-form");
    const regPanel = document.getElementById("register-form");
    if (!loginPanel || !regPanel) return;
    loginPanel.classList.remove("d-none");
    regPanel.classList.add("d-none");
    setMessage("");
}

function showRegisterForm() {
    const loginPanel = document.getElementById("login-form");
    const regPanel = document.getElementById("register-form");
    if (!loginPanel || !regPanel) return;
    loginPanel.classList.add("d-none");
    regPanel.classList.remove("d-none");
    setMessage("");
}

window.registerUser = async function () {
    const username = document.getElementById("reg-username")?.value?.trim();
    const password = document.getElementById("reg-password")?.value || "";

    if (!username || !password) {
        setMessage("Please provide username and password.");
        return;
    }

    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        setMessage("Registered successfully. Please login.", false);
        showLoginForm();
    } else {
        const err = await res.text();
        setMessage(err || "Registration failed.");
    }
};

window.login = async function () {
    const username = document.getElementById("username")?.value?.trim();
    const password = document.getElementById("password")?.value || "";

    if (!username || !password) {
        setMessage("Please enter username and password.");
        return;
    }

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (res.ok) {
        const data = await res.json();
        saveAuth(data);

        setMessage("Login successful.", false);

        const role = (getRole() || "").trim().toLowerCase();
        console.log("Logged user role:", role);

        if (role === "admin") {
            window.location.replace("/src/admin.html");
            return;
        }

        window.location.replace("/src/dashboard.html");
    } else {
        const err = await res.text();
        setMessage(err || "Login failed.");
    }
};

// ---------- GUARDS ----------

window.requireAuth = function () {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        window.location.replace("/src/index.html");
        return;
    }
};

window.requireAdmin = function () {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        logout();
        return;
    }
    const role = getRole();
    if (role !== "Admin") {
        alert("Admin only");
        window.location.href = "./src/dashboard.html";
    }
};

window.requireUserOrAdmin = function () {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        logout();
        return;
    }
    const role = getRole();
    if (!role) {
        logout();
    }
};