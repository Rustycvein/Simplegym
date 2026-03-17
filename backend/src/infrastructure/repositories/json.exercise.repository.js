import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ExerciseLibrary } from '../../domain/entities/exercise-libary.entity.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class JsonExerciseRepository {
    async _loadData() {
        // Ruta absoluta: Sube un nivel a 'infrastructure' y entra a 'data'
        const filePath = path.join(__dirname, '..', 'data', 'exercise-catalog.json');
        
        try {
            const data = await fs.readFile(filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            throw new Error(`No se pudo leer el archivo JSON en: ${filePath}`);
        }
    }

    async findAll() {
        const data = await this._loadData();
        
        // Extraemos el array de la propiedad 'exercises' de tu JSON
        const exercisesList = data.exercises;

        if (!Array.isArray(exercisesList)) {
            throw new Error("El JSON no tiene el formato esperado (se esperaba un array en 'exercises')");
        }
        
        // Convertimos cada objeto del JSON en una instancia de la Entidad
        return exercisesList.map(item => new ExerciseLibrary(item));
    }
}