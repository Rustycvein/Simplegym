import { User } from '../domain/entities/user.entity.js';

try {
    const user = new User({
        name: "Alex",
        email: "alex@test.com",
        password: "123"
    });
    console.log("✅ ÉXITO: Usuario creado con ID:", user.id);
} catch (error) {
    console.error("❌ ERROR:", error.message);
}