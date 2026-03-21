import { apiRequest } from "./client";

export async function registerUser(data) {
  const normalizedData = {
    email: data.email?.trim() || "",
    first_name: data.first_name?.trim() || "",
    last_name: data.last_name?.trim() || "",
    password: data.password || "",
    username: data.username?.trim() ? data.username.trim() : null,
  };

  return apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(normalizedData),
  });
}

export async function loginUser(email, password) {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch("http://127.0.0.1:8000/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Login failed");
  }

  return response.json();
}

export async function getCurrentUser() {
  return apiRequest("/users/me");
}