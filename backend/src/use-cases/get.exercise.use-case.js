export class GetExercisesUseCase {
    constructor({ catalogRepository, userExerciseRepository }) {
        this.catalogRepository = catalogRepository;
        this.userExerciseRepository = userExerciseRepository;
    }

    async execute(userId) {
        const [globalExercises, userExercises] = await Promise.all([
            this.catalogRepository.findAll(),
            this.userExerciseRepository.findAll(userId),
        ]);

        return [...globalExercises, ...userExercises];
    }
}