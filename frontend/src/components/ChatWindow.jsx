import { styles } from "../styles";

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
          messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                ...styles.messageBubble,
                alignSelf:
                  msg.sender_id === currentUser.id ? "flex-end" : "flex-start",
                background:
                  msg.sender_id === currentUser.id ? "#dbeafe" : "#fff",
              }}
            >
              <div style={styles.messageAuthor}>
                {msg.sender_id === currentUser.id
                  ? "Ты"
                  : usersMap[msg.sender_id]?.username || `User #${msg.sender_id}`}
              </div>

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
          ))
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