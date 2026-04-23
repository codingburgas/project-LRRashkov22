import { isDemoUser } from "./utils/auth.js";
import {
  requireAuth,
  requireAdmin,
  requireUserOrAdmin,
  logout,
} from "./utils/auth.js";

requireAuth();
export function showModalError(message, type = "transaction") {
  const el = document.getElementById(`${type}-error`);
  if (!el) return;

  el.innerText = message;
  el.classList.remove("d-none");

  setTimeout(() => el.classList.add("d-none"), 4000);
}
export function clearModalError(type = "transaction") {
  const el = document.getElementById(`${type}-error`);
  if (!el) return;

  el.innerText = "";
  el.classList.add("d-none");
}
document.addEventListener("DOMContentLoaded", () => {
  const banner = document.getElementById("demo-banner");

  if (banner && isDemoUser()) {
    banner.classList.remove("d-none");
  }
});

window.requireAdmin = requireAdmin;
window.requireUserOrAdmin = requireUserOrAdmin;
window.logout = logout;
