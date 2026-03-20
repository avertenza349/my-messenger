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
  const [selectedChat, setSelectedChatState] = useState(null);
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

  function setSelectedChat(chat) {
    setSelectedChatState(chat);

    if (!chat) return;

    setChats((prevChats) =>
      prevChats.map((item) =>
        item.id === chat.id
          ? { ...item, unreadCount: 0 }
          : item
      )
    );
  }

  function incrementUnread(chatId) {
    setChats((prevChats) =>
      prevChats
        .map((chat) =>
          chat.id === chatId
            ? { ...chat, unreadCount: (chat.unreadCount || 0) + 1 }
            : chat
        )
        .sort((a, b) => {
          const aDate = a.last_message?.created_at || "";
          const bDate = b.last_message?.created_at || "";
          return bDate.localeCompare(aDate);
        })
    );
  }

  function updateChatLastMessage(chatId, message) {
    setChats((prevChats) =>
      prevChats
        .map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                last_message: {
                  id: message.id,
                  sender_id: message.sender_id,
                  content:
                    message.message_type === "image"
                      ? "📷 Изображение"
                      : message.content,
                  created_at: message.created_at,
                },
              }
            : chat
        )
        .sort((a, b) => {
          const aDate = a.last_message?.created_at || "";
          const bDate = b.last_message?.created_at || "";
          return bDate.localeCompare(aDate);
        })
    );
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
        : [...prev, userId]
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
    incrementUnread,
    updateChatLastMessage,
  };
}