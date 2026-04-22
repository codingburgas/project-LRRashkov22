import { getToken } from "../utils/auth.js";

async function load() {
    const token = getToken();

    const res = await fetch("https://api-lecho.vanix.shop/api/categories/defaults-admin", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (!res.ok) {
        console.error("Not admin?");
        return;
    }

    const data = await res.json();

    const container = document.getElementById("list");
    container.innerHTML = "";

    data.forEach(c => {
        const div = document.createElement("div");

        div.className = "d-flex justify-content-between mb-2";

        div.innerHTML = `
            <div>${c.name} (${c.isIncome ? "Income" : "Expense"})</div>
            <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">X</button>
        `;

        container.appendChild(div);
    });
}

window.createCategory = async function () {
    const token = getToken();

    const name = document.getElementById("name").value;
    const type = document.getElementById("type").value;
    const budget = parseFloat(document.getElementById("budget").value) || 0;

    const res = await fetch("https://api-lecho.vanix.shop/api/categories/default", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            name: name,
            isIncome: type === "income",
            budgetLimit: budget
        })
    });

    if (!res.ok) {
        console.error(await res.text());
        return;
    }

    await load();
};

window.deleteCategory = async function (id) {
    const token = getToken();

    await fetch(`https://api-lecho.vanix.shop/api/categories/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    await load();
};

load();