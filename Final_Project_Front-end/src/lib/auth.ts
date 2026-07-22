import type { AuthUser } from "./api";

export const AUTH_TOKEN_STORAGE_KEY = "auth_token";
export const AUTH_USER_STORAGE_KEY = "auth_user";
export const LOGIN_NOTICE_STORAGE_KEY = "login_notice";

export const readStoredToken = () => {
  return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
};

export const readStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<AuthUser>;

    if (!parsed?.id || !parsed?.email || !parsed?.name) {
      return null;
    }

    const inferredRole =
      parsed.role ??
      (parsed.email === "admin@fitclub.com" || parsed.id === "user_admin" ? "admin" : "client");

    return {
      id: parsed.id,
      name: parsed.name,
      email: parsed.email,
      role: inferredRole,
      phone: parsed.phone ?? "",
      birthDate: parsed.birthDate ?? "",
      address: parsed.address ?? "",
      city: parsed.city ?? "",
      country: parsed.country ?? "",
      createdAt: parsed.createdAt ?? "",
    };
  } catch {
    return null;
  }
};

export const persistAuth = (token: string, user: AuthUser) => {
  localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
};

export const userCanAccessDashboard = (user: AuthUser | null) => {
  return Boolean(user);
};

export const userIsAdmin = (user: AuthUser | null) => {
  if (!user) {
    return false;
  }

  return user.role === "admin" || user.email === "admin@fitclub.com" || user.id === "user_admin";
};

export const userIsCoach = (user: AuthUser | null) => {
  if (!user) {
    return false;
  }

  return user.role === "coach";
};
