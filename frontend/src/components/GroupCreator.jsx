import { styles } from "../styles";

export default function GroupCreator({
  groupTitle,
  setGroupTitle,
  users,
  groupParticipantIds,
  onToggleGroupParticipant,
  onCreateGroupChat,
}) {
  const safeUsers = users || [];
  const safeGroupParticipantIds = groupParticipantIds || [];

  return (
    <div style={styles.block}>
      <h3>Новая группа</h3>
      <form onSubmit={onCreateGroupChat}>
        <input
          type="text"
          placeholder="Название группы"
          value={groupTitle || ""}
          onChange={(e) => setGroupTitle(e.target.value)}
          style={styles.input}
        />

        <div style={styles.scrollList}>
          {safeUsers.length === 0 ? (
            <p style={styles.mutedText}>Нет доступных пользователей</p>
          ) : (
            safeUsers.map((user) => (
              <label key={user.id} style={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={safeGroupParticipantIds.includes(user.id)}
                  onChange={() => onToggleGroupParticipant(user.id)}
                />
                <span>
                  {user.username} ({user.email})
                </span>
              </label>
            ))
          )}
        </div>

        <button type="submit" style={styles.fullButton}>
          Создать группу
        </button>
      </form>
    </div>
  );
}