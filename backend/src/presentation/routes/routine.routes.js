import { Router } from "express";
import { SqliteRoutineRepository } from "../../infrastructure/repositories/sqlite.routine.repository.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { randomUUID } from "crypto";

const router = Router();
const routineRepository = new SqliteRoutineRepository();

router.use(authMiddleware);

router.get("/", (req, res) => {
  try {
    const routines = routineRepository.findAllByUser(req.user.id);
    res.status(200).json({ routines });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", (req, res) => {
  try {
    const now = new Date().toISOString();
    const routine = {
      id: req.body.id || randomUUID(),
      userId: req.user.id,
      name: req.body.name,
      exercises: req.body.exercises || [],
      createdAt: req.body.createdAt || now,
      updatedAt: now,
      deletedAt: req.body.deletedAt || null,
    };

    if (!routine.name) {
      return res.status(400).json({ error: "El nombre es requerido" });
    }

    routineRepository.save(routine);
    res.status(201).json({ message: "Rutina guardada", data: routine });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;