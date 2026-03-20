import { styles } from "../styles";

export default function ContactList({ contacts, onOpenPrivateChat }) {
  const safeContacts = Array.isArray(contacts) ? contacts : [];

  if (safeContacts.length === 0) {
    return <div style={styles.mutedText}>Пока нет контактов</div>;
  }

  return (
    <div style={styles.contactsList}>
      {safeContacts.map((user) => {
        const letter = user?.username?.[0]?.toUpperCase() || "U";

        return (
          <button
            key={user.id}
            type="button"
            style={styles.contactRowButton}
            onClick={(e) => onOpenPrivateChat(e, user.id)}
          >
            <div style={styles.contactAvatar}>{letter}</div>

            <div style={styles.contactContent}>
              <div style={styles.contactName}>
                {user.username || "Без имени"}
              </div>
              <div style={styles.contactEmailText}>
                {user.email || "Без email"}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}