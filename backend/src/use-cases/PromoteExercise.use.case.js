export class PromoteExerciseUseCase {
    constructor({ userExerciseRepository }) {
        this.userExerciseRepository = userExerciseRepository;
    }

    async execute(exerciseId) {
        const exercise = await this.userExerciseRepository.findById(exerciseId);

        if (!exercise) throw new Error("Ejercicio no encontrado");
        if (!exercise.isUserExercise()) throw new Error("Solo se pueden promover ejercicios de usuario");
        if (exercise.wasPromoted()) throw new Error("Este ejercicio ya fue promovido");

        const globalId = await this.userExerciseRepository.promoteToGlobal(exerciseId);

        return globalId;
    }
}
