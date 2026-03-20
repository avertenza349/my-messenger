import { apiRequest } from "./client";

export async function getMyChats() {
  return apiRequest("/chats/");
}

export async function deleteChat(chatId) {
  return apiRequest(`/chats/${chatId}`, {
    method: "DELETE",
  });
}

export async function getChatMessages(chatId, options = {}) {
  const params = new URLSearchParams();

  if (options.limit) {
    params.set("limit", String(options.limit));
  }

  if (options.beforeId) {
    params.set("before_id", String(options.beforeId));
  }

  const query = params.toString();
  const url = query
    ? `/chats/${chatId}/messages?${query}`
    : `/chats/${chatId}/messages`;

  return apiRequest(url);
}

export async function sendMessage(chatId, content) {
  return apiRequest(`/chats/${chatId}/messages`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
}

export async function createPrivateChat(userId) {
  return apiRequest("/chats/private", {
    method: "POST",
    body: JSON.stringify({ user_id: Number(userId) }),
  });
}

export async function sendImage(chatId, file) {
  const token = localStorage.getItem("access_token");
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`http://127.0.0.1:8000/chats/${chatId}/images`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Image upload failed");
  }

  return response.json();
}

export async function createGroupChat(title, participantIds) {
  return apiRequest("/chats/group", {
    method: "POST",
    body: JSON.stringify({
      title,
      participant_ids: participantIds.map((id) => Number(id)),
    }),
  });
}