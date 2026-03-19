import { styles } from "../styles";
import ContactList from "./ContactList";
import GroupCreator from "./GroupCreator";
import ChatList from "./ChatList";

export default function Sidebar({
  currentUser,
  contacts,
  contactEmail,
  setContactEmail,
  onAddContact,
  onOpenPrivateChat,
  groupTitle,
  setGroupTitle,
  users,
  groupParticipantIds,
  onToggleGroupParticipant,
  onCreateGroupChat,
  chats,
  selectedChat,
  onSelectChat,
  getChatDisplayName,
  onLogout,
  onAvatarChange,
}) {
  const avatarSrc = currentUser?.avatar_url
    ? `http://127.0.0.1:8000${currentUser.avatar_url}`
    : null;

  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h2 style={{ margin: 0 }}>Чаты</h2>
        <button style={styles.smallButton} onClick={onLogout}>
          Выйти
        </button>
      </div>

      <div style={styles.userCard}>
        <label style={styles.avatarUploadLabel}>
          {avatarSrc ? (
            <img src={avatarSrc} alt="Аватар" style={styles.avatarImage} />
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

        <div>
          <div style={{ fontWeight: 700 }}>{currentUser.username}</div>
          <div style={styles.mutedText}>{currentUser.email}</div>
        </div>
      </div>

      <div style={styles.block}>
        <form style={styles.contactForm} onSubmit={onAddContact}>
          <input
            style={styles.input}
            type="email"
            placeholder="Почта контакта"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
          />
          <button style={styles.button} type="submit">
            Добавить контакт
          </button>
        </form>

        <ContactList contacts={contacts} onOpenPrivateChat={onOpenPrivateChat} />
      </div>

      <div style={styles.block}>
        <GroupCreator
          groupTitle={groupTitle}
          setGroupTitle={setGroupTitle}
          users={users}
          groupParticipantIds={groupParticipantIds}
          onToggleGroupParticipant={onToggleGroupParticipant}
          onCreateGroupChat={onCreateGroupChat}
        />
      </div>

      <div style={styles.block}>
        <ChatList
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={onSelectChat}
          getChatDisplayName={getChatDisplayName}
        />
      </div>
    </aside>
  );
}