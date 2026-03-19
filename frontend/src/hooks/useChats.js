import { useState } from "react";
import {
  getMyChats,
  getChatMessages,
  createPrivateChat,
  createGroupChat,
  sendMessage,
  sendImage,
} from "../api/chats";

export function useChats() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);

  const [groupTitle, setGroupTitle] = useState("");
  const [groupParticipantIds, setGroupParticipantIds] = useState([]);

  async function loadChats() {
    const chatList = await getMyChats();

    const sortedChats = [...chatList].sort((a, b) => {
      const aDate = a.last_message?.created_at || "";
      const bDate = b.last_message?.created_at || "";
      return bDate.localeCompare(aDate);
    });

    setChats((prevChats) => {
      const prevUnreadMap = {};
      prevChats.forEach((chat) => {
        prevUnreadMap[chat.id] = chat.unreadCount || 0;
      });

      return sortedChats.map((chat) => ({
        ...chat,
        unreadCount: prevUnreadMap[chat.id] || 0,
      }));
    });

    return sortedChats;
  }

  async function loadMessages(chatId) {
    const list = await getChatMessages(chatId);
    setMessages(list);
    return list;
  }

  async function openPrivateChat(userId) {
    const chat = await createPrivateChat(userId);
    await loadChats();
    setSelectedChat(chat);
    return chat;
  }

  async function createGroup(title, participantIds) {
    const chat = await createGroupChat(title, participantIds);
    await loadChats();
    setSelectedChat(chat);
    setGroupTitle("");
    setGroupParticipantIds([]);
    return chat;
  }

  async function send(chatId, text) {
    await sendMessage(chatId, text);
  }

  async function sendImg(chatId, file) {
    await sendImage(chatId, file);
  }

  function toggleGroupParticipant(userId) {
    setGroupParticipantIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  return {
    chats,
    setChats,

    selectedChat,
    setSelectedChat,

    messages,
    setMessages,

    groupTitle,
    setGroupTitle,

    groupParticipantIds,
    setGroupParticipantIds,
    toggleGroupParticipant,

    loadChats,
    loadMessages,
    openPrivateChat,
    createGroup,
    send,
    sendImg,
  };
}