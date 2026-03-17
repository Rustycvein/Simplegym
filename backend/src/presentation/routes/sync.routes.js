import { Router } from "express";
import { JsonSessionRepository } from "../../infrastructure/repositories/json.session.repository.js";
import { LogSessionUseCase } from "../../use-cases/log.session.use-case.js";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url"; 
import { JsonRoutineRepository } from "../../infrastructure/repositories/json-routine.repository.js";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionRepository = new JsonSessionRepository();
const routineRepository = new JsonRoutineRepository(); 
const logSessionUseCase = new LogSessionUseCase(sessionRepository);

router.post("/", async (req, res) => {
    try {
        const { sessions = [] } = req.body;
        const results = [];
        for (const sessionData of sessions) {
            const saved = await logSessionUseCase.execute(sessionData);
            results.push(saved);
        }
        res.json({
            message: "Sincronización exitosa",
            processed: results.length,
            serverTime: new Date().toISOString()
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const { lastSync } = req.query;
        console.log("Pull solicitado desde:", lastSync || "el inicio (Full Sync)");
        
        const sessions = await sessionRepository.findAll(lastSync);
        const routines = await routineRepository.findAll(lastSync); 
        const exerciseCatalogPath = path.join(__dirname, "../../infrastructure/data/exercise.catalogo.json");

        const exerciseData = JSON.parse(readFileSync(exerciseCatalogPath, "utf-8"));

        res.json({
            routines: routines,
            exercises: exerciseData.exercises || exerciseData,
            sessions: sessions,
            serverTime: new Date().toISOString() 
        });
    } catch (error) {
        console.error("Error en Pull:", error);
        res.status(500).json({ 
            error: "Error en el pull de datos", 
            details: error.message,
            pathAttempted: path.join(__dirname, "../../infrastructure/data/exercise.catalogo.json") 
        });
    }
});

export default router;