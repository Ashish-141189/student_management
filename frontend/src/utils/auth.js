// src/utils/auth.js
export function getToken() {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token") ||
    null
  );
}

export function getRole() {
  return (
    localStorage.getItem("role") ||
    sessionStorage.getItem("role") ||
    null
  );
}

/**
 * remember = true -> store in localStorage (persist)
 * remember = false -> store in sessionStorage (tab only)
 */
export function setAuth(token, role, remember = true) {
  const storage = remember ? localStorage : sessionStorage;
  if (token) storage.setItem("token", token);
  if (role) storage.setItem("role", role);

  // notify app that auth changed (Dashboard, PrivateRoute, etc. can listen)
  window.dispatchEvent(new Event("authChanged"));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("role");
  window.dispatchEvent(new Event("authChanged"));
}
