import { useEffect, useLayoutEffect, useRef } from "react";
import { styles } from "../styles";

function isSameDay(first, second) {
  const firstDate = new Date(first);
  const secondDate = new Date(second);

  return (
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  );
}

function formatMessageTime(dateString) {
  return new Date(dateString).toLocaleTimeString("ru-RU", {
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
  onLoadOlderMessages,
  onSaveScrollPosition,
  getSavedScrollPosition,
  ensureMessagesForSavedPosition,
  isLoadingOlder,
  hasMoreMessages,
}) {
  const messagesRef = useRef(null);
  const restoreDoneRef = useRef({});
  const prependStateRef = useRef(null);
  const prevChatIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container || !selectedChat?.id) return;

    const handleScroll = () => {
      onSaveScrollPosition?.(selectedChat.id, container.scrollTop);

      if (
        container.scrollTop <= 80 &&
        hasMoreMessages &&
        !isLoadingOlder
      ) {
        prependStateRef.current = {
          chatId: selectedChat.id,
          prevScrollHeight: container.scrollHeight,
          prevScrollTop: container.scrollTop,
        };

        onLoadOlderMessages?.(selectedChat.id);
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [
    selectedChat?.id,
    onSaveScrollPosition,
    onLoadOlderMessages,
    hasMoreMessages,
    isLoadingOlder,
  ]);

  useEffect(() => {
    restoreDoneRef.current = {};
  }, [selectedChat?.id]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container || !selectedChat?.id) return;

    const currentChatId = selectedChat.id;
    const prevChatId = prevChatIdRef.current;

    if (prevChatId && prevChatId !== currentChatId) {
      onSaveScrollPosition?.(prevChatId, container.scrollTop);
    }

    prevChatIdRef.current = currentChatId;
  }, [selectedChat?.id, onSaveScrollPosition]);

  useEffect(() => {
    let cancelled = false;

    async function restoreScroll() {
      const container = messagesRef.current;
      if (!container || !selectedChat?.id) return;
      if (restoreDoneRef.current[selectedChat.id]) return;

      await ensureMessagesForSavedPosition?.(selectedChat.id, container);

      if (cancelled) return;

      const savedScrollTop = getSavedScrollPosition?.(selectedChat.id) || 0;

      requestAnimationFrame(() => {
        const currentContainer = messagesRef.current;
        if (!currentContainer) return;

        if (savedScrollTop > 0) {
          currentContainer.scrollTop = savedScrollTop;
        } else {
          currentContainer.scrollTop = currentContainer.scrollHeight;
        }

        restoreDoneRef.current[selectedChat.id] = true;
      });
    }

    restoreScroll();

    return () => {
      cancelled = true;
    };
  }, [
    selectedChat?.id,
    messages.length,
    ensureMessagesForSavedPosition,
    getSavedScrollPosition,
  ]);

  useLayoutEffect(() => {
    const container = messagesRef.current;
    const prependState = prependStateRef.current;

    if (!container || !prependState || !selectedChat?.id) {
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    if (
      prependState.chatId === selectedChat.id &&
      messages.length > prevMessagesLengthRef.current
    ) {
      const newScrollHeight = container.scrollHeight;
      const delta = newScrollHeight - prependState.prevScrollHeight;
      container.scrollTop = prependState.prevScrollTop + delta;
      prependStateRef.current = null;
    }

    prevMessagesLengthRef.current = messages.length;
  }, [messages, selectedChat?.id]);

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

      <div ref={messagesRef} style={styles.messagesArea}>
        {isLoadingOlder && (
          <div style={styles.historyLoader}>Загружаю старые сообщения...</div>
        )}

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
                        <div style={styles.messageAuthor}>
                          {isMine
                            ? "Ты"
                            : usersMap[msg.sender_id]?.username ||
                              `User #${msg.sender_id}`}
                        </div>
                        <div>{msg.content}</div>
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
          <button
            type="submit"
            style={styles.button}
            disabled={!selectedImage}
          >
            Отправить картинку
          </button>
        </form>

        {error && <div style={styles.errorText}>{error}</div>}
        {message && <div style={styles.successText}>{message}</div>}
      </div>
    </div>
  );
}