import db from "../database/sqlite.js";

export class SqliteSessionRepository {
  save(session) {
    db.prepare(`
      INSERT OR REPLACE INTO sessions (id, userId, routineId, exercises, date, updatedAt, deletedAt)
      VALUES (@id, @userId, @routineId, @exercises, @date, @updatedAt, @deletedAt)
    `).run({
      ...session,
      exercises: JSON.stringify(session.exercises),
      deletedAt: session.deletedAt || null,
    });
    return session;
  }

  findAllByUser(userId) {
    const rows = db.prepare(
      "SELECT * FROM sessions WHERE userId = ? AND deletedAt IS NULL ORDER BY date DESC"
    ).all(userId);
    return rows.map(r => ({ ...r, exercises: JSON.parse(r.exercises) }));
  }
}