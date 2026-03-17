import { randomUUID } from "node:crypto";

export class SessionEntity {
    constructor({ id, routineId, exercises = [], date, updatedAt }) {
        this.id = id || randomUUID();
        this.routineId = routineId;
        this.exercises = exercises;

        const now = new Date().toISOString();
        
        this.date = date || now;
        this.updatedAt = updatedAt || now; 
        
        this._validate();
    }

    _validate() {
        if (!this.routineId) throw new Error("La sesion debe estar vinculada a una rutina");
        if (!Array.isArray(this.exercises) || this.exercises.length === 0) {
            throw new Error("No se puede registrar una sesion sin ejercicios");
        }
    }
}