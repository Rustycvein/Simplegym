import { useState } from "react";

const API_URL = "https://simplegym.onrender.com";

function Login({ onSuccess, goToRegister }) {
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

        <div className="flex items-center justify-center gap-2">
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">
            SimpleGym
          </h1 >
          <img src="/logo.svg" alt="logo" className="w-7 h-7"/>
        </div>

        <p className="text-zinc-600 text-[10px] font-mono uppercase mb-10">
          Inicia sesión para continuar
        </p>

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
          <p className="text-red-500 text-[10px] font-mono uppercase mb-4 text-center">
            {error}
          </p>
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
          <button
            onClick={goToRegister}
            className="text-zinc-300 hover:text-white underline"
          >
            Regístrate
          </button>
        </p>

      </div>
    </div>
  );
}

export default Login;