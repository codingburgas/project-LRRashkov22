export async function getAccounts(token) {
    return fetch("https://api-lecho.vanix.shop/api/account", {
        headers: {
            Authorization: "Bearer " + token
        }
    });
}