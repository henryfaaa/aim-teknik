// src/utils/token.js
export const getAdminToken = () => {
  try {
    return JSON.parse(localStorage.getItem("user_admin") || "{}")?.token || "";
  } catch {
    return "";
  }
};

export const getOwnerToken = () => {
  try {
    return JSON.parse(localStorage.getItem("user_owner") || "{}")?.token || "";
  } catch {
    return "";
  }
};
