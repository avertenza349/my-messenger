export const styles = {
  appContainer: {
    display: "flex",
    height: "100vh",
    overflow: "hidden",
    background: "#f8fafc",
  },

  sidebar: {
    width: 360,
    height: "100vh",
    padding: 12,
    borderRight: "1px solid #dbe2ea",
    background: "#f3f6f9",
    boxSizing: "border-box",
    overflow: "hidden",
    flexShrink: 0,
    position: "relative",
  },

  chatImage: {
    maxWidth: "260px",
    width: "100%",
    height: "auto",
    borderRadius: "12px",
    display: "block",
    marginTop: "6px",
  },

  imageCaption: {
    marginTop: "4px",
    wordBreak: "break-word",
  },

  dateDividerWrapper: {
    display: "flex",
    justifyContent: "center",
    margin: "14px 0 10px",
  },

  imageViewerContent: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
  },

  viewerButton: {
    minWidth: 52,
    height: 40,
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    background: "rgba(255,255,255,0.12)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
  },

  viewerCloseButton: {
    minWidth: 52,
    height: 40,
    border: "1px solid rgba(255,255,255,0.18)",
    borderRadius: 10,
    background: "rgba(239,68,68,0.9)",
    color: "#fff",
    cursor: "pointer",
    fontSize: 16,
  },

  imageViewerStage: {
    flex: 1,
    overflow: "auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  imageViewerImage: {
    maxWidth: "90vw",
    maxHeight: "80vh",
    objectFit: "contain",
    transformOrigin: "center center",
    transition: "transform 0.15s ease",
    cursor: "grab",
  },

  imageViewerToolbar: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },

  imageViewerOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 1000,
    background: "rgba(15, 23, 42, 0.88)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },

  messageText: {
    wordBreak: "break-word",
  },

  dateDivider: {
    padding: "6px 12px",
    borderRadius: 999,
    background: "#e5e7eb",
    color: "#374151",
    fontSize: 12,
    fontWeight: 600,
  },

  messageTime: {
    position: "absolute",
    right: 8,
    bottom: 4,
    fontSize: 11,
    color: "#64748b",
  },

  sidebarViewport: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },

  sidebarBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingRight: 2,
  },

  contactsHeaderRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
    flexShrink: 0,
  },

  contactsBackButton: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    padding: 0,
    flexShrink: 0,
  },

  contactsBody: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    paddingBottom: 90,
    paddingRight: 2,
  },

  contactsListCard: {
    border: "1px solid #dbe2ea",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
  },

  sidebarScreen: {
    width: "50%",
    height: "100%",
    boxSizing: "border-box",
    paddingRight: 4,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    position: "relative",
  },

  sidebarTrack: {
    display: "flex",
    width: "200%",
    height: "100%",
    transition: "transform 0.28s ease",
  },

  sidebarPanelsViewport: {
    width: "100%",
    height: "100%",
    overflow: "hidden",
  },

  sidebarPanelsTrack: {
    display: "flex",
    width: "200%",
    height: "100%",
    transition: "transform 0.28s ease",
  },

  sidebarPanel: {
    width: "50%",
    height: "100%",
    overflowY: "auto",
    paddingRight: 4,
    boxSizing: "border-box",
  },

  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  userCardCompact: {
    border: "1px solid #dbe2ea",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    marginBottom: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    position: "relative",
  },

  userCardMain: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
    flex: 1,
  },

  userInfo: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  userName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  userEmail: {
    fontSize: 12,
    color: "#64748b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  avatarUploadLabel: {
    width: 56,
    height: 56,
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
    fontSize: 22,
    fontWeight: 700,
    color: "#475569",
  },

  iconButton: {
    width: 42,
    height: 42,
    minWidth: 42,
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    userSelect: "none",
  },

  sendIconButton: {
    width: 42,
    height: 42,
    minWidth: 42,
    borderRadius: "50%",
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    opacity: 1,
  },

  selectedFileRow: {
    marginTop: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    padding: "8px 10px",
    border: "1px solid #dbeafe",
    borderRadius: 10,
    background: "#eff6ff",
  },

  selectedFileName: {
    fontSize: 13,
    color: "#1e3a8a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  clearFileButton: {
    border: "none",
    background: "transparent",
    cursor: "pointer",
    fontSize: 16,
    color: "#475569",
  },

  messageComposer: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },

  composerInput: {
    flex: 1,
    paddingRight: 10,
  },

  hiddenFileInput: {
    display: "none",
  },

  profileMenuWrapper: {
    position: "relative",
    flexShrink: 0,
  },

  circleMenuButton: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    background: "#f8fafc",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
    lineHeight: 1,
    padding: 0,
  },

  popupMenu: {
    position: "absolute",
    top: 44,
    right: 0,
    minWidth: 170,
    background: "#fff",
    border: "1px solid #dbe2ea",
    borderRadius: 12,
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.12)",
    padding: 6,
    zIndex: 50,
  },

  popupMenuItem: {
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    border: "none",
    borderRadius: 10,
    background: "#fff",
    cursor: "pointer",
    fontSize: 14,
    color: "#0f172a",
  },

  contactsScreen: {
    position: "relative",
    height: "100%",
    paddingTop: 2,
  },

  contactsScreenTitle: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 12,
    paddingLeft: 52,
    color: "#0f172a",
  },

  contactsScreenList: {
    height: "calc(100% - 40px)",
    overflowY: "auto",
    paddingBottom: 90,
  },

  contactsBackFloating: {
    position: "absolute",
    top: 14,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
    padding: 0,
    zIndex: 20,
    boxShadow: "0 6px 16px rgba(15, 23, 42, 0.08)",
  },

  mainFloatingGroupButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 52,
    height: 52,
    borderRadius: "50%",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    lineHeight: 1,
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.28)",
    zIndex: 20,
  },

  groupModalCard: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 18,
    border: "1px solid #dbe2ea",
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
    padding: 16,
  },

  groupMemberRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
    fontSize: 14,
  },

  groupMembersBox: {
    border: "1px solid #dbe2ea",
    borderRadius: 12,
    padding: 12,
    maxHeight: 220,
    overflowY: "auto",
    background: "#f8fafc",
  },

  floatingAddButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 52,
    height: 52,
    borderRadius: "50%",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 30,
    lineHeight: 1,
    boxShadow: "0 10px 24px rgba(37, 99, 235, 0.28)",
    zIndex: 20,
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.35)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 16,
  },

  modalCard: {
    width: "100%",
    maxWidth: 420,
    background: "#ffffff",
    borderRadius: 20,
    boxShadow: "0 20px 50px rgba(15, 23, 42, 0.18)",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    border: "1px solid #e5e7eb",
  },

  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#111827",
    textAlign: "center",
  },

  dangerButton: {
    border: "none",
    borderRadius: 12,
    padding: "12px 18px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    background: "#ef4444",
    color: "#ffffff",
  },

  secondaryButton: {
    border: "1px solid #d1d5db",
    borderRadius: 12,
    padding: "12px 18px",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    background: "#f9fafb",
    color: "#111827",
  },

  modalActions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
  },

  modalText: {
    fontSize: 16,
    lineHeight: 1.5,
    color: "#374151",
    textAlign: "center",
  },

  modalCloseButton: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    border: "1px solid #cbd5e1",
    background: "#fff",
    cursor: "pointer",
    fontSize: 20,
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  blockCompact: {
    border: "1px solid #dbe2ea",
    borderRadius: 14,
    background: "#fff",
    padding: 12,
    marginBottom: 10,
  },

  blockHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  blockTitle: {
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
  },

  contactsList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  contactRowButton: {
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 10,
    background: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 12,
    textAlign: "left",
  },

  contactAvatar: {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "#dbeafe",
    color: "#1e3a8a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    flexShrink: 0,
  },

  contactContent: {
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },

  contactName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  contactEmailText: {
    fontSize: 12,
    color: "#64748b",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
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
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: 10,
    maxHeight: 160,
    overflowY: "auto",
    marginBottom: 10,
  },

  checkboxItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    fontSize: 14,
  },

  chatList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  chatItem: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: 10,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    background: "#fff",
    minWidth: 0,
  },

  chatTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },

  chatAvatar: {
    width: 56,
    height: 56,
    minWidth: 56,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  chatAvatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  chatAvatarFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 24,
    fontWeight: 700,
    color: "#334155",
  },

  chatInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    overflow: "hidden",
  },

  chatTopRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },

  chatTitleText: {
    flex: 1,
    minWidth: 0,
    fontWeight: 600,
    fontSize: 16,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  chatPreviewText: {
    marginTop: 4,
    fontSize: 14,
    color: "#64748b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  chatUnreadBadge: {
    minWidth: 20,
    height: 20,
    padding: "0 6px",
    borderRadius: 999,
    background: "#2563eb",
    color: "#fff",
    fontSize: 12,
    fontWeight: 600,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  chatItemActive: {
    border: "1px solid #93c5fd",
    background: "#eff6ff",
  },

  unreadBadge: {
    minWidth: 22,
    height: 22,
    padding: "0 6px",
    borderRadius: 999,
    background: "#ef4444",
    color: "#ffffff",
    fontSize: 12,
    fontWeight: 700,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  chatItemHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 4,
  },

  chatMeta: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },

  chatPreview: {
    fontSize: 13,
    color: "#374151",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  chatArea: {
    flex: 1,
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    overflow: "hidden",
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

  historyLoader: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748b",
    padding: "8px 0",
  },

  messageBubble: {
    maxWidth: 320,
    padding: 12,
    borderRadius: 12,
    border: "1px solid #d1d5db",
    minWidth: 0,
  },

  messageAuthor: {
    fontSize: 13,
    color: "#475569",
    marginBottom: 6,
  },

  messagesAreaDragOver: {
    position: "relative",
    outline: "2px dashed #2563eb",
    outlineOffset: "-8px",
    background: "#eff6ff",
  },

  dragOverlay: {
    position: "sticky",
    top: 12,
    zIndex: 5,
    display: "flex",
    justifyContent: "center",
    pointerEvents: "none",
  },

  dragOverlayText: {
    padding: "10px 16px",
    borderRadius: 999,
    background: "rgba(37, 99, 235, 0.95)",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.16)",
  },

  messageImage: {
    maxWidth: "260px",
    width: "100%",
    height: "auto",
    borderRadius: "12px",
    display: "block",
    cursor: "zoom-in",
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
    padding: 10,
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    boxSizing: "border-box",
    minWidth: 0,
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
    fontSize: 13,
    whiteSpace: "nowrap",
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

  chatHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },

  chatHeaderAvatar: {
    width: 40,
    height: 40,
    minWidth: 40,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  chatHeaderAvatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  chatHeaderAvatarFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
    fontWeight: 700,
    color: "#334155",
  },

  chatHeaderTitleWrap: {
    minWidth: 0,
    flex: 1,
  },

  chatHeaderTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  emojiPanel: {
    position: "absolute",
    bottom: 70,
    left: 16,
    width: 260,
    maxHeight: 220,
    overflowY: "auto",
    background: "#fff",
    border: "1px solid #dbe2ea",
    borderRadius: 14,
    boxShadow: "0 12px 30px rgba(15, 23, 42, 0.18)",
    padding: 10,
    display: "grid",
    gridTemplateColumns: "repeat(8, 1fr)",
    gap: 6,
    zIndex: 50,
  },

  emojiItem: {
    fontSize: 20,
    cursor: "pointer",
    textAlign: "center",
    padding: 6,
    borderRadius: 8,
    transition: "background 0.15s",
  },

  messageRow: {
    display: "flex",
    width: "100%",
  },

  messageRowMine: {
    justifyContent: "flex-end",
  },

  messageRowOther: {
    justifyContent: "flex-start",
  },

  messageWithAvatar: {
    display: "flex",
    alignItems: "flex-end",
    gap: 8,
    maxWidth: "100%",
  },

  groupMessageAvatar: {
    width: 32,
    height: 32,
    minWidth: 32,
    borderRadius: "50%",
    overflow: "hidden",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  groupMessageAvatarImage: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },

  groupMessageAvatarFallback: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#334155",
  },
};