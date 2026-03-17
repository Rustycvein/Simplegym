import { Router } from "express";
import path from "path";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

router.get("/", (req, res) => {
    try {
        const catalogPath = path.join(__dirname, "../../infrastructure/data/exercise.catalogo.json");
        
        console.log("Buscando catálogo en:", catalogPath); 

        const data = JSON.parse(readFileSync(catalogPath, "utf-8"));
        
        const exercises = data.exercises || data;
        res.json(exercises);
    } catch (error) {
        console.error("Error en catálogo:", error);
        res.status(500).json({ 
            error: "No se pudo leer el catálogo", 
            details: error.message,
            pathAttempted: error.path 
        });
    }
});

export default router;