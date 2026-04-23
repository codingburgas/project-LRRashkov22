import { loginApi, registerApi } from "../api/authApi.js";
import { saveAuth } from "../utils/auth.js";

function setMessage(text, isError = true) {
  const message = document.getElementById("message");
  if (!message) return;

  message.innerText = text;
  message.className = isError
    ? "text-danger text-center"
    : "text-success text-center";
}

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

window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;

// ---------- LOGIN ----------

window.login = async function () {
  const username = document.getElementById("username")?.value?.trim();
  const password = document.getElementById("password")?.value;

  if (!username || !password) {
    setMessage("Enter username and password");
    return;
  }

  const res = await loginApi(username, password);

  if (!res.ok) {
    const err = await res.text();
    setMessage(err);
    return;
  }

  const data = await res.json();
  saveAuth(data);

  const role = localStorage.getItem("role");

  if (role === "Admin") {
    window.location.href = "/src/admin.html";
  } else {
    window.location.href = "/src/dashboard.html";
  }
};

// ---------- REGISTER ----------

window.registerUser = async function () {
  const username = document.getElementById("reg-username")?.value?.trim();
  const password = document.getElementById("reg-password")?.value;

  if (!username || !password) {
    setMessage("Enter username and password");
    return;
  }

  const res = await registerApi(username, password);

  if (res.ok) {
    setMessage("Registered successfully", false);
    showLoginForm();
  } else {
    const err = await res.text();
    setMessage(err);
  }
};
