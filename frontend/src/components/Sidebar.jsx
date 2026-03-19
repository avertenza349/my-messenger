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
}) {
  return (
    <aside style={styles.sidebar}>
      <div style={styles.sidebarHeader}>
        <h2>Чаты</h2>
        <button onClick={onLogout} style={styles.smallButton}>
          Выйти
        </button>
      </div>

      <div style={styles.userCard}>
        <strong>{currentUser.username}</strong>
        <div>{currentUser.email}</div>
      </div>

      <ContactList
        contacts={contacts}
        contactEmail={contactEmail}
        setContactEmail={setContactEmail}
        onAddContact={onAddContact}
        onOpenPrivateChat={onOpenPrivateChat}
      />

      <GroupCreator
        groupTitle={groupTitle}
        setGroupTitle={setGroupTitle}
        users={users}
        groupParticipantIds={groupParticipantIds}
        onToggleGroupParticipant={onToggleGroupParticipant}
        onCreateGroupChat={onCreateGroupChat}
      />

      <ChatList
        chats={chats}
        selectedChat={selectedChat}
        onSelectChat={onSelectChat}
        getChatDisplayName={getChatDisplayName}
      />
    </aside>
  );
}