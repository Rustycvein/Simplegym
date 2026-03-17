export class RoutineUseCase{
    constructor(repository){
        this.repository = repository;
    }

    async create(data){
        const newRoutine = new RoutineEntity(data);
        return await this.repository.save(newRoutine);
    }

    async update(id, data){
    }
}