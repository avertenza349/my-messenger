export const styles = {
  appContainer: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
  },

  sidebar: {
    width: 410,
    padding: 16,
    borderRight: "1px solid #d1d5db",
    background: "#f3f4f6",
    boxSizing: "border-box",
    overflowY: "auto",
  },

  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },

  userCard: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background: "#fff",
    padding: 16,
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },

  avatarUploadLabel: {
    width: 72,
    height: 72,
    borderRadius: "50%",
    overflow: "hidden",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #cbd5e1",
    background: "#e2e8f0",
    flexShrink: 0,
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 28,
    fontWeight: 700,
    color: "#475569",
  },

  hiddenFileInput: {
    display: "none",
  },

  block: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    background: "#fff",
    padding: 12,
    marginBottom: 14,
  },

  contactForm: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    marginBottom: 12,
  },

  contactsList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    maxHeight: 260,
    overflowY: "auto",
    marginBottom: 4,
  },

  contactItem: {
    border: "1px solid #d1d5db",
    borderRadius: 10,
    padding: 12,
    cursor: "pointer",
    background: "#fff",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },

  fullButton: {
    width: "100%",
    padding: 12,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    background: "#fff",
    cursor: "pointer",
  },

  scrollList: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: 10,
    maxHeight: 180,
    overflowY: "auto",
    marginBottom: 12,
  },

  checkboxItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },

  chatList: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },

  chatItem: {
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: 12,
    cursor: "pointer",
  },

  chatTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },

  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 999,
    background: "#2563eb",
    color: "#fff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    padding: "0 8px",
  },

  chatMeta: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 6,
  },

  chatPreview: {
    fontSize: 14,
    color: "#334155",
  },

  chatArea: {
    flex: 1,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  chatHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    borderBottom: "1px solid #d1d5db",
  },

  messagesArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflowY: "auto",
    padding: "12px 0",
  },

  messageBubble: {
    maxWidth: 320,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d1d5db",
  },

  messageAuthor: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
  },

  messageImage: {
    width: "100%",
    borderRadius: 8,
  },

  messageForm: {
    display: "flex",
    gap: 12,
  },

  imageForm: {
    display: "flex",
    gap: 12,
    alignItems: "center",
  },

  authWrapper: {
    maxWidth: 420,
    margin: "60px auto",
    padding: 20,
  },

  authSwitch: {
    display: "flex",
    gap: 8,
    marginBottom: 16,
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },

  input: {
    width: "100%",
    padding: 12,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
  },

  button: {
    padding: "12px 16px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
  },

  smallButton: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
  },

  mutedText: {
    color: "#64748b",
  },

  emptyState: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
  },

  success: {
    color: "green",
  },

  error: {
    color: "crimson",
  },
};