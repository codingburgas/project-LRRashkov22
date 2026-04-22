import { getBudgetData, getTargetData } from "../api/analyticsApi.js";
import { getToken } from "../utils/auth.js";
import { isDemoUser } from "../utils/auth.js";
let expenseChart;
let incomeChart;
let selectedMonth = new Date().toISOString().slice(0, 7);
// function getMonthYear() {
//   const [year, month] = selectedMonth.split("-");
//   return { year: parseInt(year), month: parseInt(month) };
// }
// ---------------- HELPERS ----------------
function getColor(p) {
  if (p > 100) return "#8B0000"; // dark red (over budget)
  if (p > 80) return "red";
  if (p > 50) return "orange";
  return "green";
}
function getMonthYear() {
  const [year, month] = selectedMonth.split("-");
  return {
    month: parseInt(month),
    year: parseInt(year)
  };
}
function getColorTarget(p) {
      if (p > 80) return "green";
     if (p > 40) return "orange";
       return "red"; 
}
function excludeNegative(value) {
  return value < 0 ? 0 : value;
}
function normalizePercent(p) {
  const percent = p || 0;
  return {
    raw: percent,
    safe: Math.min(percent, 100)
  };
}
function generateColors(count) {
  const colors = [];
  for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        const lightness = 50 + (i % 2 === 0 ? 5 : -5);

        colors.push(`hsl(${hue}, 70%, ${lightness}%)`);
    }

    return colors;
}

// ---------------- RENDER TABLES ----------------
function renderBudgetTable(data, colors) {
  const tbody = document.getElementById("analytics-table-body");
  tbody.innerHTML = "";

  data.forEach((b, index) => {
    const color = colors[index] || "#ccc";

    const p = normalizePercent(b.percentageUsed);

    const tr = document.createElement("tr");
    tr.setAttribute("data-index", index);
    tr.innerHTML = `
      <td>
        <span class="dot" style="background:${color}"></span>
        ${b.categoryName}
      </td>
      <td>${b.budgetAmount ? `$${b.budgetAmount}` : "No budget set"}</td>
      <td>${b.spentAmount}</td>
      <td>${excludeNegative(b.remainingAmount)}</td>
      <td>
        <div class="progress-bar-container">
          <div class="progress-bar-fill"
               style="width:${p.safe}%; background:${getColor(p.raw)};">
          </div>
        </div>
        <span>${p.raw.toFixed(0)}%</span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}


function attachHoverSync(tableId, chart) {
    const rows = document.querySelectorAll(`#${tableId} tr`);

    rows.forEach(row => {
        row.addEventListener("mouseenter", () => {
            const index = row.getAttribute("data-index");

            chart.setActiveElements([{
                datasetIndex: 0,
                index: Number(index)
            }]);
            // chart.tooltip.setActiveElements([{
            //     datasetIndex: 0,
            //     index: Number(index)
            // }], { x: 0, y: 0 });
            chart.update();
        });

        row.addEventListener("mouseleave", () => {
            chart.setActiveElements([]);
            chart.update();
        });
    });
}


function renderTargetTable(data, colors) {
  const tbody = document.getElementById("analytics-table-body-target");
  tbody.innerHTML = "";

  data.forEach((b, index) => {
    const color = colors[index] || "#ccc";

    const p = normalizePercent(b.percentageUsed);

    const tr = document.createElement("tr");
    tr.setAttribute("data-index", index);
    tr.innerHTML = `
      <td>
        <span class="dot" style="background:${color}"></span>
        ${b.categoryName}
      </td>
      <td>${b.budgetAmount ? `$${b.budgetAmount}` : "No budget set"}</td>
      <td>${b.spentAmount}</td>
      <td>${excludeNegative(b.remainingAmount)}</td>
      <td>
        <div class="progress-bar-container">
          <div class="progress-bar-fill"
               style="width:${p.safe}%; background:${getColorTarget(p.raw)};">
          </div>
        </div>
        <span>${p.raw.toFixed(0)}%</span>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

// ---------------- CHART ----------------
function createGradientColors(ctx, baseColors) {
    return baseColors.map(color => {
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);

        gradient.addColorStop(0, lightenColor(color, 20));
        gradient.addColorStop(1, color);

        return gradient;
    });
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace("#", ""), 16);
    let r = (num >> 16) + percent;
    let g = ((num >> 8) & 0x00FF) + percent;
    let b = (num & 0x0000FF) + percent;

    r = Math.min(255, r);
    g = Math.min(255, g);
    b = Math.min(255, b);

    return `rgb(${r},${g},${b})`;
}
function createPieChart(ctx, labels, data, colors) {
    
       const context = ctx.getContext("2d"); // 🔥 ВАЖНО

    const gradientColors = createGradientColors(context, colors);
  return new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors,
    // backgroundColor: gradientColors,
    borderColor: "#ffffff",
    borderWidth: 2,
    hoverOffset: 8,
    hoverBorderWidth: 1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
          layout: {
        padding: 10
    },
      plugins: {
        legend: { display: false }
      }
    }
  });
}

function renderCharts(budgetData, targetData, expenseColors, incomeColors) {
  if (expenseChart) expenseChart.destroy();
  if (incomeChart) incomeChart.destroy();

  expenseChart = createPieChart(
    document.getElementById("expensePie"),
    budgetData.map(x => x.categoryName),
    budgetData.map(x => x.spentAmount),
    expenseColors
  );

  incomeChart = createPieChart(
    document.getElementById("incomePie"),
    targetData.map(x => x.categoryName),
    targetData.map(x => x.spentAmount),
    incomeColors
  );
}

// ---------------- INIT (MAIN) ----------------
document.addEventListener("DOMContentLoaded", initAnalytics);

async function initAnalytics() {
  const token = getToken();
  const { month, year } = getMonthYear();
  // const [budgetRes, targetRes] = await Promise.all([
  //   getBudgetData(token),
  //   getTargetData(token)
  // ]);

  // if (!budgetRes.ok || !targetRes.ok) {
  //   console.log("Request failed");
  //   return;
  // }
const resetBtn = document.querySelector("button[onclick='resetMonth()']");
if (resetBtn) {
    resetBtn.disabled = isDemoUser();
}
  
  const [budgetRes, targetRes] = await Promise.all([
    fetch(`https://api-lecho.vanix.shop/api/Analytics/budget?month=${month}&year=${year}`, {
      headers: { Authorization: "Bearer " + token }
    }),
    fetch(`https://api-lecho.vanix.shop/api/Analytics/target?month=${month}&year=${year}`, {
      headers: { Authorization: "Bearer " + token }
    })
  ]);
  
  const budgetData = await budgetRes.json();
  const targetData = await targetRes.json();
  const expenseColors = generateColors(budgetData.length);
  const incomeColors = generateColors(targetData.length); 


  renderBudgetTable(budgetData, expenseColors);
  renderTargetTable(targetData, incomeColors);
  renderCharts(budgetData, targetData, expenseColors, incomeColors);
  attachHoverSync("analytics-table-body", expenseChart);
  attachHoverSync("analytics-table-body-target", incomeChart);
}
document.getElementById("monthPicker").addEventListener("change", (e) => {
  selectedMonth = e.target.value;
  initAnalytics();
});

window.resetMonth = async function () {
  const token = getToken();
  const { month, year } = getMonthYear();

  await fetch(`https://api-lecho.vanix.shop/api/Analytics/reset?month=${month}&year=${year}`, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token
    }
  });

  initAnalytics();
};