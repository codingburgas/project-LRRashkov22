import './style.css'


const API_URL = "https://localhost:7095/api/Auth";

window.login = async function () {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username,
      password
    })
  });

  if (res.ok) {
    const data = await res.json();

localStorage.setItem("token", data.accessToken);

    localStorage.setItem("token", token);

    console.log("TOKEN:", token);

    document.getElementById("message").innerText = "Logged in!";
  } else {
    document.getElementById("message").innerText = "Login failed";
  }
};

window.testAuth = async function () {
  const token = localStorage.getItem("token");

  const res = await fetch("https://localhost:7095/api/Auth", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const text = await res.text();
  console.log(text);
};



window.login = async function () {
  const res = await fetch("https://localhost:7095/api/Auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  });

  const messageEl = document.getElementById("message");

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem("token", data.accessToken);

    messageEl.innerText = "Login successful";
  } else {
    const errorText = await res.text();

    messageEl.innerText = `${errorText}`;
    console.log("STATUS:", res.status);
  }
};