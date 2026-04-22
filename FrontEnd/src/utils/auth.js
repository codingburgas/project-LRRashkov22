const API_URL = "https://api-lecho.vanix.shop/api/Auth";

// ---------- HELPERS ----------

export function parseJwt(token) {
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

export function getIsDemoFromToken() {
    const token = localStorage.getItem("token");

    if (!token) return false;

    const payload = JSON.parse(atob(token.split('.')[1]));

    return payload.isDemo === "True" || payload.isDemo === "true";
}

export function getToken() {
    return localStorage.getItem("token");
}

export function getRole() {
    return localStorage.getItem("role");
}

export function isDemoUser() {
    return localStorage.getItem("isDemo") === "true";
}

export function isTokenExpired(token) {
    const claims = parseJwt(token);
    if (!claims || !claims.exp) return true;
    return Date.now() >= claims.exp * 1000;
}

export function saveAuth(data) {
    const token = data.accessToken;
    const payload = parseJwt(token) || {};

    const role =
        payload.role ||
        payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

    const userId =
        payload.nameid ||
        payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    const username =
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
    payload.unique_name ||
    payload.name ||
    "";
    const isDemo = payload.isDemo === "True" || payload.isDemo === "true";
    localStorage.setItem("username", username);
    localStorage.setItem("token", token);
    localStorage.setItem("role", role || "User");
    localStorage.setItem("userId", userId || "");
    localStorage.setItem("isDemo", isDemo);
}
export function getUsername() {
    return localStorage.getItem("username");
}
export function logout() {
    localStorage.clear();
    window.location.href = "/index.html";
}

// ---------- GUARDS ----------

export function requireAuth() {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        window.location.replace("/index.html");
    }
}

export function requireAdmin() {
    const role = getRole();
    if (role !== "Admin") {
        alert("Admin only");
        window.location.href = "/src/dashboard.html";
    }
}

export function requireUserOrAdmin() {
    const token = getToken();
    if (!token || isTokenExpired(token)) {
        logout();
        return;
    }
    const role = getRole();
    if (!role) {
        logout();
    }
}