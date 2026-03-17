import { RoutineEntity } from "../domain/entities/Routine.entity.js";

export class CreateRoutineUseCase {
    constructor(routineRepository) {
        this.routineRepository = routineRepository;
    }

    async execute(routineData) {
        const routine = new RoutineEntity(routineData);
        return await this.routineRepository.save(routine);
    }
}