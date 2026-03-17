import {randomUUID} from "node:crypto";

export class Set{
    constructor({id, reps, weight, isComplete = false, type = 'normal'}){
        if(reps < 0) throw new Error("Las repeticiones no puede ser 0 o negativas");
        if(weight < 0) throw new Error("El pero no puede ser negativo")
            
        this.id = id || randomUUID();
        this.reps = reps;
        this.weight =  weight;
        this.isComplete = isComplete;
        this.type = type
    }
}