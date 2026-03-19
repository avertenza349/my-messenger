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
import { getUsers } from "./api/users";

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

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [privateUserId, setPrivateUserId] = useState("");
  const [groupTitle, setGroupTitle] = useState("");
  const [groupParticipantIds, setGroupParticipantIds] = useState([]);

  const usersMap = useMemo(() => {
    const map = {};
    users.forEach((user) => {
      map[user.id] = user;
    });
    return map;
  }, [users]);

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
          (chat) => chat.id === selectedChat.id
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
    if (selectedChat) {
      loadMessages(selectedChat.id);

      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === selectedChat.id
            ? { ...chat, unreadCount: 0 }
            : chat
        )
      );
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedChat) {
      loadMessages(selectedChat.id);
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

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
    const token = localStorage.getItem("access_token");
    if (!token || !currentUser) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const ws = new WebSocket(`ws://127.0.0.1:8000/ws?token=${token}`);
    wsRef.current = ws;

    let pingInterval = null;

    ws.onopen = () => {
      console.log("Global WebSocket connected");

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
              const isActiveChat = selectedChat && selectedChat.id === incomingChatId;
              const isOwnMessage = incomingMessage.sender_id === currentUser.id;

              return {
                ...chat,
                last_message: incomingMessage,
                unreadCount: isActiveChat || isOwnMessage
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
            (msg) => msg.id === incomingMessage.id
          );
          if (alreadyExists) return prevMessages;

          return [...prevMessages, incomingMessage];
        });
      }
    };

    ws.onerror = (event) => {
      console.log("Global WebSocket error", event);
    };

    ws.onclose = () => {
      console.log("Global WebSocket disconnected");
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
        await Promise.all([loadUsers(), loadChats()]);
      }

      setMessage("Вход выполнен");
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

  async function handleCreatePrivateChat(e) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!privateUserId) {
      setError("Выбери пользователя");
      return;
    }

    try {
      const chat = await createPrivateChat(privateUserId);
      await loadChats();
      setSelectedChat(chat);
      if (isMobile) {
        setMobileView("chat");
      }
      setPrivateUserId("");
      setMessage("Личный чат создан");
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

  function handleLogout() {
    localStorage.removeItem("access_token");
    setCurrentUser(null);
    setUsers([]);
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
        : [...prev, userId]
    );
  }

  if (!currentUser) {
    return (
      <div style={styles.authContainer}>
        <h1>Мой мессенджер</h1>

        <div style={styles.switcher}>
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
    <div
      style={{
        ...styles.layout,
        gridTemplateColumns: isMobile ? "1fr" : "380px 1fr",
      }}
    >
      {(!isMobile || mobileView === "chats") && (
        <aside style={styles.sidebar}>
          <div style={styles.sidebarHeader}>
            <h2 style={{ margin: 0 }}>Чаты</h2>
            <button onClick={handleLogout} style={styles.smallButton}>
              Выйти
            </button>
          </div>

          <div style={styles.userBox}>
            <div>
              <b>{currentUser.username}</b>
            </div>
            <div style={styles.muted}>{currentUser.email}</div>
          </div>

          <form onSubmit={handleCreatePrivateChat} style={styles.createForm}>
            <div style={styles.formTitle}>Новый личный чат</div>
            <select
              value={privateUserId}
              onChange={(e) => setPrivateUserId(e.target.value)}
              style={styles.input}
            >
              <option value="">Выбери пользователя</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>
            <button type="submit" style={styles.smallButton}>
              Создать
            </button>
          </form>

          <form onSubmit={handleCreateGroupChat} style={styles.createForm}>
            <div style={styles.formTitle}>Новая группа</div>
            <input
              type="text"
              placeholder="Название группы"
              value={groupTitle}
              onChange={(e) => setGroupTitle(e.target.value)}
              style={styles.input}
            />

            <div style={styles.participantsBox}>
              {users.length === 0 ? (
                <div style={styles.muted}>Нет доступных пользователей</div>
              ) : (
                users.map((user) => (
                  <label key={user.id} style={styles.checkboxLabel}>
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

            <button type="submit" style={styles.smallButton}>
              Создать группу
            </button>
          </form>

          <div style={styles.chatList}>
            {chats.length === 0 ? (
              <p style={styles.muted}>Пока нет чатов</p>
            ) : (
              chats.map((chat) => (
                <button
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
                  <div style={styles.chatTopRow}>
                    <div style={styles.chatTitle}>{getChatDisplayName(chat)}</div>

                    {chat.unreadCount > 0 && (
                      <div style={styles.unreadBadge}>{chat.unreadCount}</div>
                    )}
                  </div>

                  <div style={styles.muted}>
                    {chat.is_group
                      ? chat.participants.map((p) => p.username).join(", ")
                      : "Личный чат"}
                  </div>

                  <div style={styles.lastMessagePreview}>
                    {chat.last_message
                      ? chat.last_message.content || "Изображение"
                      : "Пока нет сообщений"}
                  </div>
                </button>
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
                <div style={styles.chatHeaderInner}>
                  {isMobile && (
                    <button
                      onClick={() => setMobileView("chats")}
                      style={styles.smallButton}
                    >
                      Назад
                    </button>
                  )}
                  <h2 style={{ margin: 0 }}>{getChatDisplayName(selectedChat)}</h2>
                </div>
              </div>

              <div style={styles.messagesBox}>
                {messages.length === 0 ? (
                  <p style={styles.muted}>Пока нет сообщений</p>
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
                            : "#f1f5f9",
                      }}
                    >
                      <div style={styles.messageMeta}>
                        {msg.sender_id === currentUser.id
                          ? "Ты"
                          : usersMap[msg.sender_id]?.username ||
                          `User #${msg.sender_id}`}
                      </div>

                      {msg.message_type === "image" && msg.image_url ? (
                        <img
                          src={`http://127.0.0.1:8000${msg.image_url}`}
                          alt="uploaded"
                          style={styles.chatImage}
                        />
                      ) : (
                        <div>{msg.content}</div>
                      )}
                    </div>
                  ))
                )}
              </div>

              <div style={styles.composerWrapper}>
                <form onSubmit={handleSendMessage} style={styles.messageForm}>
                  <input
                    type="text"
                    placeholder="Введите сообщение..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={styles.input}
                  />
                  <button type="submit" style={styles.button}>
                    Отправить
                  </button>
                </form>

                <form onSubmit={handleSendImage} style={styles.imageForm}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                  />
                  <button
                    type="submit"
                    style={styles.smallButton}
                    disabled={!selectedImage}
                  >
                    Отправить картинку
                  </button>
                </form>
              </div>
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
  authContainer: {
    maxWidth: "420px",
    margin: "40px auto",
    padding: "24px",
    border: "1px solid #ccc",
    borderRadius: "12px",
    fontFamily: "Arial, sans-serif",
    background: "#fff",
  },
  layout: {
    display: "grid",
    gridTemplateColumns: "380px 1fr",
    height: "100vh",
    fontFamily: "Arial, sans-serif",
  },
  sidebar: {
    borderRight: "1px solid #ddd",
    padding: "16px",
    background: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    overflowY: "auto",
    height: "100vh",
    boxSizing: "border-box",
  },
  sidebarHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  userBox: {
    padding: "12px",
    borderRadius: "10px",
    background: "#fff",
    border: "1px solid #e5e7eb",
  },
  createForm: {
    padding: "12px",
    borderRadius: "10px",
    background: "#fff",
    border: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  formTitle: {
    fontWeight: "bold",
    fontSize: "14px",
  },
  participantsBox: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    maxHeight: "160px",
    overflowY: "auto",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    padding: "8px",
    background: "#fff",
  },
  checkboxLabel: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    fontSize: "14px",
  },
  chatList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  chatArea: {
    display: "flex",
    flexDirection: "column",
    padding: "16px",
    background: "#ffffff",
    height: "100vh",
    boxSizing: "border-box",
  },
  chatHeader: {
    paddingBottom: "12px",
    borderBottom: "1px solid #e5e7eb",
    marginBottom: "12px",
  },
  messagesBox: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflowY: "auto",
    padding: "12px 0",
  },
  messageBubble: {
    maxWidth: "60%",
    padding: "10px 12px",
    borderRadius: "12px",
    border: "1px solid #ddd",
  },
  messageMeta: {
    fontSize: "12px",
    color: "#64748b",
    marginBottom: "4px",
  },
  messageForm: {
    display: "flex",
    gap: "12px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7eb",
  },
  chatItem: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "12px",
    textAlign: "left",
    cursor: "pointer",
  },
  chatTitle: {
    fontWeight: "bold",
    marginBottom: "4px",
  },
  lastMessagePreview: {
    color: "#475569",
    fontSize: "13px",
    marginTop: "6px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  emptyState: {
    margin: "auto",
    color: "#64748b",
    fontSize: "18px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "20px",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    width: "100%",
    boxSizing: "border-box",
  },
  button: {
    padding: "12px",
    fontSize: "16px",
    cursor: "pointer",
  },
  smallButton: {
    padding: "10px 12px",
    fontSize: "14px",
    cursor: "pointer",
  },
  switcher: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
  },
  success: {
    color: "green",
    marginTop: "16px",
  },
  error: {
    color: "red",
    marginTop: "16px",
  },
  muted: {
    color: "#64748b",
    fontSize: "14px",
  },
  chatTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "8px",
  },

  composerWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingTop: "12px",
    borderTop: "1px solid #e5e7eb",
  },

  imageForm: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    flexWrap: "wrap",
  },

  chatImage: {
    maxWidth: "280px",
    maxHeight: "280px",
    borderRadius: "10px",
    display: "block",
  },

  chatHeaderInner: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  unreadBadge: {
    minWidth: "22px",
    height: "22px",
    borderRadius: "999px",
    background: "#2563eb",
    color: "#fff",
    fontSize: "12px",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0 6px",
    flexShrink: 0,
  },
};