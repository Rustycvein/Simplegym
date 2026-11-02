import db from "../src/infrastructure/database/sqlite.js";
import { ExerciseCatalogRepository } from "../src/domain/repositories/ExerciseCatalog.repository.js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const JSON_PATH = resolve(__dirname, "../src/infrastructure/data/exercises.json");

const { exercises } = JSON.parse(readFileSync(JSON_PATH, "utf-8"));
const catalogRepo = new ExerciseCatalogRepository(db);

console.log(`Migrando ${exercises.length} ejercicios...`);

for (const exercise of exercises) {
    try {
        await catalogRepo.create({
            id:           exercise.id,
            name:         exercise.name,
            muscle_group: exercise.muscle_group,
            equipment:    exercise.equipment,
            aliases:      exercise.aliases ?? [],
        });
        console.log(`✓ ${exercise.id}`);
    } catch (err) {
        console.error(`✗ ${exercise.id}: ${err.message}`);
    }
}

console.log("Migración completada.");
db.close();