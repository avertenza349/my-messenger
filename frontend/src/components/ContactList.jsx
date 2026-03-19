import { styles } from "../styles";

export default function ContactList({
  contacts,
  contactEmail,
  setContactEmail,
  onAddContact,
  onOpenPrivateChat,
}) {
  return (
    <div style={styles.block}>
      <h3>Новый личный чат</h3>

      <form onSubmit={onAddContact} style={styles.contactForm}>
        <input
          type="email"
          placeholder="Почта пользователя"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.fullButton}>
          Добавить в контакты
        </button>
      </form>

      <div style={styles.contactsList}>
        {contacts.length === 0 ? (
          <p style={styles.mutedText}>Пока нет контактов</p>
        ) : (
          contacts.map((user) => (
            <div
              key={user.id}
              style={styles.contactItem}
              onClick={(e) => onOpenPrivateChat(e, user.id)}
            >
              <strong>{user.username}</strong>
              <div>{user.email}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}