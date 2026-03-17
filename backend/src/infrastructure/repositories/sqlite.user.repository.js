
import db from "../database/sqlite.js";

export class SqliteUserRepository {
  findByEmail(email) {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  }

  findById(id) {
    return db.prepare("SELECT id, email, createdAt FROM users WHERE id = ?").get(id);
  }

  save({ id, email, password, createdAt, updatedAt }) {
    db.prepare(`
      INSERT INTO users (id, email, password, createdAt, updatedAt)
      VALUES (@id, @email, @password, @createdAt, @updatedAt)
    `).run({ id, email, password, createdAt, updatedAt });
    return { id, email, createdAt };
  }
}