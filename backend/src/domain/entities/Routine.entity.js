import { randomUUID } from "node:crypto";

export class RoutineEntity {
    constructor({ id, userId, name, exercises = [], createdAt, updatedAt }) {
        const now = new Date().toISOString();

        this.id = id || randomUUID();
        this.userId = userId;
        this.name = name;
        this.exercises = exercises;
        
        this.createdAt = createdAt || now;
        this.updatedAt = updatedAt || now;

        this._validate();
    }

    _validate() {
        if (!this.name || this.name.trim().length === 0) {
            throw new Error("Esta rutina debe tener un nombre válido");
        }
        if (!Array.isArray(this.exercises) || this.exercises.length === 0) {
            throw new Error("Una rutina debe contener al menos un ejercicio");
        }
    }
}