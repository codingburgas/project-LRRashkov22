// api/categoryApi.js
const BASE_URL = "https://api-lecho.vanix.shop/api/categories";

export async function getCategories(token) {
  return fetch(BASE_URL, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
}

//--------------------------------------------------------------
export async function getSetupStatus(token) {
  return fetch(`${BASE_URL}/setup-status`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
}

export async function setupCategories(token, data) {
  return fetch(`${BASE_URL}/setup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
}
