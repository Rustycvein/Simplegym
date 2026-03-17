import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

export class RegisterUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, password }) {
    if (!email || !password) throw new Error("Email y contraseña son requeridos");
    if (password.length < 6) throw new Error("La contraseña debe tener al menos 6 caracteres");

    const existing = this.userRepository.findByEmail(email);
    if (existing) throw new Error("El email ya está registrado");

    const hashed = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    return this.userRepository.save({
      id: randomUUID(),
      email,
      password: hashed,
      createdAt: now,
      updatedAt: now,
    });
  }
}