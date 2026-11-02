import { IExerciseCatalogRepository } from "../../domain/repositories/IExerciseCatalog.repository.js";
import { ExerciseCatalog } from "../../domain/entities/exercise-catalog.entity.js";
import { randomUUID } from "crypto";

export class UserExerciseRepository extends IExerciseCatalogRepository {
    constructor(db) {
        super();
        this.db = db;
    }

    // ── Helpers ──────────────────────────────────────────────

    _getNames(sourceId, sourceType) {
        const rows = this.db.prepare(`
            SELECT lang, name, is_alias
            FROM exercise_names
            WHERE source_id = ? AND source_type = ?
        `).all(sourceId, sourceType);

        const name = {};
        const aliases = [];

        for (const row of rows) {
            if (row.is_alias) {
                aliases.push(row.name);
            } else {
                name[row.lang] = row.name;
            }
        }

        return { name, aliases };
    }

    _rowToEntity(row) {
        const { name, aliases } = this._getNames(row.id, "user");

        return new ExerciseCatalog({
            id:           row.id,
            name,
            muscle_group: row.muscle_group,
            equipment:    row.equipment,
            aliases,
            isGlobal:     false,
            userId:       row.user_id,
            promotedTo:   row.promoted_to ?? null,
        });
    }

    // ── Métodos públicos ─────────────────────────────────────

    async findAll(userId) {
        const rows = this.db.prepare(`
            SELECT * FROM user_exercises WHERE user_id = ?
        `).all(userId);

        return rows.map(row => this._rowToEntity(row));
    }

    async findById(id) {
        const row = this.db.prepare(`
            SELECT * FROM user_exercises WHERE id = ?
        `).get(id);

        if (!row) return null;
        return this._rowToEntity(row);
    }

    async createUserExercise(userId, { name, muscle_group, equipment, aliases = [] }) {
        const id = randomUUID();

        this.db.prepare(`
            INSERT INTO user_exercises (id, user_id, muscle_group, equipment)
            VALUES (?, ?, ?, ?)
        `).run(id, userId, muscle_group, equipment);

        for (const [lang, value] of Object.entries(name)) {
            this.db.prepare(`
                INSERT INTO exercise_names (id, source_id, source_type, lang, name, is_alias)
                VALUES (?, ?, 'user', ?, ?, 0)
            `).run(randomUUID(), id, lang, value);
        }

        for (const alias of aliases) {
            this.db.prepare(`
                INSERT INTO exercise_names (id, source_id, source_type, lang, name, is_alias)
                VALUES (?, ?, 'user', 'es', ?, 1)
            `).run(randomUUID(), id, alias);
        }

        return this.findById(id);
    }

    async promoteToGlobal(exerciseId) {
        const exercise = await this.findById(exerciseId);
        if (!exercise) throw new Error(`Ejercicio ${exerciseId} no encontrado`);
        if (exercise.wasPromoted()) throw new Error(`El ejercicio ya fue promovido`);

        const globalId = randomUUID();

        // Copiar al catálogo global
        this.db.prepare(`
            INSERT INTO exercise_catalog (id, muscle_group, equipment, contributed_by, source_exercise_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(globalId, exercise.muscle_group, exercise.equipment, exercise.userId, exerciseId);

        // Copiar nombres y aliases
        this.db.prepare(`
            INSERT INTO exercise_names (id, source_id, source_type, lang, name, is_alias)
            SELECT randomUUID(), ?, 'catalog', lang, name, is_alias
            FROM exercise_names
            WHERE source_id = ? AND source_type = 'user'
        `).run(globalId, exerciseId);

        // Marcar el original como promovido
        this.db.prepare(`
            UPDATE user_exercises
            SET promoted_to = ?, promoted_at = datetime('now')
            WHERE id = ?
        `).run(globalId, exerciseId);

        return globalId;
    }
}
