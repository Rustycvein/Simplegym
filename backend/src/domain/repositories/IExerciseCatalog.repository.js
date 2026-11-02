export class IExerciseCatalogRepository {

    // Devuelve todos los ejercicios globales + los custom del usuario
    async findAll(userId) {
        throw new Error("findAll() no implementado");
    }

    // Devuelve un ejercicio por id (global o del usuario)
    async findById(id) {
        throw new Error("findById() no implementado");
    }

    // Crea un ejercicio custom para un usuario
    async createUserExercise(userId, data) {
        throw new Error("createUserExercise() no implementado");
    }

    // Promueve un ejercicio custom al catálogo global
    async promoteToGlobal(exerciseId) {
        throw new Error("promoteToGlobal() no implementado");
    }
}
