import { useEffect, useMemo, useState } from "react";
import { getUsers, getContacts, addContactByEmail, uploadMyAvatar } from "./api/users";

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
  const [contactEmail, setContactEmail] = useState("");

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState("chats");

  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  // ===== MAP USERS =====
  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((u) => (map[u.id] = u));
    contacts.forEach((u) => (map[u.id] = u));
    return map;
  }, [users, contacts]);

  // ===== LOAD DATA =====
  async function loadUsers() {
    const data = await getUsers();
    setUsers(data);
  }

  async function loadContacts() {
    const data = await getContacts();
    setContacts(data);
  }

  // ===== CONTACTS =====
  async function handleAddContact(e) {
    e.preventDefault();

    if (!contactEmail.trim()) return;

    await addContactByEmail(contactEmail.trim());
    setContactEmail("");
    await loadContacts();
  }

  // ===== AUTH =====
  async function handleLogin(e) {
    e.preventDefault();

    const user = await auth.login(auth.loginForm.email, auth.loginForm.password);

    if (user) {
      await Promise.all([loadUsers(), loadContacts(), chats.loadChats()]);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    await auth.register(auth.registerForm);
  }

  // ===== CHAT ACTIONS =====
  async function handleOpenPrivateChat(e, userId) {
    e.preventDefault();
    await chats.openPrivateChat(userId);

    if (isMobile) setMobileView("chat");
  }

  async function handleCreateGroup(e) {
    e.preventDefault();
    await chats.createGroup(chats.groupTitle, chats.groupParticipantIds);

    if (isMobile) setMobileView("chat");
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

    await chats.send(chats.selectedChat.id, newMessage);
    setNewMessage("");
  }

  async function handleSendImage(e) {
    e.preventDefault();
    if (!chats.selectedChat || !selectedImage) return;

    await chats.sendImg(chats.selectedChat.id, selectedImage);
    setSelectedImage(null);
  }

  // ===== MOBILE =====
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileView("chats");
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ===== LOAD MESSAGES =====
  useEffect(() => {
    if (chats.selectedChat) {
      chats.loadMessages(chats.selectedChat.id);
    }
  }, [chats.selectedChat]);

  // ===== WEBSOCKET =====
  useWebSocket(
    localStorage.getItem("access_token"),
    (data) => {
      console.log("WS:", data);
      // тут потом можно обновлять чаты/сообщения
    }
  );

  // ===== AUTH SCREEN =====
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

  // ===== MAIN UI =====
  return (
    <div style={styles.appContainer}>
      {(!isMobile || mobileView === "chats") && (
        <Sidebar
          currentUser={auth.currentUser}
          contacts={contacts}
          contactEmail={contactEmail}
          setContactEmail={setContactEmail}
          onAddContact={handleAddContact}
          onOpenPrivateChat={handleOpenPrivateChat}
          groupTitle={chats.groupTitle}
          setGroupTitle={chats.setGroupTitle}
          users={users}
          groupParticipantIds={chats.groupParticipantIds}
          onToggleGroupParticipant={chats.toggleGroupParticipant}
          onCreateGroupChat={handleCreateGroup}
          chats={chats.chats}
          selectedChat={chats.selectedChat}
          onAvatarChange={handleAvatarChange}
          onSelectChat={(chat) => {
            chats.setSelectedChat(chat);
            if (isMobile) setMobileView("chat");
          }}
          getChatDisplayName={(chat) => {
            if (chat.is_group) return chat.title;

            const other = chat.participants.find(
              (p) => p.id !== auth.currentUser.id
            );
            return other?.username || "Чат";
          }}
          onLogout={auth.logout}
        />
      )}

      {(!isMobile || mobileView === "chat") && (
        <ChatWindow
          isMobile={isMobile}
          selectedChat={chats.selectedChat}
          currentUser={auth.currentUser}
          usersMap={usersMap}
          messages={chats.messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          onSendMessage={handleSendMessage}
          onSendImage={handleSendImage}
          setSelectedImage={setSelectedImage}
          selectedImage={selectedImage}
          onBack={() => setMobileView("chats")}
          getChatDisplayName={(chat) => {
            if (chat.is_group) return chat.title;

            const other = chat.participants.find(
              (p) => p.id !== auth.currentUser.id
            );
            return other?.username || "Чат";
          }}
          error={auth.error}
          message={auth.message}
        />
      )}
    </div>
  );
}