import { useEffect, useMemo, useState } from "react";
import {
  getUsers,
  getContacts,
  addContactByEmail,
  uploadMyAvatar,
} from "./api/users";
import { useAuth } from "./hooks/useAuth";
import { useChats } from "./hooks/useChats";
import { useWebSocket } from "./hooks/useWebSocket";
import AuthForm from "./components/AuthForm";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import { styles } from "./styles";
import "./App.css";

export default function App() {
  const auth = useAuth();
  const chats = useChats();

  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState("chats");
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const usersMap = useMemo(() => {
    const map = {};

    users.forEach((u) => {
      map[u.id] = u;
    });

    contacts.forEach((u) => {
      map[u.id] = u;
    });

    return map;
  }, [users, contacts]);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      auth.setError(err.message || "Не удалось загрузить пользователей");
    }
  }

  async function loadContacts() {
    try {
      const data = await getContacts();
      setContacts(data);
    } catch (err) {
      auth.setError(err.message || "Не удалось загрузить контакты");
    }
  }

  async function handleAddContact(email) {
    if (!email?.trim()) {
      return { ok: false, error: "Введите email" };
    }

    try {
      await addContactByEmail(email.trim());
      await loadContacts();
      auth.setMessage("Контакт добавлен");
      auth.setError("");
      return { ok: true };
    } catch (err) {
      const rawMessage = err?.message || "";
      const normalizedMessage = rawMessage.toLowerCase();

      const message =
        rawMessage.includes("404") ||
        normalizedMessage.includes("not found") ||
        normalizedMessage.includes("не найден")
          ? "Пользователь не найден"
          : rawMessage || "Не удалось добавить контакт";

      auth.setError(message);
      return { ok: false, error: message };
    }
  }

  async function handleLogin(e) {
    e.preventDefault();

    const user = await auth.login(
      auth.loginForm.email,
      auth.loginForm.password
    );

    if (user) {
      await Promise.all([loadUsers(), loadContacts(), chats.loadChats()]);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    await auth.register(auth.registerForm);
  }

  async function handleOpenPrivateChat(e, userId) {
    e.preventDefault();

    try {
      await chats.openPrivateChat(userId);
      if (isMobile) setMobileView("chat");
    } catch (err) {
      auth.setError(err.message || "Не удалось открыть чат");
    }
  }

  async function handleCreateGroup(e) {
    e.preventDefault();

    try {
      await chats.createGroup(chats.groupTitle, chats.groupParticipantIds);
      if (isMobile) setMobileView("chat");
    } catch (err) {
      auth.setError(err.message || "Не удалось создать группу");
    }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const updatedUser = await uploadMyAvatar(file);
      auth.setCurrentUser(updatedUser);
      auth.setMessage("Аватар обновлён");
      auth.setError("");
    } catch (err) {
      auth.setError(err.message || "Не удалось загрузить аватар");
    }

    e.target.value = "";
  }

  async function handleSendMessage(e) {
    e.preventDefault();

    if (!chats.selectedChat || !newMessage.trim()) return;

    try {
      await chats.send(chats.selectedChat.id, newMessage);
      setNewMessage("");
      await chats.loadMessages(chats.selectedChat.id);
      await chats.loadChats();
    } catch (err) {
      auth.setError(err.message || "Не удалось отправить сообщение");
    }
  }

  async function handleSendImage(e) {
    e.preventDefault();

    if (!chats.selectedChat || !selectedImage) return;

    try {
      await chats.sendImg(chats.selectedChat.id, selectedImage);
      setSelectedImage(null);
      await chats.loadMessages(chats.selectedChat.id);
      await chats.loadChats();
    } catch (err) {
      auth.setError(err.message || "Не удалось отправить изображение");
    }
  }

  function getChatDisplayName(chat) {
    if (chat.is_group) return chat.title;

    const other = chat.participants.find(
      (p) => p.id !== auth.currentUser?.id
    );

    return other?.username || "Чат";
  }

  useEffect(() => {
    async function init() {
      try {
        const user = await auth.bootstrapAuth();

        if (user) {
          await Promise.all([loadUsers(), loadContacts(), chats.loadChats()]);
        }
      } catch (err) {
        auth.setError(err.message || "Не удалось восстановить сессию");
      }
    }

    init();
  }, []);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);

      if (!mobile) {
        setMobileView("chats");
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (chats.selectedChat) {
      chats.loadMessages(chats.selectedChat.id);
    }
  }, [chats.selectedChat]);

  useWebSocket(localStorage.getItem("access_token"), async (data) => {
    if (!auth.currentUser) return;

    if (data?.type === "new_message") {
      await chats.loadChats();

      if (
        chats.selectedChat &&
        (data.chat_id === chats.selectedChat.id ||
          data.chat?.id === chats.selectedChat.id)
      ) {
        await chats.loadMessages(chats.selectedChat.id);
      }
    }
  });

  if (auth.isAuthLoading) {
    return <div style={{ padding: 20 }}>Загрузка...</div>;
  }

  if (!auth.currentUser) {
    return (
      <AuthForm
        mode={auth.mode}
        setMode={auth.setMode}
        registerForm={auth.registerForm}
        setRegisterForm={auth.setRegisterForm}
        loginForm={auth.loginForm}
        setLoginForm={auth.setLoginForm}
        onRegister={handleRegister}
        onLogin={handleLogin}
        message={auth.message}
        error={auth.error}
      />
    );
  }

  return (
    <div style={styles.appContainer}>
      {(!isMobile || mobileView === "chats") && (
        <Sidebar
          currentUser={auth.currentUser}
          chats={chats.chats}
          selectedChat={chats.selectedChat}
          setSelectedChat={(chat) => {
            chats.setSelectedChat(chat);
            if (isMobile) setMobileView("chat");
          }}
          contacts={contacts}
          users={users}
          onAddContact={handleAddContact}
          onOpenPrivateChat={handleOpenPrivateChat}
          groupTitle={chats.groupTitle}
          setGroupTitle={chats.setGroupTitle}
          groupParticipantIds={chats.groupParticipantIds}
          toggleGroupParticipant={chats.toggleGroupParticipant}
          onCreateGroup={handleCreateGroup}
          onAvatarChange={handleAvatarChange}
          getChatDisplayName={getChatDisplayName}
          onLogout={auth.logout}
        />
      )}

      {(!isMobile || mobileView === "chat") && (
        <ChatWindow
          currentUser={auth.currentUser}
          selectedChat={chats.selectedChat}
          messages={chats.messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          selectedImage={selectedImage}
          setSelectedImage={setSelectedImage}
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          onBack={() => setMobileView("chats")}
          isMobile={isMobile}
          usersMap={usersMap}
          getChatDisplayName={getChatDisplayName}
          error={auth.error}
          message={auth.message}
        />
      )}
    </div>
  );
}