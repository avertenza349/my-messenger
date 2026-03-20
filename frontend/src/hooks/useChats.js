import { useCallback, useMemo, useState } from "react";
import {
  getMyChats,
  getChatMessages,
  createPrivateChat,
  createGroupChat,
  sendMessage,
  sendImage,
  deleteChat,
} from "../api/chats";

const PAGE_SIZE = 30;
const CHAT_SCROLL_STORAGE_KEY = "chat_scroll_positions_v1";

function readStoredScrollPositions() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_SCROLL_STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeStoredScrollPositions(value) {
  localStorage.setItem(CHAT_SCROLL_STORAGE_KEY, JSON.stringify(value));
}

export function useChats() {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChatState] = useState(null);
  const [messagesByChat, setMessagesByChat] = useState({});
  const [loadingByChat, setLoadingByChat] = useState({});
  const [loadingOlderByChat, setLoadingOlderByChat] = useState({});
  const [hasMoreByChat, setHasMoreByChat] = useState({});
  const [groupTitle, setGroupTitle] = useState("");
  const [groupParticipantIds, setGroupParticipantIds] = useState([]);
  const [scrollPositions, setScrollPositions] = useState(readStoredScrollPositions);

  const messages = selectedChat ? messagesByChat[selectedChat.id] || [] : [];

  const setSelectedChat = useCallback((chat) => {
    setSelectedChatState(chat);
    if (chat?.id) {
      setChats((prev) =>
        prev.map((item) =>
          item.id === chat.id ? { ...item, unreadCount: 0 } : item
        )
      );
    }
  }, []);

  async function removeChat(chatId) {
    await deleteChat(chatId);

    setChats((prev) => prev.filter((chat) => chat.id !== chatId));

    setMessagesByChat((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });

    setLoadingByChat((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });

    setLoadingOlderByChat((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });

    setHasMoreByChat((prev) => {
      const next = { ...prev };
      delete next[chatId];
      return next;
    });

    setScrollPositions((prev) => {
      const next = { ...prev };
      delete next[chatId];
      writeStoredScrollPositions(next);
      return next;
    });

    setSelectedChatState((prev) => {
      if (prev?.id === chatId) {
        return null;
      }
      return prev;
    });
  }

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

  async function loadMessages(chatId, options = {}) {
    const { force = false } = options;

    if (!force && messagesByChat[chatId]?.length) {
      return messagesByChat[chatId];
    }

    setLoadingByChat((prev) => ({ ...prev, [chatId]: true }));

    try {
      const list = await getChatMessages(chatId, { limit: PAGE_SIZE });

      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: list,
      }));

      setHasMoreByChat((prev) => ({
        ...prev,
        [chatId]: list.length === PAGE_SIZE,
      }));

      return list;
    } finally {
      setLoadingByChat((prev) => ({ ...prev, [chatId]: false }));
    }
  }

  async function loadOlderMessages(chatId) {
    const currentMessages = messagesByChat[chatId] || [];

    if (!currentMessages.length) {
      return [];
    }

    if (loadingOlderByChat[chatId]) {
      return [];
    }

    if (!hasMoreByChat[chatId]) {
      return [];
    }

    const oldestMessage = currentMessages[0];
    if (!oldestMessage?.id) {
      return [];
    }

    setLoadingOlderByChat((prev) => ({ ...prev, [chatId]: true }));

    try {
      const older = await getChatMessages(chatId, {
        limit: PAGE_SIZE,
        beforeId: oldestMessage.id,
      });

      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [...older, ...(prev[chatId] || [])],
      }));

      setHasMoreByChat((prev) => ({
        ...prev,
        [chatId]: older.length === PAGE_SIZE,
      }));

      return older;
    } finally {
      setLoadingOlderByChat((prev) => ({ ...prev, [chatId]: false }));
    }
  }

  async function refreshCurrentChat(chatId) {
    const currentMessages = messagesByChat[chatId] || [];
    const list = await getChatMessages(chatId, { limit: PAGE_SIZE });

    if (!currentMessages.length) {
      setMessagesByChat((prev) => ({ ...prev, [chatId]: list }));
      setHasMoreByChat((prev) => ({
        ...prev,
        [chatId]: list.length === PAGE_SIZE,
      }));
      return list;
    }

    const currentIds = new Set(currentMessages.map((msg) => msg.id));
    const onlyNew = list.filter((msg) => !currentIds.has(msg.id));

    if (onlyNew.length) {
      setMessagesByChat((prev) => ({
        ...prev,
        [chatId]: [...(prev[chatId] || []), ...onlyNew],
      }));
    }

    setHasMoreByChat((prev) => ({
      ...prev,
      [chatId]: list.length === PAGE_SIZE,
    }));

    return list;
  }

  function saveScrollPosition(chatId, scrollTop) {
    if (!chatId) return;

    setScrollPositions((prev) => {
      const next = {
        ...prev,
        [chatId]: Math.max(0, Math.round(scrollTop)),
      };
      writeStoredScrollPositions(next);
      return next;
    });
  }

  function getSavedScrollPosition(chatId) {
    return scrollPositions[chatId] || 0;
  }

  async function ensureMessagesForSavedPosition(chatId, container) {
    if (!chatId || !container) return;

    const targetScrollTop = getSavedScrollPosition(chatId);

    while (
      hasMoreByChat[chatId] !== false &&
      container.scrollHeight < targetScrollTop + container.clientHeight + 120
    ) {
      const older = await loadOlderMessages(chatId);
      if (!older.length) {
        break;
      }
    }
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

  function incrementUnread(chatId) {
    if (!chatId) return;

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              unreadCount:
                selectedChat?.id === chatId ? 0 : (chat.unreadCount || 0) + 1,
            }
          : chat
      )
    );
  }

  function updateChatLastMessage(chatId, message) {
    if (!chatId || !message) return;

    setChats((prev) => {
      const next = prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              last_message: message,
            }
          : chat
      );

      next.sort((a, b) => {
        const aDate = a.last_message?.created_at || "";
        const bDate = b.last_message?.created_at || "";
        return bDate.localeCompare(aDate);
      });

      return next;
    });
  }

  const selectedChatMeta = useMemo(() => {
    if (!selectedChat?.id) {
      return {
        isLoading: false,
        isLoadingOlder: false,
        hasMore: false,
      };
    }

    return {
      isLoading: !!loadingByChat[selectedChat.id],
      isLoadingOlder: !!loadingOlderByChat[selectedChat.id],
      hasMore: hasMoreByChat[selectedChat.id] !== false,
    };
  }, [selectedChat, loadingByChat, loadingOlderByChat, hasMoreByChat]);

  return {
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    messages,
    messagesByChat,
    groupTitle,
    setGroupTitle,
    groupParticipantIds,
    setGroupParticipantIds,
    toggleGroupParticipant,
    loadChats,
    loadMessages,
    loadOlderMessages,
    refreshCurrentChat,
    openPrivateChat,
    createGroup,
    send,
    sendImg,
    removeChat,
    incrementUnread,
    updateChatLastMessage,
    saveScrollPosition,
    getSavedScrollPosition,
    ensureMessagesForSavedPosition,
    selectedChatMeta,
  };
}