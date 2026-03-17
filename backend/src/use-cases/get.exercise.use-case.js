export class GetExercises {
    constructor(exerciseRepository) {
        this.exerciseRepository = exerciseRepository;
    }

    async execute(searchTerm = "") {
        const allExercises = await this.exerciseRepository.findAll();
        
        if (!searchTerm) return allExercises;

        const term = searchTerm.toLowerCase().trim();

        return allExercises.filter(ex => {
            const matchName = ex.name.es.toLowerCase().includes(term) || 
                              ex.name.en.toLowerCase().includes(term);
            const matchAlias = ex.aliases.some(alias => alias.toLowerCase().includes(term));
            
            return matchName || matchAlias;
        });
    }
}