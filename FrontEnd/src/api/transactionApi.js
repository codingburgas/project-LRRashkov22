const BASE_URL = "https://api-lecho.vanix.shop/api/transaction";

export async function getTransactions(token) {
    return fetch(BASE_URL, {
        headers: {
            Authorization: "Bearer " + token
        }
    });
}

export async function getRecentTransactions(token) {
    return fetch(`${BASE_URL}/recent`, {
        headers: {
            Authorization: "Bearer " + token
        }
    });
}