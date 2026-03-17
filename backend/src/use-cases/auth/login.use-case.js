import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export class LoginUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute({ email, password }) {
    if (!email || !password) throw new Error("Email y contraseña son requeridos");

    const user = this.userRepository.findByEmail(email);
    if (!user) throw new Error("Credenciales incorrectas");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Credenciales incorrectas");

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return { token, user: { id: user.id, email: user.email } };
  }
}