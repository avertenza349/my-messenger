import { apiRequest } from "./client";

export async function getUsers() {
  return apiRequest("/users/");
}

export async function getContacts() {
  return apiRequest("/users/contacts");
}

export async function addContactByEmail(email) {
  return apiRequest("/users/contacts", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function deleteContact(contactUserId) {
  return apiRequest(`/users/contacts/${contactUserId}`, {
    method: "DELETE",
  });
}

export async function uploadMyAvatar(file) {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("avatar", file);

  const response = await fetch("http://91.105.236.148:8000/users/me/avatar", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Не удалось загрузить аватар");
  }

  return response.json();
}