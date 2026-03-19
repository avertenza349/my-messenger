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
  return (
    <main style={styles.chatArea}>
      {!selectedChat ? (
        <div style={styles.emptyState}>Выбери чат слева</div>
      ) : (
        <>
          <div style={styles.chatHeader}>
            {isMobile && (
              <button onClick={onBack} style={styles.smallButton}>
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
                      msg.sender_id === currentUser.id ? "flex-end" : "flex-start",
                    background:
                      msg.sender_id === currentUser.id ? "#dcfce7" : "#ffffff",
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

          <form onSubmit={onSendMessage} style={styles.messageForm}>
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

          <form onSubmit={onSendImage} style={styles.imageForm}>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
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
  );
}