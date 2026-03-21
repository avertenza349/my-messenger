import { useState } from "react";
import { styles } from "../styles";
import ChatDeleteModal from "./ChatDeleteModal";

function getFullAvatarUrl(avatarUrl) {
  if (!avatarUrl) return null;
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  return `http://127.0.0.1:8000${avatarUrl}`;
}

export default function ChatList({
  chats,
  selectedChat,
  setSelectedChat,
  getChatDisplayName,
  onDeleteChat,
  currentUser,
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

  function getOtherParticipant(chat) {
    if (chat.is_group) return null;
    if (!Array.isArray(chat.participants) || chat.participants.length === 0) {
      return null;
    }

    return (
      chat.participants.find((participant) => participant.id !== currentUser?.id) ||
      chat.participants[0]
    );
  }

  function renderAvatar(chat) {
    if (chat.is_group) {
      return <div style={styles.chatAvatarFallback}>👥</div>;
    }

    const otherParticipant = getOtherParticipant(chat);
    const avatarUrl = getFullAvatarUrl(otherParticipant?.avatar_url);

    if (avatarUrl) {
      return (
        <img
          src={avatarUrl}
          alt={otherParticipant?.username || "Аватар"}
          style={styles.chatAvatarImage}
        />
      );
    }

    const firstLetter = (
      otherParticipant?.username?.[0] ||
      getChatDisplayName(chat)?.[0] ||
      "U"
    ).toUpperCase();

    return <div style={styles.chatAvatarFallback}>{firstLetter}</div>;
  }

  if (safeChats.length === 0) {
    return <div style={styles.emptyState}>Пока нет чатов</div>;
  }

  return (
    <>
      <div>
        {safeChats.map((chat) => {
          const isSelected = selectedChat?.id === chat.id;

          const previewSource =
            chat.last_message?.message_type === "image"
              ? "📷 Изображение"
              : chat.last_message?.content || "Нет сообщений";

          const preview =
            previewSource.length > 40
              ? `${previewSource.slice(0, 40)}...`
              : previewSource;

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
              <div style={styles.chatAvatar}>{renderAvatar(chat)}</div>

              <div style={styles.chatInfo}>
                <div style={styles.chatTopRow}>
                  <div style={styles.chatTitleText}>{getChatDisplayName(chat)}</div>
                  {chat.unread_count > 0 ? (
                    <span style={styles.chatUnreadBadge}>{chat.unread_count}</span>
                  ) : null}
                </div>

                <div style={styles.chatPreviewText}>{preview}</div>
              </div>
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