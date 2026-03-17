import db from "../database/sqlite.js";

export class SqliteRoutineRepository {
  save(routine) {
    db.prepare(`
      INSERT OR REPLACE INTO routines (id, userId, name, exercises, createdAt, updatedAt, deletedAt)
      VALUES (@id, @userId, @name, @exercises, @createdAt, @updatedAt, @deletedAt)
    `).run({
      ...routine,
      exercises: JSON.stringify(routine.exercises),
      deletedAt: routine.deletedAt || null,
    });
    return routine;
  }

  findAllByUser(userId) {
    const rows = db.prepare(
      "SELECT * FROM routines WHERE userId = ? AND deletedAt IS NULL ORDER BY createdAt DESC"
    ).all(userId);
    return rows.map(r => ({ ...r, exercises: JSON.parse(r.exercises) }));
  }

  findById(id, userId) {
    const row = db.prepare(
      "SELECT * FROM routines WHERE id = ? AND userId = ?"
    ).get(id, userId);
    if (!row) return null;
    return { ...row, exercises: JSON.parse(row.exercises) };
  }
}