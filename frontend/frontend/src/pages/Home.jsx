import { Github } from 'lucide-react'

function Home({ goToLogin, goToRegister }) {
  return (
    <div className="min-h-screen bg-[#080808] flex flex-col relative overflow-hidden">

      
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff08 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />
    
      <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, #080808, transparent)' }}
      />
      <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{ background: 'linear-gradient(to top, #080808, transparent)' }}
      />

      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/logo.svg"
          alt=""
          className="w-130 opacity-[0.03] select-none"
          style={{ filter: 'invert(1)' }}
        />
      </div>

     
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10 py-12">

        
        <div className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 text-[#888] text-[10px] font-mono uppercase tracking-widest px-4 py-1.5 rounded-full mb-10">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400"/>
          App de entrenamiento
        </div>

        
        <div className="flex items-center justify-center gap-4 mb-4">
          <h1 className="text-[clamp(56px,15vw,120px)] font-black italic uppercase leading-none tracking-tighter">
            <span className="text-white">Simple</span><span className="text-[#2a2a2a]">Gym</span>
          </h1>
          <img
            src="/logo.svg"
            alt="logo"
            className="w-[clamp(40px,8vw,72px)] opacity-90"
            
          />
        </div>

        <p className="text-[#444] text-[11px] font-mono uppercase tracking-[0.2em] mb-10">
          Registra · Progresa · Repite
        </p>

        <div className="w-px h-10 bg-white/10 mb-10" />
        
        <div className="flex flex-wrap gap-2 justify-center mb-12">
          {[
            { label: 'Offline', sub: 'first' },
            { label: 'Sync', sub: 'automático' },
            { label: 'Sin', sub: 'ads' },
            { label: '', sub: 'Gratis' },
          ].map(({ label, sub }) => (
            <span key={sub} className="border border-white/10 bg-white/5 text-[#555] text-[10px] font-mono uppercase tracking-wide px-4 py-1.5 rounded-full">
              {label && <strong className="text-[#888]">{label} </strong>}{sub}
            </span>
          ))}
        </div>

        
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button
            onClick={goToRegister}
            className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-xs tracking-widest active:scale-95 transition-transform"
          >
            Crear cuenta
          </button>
          <button
            onClick={goToLogin}
            className="w-full bg-transparent text-[#444] font-bold py-4 rounded-2xl uppercase text-xs tracking-widest border border-white/10 hover:border-white/25 hover:text-white active:scale-95 transition-all"
          >
            Iniciar sesión
          </button>
        </div>

      </main>

      
      <footer className="relative z-10 border-t border-white/5 px-6 py-5 flex items-center justify-between">
        <span className="text-[#2a2a2a] text-[10px] font-mono uppercase tracking-widest">
          © {new Date().getFullYear()} SimpleGym by Rustycvein
        </span>
        
        <a
          href="https://github.com/Rustycvein"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-white hover:text-zinc-500 text-[10px] font-mono uppercase tracking-widest transition-colors"
        >
          <Github size={12} />
          GitHub
        </a>
      </footer>

    </div>
  )
}

export default Home