import { getUsername, getToken } from "../utils/auth.js";
import { getDashboardData } from "../api/dashboardApi.js";
import { getTransactions, getRecentTransactions } from "../api/transactionApi.js";
import { getCategories, getSetupStatus, setupCategories } from "../api/categoryApi.js";
import { getChartData } from "../api/dashboardApi.js";
import { getAccounts } from "../api/accountApi.js";

let isIncome = true;
let chartInstance;
let currentDays = 7;
let currentMode = "daily";
let currentModal = null;
let isSetupMode = false;
window.changeRange = function (days) {
    currentDays = days;
    loadChart();
};
window.setMode = function (mode, days) {
    currentMode = mode;
    currentDays = days;
    loadChart();
};
window.openDeposit = function () {
    isIncome = true;
    currentModal = "transaction";
    loadCategories();
    loadAccounts();
    document.getElementById("modal-title").innerText = "Deposit";
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
};

window.openWithdraw = function () {
    isIncome = false;
    currentModal = "transaction";
    loadCategories();
    loadAccounts();
    document.getElementById("modal-title").innerText = "Withdraw";
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
};
window.openSetBudgets = function () {
    currentModal = "budget";
    loadCategories();
    document.getElementById("modal-title").innerText = "Set Budget";
    new bootstrap.Modal(document.getElementById('BudgetModal')).show();
};
async function loadCategories() {
    const token = getToken();
    const res = await getCategories(token);
    if (!res.ok) {
        console.error(await res.text());
        return;
    }
    const data = await res.json();

      let selectId;

    if (currentModal === "transaction") {
        selectId = "category";
    } else if (currentModal === "budget") {
        selectId = "budgetLimit-category";
    } else {
        return;
    }

    const select = document.getElementById(selectId);
    select.innerHTML = "";
    const filtered = currentModal === "budget"
    ? data
    :  data.filter(c => c.isIncome === isIncome);
    filtered.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.text = c.name;
        select.appendChild(option);
    });

    populateCategoryFilterMenu(data);
}

async function loadAccounts() {
    const token = getToken();
    const res = await getAccounts(token);

    if (!res.ok) return;

    const data = await res.json();

    const select = document.getElementById("account");
    if (!select) return;

    select.innerHTML = "";

    data.forEach(a => {
        const option = document.createElement("option");
        option.value = a.id;
        option.text = a.name;
        select.appendChild(option);
    });
}

function populateCategoryFilterMenu(categories) {
    const submenu = document.getElementById("categoryFilterSubmenu");
    if (!submenu) return;

    submenu.innerHTML = "";
    const allCategoriesItem = document.createElement("li");
    allCategoriesItem.innerHTML = `
        <button class="dropdown-item" type="button" onclick="filterTransactionsByCategory(null)">All categories</button>
    `;
    submenu.appendChild(allCategoriesItem);

    categories.forEach(category => {
        const li = document.createElement("li");
        li.innerHTML = `
            <button class="dropdown-item" type="button" onclick="filterTransactionsByCategory(${category.id})">${category.name}</button>
        `;
        submenu.appendChild(li);
    });
}

window.filterTransactionsByCategory = function (categoryId) {
    loadTable(categoryId);
};

document.addEventListener("DOMContentLoaded", async () => {   


  await checkSetup();
    loadUser();
    loadDashboard();
    loadRecent();
    loadTable();
    loadCategories();
    loadChart(); 
});
window.submitTransaction = async function () {
    const token = getToken();

    const amount = parseFloat(document.getElementById("amount").value);
    const description = document.getElementById("description").value;
    const categoryId = parseInt(document.getElementById("category").value);
    const dateValue = document.getElementById("date").value;
    const accountId = parseInt(document.getElementById("account").value);
    
    if (!accountId || !amount || !categoryId || !dateValue) {
        alert("Fill all fields");
        return;
    }

    const date = new Date(dateValue + "T00:00:00").toISOString();

    const res = await fetch("https://localhost:7095/api/transaction", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            amount,
            description,
            categoryId,
            accountId,
            isIncome,
            transactionDate: date
        })
    });

    if (!res.ok) {
        alert("Error creating transaction");
        return;
    }

    loadDashboard();
    loadRecent();
    loadTable();
    loadCategories();
    loadChart();
    bootstrap.Modal.getInstance(document.getElementById('transactionModal')).hide();
};
// ---------- USER ----------
function loadUser() {
    const username = getUsername();
    const el = document.getElementById("welcome-message");

    if (el && username) {
        el.innerText = `Welcome back, ${username}!`;
    }
}

// ---------- DASHBOARD ----------
async function loadDashboard() {
    const token = getToken();
    const res = await getDashboardData(token);

    if (!res.ok) return;

    const data = await res.json();

    document.getElementById("balance").innerText = data.balance.toFixed(2);
    document.getElementById("income").innerText = data.totalIncome.toFixed(2);
    document.getElementById("expenses").innerText = data.totalExpenses.toFixed(2);
}

