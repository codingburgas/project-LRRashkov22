import { getToken } from "../utils/auth.js";
import {showModalError} from "../main.js";
import {clearModalError} from "../main.js";
import {isDemoUser} from "../utils/auth.js";
let pieChart;
let lineChart;
let selectedAccountId = null;
let editingRowId = null;
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
    clearModalError("account");
        const isDemo = isDemoUser();

    document.querySelectorAll("#accountModal input, #accountModal select")
        .forEach(el => {
            if (el.type !== "button") {
                el.disabled = isDemo;
            }
        });

    new bootstrap.Modal(document.getElementById('accountModal')).show();
};

window.submitAccount = async function () {
    const token = getToken();
    if (isDemoUser()) {
    showModalError("Demo account is read-only. Create one to use full app", "account");
    return;
}
    const name = document.getElementById("account-name").value;
    const type = parseInt(document.getElementById("account-type").value);

        if (!name) {
            showModalError("Name required", "account");
            return;
        }

    const res = await fetch("https://api-lecho.vanix.shop/api/account", {
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
    const error = await res.text();
    showModalError(error || "Error creating account", "account");
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
                data: data,
                    hoverOffset: 8,
                    hoverBorderWidth: 1
            }]
        },
                options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
            },
                        layout: {
        padding: {
            bottom: 30
        }
    }
        }
    });
    return pieChart.data.datasets[0].backgroundColor;
}

async function loadAccountChart(accountId, accountName) {
    const token = getToken();

    const res = await fetch("https://api-lecho.vanix.shop/api/transaction", {
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
        `${accountName} Overview`;

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
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
            },
            layout: {
        padding: {
            bottom: 30
        }
    },
    scales: {
        y: {
            ticks: {
                precision: 0
            }
        }
    }
        }
    });
}

function attachHoverSync(tableId, chart) {
    const rows = document.querySelectorAll(`#${tableId} tr`);

    rows.forEach(row => {
        row.addEventListener("mouseenter", () => {
            if (editingRowId !== null) return;
            const index = row.getAttribute("data-index");

            chart.setActiveElements([{
                datasetIndex: 0,
                index: Number(index)
            }]);

            chart.update();
        });

        row.addEventListener("mouseleave", () => {
            chart.setActiveElements([]);
            chart.update();
        });
    });
}

async function loadAccounts() {
    const token = getToken();

    const res = await fetch("https://api-lecho.vanix.shop/api/account", {
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (!res.ok) return;
    const isDemo = isDemoUser();
    const data = await res.json();
    const colors = renderPieChart(data);
    const table = document.getElementById("accounts-table");
    table.innerHTML = "";

    data.forEach((a, index) => {
        const tr = document.createElement("tr");
         tr.setAttribute("data-index", index);
        tr.innerHTML = `
            <td> 
                <span style="
            display:inline-block;
            width:10px;
            height:10px;
            border-radius:50%;
            background:${colors[index]};
            margin-right:8px;
        "></span>
        ${a.name}</td>
            <td>${a.balance}</td>
            <td>${getAccountTypeName(a.accountType)}</td>
           <td class="text-end">
    <button class="btn btn-sm btn-outline-primary me-1"
        ${isDemo ? "disabled" : ""}
        onclick="startEditRow(this, ${a.id}, '${a.name}', ${a.accountType})">
        ✏️
    </button>

    <button class="btn btn-sm btn-outline-danger"
        ${isDemo ? "disabled" : ""}
        onclick="deleteAccount(${a.id}, this)">
        ❌
    </button>
</td>
        `;
        tr.querySelectorAll("button").forEach(btn => {
            btn.addEventListener("click", e => e.stopPropagation());
        });
        tr.style.cursor = "pointer";
        tr.onclick = () => {
              if (editingRowId !== null) return;
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

    renderPieChart(data);
    attachHoverSync("accounts-table", pieChart);
}

window.startEditRow = function (btn, id, name, type) {
    if (isDemoUser()) return;
    if (editingRowId !== null) return; // 🔥 само 1 edit

    editingRowId = id;

    const tr = btn.closest("tr");

    tr.classList.add("table-warning");

    const balance = tr.children[1].innerText; // 🔥 запазваме го

    tr.onclick = null; // 🔥 махаме click → FIX chart reload

    tr.innerHTML = `
        <td>
            <input class="form-control form-control-sm"
                value="${name}"
                id="edit-name-${id}" />
        </td>

        <td>${balance}</td>

        <td>
            <select class="form-control form-control-sm" id="edit-type-${id}">
                <option value="0" ${type == 0 ? "selected" : ""}>Credit Card</option>
                <option value="1" ${type == 1 ? "selected" : ""}>Debit Card</option>
                <option value="2" ${type == 2 ? "selected" : ""}>Bank</option>
                <option value="3" ${type == 3 ? "selected" : ""}>Investment</option>
                <option value="4" ${type == 4 ? "selected" : ""}>Wallet</option>
            </select>
        </td>

        <td class="text-end">
            <button class="btn btn-sm btn-success me-1"
                onclick="saveEdit(${id})">
                💾
            </button>

            <button class="btn btn-sm btn-secondary"
                onclick="cancelEdit()">
                ❌
            </button>
        </td>
    `;
};
window.saveEdit = async function (id) {
    const token = getToken();
    if (isDemoUser()) {
        showModalError("Demo account is read-only. Create one to use full app", "account");
        return;
    }
    const name = document.getElementById(`edit-name-${id}`).value;
    const type = parseInt(document.getElementById(`edit-type-${id}`).value);

    const res = await fetch("https://api-lecho.vanix.shop/api/account", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            accountId: id,
            name,
            accountType: type
        })
    });

    if (!res.ok) {
        showModalError("Update failed", "account");
        return;
    }

    editingRowId = null; // 🔥 reset
    loadAccounts();
};

window.deleteAccount = async function (id, btn) {
    const token = getToken();
    if (isDemoUser()) {
        showModalError("Demo account is read-only. Create one to use full app", "account");
        return;
    }
    if (!confirm("Delete this account?")) return;

    const res = await fetch(`https://api-lecho.vanix.shop/api/account/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    if (!res.ok) {
        showModalError("Delete failed", "account");
        return;
    }

    // 🔥 махаме row-а от UI (без reload)
    const tr = btn.closest("tr");
    tr.remove();

    // 🔥 reload chart + pie
    loadAccounts();
};

window.cancelEdit = function () {
    editingRowId = null;
    loadAccounts(); // връща нормалния state
};
document.addEventListener("DOMContentLoaded", () => {
    loadAccounts();
});


