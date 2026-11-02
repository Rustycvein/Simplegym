import { Router } from "express";
import db from "../../infrastructure/database/sqlite.js";
import { ExerciseCatalogRepository } from "../../domain/repositories/ExerciseCatalog.repository.js";

const router = Router();
const repo = new ExerciseCatalogRepository(db);

// GET (ya lo tienes pero ahora desde DB)
router.get("/", async (req, res) => {
  try {
    const exercises = await repo.findAll();
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ POST - crear ejercicio
router.post("/", async (req, res) => {
  try {
    const { name, muscle_group, equipment, aliases } = req.body;

    if (!name?.es || !muscle_group) {
      return res.status(400).json({
        error: "Nombre (es) y muscle_group son obligatorios"
      });
    }

    const newExercise = await repo.create({
      name,
      muscle_group,
      equipment,
      aliases
    });

    res.status(201).json(newExercise);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;