// ---------- RECENT ----------
async function loadRecent() {
    const token = getToken();
    const res = await getRecentTransactions(token);

    if (!res.ok) return;

    const data = await res.json();

    const container = document.getElementById("recent-list");
    container.innerHTML = "";

    data.forEach(t => {
        const div = document.createElement("div");

div.innerHTML = ` 
<div class="d-flex justify-content-between align-items-start">
    
    <!-- LEFT -->
    <div>
        <strong>${t.description}</strong><br>
        <span class="text-muted" style="font-size: 12px;">
            Account: ${t.accountName}
        </span>
    </div>

    <!-- RIGHT -->
    <div class="text-end">
        <div class="${t.isIncome ? "text-success" : "text-danger"} fw-bold">
            ${t.isIncome ? "+" : "-"}$${t.amount}
        </div>
        <div class="text-muted" style="font-size: 12px;">
            ${new Date(t.transactionDate).toLocaleDateString()}
        </div>
    </div>

</div>
<hr class="my-2">
`;

        container.appendChild(div);
    });
}

// ---------- TABLE ----------
async function loadTable(categoryId) {
    const token = getToken();
    const res = await getTransactions(token);

    if (!res.ok) return;

    const data = await res.json();

    const tbody = document.getElementById("transactions-table");
    tbody.innerHTML = "";

    const header = document.querySelector('h6');
    const isTransactionPage = header && header.textContent === 'Transactions';

    const transactions = isTransactionPage ? data : data.filter(t => !t.isIncome);
    const filteredTransactions = categoryId ? transactions.filter(t => t.categoryId === categoryId) : transactions;

    filteredTransactions.forEach(t => {
        const tr = document.createElement("tr");
            
        tr.innerHTML = `
            <td>${new Date(t.transactionDate).toLocaleDateString()}</td>
            <td>${t.categoryName}</td>
            <td class="${isTransactionPage ? (t.isIncome ? "text-success" : "text-danger") : "text-danger"}">
                ${isTransactionPage ? (t.isIncome ? "+" : "-") : "-"}$${t.amount}
            </td>
            <td>${t.description}</td>
        `;

        tbody.insertBefore(tr, tbody.firstChild);
    });
}


