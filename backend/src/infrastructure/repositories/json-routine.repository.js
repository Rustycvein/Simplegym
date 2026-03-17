import fs from 'node:fs/promises';
import path from 'node:path';

export class JsonRoutineRepository {
    constructor() {
        this.filePath = path.resolve('src/infrastructure/data/routines.json');
    }

    async findAll() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return []; 
        }
    }

    async save(routine) {
        const routines = await this.findAll();
        routines.push(routine);
        await fs.writeFile(this.filePath, JSON.stringify(routines, null, 2), 'utf-8');
        return routine;
    }
}