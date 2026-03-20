import { styles } from "../styles";

export default function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
  getChatDisplayName,
}) {
  const safeChats = Array.isArray(chats) ? chats : [];

  if (safeChats.length === 0) {
    return <div style={styles.mutedText}>Пока нет чатов</div>;
  }

  return (
    <div style={styles.chatList}>
      {safeChats.map((chat) => {
        const isSelected = selectedChat?.id === chat.id;

        const preview =
          chat.last_message?.content?.length > 40
            ? `${chat.last_message.content.slice(0, 40)}...`
            : chat.last_message?.content || "Нет сообщений";

        return (
          <button
            key={chat.id}
            type="button"
            onClick={() => setSelectedChat(chat)}
            style={{
              ...styles.chatItem,
              ...(isSelected ? styles.chatItemActive : {}),
            }}
          >
            <div style={styles.chatTitleRow}>
              <strong>{getChatDisplayName(chat)}</strong>

              {chat.unread_count > 0 ? (
                <span style={styles.unreadBadge}>{chat.unread_count}</span>
              ) : null}
            </div>

            <div style={styles.chatMeta}>
              {chat.is_group ? "Групповой чат" : "Личный чат"}
            </div>

            <div style={styles.chatPreview}>{preview}</div>
          </button>
        );
      })}
    </div>
  );
}