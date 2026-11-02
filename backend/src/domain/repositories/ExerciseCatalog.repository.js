import { IExerciseCatalogRepository } from "../../domain/repositories/IExerciseCatalog.repository.js";
import { ExerciseCatalog } from "../../domain/entities/exercise-catalog.entity.js";
import { randomUUID } from "crypto";

export class ExerciseCatalogRepository extends IExerciseCatalogRepository {
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
        const { name, aliases } = this._getNames(row.id, "catalog");

        return new ExerciseCatalog({
            id:           row.id,
            name,
            muscle_group: row.muscle_group,
            equipment:    row.equipment,
            aliases,
            isGlobal:     true,
            userId:       null,
        });
    }

    // ── Métodos públicos ─────────────────────────────────────

    async findAll() {
        const rows = this.db.prepare(`
            SELECT * FROM exercise_catalog
        `).all();

        return rows.map(row => this._rowToEntity(row));
    }

    async findById(id) {
        const row = this.db.prepare(`
            SELECT * FROM exercise_catalog WHERE id = ?
        `).get(id);

        if (!row) return null;
        return this._rowToEntity(row);
    }

    async create({ id, muscle_group, equipment, name, aliases = [], contributedBy = null, sourceExerciseId = null }) {
        const exerciseId = id ?? randomUUID();

        this.db.prepare(`
            INSERT INTO exercise_catalog (id, muscle_group, equipment, contributed_by, source_exercise_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(exerciseId, muscle_group, equipment, contributedBy, sourceExerciseId);

        // Insertar nombres principales
        for (const [lang, value] of Object.entries(name)) {
            this.db.prepare(`
                INSERT INTO exercise_names (id, source_id, source_type, lang, name, is_alias)
                VALUES (?, ?, 'catalog', ?, ?, 0)
            `).run(randomUUID(), exerciseId, lang, value);
        }

        // Insertar aliases
        for (const alias of aliases) {
            this.db.prepare(`
                INSERT INTO exercise_names (id, source_id, source_type, lang, name, is_alias)
                VALUES (?, ?, 'catalog', 'es', ?, 1)
            `).run(randomUUID(), exerciseId, alias);
        }

        return this.findById(exerciseId);
    }
}
