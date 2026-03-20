import { useEffect, useRef, useState } from "react";
import { styles } from "../styles";
import ContactList from "./ContactList";
import ChatList from "./ChatList";

export default function Sidebar({
  currentUser,
  contacts,
  onAddContact,
  onOpenPrivateChat,
  groupTitle,
  setGroupTitle,
  groupParticipantIds,
  toggleGroupParticipant,
  onCreateGroup,
  chats,
  selectedChat,
  setSelectedChat,
  getChatDisplayName,
  onLogout,
  onAvatarChange,
  onDeleteChat,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState("main");

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [contactEmail, setContactEmail] = useState("");
  const [contactModalError, setContactModalError] = useState("");
  const [contactModalMessage, setContactModalMessage] = useState("");
  const [isAddingContact, setIsAddingContact] = useState(false);

  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);

  const menuRef = useRef(null);

  const avatarSrc = currentUser?.avatar_url
    ? `http://127.0.0.1:8000${currentUser.avatar_url}`
    : null;

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  function openContactsPanel() {
    setMenuOpen(false);
    setActivePanel("contacts");
  }

  function backToMainPanel() {
    setActivePanel("main");
  }

  function openAddContactModal() {
    setIsAddContactModalOpen(true);
    setContactEmail("");
    setContactModalError("");
    setContactModalMessage("");
  }

  function closeAddContactModal() {
    setIsAddContactModalOpen(false);
    setContactEmail("");
    setContactModalError("");
    setContactModalMessage("");
    setIsAddingContact(false);
  }

  async function handleSubmitAddContact(e) {
    e.preventDefault();

    const email = contactEmail.trim();

    if (!email) {
      setContactModalError("Введите email");
      setContactModalMessage("");
      return;
    }

    try {
      setIsAddingContact(true);
      setContactModalError("");
      setContactModalMessage("");

      const result = await onAddContact(email);

      if (result?.ok) {
        setContactModalMessage("Контакт добавлен");
        setContactModalError("");
        setContactEmail("");

        setTimeout(() => {
          closeAddContactModal();
        }, 700);
      } else {
        setContactModalError(result?.error || "Пользователь не найден");
        setContactModalMessage("");
      }
    } catch {
      setContactModalError("Пользователь не найден");
      setContactModalMessage("");
    } finally {
      setIsAddingContact(false);
    }
  }

  function openCreateGroupModal() {
    setIsCreateGroupModalOpen(true);
  }

  function closeCreateGroupModal() {
    setIsCreateGroupModalOpen(false);
    setGroupTitle("");
  }

  async function handleSubmitCreateGroup(e) {
    e.preventDefault();

    const result = await onCreateGroup(e);

    if (result?.ok) {
      closeCreateGroupModal();
    }
  }

  return (
    <>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarViewport}>
          <div
            style={{
              ...styles.sidebarTrack,
              transform:
                activePanel === "main"
                  ? "translateX(0%)"
                  : "translateX(-50%)",
            }}
          >
            <section style={styles.sidebarScreen}>
              <div style={styles.sidebarHeader}>
                <h2 style={{ margin: 0, fontSize: 22 }}>Чаты</h2>
                <button style={styles.smallButton} onClick={onLogout}>
                  Выйти
                </button>
              </div>

              <div style={styles.userCardCompact}>
                <div style={styles.userCardMain}>
                  <label style={styles.avatarUploadLabel}>
                    {avatarSrc ? (
                      <img
                        src={avatarSrc}
                        alt="avatar"
                        style={styles.avatarImage}
                      />
                    ) : (
                      <div style={styles.avatarPlaceholder}>
                        {currentUser.username?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      style={styles.hiddenFileInput}
                      onChange={onAvatarChange}
                    />
                  </label>

                  <div style={styles.userInfo}>
                    <div style={styles.userName}>{currentUser.username}</div>
                    <div style={styles.userEmail}>{currentUser.email}</div>
                  </div>
                </div>

                <div style={styles.profileMenuWrapper} ref={menuRef}>
                  <button
                    type="button"
                    style={styles.circleMenuButton}
                    onClick={() => setMenuOpen((prev) => !prev)}
                    title="Меню"
                  >
                    ☰
                  </button>

                  {menuOpen && (
                    <div style={styles.popupMenu}>
                      <button
                        type="button"
                        style={styles.popupMenuItem}
                        onClick={openContactsPanel}
                      >
                        Контакты
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div style={styles.sidebarBody}>
                <div style={styles.blockCompact}>
                  <div style={styles.blockHeader}>
                    <h3 style={styles.blockTitle}>Мои чаты</h3>
                  </div>

                  <ChatList
                    chats={chats}
                    selectedChat={selectedChat}
                    setSelectedChat={setSelectedChat}
                    getChatDisplayName={getChatDisplayName}
                    onDeleteChat={onDeleteChat}
                  />
                </div>
              </div>

              <button
                type="button"
                style={styles.mainFloatingGroupButton}
                onClick={openCreateGroupModal}
                title="Новая группа"
              >
                +
              </button>
            </section>

            <section style={styles.sidebarScreen}>
              <div style={styles.contactsHeaderRow}>
                <button
                  type="button"
                  style={styles.contactsBackButton}
                  onClick={backToMainPanel}
                  title="Назад"
                >
                  ←
                </button>

                <h2 style={{ margin: 0, fontSize: 22 }}>Контакты</h2>
              </div>

              <div style={styles.contactsBody}>
                <div style={styles.contactsListCard}>
                  <ContactList
                    contacts={contacts}
                    onOpenPrivateChat={onOpenPrivateChat}
                  />
                </div>
              </div>

              <button
                type="button"
                style={styles.floatingAddButton}
                onClick={openAddContactModal}
                title="Добавить контакт"
              >
                +
              </button>
            </section>
          </div>
        </div>
      </aside>

      {isAddContactModalOpen && (
        <div style={styles.modalOverlay} onClick={closeAddContactModal}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Добавить контакт</h3>
              <button
                type="button"
                style={styles.modalCloseButton}
                onClick={closeAddContactModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitAddContact} style={styles.form}>
              <input
                type="email"
                placeholder="Введите email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                style={styles.input}
              />

              {contactModalError ? (
                <div style={styles.error}>{contactModalError}</div>
              ) : null}

              {contactModalMessage ? (
                <div style={styles.success}>{contactModalMessage}</div>
              ) : null}

              <button
                type="submit"
                style={styles.button}
                disabled={isAddingContact}
              >
                {isAddingContact ? "Добавление..." : "Добавить"}
              </button>
            </form>
          </div>
        </div>
      )}

      {isCreateGroupModalOpen && (
        <div style={styles.modalOverlay} onClick={closeCreateGroupModal}>
          <div
            style={styles.groupModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Новая группа</h3>
              <button
                type="button"
                style={styles.modalCloseButton}
                onClick={closeCreateGroupModal}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitCreateGroup} style={styles.form}>
              <input
                type="text"
                placeholder="Название группы"
                value={groupTitle}
                onChange={(e) => setGroupTitle(e.target.value)}
                style={styles.input}
              />

              <div style={styles.groupMembersBox}>
                {contacts.length === 0 ? (
                  <div style={styles.mutedText}>Сначала добавь контакты</div>
                ) : (
                  contacts.map((user) => (
                    <label key={user.id} style={styles.groupMemberRow}>
                      <input
                        type="checkbox"
                        checked={groupParticipantIds.includes(user.id)}
                        onChange={() => toggleGroupParticipant(user.id)}
                      />
                      <span>
                        {user.username} ({user.email})
                      </span>
                    </label>
                  ))
                )}
              </div>

              <button type="submit" style={styles.button}>
                Создать группу
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}