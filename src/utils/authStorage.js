import { jwtDecode } from "jwt-decode";

const AUTH_STORAGE_KEY = "user";
const AUTH_EVENT_NAME = "auth-user-changed";

function dispatchAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT_NAME));
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;

  try {
    const decoded = jwtDecode(token);
    if (!decoded?.exp) return false;

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return decoded.exp <= nowInSeconds;
  } catch {
    return true;
  }
}

export function hasValidStoredSession() {
  const user = getStoredUser();
  return Boolean(user?.token && !isTokenExpired(user.token));
}

export function getStoredToken() {
  const user = getStoredUser();
  return hasValidStoredSession() ? user?.token || null : null;
}

export function setStoredUser(user) {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  dispatchAuthChange();
}

export function mergeStoredUser(partialUser) {
  const currentUser = getStoredUser() || {};
  const nextUser = {
    ...currentUser,
    ...partialUser,
  };

  setStoredUser(nextUser);
  return nextUser;
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  dispatchAuthChange();
}

export { AUTH_EVENT_NAME };
