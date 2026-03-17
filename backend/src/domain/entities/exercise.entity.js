import {randomUUID} from "crypto";

export class Exercise{
    constructor({id, exerciseLibraryId, set = [], note = ""}){
        if(!exerciseLibraryId) throw new Error("Ejercicio requerido");

        this.id = id || randomUUID();
        this. exerciseLibraryId = exerciseLibraryId;
        this.set = set;
        this.note = note
    }
}