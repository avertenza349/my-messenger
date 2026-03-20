import { styles } from "../styles";

export default function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
  getChatDisplayName,
}) {
  const safeChats = Array.isArray(chats) ? chats : [];

  if (safeChats.length === 0) {
    return <p>Пока нет чатов</p>;
  }

  return (
    <>
      {safeChats.map((chat) => {
        const isSelected = selectedChat?.id === chat.id;

        const preview =
          chat.last_message?.content?.length > 40
            ? `${chat.last_message.content.slice(0, 40)}...`
            : chat.last_message?.content || "Нет сообщений";

        return (
          <button
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            style={{
              ...styles.chatItem,
              ...(isSelected ? styles.chatItemActive : {}),
            }}
          >
            <div style={styles.chatItemHeader}>
              <strong>{getChatDisplayName(chat)}</strong>

              {chat.unreadCount > 0 ? (
                <span style={styles.unreadBadge}>{chat.unreadCount}</span>
              ) : null}
            </div>

            <div style={styles.chatMeta}>
              {chat.is_group ? "Групповой чат" : "Личный чат"}
            </div>

            <div style={styles.chatPreview}>{preview}</div>
          </button>
        );
      })}
    </>
  );
}