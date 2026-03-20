import { styles } from "../styles";

export default function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
  getChatDisplayName,
  onDeleteChat,
}) {
  const safeChats = Array.isArray(chats) ? chats : [];

  async function handleContextMenu(e, chat) {
    e.preventDefault();

    const confirmed = window.confirm(
      `Удалить чат "${getChatDisplayName(chat)}"?`
    );

    if (!confirmed) return;

    try {
      await onDeleteChat?.(chat.id);
    } catch (error) {
      alert(error.message || "Не удалось удалить чат");
    }
  }

  if (safeChats.length === 0) {
    return <div style={styles.emptyState}>Пока нет чатов</div>;
  }

  return (
    <div>
      {safeChats.map((chat) => {
        const isSelected = selectedChat?.id === chat.id;
        const preview =
          chat.last_message?.content?.length > 40
            ? `${chat.last_message.content.slice(0, 40)}...`
            : chat.last_message?.content || "Нет сообщений";

        return (
          <div
            key={chat.id}
            onClick={() => setSelectedChat(chat)}
            onContextMenu={(e) => handleContextMenu(e, chat)}
            style={{
              ...styles.chatItem,
              ...(isSelected ? styles.chatItemActive : {}),
              cursor: "pointer",
            }}
            title="ПКМ — удалить чат"
          >
            <div>
              {getChatDisplayName(chat)}{" "}
              {chat.unread_count > 0 ? <span>{chat.unread_count}</span> : null}
            </div>

            <div>{chat.is_group ? "Групповой чат" : "Личный чат"}</div>

            <div>{preview}</div>
          </div>
        );
      })}
    </div>
  );
}