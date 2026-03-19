import { apiRequest } from "./client";

export async function getUsers() {
  return apiRequest("/users/");
}