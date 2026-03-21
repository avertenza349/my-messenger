import { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const fileInputRef = useRef(null);
  const restoreDoneRef = useRef({});
  const prependStateRef = useRef(null);
  const prevChatIdRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);
  const shouldAutoScrollRef = useRef(true);

  const [viewerImage, setViewerImage] = useState(null);
  const [viewerZoom, setViewerZoom] = useState(1);
  const [isDragOver, setIsDragOver] = useState(false);

  function scrollToBottom(behavior = "auto") {
    const container = messagesRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  }

  function isNearBottom(container, threshold = 120) {
    return (
      container.scrollHeight - container.scrollTop - container.clientHeight <=
      threshold
    );
  }

  function openImageViewer(imageUrl) {
    setViewerImage(imageUrl);
    setViewerZoom(1);
  }

  function closeImageViewer() {
    setViewerImage(null);
    setViewerZoom(1);
  }

  function zoomIn() {
    setViewerZoom((prev) => Math.min(prev + 0.25, 4));
  }

  function zoomOut() {
    setViewerZoom((prev) => Math.max(prev - 0.25, 0.5));
  }

  function resetZoom() {
    setViewerZoom(1);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer?.files?.[0];
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      return;
    }

    setSelectedImage(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    if (!isDragOver) {
      setIsDragOver(true);
    }
  }

  function handleDragLeave(e) {
    if (e.currentTarget === e.target) {
      setIsDragOver(false);
    }
  }

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!viewerImage) return;

      if (e.key === "Escape") {
        closeImageViewer();
      }

      if (e.key === "+" || e.key === "=") {
        zoomIn();
      }

      if (e.key === "-") {
        zoomOut();
      }

      if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [viewerImage]);

  useEffect(() => {
    const container = messagesRef.current;
    if (!container || !selectedChat?.id) return;

    const handleScroll = () => {
      onSaveScrollPosition?.(selectedChat.id, container.scrollTop);
      shouldAutoScrollRef.current = isNearBottom(container);

      if (container.scrollTop <= 80 && hasMoreMessages && !isLoadingOlder) {
        prependStateRef.current = {
          chatId: selectedChat.id,
          prevScrollHeight: container.scrollHeight,
          prevScrollTop: container.scrollTop,
        };

        onLoadOlderMessages?.(selectedChat.id);
      }
    };

    shouldAutoScrollRef.current = isNearBottom(container);

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

        shouldAutoScrollRef.current = isNearBottom(currentContainer);
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

    if (!container || !selectedChat?.id) {
      prevMessagesLengthRef.current = messages.length;
      return;
    }

    const prevLength = prevMessagesLengthRef.current;
    const currentLength = messages.length;

    if (
      prependState &&
      prependState.chatId === selectedChat.id &&
      currentLength > prevLength
    ) {
      const newScrollHeight = container.scrollHeight;
      const delta = newScrollHeight - prependState.prevScrollHeight;
      container.scrollTop = prependState.prevScrollTop + delta;
      prependStateRef.current = null;
      prevMessagesLengthRef.current = currentLength;
      return;
    }

    if (currentLength > prevLength && shouldAutoScrollRef.current) {
      requestAnimationFrame(() => {
        scrollToBottom("smooth");
      });
    }

    prevMessagesLengthRef.current = currentLength;
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

      <div
        ref={messagesRef}
        style={{
          ...styles.messagesArea,
          ...(isDragOver ? styles.messagesAreaDragOver : {}),
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isDragOver && (
          <div style={styles.dragOverlay}>
            <div style={styles.dragOverlayText}>Отпусти изображение, чтобы прикрепить</div>
          </div>
        )}

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
            const isImageMessage =
              msg.message_type === "image" && !!msg.image_url;

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
                      position: "relative",
                      paddingBottom: 22,
                    }}
                  >
                    {!isMine && (
                      <div style={styles.messageAuthor}>
                        {usersMap[msg.sender_id]?.username ||
                          `User #${msg.sender_id}`}
                      </div>
                    )}

                    {isImageMessage ? (
                      <>
                        <img
                          src={msg.image_url}
                          alt="Изображение"
                          style={styles.messageImage}
                          onClick={() => openImageViewer(msg.image_url)}
                        />
                        {msg.content && (
                          <div style={styles.imageCaption}>{msg.content}</div>
                        )}
                      </>
                    ) : (
                      <div style={styles.messageText}>{msg.content}</div>
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
        <form onSubmit={onSendMessage} style={styles.messageComposer}>
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            style={{ ...styles.input, ...styles.composerInput }}
            placeholder="Введите сообщение"
          />

          <label style={styles.iconButton} title="Прикрепить изображение">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={styles.hiddenFileInput}
              onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
            />
            📎
          </label>

          <button
            type="submit"
            style={{
              ...styles.sendIconButton,
              opacity: !newMessage.trim() && !selectedImage ? 0.5 : 1,
              cursor:
                !newMessage.trim() && !selectedImage ? "not-allowed" : "pointer",
            }}
            title="Отправить"
            disabled={!newMessage.trim() && !selectedImage}
          >
            ➤
          </button>
        </form>

        {selectedImage && (
          <div style={styles.selectedFileRow}>
            <span style={styles.selectedFileName}>
              Выбрано: {selectedImage.name}
            </span>
            <button
              type="button"
              style={styles.clearFileButton}
              onClick={() => {
                setSelectedImage(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              ✕
            </button>
          </div>
        )}

        {error && <div style={styles.errorText}>{error}</div>}
        {message && <div style={styles.successText}>{message}</div>}
      </div>

      {viewerImage && (
        <div style={styles.imageViewerOverlay} onClick={closeImageViewer}>
          <div
            style={styles.imageViewerContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.imageViewerToolbar}>
              <button type="button" style={styles.viewerButton} onClick={zoomOut}>
                −
              </button>
              <button type="button" style={styles.viewerButton} onClick={resetZoom}>
                100%
              </button>
              <button type="button" style={styles.viewerButton} onClick={zoomIn}>
                +
              </button>
              <button type="button" style={styles.viewerCloseButton} onClick={closeImageViewer}>
                ✕
              </button>
            </div>

            <div style={styles.imageViewerStage}>
              <img
                src={viewerImage}
                alt="Полноэкранный просмотр"
                style={{
                  ...styles.imageViewerImage,
                  transform: `scale(${viewerZoom})`,
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}