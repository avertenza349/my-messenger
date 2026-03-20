import { styles } from "../styles";

function isSameDay(dateA, dateB) {
  const a = new Date(dateA);
  const b = new Date(dateB);

  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatMessageTime(dateString) {
  const date = new Date(dateString);

  return date.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateDivider(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date();

  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Сегодня";
  }

  if (isSameDay(date, yesterday)) {
    return "Вчера";
  }

  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ChatWindow({
  isMobile,
  selectedChat,
  currentUser,
  usersMap,
  messages,
  newMessage,
  setNewMessage,
  onSendMessage,
  onSendImage,
  setSelectedImage,
  selectedImage,
  onBack,
  getChatDisplayName,
  error,
  message,
}) {
  if (!selectedChat) {
    return <div style={styles.emptyState}>Выбери чат слева</div>;
  }

  return (
    <div style={styles.chatArea}>
      <div style={styles.chatHeader}>
        {isMobile && (
          <button style={styles.smallButton} onClick={onBack}>
            Назад
          </button>
        )}
        <h2 style={{ margin: 0 }}>{getChatDisplayName(selectedChat)}</h2>
      </div>

      <div style={styles.messagesArea}>
        {messages.length === 0 ? (
          <div style={styles.emptyState}>Пока нет сообщений</div>
        ) : (
          messages.map((msg, index) => {
            const prevMessage = messages[index - 1];

            const showDate =
              !prevMessage || !isSameDay(prevMessage.created_at, msg.created_at);

            const isMine = msg.sender_id === currentUser.id;

            return (
              <div key={msg.id} style={{ width: "100%" }}>
                {showDate && (
                  <div style={styles.dateDividerWrapper}>
                    <div style={styles.dateDivider}>
                      {formatDateDivider(msg.created_at)}
                    </div>
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: isMine ? "flex-end" : "flex-start",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      ...styles.messageBubble,
                      background: isMine ? "#dbeafe" : "#fff",
                      display: "flex",
                      alignItems: "flex-end",
                      gap: 8,
                    }}
                  >

                    {msg.message_type === "image" && msg.image_url ? (
                      <img
                        src={msg.image_url}
                        alt="Сообщение"
                        style={styles.messageImage}
                      />
                    ) : (
                      <div style={{ flex: 1 }}>
                        {msg.message_type === "image" && msg.image_url ? (
                          <img
                            src={msg.image_url}
                            alt="Сообщение"
                            style={styles.messageImage}
                          />
                        ) : (
                          <div>{msg.content}</div>
                        )}
                      </div>
                    )}

                    <div style={styles.messageTime}>
                      {formatMessageTime(msg.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div style={styles.chatFooter}>
        <form onSubmit={onSendMessage} style={styles.messageForm}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ ...styles.input, flex: 1 }}
            placeholder="Введите сообщение"
          />
          <button type="submit" style={styles.button}>
            Отправить
          </button>
        </form>

        <form onSubmit={onSendImage} style={styles.imageForm}>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
          />
          <button type="submit" style={styles.button} disabled={!selectedImage}>
            Отправить картинку
          </button>
        </form>

        {error && <div style={styles.error}>{error}</div>}
        {message && <div style={styles.success}>{message}</div>}
      </div>
    </div>
  );
}