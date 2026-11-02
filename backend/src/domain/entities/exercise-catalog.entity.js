import { ExerciseLibrary } from "./exercise-library.entity.js";

export class ExerciseCatalog extends ExerciseLibrary {
    constructor({ id, name, muscle_group, equipment, aliases, isGlobal = true, userId = null, promotedTo = null }) {
        super({ id, name, muscle_group, equipment, aliases });

        this.isGlobal  = isGlobal;   // true = catálogo global, false = ejercicio del usuario
        this.userId    = userId;     // null si es global
        this.promotedTo = promotedTo; // id en exercise_catalog si fue promovido
    }

    isUserExercise() {
        return !this.isGlobal && this.userId !== null;
    }

    wasPromoted() {
        return this.promotedTo !== null;
    }
}
