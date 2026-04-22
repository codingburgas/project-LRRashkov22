const API_URL = "https://api-lecho.vanix.shop/api/dashboard";

export async function getDashboardData(token) {
    return fetch(API_URL, {
        headers: {
            Authorization: "Bearer " + token
        }
    });
}
export async function getChartData(token, days, mode) {
    return fetch(`https://api-lecho.vanix.shop/api/dashboard/chart?days=${days}&mode=${mode}`, {
        headers: {
            Authorization: "Bearer " + token
        }
    });
}
export async function PutBudgetLimit(token, limit) {
    return fetch(`${API_URL}/budget`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token
        },
        body: JSON.stringify(limit)
    });
}