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

export async function removeContact(contactUserId) {
  return apiRequest(`/users/contacts/${contactUserId}`, {
    method: "DELETE",
  });
}