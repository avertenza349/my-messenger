import { styles } from "../styles";

export default function ContactList({
  contacts,
  onOpenPrivateChat,
  onRequestDeleteContact,
}) {
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  function getUserDisplayName(user) {
    if (!user) return "Пользователь";

    const fullName = [user.first_name, user.last_name]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || user.username || user.email || "Пользователь";
  }

  if (safeContacts.length === 0) {
    return <div style={styles.emptyState}>Пока нет контактов</div>;
  }

  return (
    <div>
      {safeContacts.map((contact) => (
        <div
          key={contact.id}
          style={{
            ...styles.chatItem,
            cursor: "pointer",
          }}
          onClick={(e) => onOpenPrivateChat(e, contact.id)}
          onContextMenu={(e) => {
            e.preventDefault();
            onRequestDeleteContact?.(contact);
          }}
          title="ПКМ — действия с контактом"
        >
          <div style={{ fontWeight: 600 }}>
            {getUserDisplayName(contact)}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {contact.email}
          </div>
        </div>
      ))}
    </div>
  );
}