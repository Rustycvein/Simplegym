import { Router } from "express";
import { SqliteUserRepository } from "../../infrastructure/repositories/sqlite.user.repository.js";
import { RegisterUseCase } from "../../use-cases/auth/register.use-case.js";
import { LoginUseCase } from "../../use-cases/auth/login.use-case.js";

const router = Router();
const userRepository = new SqliteUserRepository();
const registerUseCase = new RegisterUseCase(userRepository);
const loginUseCase = new LoginUseCase(userRepository);

router.post("/register", async (req, res) => {
  try {
    const user = await registerUseCase.execute(req.body);
    res.status(201).json({ message: "Usuario creado", user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const result = await loginUseCase.execute(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;