import { Router } from "express";
import { SqliteSessionRepository } from "../../infrastructure/repositories/sqlite.session.repository.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { randomUUID } from "crypto";

const router = Router();
const sessionRepository = new SqliteSessionRepository();

router.use(authMiddleware);

router.get("/", (req, res) => {
  try {
    const sessions = sessionRepository.findAllByUser(req.user.id);
    res.status(200).json({ sessions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", (req, res) => {
  try {
    const now = new Date().toISOString();
    const session = {
      id: req.body.id || randomUUID(),
      userId: req.user.id,
      routineId: req.body.routineId || "free_workout",
      exercises: req.body.exercises || [],
      date: req.body.date || now,
      updatedAt: now,
      deletedAt: null,
    };

    if (!session.exercises.length) {
      return res.status(400).json({ error: "No se puede guardar una sesión sin ejercicios" });
    }

    sessionRepository.save(session);
    res.status(201).json({ message: "Sesión guardada", data: session });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;