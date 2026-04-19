export async function getAccounts(token) {
    return fetch("https://localhost:7095/api/account", {
        headers: {
            Authorization: "Bearer " + token
        }
    });
}