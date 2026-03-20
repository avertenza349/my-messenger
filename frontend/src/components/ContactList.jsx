import { styles } from "../styles";

export default function ContactList({
  contacts,
  onOpenPrivateChat,
  onRequestDeleteContact,
}) {
  const safeContacts = Array.isArray(contacts) ? contacts : [];

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
            {contact.username || "Без имени"}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>
            {contact.email}
          </div>
        </div>
      ))}
    </div>
  );
}