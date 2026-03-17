import { SessionEntity } from "../domain/entities/session.entity.js";

export class LogSessionUseCase {
    constructor(sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    async execute(sessionData) {
        const session = new SessionEntity(sessionData);

        return await this.sessionRepository.save(session);
    }
}