async function loadChart() {
    const token = getToken();
    const res = await getChartData(token, currentDays, currentMode);

    if (!res.ok) {
        console.error("Chart failed");
        return;
    }

    const data = await res.json();

    const labels = data.map(x => x.label);
    const income = data.map(x => x.income);
    const expenses = data.map(x => x.expense);
    const balance = data.map(x => x.balance);

    const ctx = document.getElementById("financeChart");


    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "line",
        data: {
            labels: labels,
            datasets: [
                {
                    label: "Income",
                    data: income,
                    borderWidth: 2,
                    tension: 0.3,
                    borderColor: "#0d6dfd63",
                    pointRadius: 0,
                   
                },
                {
                    label: "Expenses",
                    data: expenses,
                    borderWidth: 2,
                    tension: 0.3,
                    borderColor: "#dc354663",
                    pointRadius: 0,
                },
                {
                    label: "Balance",
                    data: balance,
                    borderWidth: 3,
                    tension: 0.3,
                    fill: true,

                   backgroundColor: "#28a74614",
                    borderColor: "#28a745",
                   pointRadius: 0,
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}


import { PutBudgetLimit } from "../api/dashboardApi.js";
window.submitBudgetLimit = async function () {
    const token = getToken();

    const amount = parseFloat(document.getElementById("limit-amount").value);
    const categoryId = parseInt(document.getElementById("budgetLimit-category").value);
    
    if (!amount || !categoryId) {
        alert("Fill all fields");
        return;
    }

    const res = await PutBudgetLimit(token, { amount, categoryId });

    if (!res.ok) {
        alert("Error creating transaction");
        return;
    }

    loadDashboard();
    loadRecent();
    loadTable();
    loadCategories();
    loadChart();
    bootstrap.Modal.getInstance(document.getElementById('BudgetModal')).hide();
};


// ---------- SETUP ----------
async function checkSetup() {
    const token = getToken();
    const res = await getSetupStatus(token);
    if (!res.ok) return;
    const isDone = await res.json();
    if (!isDone) {
        isSetupMode = true;
        await loadDefaultCategoriesForSetup();
        document.getElementById("setup-account-section").style.display = "block";
        const modal = new bootstrap.Modal(document.getElementById('SetupModal'));
        modal.show();
    };
}

async function loadDefaultCategoriesForSetup() {
    const token = getToken();
    const res = await fetch("https://localhost:7095/api/categories/defaults", {
    headers: {
        Authorization: "Bearer " + token
    }
});
    if (!res.ok) return;
    const data = await res.json();
    const container = document.getElementById("setup-categories");
    container.innerHTML = "";
    const defaults = data;
    defaults.forEach(c => {
    const div = document.createElement("div");
    div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <input type="checkbox" value="${c.id}" />
                    ${c.name}
                </div>
                <input type="number" class="form-control w-25" data-id="${c.id}" placeholder="Budget" />
            </div>
        `;

        container.appendChild(div);
    });
}

window.submitSetup = async function () {
    const token = getToken();
    const selected = [];
    const custom = [];
    document.querySelectorAll("#setup-categories input[type=checkbox]").forEach(cb => {
        if (cb.checked) selected.push(parseInt(cb.value));
    });
    const accountName = document.getElementById("setup-account-name").value;
    const accountType = parseInt(document.getElementById("setup-account-type").value);
    if (isSetupMode && !accountName && !accountType) {
        alert("Account name and type are required");
        return;
    }
    if (isSetupMode) {
    await fetch("https://localhost:7095/api/account", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            name: accountName,
            accountType: accountType
        })
    });
}
    document.querySelectorAll(".custom-category").forEach(row => {
        const name = row.querySelector(".name").value;
        const amount = parseFloat(row.querySelector(".amount").value);
        const isIncome = row.querySelector(".type").value === "income";
        if (!accountName) {
            alert("Account name is required");
            return;
        } 
        if (name) {
            custom.push({
                name,
                budgetLimit: amount || 0,
                isIncome
            });
        }
    });

    const res = await setupCategories(token, {
        defaultCategoryIds: selected,
        customCategories: custom
    });

    if (!res.ok) {
        alert("Setup failed");
        return;
    }
    bootstrap.Modal.getInstance(document.getElementById('SetupModal')).hide();
    loadCategories();
    loadDashboard();
    loadChart();
    sessionStorage.removeItem("setupShown");
};

window.addCustomCategory = function () {
    const container = document.getElementById("custom-categories");
    const div = document.createElement("div");
    div.classList.add("custom-category", "mb-2");
    div.innerHTML = `
        <input class="form-control mb-1 name" placeholder="Name" />
        <input type="number" class="form-control mb-1 amount" placeholder="Budget" />
        <select class="form-control type">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
        </select>
    `;

    container.appendChild(div);
};

window.handleSave = function () {
    if (isSetupMode) {
        submitSetup();
    } else {
        saveCategoryChanges();
    }
};

//----------------------------------------------------------------
window.openCategoryManager = async function () {
    const token = getToken();

    // 🔥 взимаме user категории
    const res = await getCategories(token);
    if (!res.ok) return;

    const data = await res.json();
    isSetupMode = false;
    document.getElementById("setup-account-section").style.display = "none";
    const container = document.getElementById("setup-categories");
    container.innerHTML = "";
    // 🔥 показваме ВСИЧКИ user категории (editable)
    data.forEach(c => {
        const div = document.createElement("div");

        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <input type="text" class="form-control w-25 name" value="${c.name}" data-id="${c.id}" />
                
                <select class="form-control w-25 type" data-id="${c.id}">
                    <option value="expense" ${!c.isIncome ? "selected" : ""}>Expense</option>
                    <option value="income" ${c.isIncome ? "selected" : ""}>Income</option>
                </select>

                <input type="number" class="form-control w-25 amount" value="${c.budgetLimit}" data-id="${c.id}" />

                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${c.id})">X</button>
            </div>
        `;

        container.appendChild(div);
    });

    // 🔥 чистим custom section
    document.getElementById("custom-categories").innerHTML = "";

    new bootstrap.Modal(document.getElementById('SetupModal')).show();
};

window.saveCategoryChanges = async function () {
    const token = getToken();

    const rows = document.querySelectorAll("#setup-categories > div, #custom-categories > div");

    for (const row of rows) {
        const nameInput = row.querySelector(".name");
        const typeInput = row.querySelector(".type");
        const amountInput = row.querySelector(".amount");

        const id = nameInput.dataset.id;

        const payload = {
            name: nameInput.value,
            isIncome: typeInput.value === "income",
            budgetLimit: parseFloat(amountInput.value) || 0
        };

        // 🔥 ако има id → UPDATE
        if (id) {
            await fetch(`https://localhost:7095/api/categories/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
body: JSON.stringify({
    Id: parseInt(id),
    Name: payload.name,
    IsIncome: payload.isIncome,
    BudgetLimit: payload.budgetLimit
})
            });
        }
        // 🔥 ако НЯМА id → CREATE
        else {
            await fetch(`https://localhost:7095/api/categories`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + token
                },
body: JSON.stringify({
    Name: payload.name,
    IsIncome: payload.isIncome,
    BudgetLimit: payload.budgetLimit
})
            });
        }
    }

    bootstrap.Modal.getInstance(document.getElementById('SetupModal')).hide();

    loadCategories();
    loadDashboard();
    loadChart();
};

window.deleteCategory = async function (id) {
    const token = getToken();

    await fetch(`https://localhost:7095/api/categories/${id}`, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + token
        }
    });

    document.querySelector(`[data-id="${id}"]`)?.closest("div").remove();
};