import { getToken } from "../utils/auth.js";
import { getTransactions } from "../api/transactionApi.js";
import { getCategories } from "../api/categoryApi.js";

let isIncome = true;
let currentSort = null;
let currentType = null;
let currentCategoryId = null;

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

window.applyTransactionSort = function (sortType) {
    currentSort = sortType;
    loadTable();
};

window.applyTransactionType = function (type) {
    currentType = type;
    loadTable();
};

window.filterTransactionsByCategory = function (categoryId) {
    currentCategoryId = categoryId;
    loadTable();
};

document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadTable();
});

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

    if (currentType === "income") {
        transactions = transactions.filter(t => t.isIncome);
    } else if (currentType === "expenses") {
        transactions = transactions.filter(t => !t.isIncome);
    }

    if (currentCategoryId) {
        transactions = transactions.filter(t => t.categoryId === currentCategoryId);
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

