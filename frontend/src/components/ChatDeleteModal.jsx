import { createPortal } from "react-dom";
import { styles } from "../styles";

export default function ChatDeleteModal({
  isOpen,
  mode,
  chatName,
  onClose,
  onConfirmDelete,
  onRequestDelete,
}) {
  if (!isOpen) return null;

  const isConfirm = mode === "confirm";

  const modalContent = (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div
        style={styles.modalCard}
        onClick={(e) => e.stopPropagation()}
      >
        {!isConfirm ? (
          <>
            <div style={styles.modalTitle}>Действие с чатом</div>

            <button
              type="button"
              style={styles.dangerButton}
              onClick={onRequestDelete}
            >
              Удалить
            </button>

            <button
              type="button"
              style={styles.secondaryButton}
              onClick={onClose}
            >
              Закрыть
            </button>
          </>
        ) : (
          <>
            <div style={styles.modalTitle}>Удаление чата</div>

            <div style={styles.modalText}>
              Вы точно хотите удалить чат{" "}
              <strong>{chatName}</strong>?
            </div>

            <div style={styles.modalActions}>
              <button
                type="button"
                style={styles.secondaryButton}
                onClick={onClose}
              >
                Нет
              </button>

              <button
                type="button"
                style={styles.dangerButton}
                onClick={onConfirmDelete}
              >
                Да
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}