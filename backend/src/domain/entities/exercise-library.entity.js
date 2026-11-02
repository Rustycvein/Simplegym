export class ExerciseLibrary {
    constructor({ id, name, muscle_group, equipment, aliases = [] }) {
        if (!name || !name.es) throw new Error("El ejercicio debe tener al menos un nombre en español");
        if (!muscle_group) throw new Error("El grupo muscular es obligatorio");

        this.id = id;
        this.name = name;
        this.muscle_group = muscle_group;
        this.equipment = equipment;
        this.aliases = aliases;
    }
}