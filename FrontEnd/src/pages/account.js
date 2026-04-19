import { getToken } from "../utils/auth.js";

let pieChart;
let lineChart;
let selectedAccountId = null;

function getAccountTypeName(type) {
    switch (type) {
        case 0: return "Credit Card";
        case 1: return "Debit Card";
        case 2: return "Bank";
        case 3: return "Investment";
        case 4: return "Wallet";
        default: return "Unknown";
    }
}

window.openAddAccount = function () {
    new bootstrap.Modal(document.getElementById('accountModal')).show();
};

window.submitAccount = async function () {
    const token = getToken();

    const name = document.getElementById("account-name").value;
    const type = parseInt(document.getElementById("account-type").value);

    if (!name) {
        alert("Name required");
        return;
    }

    const res = await fetch("https://localhost:7095/api/account", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            name: name,
            accountType: type,
            balance: 0 
        })
    });

    if (!res.ok) {
        alert("Error");
        return;
    }

    bootstrap.Modal.getInstance(document.getElementById('accountModal')).hide();

    loadAccounts();
};


function renderPieChart(accounts) {
    const ctx = document.getElementById("accountsPieChart");

    const labels = accounts.map(a => a.name);
    const data = accounts.map(a => a.balance);

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(ctx, {
        type: "pie",
        data: {
            labels: labels,
            datasets: [{
                data: data
            }]
        }
    });
}

async function loadAccountChart(accountId, accountName) {
    const token = getToken();

    const res = await fetch("https://localhost:7095/api/transaction", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (!res.ok) return;

    const data = await res.json();

    const filtered = data
        .filter(t => t.accountId === accountId)
        .sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
        if (filtered.length === 0) {
            renderLineChart([], [], accountName);
            return;
        }
    let balance = 0;

    const labels = [];
    const balances = [];

    filtered.forEach(t => {
        balance += t.isIncome ? t.amount : -t.amount;

        labels.push(new Date(t.transactionDate).toLocaleDateString());
        balances.push(balance);
    });

    renderLineChart(labels, balances, accountName);
}
function renderLineChart(labels, data, accountName) {
    const ctx = document.getElementById("accountLineChart");

    document.getElementById("account-chart-title").innerText =
        `Account ${accountName} Overview`;

    if (lineChart) lineChart.destroy();

    lineChart = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [{
                data: data,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            plugins: {
                legend: { display: false }
            }
        }
    });
}
async function loadAccounts() {
    const token = getToken();

    const res = await fetch("https://localhost:7095/api/account", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (!res.ok) return;

    const data = await res.json();

    const table = document.getElementById("accounts-table");
    table.innerHTML = "";

    data.forEach(a => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${a.name}</td>
            <td>${a.balance}</td>
            <td>${getAccountTypeName(a.accountType)}</td>
        `;

        tr.style.cursor = "pointer";
        tr.onclick = () => {
            selectedAccountId = a.id;
             document.querySelectorAll("#accounts-table tr")
            .forEach(r => r.classList.remove("table-active"));

        tr.classList.add("table-active");
            loadAccountChart(a.id, a.name);
        };

        table.appendChild(tr);
    });

    if (data.length > 0) {
    selectedAccountId = data[0].id;
    loadAccountChart(data[0].id, data[0].name);
}
    // 🔥 PIE
    renderPieChart(data);
}

document.addEventListener("DOMContentLoaded", () => {
    loadAccounts();
});


