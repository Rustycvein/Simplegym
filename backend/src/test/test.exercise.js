import { GetExercises } from '../use-cases/get.exercise.use-case.js';
import { JsonExerciseRepository } from '../infrastructure/repositories/json.exercise.repository.js';

async function testExerciseSearch() {
    console.log("🚀 Iniciando prueba de catálogo de ejercicios...\n");

    try {
        // 1. Inicializamos las piezas
        const repository = new JsonExerciseRepository();
        const useCase = new GetExercises(repository);

        // 2. Probar búsqueda por Alias (Ej: "bench")
        console.log("🔍 Buscando: 'bench'...");
        const benchResults = await useCase.execute("bench");
        
        if (benchResults.length > 0) {
            console.log(`✅ Éxito: Encontrados ${benchResults.length} ejercicios.`);
            console.table(benchResults.map(ex => ({
                id: ex.id,
                nombre_es: ex.name.es,
                grupo: ex.muscle_group
            })));
        } else {
            console.warn("⚠️ No se encontraron ejercicios con 'bench'. Revisa tu JSON.");
        }

        // 3. Probar búsqueda que no existe
        console.log("\n🔍 Buscando algo inexistente: 'zumba'...");
        const emptyResults = await useCase.execute("zumba");
        console.log(emptyResults.length === 0 ? "✅ Correcto: 0 resultados." : "❌ Error: Devolvió datos erróneos.");

    } catch (error) {
        console.error("❌ Error durante el test:", error.message);
    }
}

testExerciseSearch();