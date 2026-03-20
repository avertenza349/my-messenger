import { useState } from "react";
import { styles } from "../styles";
import ChatDeleteModal from "./ChatDeleteModal";

export default function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
  getChatDisplayName,
  onDeleteChat,
}) {
  const safeChats = Array.isArray(chats) ? chats : [];
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("menu");
  const [targetChat, setTargetChat] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  function openDeleteMenu(chat) {
    setTargetChat(chat);
    setModalMode("menu");
    setModalOpen(true);
  }

  function closeModal() {
    if (isDeleting) return;
    setModalOpen(false);
    setModalMode("menu");
    setTargetChat(null);
  }

  function handleContextMenu(e, chat) {
    e.preventDefault();
    openDeleteMenu(chat);
  }

  function handleRequestDelete() {
    setModalMode("confirm");
  }

  async function handleConfirmDelete() {
    if (!targetChat?.id || !onDeleteChat) return;

    try {
      setIsDeleting(true);
      await onDeleteChat(targetChat.id);
      closeModal();
    } catch (error) {
      alert(error.message || "Не удалось удалить чат");
    } finally {
      setIsDeleting(false);
    }
  }

  if (safeChats.length === 0) {
    return <div style={styles.emptyState}>Пока нет чатов</div>;
  }

  return (
    <>
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
              title="ПКМ — действия с чатом"
            >
              <div>
                {getChatDisplayName(chat)}
                {chat.unread_count > 0 ? <span> {chat.unread_count}</span> : null}
              </div>

              <div>{chat.is_group ? "Групповой чат" : "Личный чат"}</div>

              <div>{preview}</div>
            </div>
          );
        })}
      </div>

      <ChatDeleteModal
        isOpen={modalOpen}
        mode={modalMode}
        chatName={targetChat ? getChatDisplayName(targetChat) : ""}
        onClose={closeModal}
        onRequestDelete={handleRequestDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  );
}