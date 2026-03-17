import fs from 'node:fs/promises';
import path from 'node:path';

export class JsonSessionRepository {
    constructor() {
        this.filePath = path.resolve('src/infrastructure/data/sessions.history.json');
    }

    async save(session) {
        const sessions = await this.findAll();
        sessions.push(session);
        
        await fs.writeFile(this.filePath, JSON.stringify(sessions, null, 2), 'utf-8');
        return session;
    }

    async findAll() {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }
}