import { useEffect, useMemo, useRef, useState } from "react";
import { registerUser, loginUser, getCurrentUser } from "./api/auth";
import {
  getMyChats,
  getChatMessages,
  sendMessage,
  sendImage,
  createPrivateChat,
  createGroupChat,
} from "./api/chats";
import { getUsers, getContacts, addContactByEmail } from "./api/users";
import "./App.css";

export default function App() {
  const wsRef = useRef(null);

  const [mode, setMode] = useState("login");
  const [registerForm, setRegisterForm] = useState({
    email: "",
    username: "",
    password: "",
  });
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [mobileView, setMobileView] = useState("chats");

  const [currentUser, setCurrentUser] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [users, setUsers] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [contactEmail, setContactEmail] = useState("");

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [groupTitle, setGroupTitle] = useState("");
  const [groupParticipantIds, setGroupParticipantIds] = useState([]);

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((user) => {
      map[user.id] = user;
    });
    contacts.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [users, contacts]);

  async function loadCurrentUser() {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      setError("");
      return user;
    } catch {
      setCurrentUser(null);
      return null;
    }
  }

  async function loadUsers() {
    try {
      const userList = await getUsers();
      setUsers(userList);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadContacts() {
    try {
      const contactList = await getContacts();
      setContacts(contactList);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadChats() {
    try {
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

      if (sortedChats.length > 0 && !selectedChat) {
        setSelectedChat(sortedChats[0]);
      }

      if (selectedChat) {
        const updatedSelected = sortedChats.find(
          (chat) => chat.id === selectedChat.id,
        );
        if (updatedSelected) {
          setSelectedChat(updatedSelected);
        }
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadMessages(chatId) {
    try {
      const messageList = await getChatMessages(chatId);
      setMessages(messageList);
    } catch (err) {
      setError(err.message);
    }
  }

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
    if (selectedChat) {
      loadMessages(selectedChat.id);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id ? { ...chat, unreadCount: 0 } : chat,
        ),
      );
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token || !currentUser) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`);
    wsRef.current = ws;
    let pingInterval = null;

    ws.onopen = () => {
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send("ping");
        }
      }, 20000);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new_message") {
        const incomingMessage = data.message;
        const incomingChatId = data.chat_id;

        setChats((prevChats) => {
          const updated = prevChats.map((chat) => {
            if (chat.id === incomingChatId) {
              const isActiveChat =
                selectedChat && selectedChat.id === incomingChatId;
              const isOwnMessage = incomingMessage.sender_id === currentUser.id;

              return {
                ...chat,
                last_message: incomingMessage,
                unreadCount:
                  isActiveChat || isOwnMessage
                    ? 0
                    : (chat.unreadCount || 0) + 1,
              };
            }
            return chat;
          });

          updated.sort((a, b) => {
            const aDate = a.last_message?.created_at || "";
            const bDate = b.last_message?.created_at || "";
            return bDate.localeCompare(aDate);
          });

          return [...updated];
        });

        setSelectedChat((prevSelectedChat) => {
          if (!prevSelectedChat) return prevSelectedChat;
          if (prevSelectedChat.id === incomingChatId) {
            return {
              ...prevSelectedChat,
              last_message: incomingMessage,
            };
          }
          return prevSelectedChat;
        });

        setMessages((prevMessages) => {
          if (!selectedChat || selectedChat.id !== incomingChatId) {
            return prevMessages;
          }

          const alreadyExists = prevMessages.some(
            (msg) => msg.id === incomingMessage.id,
          );
          if (alreadyExists) return prevMessages;

          return [...prevMessages, incomingMessage];
        });
      }
    };

    ws.onclose = () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
    };

    return () => {
      if (pingInterval) {
        clearInterval(pingInterval);
      }
      ws.close();
    };
  }, [currentUser, selectedChat]);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await registerUser(registerForm);
      setMessage(`Пользователь ${result.username} успешно зарегистрирован`);
      setMode("login");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const result = await loginUser(loginForm.email, loginForm.password);
      localStorage.setItem("access_token", result.access_token);

      const user = await loadCurrentUser();
      if (user) {
        await Promise.all([loadUsers(), loadContacts(), loadChats()]);
      }

      setMessage("Вход выполнен");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleAddContact(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!contactEmail.trim()) {
      setError("Введи почту пользователя");
      return;
    }

    try {
      await addContactByEmail(contactEmail.trim());
      await loadContacts();
      setContactEmail("");
      setMessage("Контакт добавлен");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreatePrivateChat(e, targetUserId) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!targetUserId) {
      setError("Не выбран контакт");
      return;
    }

    try {
      const chat = await createPrivateChat(targetUserId);
      await loadChats();
      setSelectedChat(chat);

      if (isMobile) {
        setMobileView("chat");
      }

      setMessage("Личный чат открыт");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateGroupChat(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!groupTitle.trim()) {
      setError("Введи название группы");
      return;
    }

    try {
      const chat = await createGroupChat(groupTitle, groupParticipantIds);
      await loadChats();
      setSelectedChat(chat);

      if (isMobile) {
        setMobileView("chat");
      }

      setGroupTitle("");
      setGroupParticipantIds([]);
      setMessage("Групповой чат создан");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    if (!selectedChat || !newMessage.trim()) return;

    setError("");
    setMessage("");

    try {
      await sendMessage(selectedChat.id, newMessage);
      setNewMessage("");
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSendImage(e) {
    e.preventDefault();
    if (!selectedChat || !selectedImage) return;

    setError("");
    setMessage("");

    try {
      await sendImage(selectedChat.id, selectedImage);
      setSelectedImage(null);
    } catch (err) {
      setError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("access_token");
    setCurrentUser(null);
    setUsers([]);
    setContacts([]);
    setChats([]);
    setSelectedChat(null);
    setMessages([]);
    setMessage("Вы вышли из аккаунта");
  }

  function getChatDisplayName(chat) {
    if (chat.is_group) {
      return chat.title || `Группа #${chat.id}`;
    }

    const otherUser = chat.participants.find((p) => p.id !== currentUser.id);
    if (!otherUser) return `Чат #${chat.id}`;
    return otherUser.username;
  }

  function toggleGroupParticipant(userId) {
    setGroupParticipantIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  }

  if (!currentUser) {
    return (
      <div style={styles.authWrapper}>
        <h1>Мой мессенджер</h1>

        <div style={styles.authSwitch}>
          <button onClick={() => setMode("login")} style={styles.button}>
            Логин
          </button>
          <button onClick={() => setMode("register")} style={styles.button}>
            Регистрация
          </button>
        </div>

        {mode === "register" ? (
          <form onSubmit={handleRegister} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={registerForm.email}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, email: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Username"
              value={registerForm.username}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, username: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) =>
                setRegisterForm({ ...registerForm, password: e.target.value })
              }
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Зарегистрироваться
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} style={styles.form}>
            <input
              type="email"
              placeholder="Email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm({ ...loginForm, email: e.target.value })
              }
              style={styles.input}
            />
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm({ ...loginForm, password: e.target.value })
              }
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Войти
            </button>
          </form>
        )}

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      {(!isMobile || mobileView === "chats") && (
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2>Чаты</h2>
            <button onClick={handleLogout} style={styles.smallButton}>
              Выйти
            </button>
          </div>

          <div style={styles.userCard}>
            <strong>{currentUser.username}</strong>
            <div>{currentUser.email}</div>
          </div>

          <div style={styles.block}>
            <h3>Новый личный чат</h3>

            <form onSubmit={handleAddContact} style={styles.contactForm}>
              <input
                type="email"
                placeholder="Почта пользователя"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={styles.input}
              />
              <button type="submit" style={styles.fullButton}>
                Добавить в контакты
              </button>
            </form>

            <div style={styles.contactsList}>
              {contacts.length === 0 ? (
                <p style={styles.mutedText}>Пока нет контактов</p>
              ) : (
                contacts.map((user) => (
                  <div
                    key={user.id}
                    style={styles.contactItem}
                    onClick={(e) => handleCreatePrivateChat(e, user.id)}
                  >
                    <strong>{user.username}</strong>
                    <div>{user.email}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div style={styles.block}>
            <h3>Новая группа</h3>
            <form onSubmit={handleCreateGroupChat}>
              <input
                type="text"
                placeholder="Название группы"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                style={styles.input}
              />

              <div style={styles.scrollList}>
                {users.length === 0 ? (
                  <p style={styles.mutedText}>Нет доступных пользователей</p>
                ) : (
                  users.map((user) => (
                    <label key={user.id} style={styles.checkboxItem}>
                      <input
                        type="checkbox"
                        checked={groupParticipantIds.includes(user.id)}
                        onChange={() => toggleGroupParticipant(user.id)}
                      />
                      <span>
                        {user.username} ({user.email})
                      </span>
                    </label>
                  ))
                )}
              </div>

              <button type="submit" style={styles.fullButton}>
                Создать группу
              </button>
            </form>
          </div>

          <div style={styles.chatList}>
            {chats.length === 0 ? (
              <p>Пока нет чатов</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => {
                    setSelectedChat(chat);
                    if (isMobile) {
                      setMobileView("chat");
                    }
                  }}
                  style={{
                    ...styles.chatItem,
                    background:
                      selectedChat?.id === chat.id ? "#dbeafe" : "#ffffff",
                  }}
                >
                  <div style={styles.chatTitleRow}>
                    <strong>{getChatDisplayName(chat)}</strong>
                    {chat.unreadCount > 0 && (
                      <span style={styles.unreadBadge}>
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div style={styles.chatMeta}>
                    {chat.is_group
                      ? chat.participants.map((p) => p.username).join(", ")
                      : "Личный чат"}
                  </div>
                  <div style={styles.chatPreview}>
                    {chat.last_message
                      ? chat.last_message.content || "Изображение"
                      : "Пока нет сообщений"}
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

      {(!isMobile || mobileView === "chat") && (
        <main style={styles.chatArea}>
          {!selectedChat ? (
            <div style={styles.emptyState}>Выбери чат слева</div>
          ) : (
            <>
              <div style={styles.chatHeader}>
                {isMobile && (
                  <button
                    onClick={() => setMobileView("chats")}
                    style={styles.smallButton}
                  >
                    Назад
                  </button>
                )}
                <h2>{getChatDisplayName(selectedChat)}</h2>
              </div>

              <div style={styles.messagesArea}>
                {messages.length === 0 ? (
                  <p>Пока нет сообщений</p>
                ) : (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      style={{
                        ...styles.messageBubble,
                        alignSelf:
                          msg.sender_id === currentUser.id
                            ? "flex-end"
                            : "flex-start",
                        background:
                          msg.sender_id === currentUser.id
                            ? "#dcfce7"
                            : "#ffffff",
                      }}
                    >
                      <div style={styles.messageAuthor}>
                        {msg.sender_id === currentUser.id
                          ? "Ты"
                          : usersMap[msg.sender_id]?.username ||
                            `User #${msg.sender_id}`}
                      </div>

                      {msg.message_type === "image" && msg.image_url ? (
                        <img
                          src={`http://127.0.0.1:8000${msg.image_url}`}
                          alt="Изображение"
                          style={styles.messageImage}
                        />
                      ) : (
                        <div>{msg.content}</div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleSendMessage} style={styles.messageForm}>
                <input
                  type="text"
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  style={{ ...styles.input, flex: 1 }}
                />
                <button type="submit" style={styles.button}>
                  Отправить
                </button>
              </form>

              <form onSubmit={handleSendImage} style={styles.imageForm}>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedImage(e.target.files?.[0] || null)
                  }
                />
                <button
                  type="submit"
                  style={styles.button}
                  disabled={!selectedImage}
                >
                  Отправить картинку
                </button>
              </form>
            </>
          )}

          {error && <p style={styles.error}>{error}</p>}
          {message && <p style={styles.success}>{message}</p>}
        </main>
      )}
    </div>
  );
}

const styles = {
  appContainer: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
  },
  sidebar: {
    width: 410,
    padding: 16,
    borderRight: "1px solid #d1d5db",
    background: "#f3f4f6",
    boxSizing: "border-box",
    overflowY: "auto",
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  userCard: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background: "#fff",
    padding: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  block: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background: "#fff",
    padding: 12,
    marginBottom: 14,
  },
  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 12,
  },
  contactsList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 260,
    overflowY: "auto",
    marginBottom: 4,
  },
  contactItem: {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: 12,
    cursor: "pointer",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  fullButton: {
    width: "100%",
    padding: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
  },
  scrollList: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: 10,
    maxHeight: 180,
    overflowY: "auto",
    marginBottom: 12,
  },
  checkboxItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  chatItem: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    cursor: "pointer",
  },
  chatTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    background: "#2563eb",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    padding: "0 8px",
  },
  chatMeta: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
  },
  chatPreview: {
    fontSize: 14,
    color: "#334155",
  },
  chatArea: {
    flex: 1,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #d1d5db",
  },
  messagesArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
    padding: "12px 0",
  },
  messageBubble: {
    maxWidth: 320,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d1d5db",
  },
  messageAuthor: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
  },
  messageImage: {
    width: "100%",
    borderRadius: 8,
  },
  messageForm: {
    display: "flex",
    gap: 12,
  },
  imageForm: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },
  authWrapper: {
    maxWidth: 420,
    margin: "60px auto",
    padding: 20,
  },
  authSwitch: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  },
  button: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
  },
  smallButton: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
  },
  mutedText: {
    color: "#64748b",
  },
  emptyState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },
  success: {
    color: "green",
  },
  error: {
    color: "crimson",
  },
};