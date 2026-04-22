import { getToken } from "../utils/auth.js";
import { getTransactions } from "../api/transactionApi.js";
import { getCategories } from "../api/categoryApi.js";

let isIncome = true;
let filters = {
    type: null,        
    categoryId: null,
    accountId: null
};
let currentSort = null;

window.openDeposit = function () {
    isIncome = true;
    loadCategories();
    document.getElementById("modal-title").innerText = "Deposit";
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
};

window.openWithdraw = function () {
    isIncome = false;
    loadCategories();
    document.getElementById("modal-title").innerText = "Withdraw";
    new bootstrap.Modal(document.getElementById('transactionModal')).show();
};

async function loadCategories() {
    const token = getToken();
    const res = await getCategories(token);

    if (!res.ok) return;

    const data = await res.json();
    const select = document.getElementById("category");
    select.innerHTML = "";

    const filtered = data.filter(c => c.isIncome === isIncome);
    filtered.forEach(c => {
        const option = document.createElement("option");
        option.value = c.id;
        option.text = c.name;
        select.appendChild(option);
    });

    populateCategoryFilterMenu(data);
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
async function populateAccountFilterMenu() {
    const token = getToken();

    const res = await fetch("https://api-lecho.vanix.shop/api/account", {
        headers: { Authorization: "Bearer " + token }
    });

    if (!res.ok) return;

    const data = await res.json();

    const submenu = document.getElementById("accountFilterSubmenu");
    submenu.innerHTML = "";

    submenu.innerHTML += `
        <li>
            <button class="dropdown-item" onclick="filterByAccount(null)">
                All accounts
            </button>
        </li>
    `;

    data.forEach(acc => {
        submenu.innerHTML += `
            <li>
                <button class="dropdown-item" onclick="filterByAccount(${acc.id})">
                    ${acc.name}
                </button>
            </li>
        `;
    });
}

window.filterByAccount = function (id) {
    filters.accountId = id;
    renderActiveFilters();
    loadTable();
};

window.applyTransactionSort = function (sortType) {
    currentSort = sortType;
    loadTable();
};

window.applyTransactionType = function (type) {
    filters.type = type;
    renderActiveFilters();
    loadTable();
};

window.filterTransactionsByCategory = function (categoryId) {
    filters.categoryId = categoryId;
    renderActiveFilters();
    loadTable();
};



window.submitTransaction = async function () {
    const token = getToken();
    const amount = parseFloat(document.getElementById("amount").value);
    const description = document.getElementById("description").value;
    const categoryId = parseInt(document.getElementById("category").value);
    const dateValue = document.getElementById("date").value;

    if (!amount || !categoryId || !dateValue) {
        alert("Fill all fields");
        return;
    }

    const date = new Date(dateValue + "T00:00:00").toISOString();

    const res = await fetch("https://api-lecho.vanix.shop/api/transaction", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify({
            amount,
            description,
            categoryId,
            isIncome,
            transactionDate: date
        })
    });

    if (!res.ok) {
        alert("Error creating transaction");
        return;
    }

    loadCategories();
    loadTable();
    bootstrap.Modal.getInstance(document.getElementById('transactionModal')).hide();
};

async function loadTable() {
    const token = getToken();
    const res = await getTransactions(token);

    if (!res.ok) return;

    const data = await res.json();
    let transactions = data;




if (filters.type === "income") {
    transactions = transactions.filter(t => t.isIncome);
}
if (filters.type === "expenses") {
    transactions = transactions.filter(t => !t.isIncome);
}


if (filters.categoryId !== null) {
    transactions = transactions.filter(t => t.categoryId === filters.categoryId);
}

if (filters.accountId !== null) {
    transactions = transactions.filter(t => t.accountId === filters.accountId);
}

    if (currentSort === "oldest") {
        transactions.sort((a, b) => new Date(a.transactionDate) - new Date(b.transactionDate));
    } else if (currentSort === "newest") {
        transactions.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
    } else if (currentSort === "mostAmount") {
        transactions.sort((a, b) => b.amount - a.amount);
    } else if (currentSort === "lessAmount") {
        transactions.sort((a, b) => a.amount - b.amount);
    }

    const tbody = document.getElementById("transactions-table");
    tbody.innerHTML = "";

    transactions.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${new Date(t.transactionDate).toLocaleDateString()}</td>
            <td>${t.categoryName}</td>
            <td>${t.accountName ?? "-"}</td>
            <td class="${t.isIncome ? "text-success" : "text-danger"}">
                ${t.isIncome ? "+" : "-"}$${t.amount}
            </td>
            <td>${t.description}</td>
        `;
        tbody.appendChild(tr);
    });
}
function renderActiveFilters() {
    const container = document.getElementById("active-filters");
    container.innerHTML = "";

    if (filters.type) {
        container.appendChild(createFilterTag("Type: " + filters.type, () => {
            filters.type = null;
            refresh();
        }));
    }

    if (filters.categoryId !== null) {
        container.appendChild(createFilterTag("Category", () => {
            filters.categoryId = null;
            refresh();
        }));
    }

    if (filters.accountId) {
        container.appendChild(createFilterTag("Account", () => {
            filters.accountId = null;
            refresh();
        }));
    }
}
function createFilterTag(text, onRemove) {
    const span = document.createElement("span");
    span.className = "badge bg-primary";

    span.innerHTML = `
        ${text}
        <span style="cursor:pointer;margin-left:6px;">✕</span>
    `;

    span.querySelector("span").onclick = onRemove;

    return span;
}
function refresh() {
    renderActiveFilters();
    loadTable();
}
window.clearFilters = function () {
    filters = {
        type: null,
        categoryId: null,
        accountId: null
    };

    currentSort = null;

    refresh();
};
document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    populateAccountFilterMenu();
    loadTable();
});