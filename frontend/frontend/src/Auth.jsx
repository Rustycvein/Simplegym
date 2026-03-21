import { useState } from "react";

const API_URL = "https://simplegym.onrender.com";

export function Login({ onSuccess, goToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data.token, data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2">
          SimpleGym
        </h1>
        <p className="text-zinc-600 text-[10px] font-mono uppercase mb-10">Inicia sesión para continuar</p>

        <div className="space-y-3 mb-6">
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-zinc-500"
          />
        </div>

        {error && (
          <p className="text-red-500 text-[10px] font-mono uppercase mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password}
          className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-sm active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>

        <p className="text-center text-zinc-600 text-[10px] font-mono uppercase">
          ¿Sin cuenta?{" "}
          <button onClick={goToRegister} className="text-zinc-300 hover:text-white underline">
            Regístrate
          </button>
        </p>
      </div>
    </div>
  );
}

// ── REGISTER ─────────────────────────────────────────────────
export function Register({ onSuccess, goToLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email || !password || !confirm) return;
    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // Registrar
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const loginRes = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok) throw new Error(loginData.error);

      onSuccess(loginData.token, loginData.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic mb-2">
          SimpleGym
        </h1>
        <p className="text-zinc-600 text-[10px] font-mono uppercase mb-10">Crea tu cuenta</p>

        <div className="space-y-3 mb-6">
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            placeholder="CONTRASEÑA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-zinc-500"
          />
          <input
            type="password"
            placeholder="CONFIRMAR CONTRASEÑA"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-zinc-500"
          />
        </div>

        {error && (
          <p className="text-red-500 text-[10px] font-mono uppercase mb-4 text-center">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password || !confirm}
          className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-sm active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed mb-4"
        >
          {loading ? "Creando cuenta..." : "Crear Cuenta"}
        </button>

        <p className="text-center text-zinc-600 text-[10px] font-mono uppercase">
          ¿Ya tienes cuenta?{" "}
          <button onClick={goToLogin} className="text-zinc-300 hover:text-white underline">
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}