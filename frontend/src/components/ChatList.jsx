import { styles } from "../styles";

export default function ChatList({
  chats,
  selectedChat,
  onSelectChat,
  getChatDisplayName,
}) {
  return (
    <div style={styles.chatList}>
      {chats.length === 0 ? (
        <p>Пока нет чатов</p>
      ) : (
        chats.map((chat) => (
          <div
            key={chat.id}
            onClick={() => onSelectChat(chat)}
            style={{
              ...styles.chatItem,
              background: selectedChat?.id === chat.id ? "#dbeafe" : "#ffffff",
            }}
          >
            <div style={styles.chatTitleRow}>
              <strong>{getChatDisplayName(chat)}</strong>
              {chat.unreadCount > 0 && (
                <span style={styles.unreadBadge}>{chat.unreadCount}</span>
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
  );
}