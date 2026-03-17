import { useState, useEffect, useCallback } from 'react'
import { Pencil, Clock, Plus, Trash2, CheckCircle2, X, Search, ChevronRight, Dumbbell, Save, ArrowLeft, Wifi, WifiOff } from 'lucide-react'
import {
  saveSession,
  getSessions,
  saveRoutine,
  getRoutines,
  deleteRoutine as dbDeleteRoutine,
  syncAll,
  getPendingCount,
  getToken,
  setToken,
  removeToken,
  openDB,
  promisify,
} from './db.js'
import { Login, Register } from './Auth.jsx'

const API_URL = "https://simplegym.onrender.com";

function App() {
  // AUTH
  const [authPage, setAuthPage] = useState(() => getToken() ? null : 'login'); // null = authenticated
  const [currentUser, setCurrentUser] = useState(null);

  const handleAuthSuccess = async (token, user) => {
    setToken(token);
    setCurrentUser(user);
    setAuthPage(null);
    
    setTimeout(loadRoutinesFromServer, 100);
  };

  const handleLogout = async () => {
    await clearLocalData();
    removeToken();
    setCurrentUser(null);
    setAuthPage('login');
    setExercises([]);
    setRoutines([]);
    setHistory([]);
  };

  const [exercises, setExercises] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCatalog, setShowCatalog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [activeRoutineId, setActiveRoutineId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveResult, setSaveResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // ONLINE / SYNC
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // RUTINAS
  const [showRoutines, setShowRoutines] = useState(false);
  const [routines, setRoutines] = useState([]);
  const [creatingRoutine, setCreatingRoutine] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);
  const [routineName, setRoutineName] = useState("");
  const [routineExercises, setRoutineExercises] = useState([]);
  const [showRoutineCatalog, setShowRoutineCatalog] = useState(false);
  const [routineSearchTerm, setRoutineSearchTerm] = useState("");

  // ── Cargar catálogo del servidor ─────────────────────────────
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const response = await fetch(`${API_URL}/api/exercises`);
        const data = await response.json();
        setCatalog(data.exercises || data);
      } catch (error) {
        console.error("Error cargando catálogo:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    getRoutines().then(setRoutines).catch(console.error);
  }, []);

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount();
    setPendingCount(count);
  }, []);

  useEffect(() => {
    refreshPendingCount();
  }, [refreshPendingCount]);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncing(true);
      await syncAll();
      await refreshPendingCount();
      setSyncing(false);
    };
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [refreshPendingCount]);

  const handleManualSync = async () => {
    if (!isOnline || syncing) return;
    setSyncing(true);
    await syncAll();
    await refreshPendingCount();
    setSyncing(false);
  };

  const filteredCatalog = catalog.filter(item => {
    const query = searchTerm.toLowerCase();
    const nameES = typeof item.name === 'object' ? item.name.es?.toLowerCase() : item.name?.toLowerCase();
    const nameEN = typeof item.name === 'object' ? item.name.en?.toLowerCase() : "";
    const aliasMatch = item.aliases?.some(alias => alias.toLowerCase().includes(query));
    return nameES?.includes(query) || nameEN?.includes(query) || aliasMatch;
  });

  const filteredRoutineCatalog = catalog.filter(item => {
    const query = routineSearchTerm.toLowerCase();
    const nameES = typeof item.name === 'object' ? item.name.es?.toLowerCase() : item.name?.toLowerCase();
    const nameEN = typeof item.name === 'object' ? item.name.en?.toLowerCase() : "";
    const aliasMatch = item.aliases?.some(alias => alias.toLowerCase().includes(query));
    return nameES?.includes(query) || nameEN?.includes(query) || aliasMatch;
  });

  const addToWorkout = (exercise) => {
    const exerciseId = exercise.id || exercise._id;
    if (exercises.find(ex => (ex.id || ex._id) === exerciseId)) {
      setShowCatalog(false);
      return;
    }
    const flatName = typeof exercise.name === 'object' ? exercise.name.es : exercise.name;
    setExercises([...exercises, { ...exercise, name: flatName, sets: [{ id: Date.now(), weight: '', reps: '' }] }]);
    setShowCatalog(false);
    setSearchTerm("");
  };

  const addSet = (exerciseId) => {
    setExercises(prev => prev.map(ex => {
      const currentId = ex.id || ex._id;
      if (currentId === exerciseId) {
        return { ...ex, sets: [...ex.sets, { id: Date.now(), weight: '', reps: '' }] };
      }
      return ex;
    }));
  };

  const updateSetValues = (exId, setId, field, value) => {
    const numValue = parseFloat(value);
    if (value !== '' && numValue < 0) return;
    setExercises(prev => prev.map(ex => {
      if ((ex.id || ex._id) === exId) {
        return { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) };
      }
      return ex;
    }));
  };

  const removeExercise = (exId) => {
    setExercises(exercises.filter(ex => (ex.id || ex._id) !== exId));
  };

  const completedCount = exercises.filter(ex => ex.sets.some(s => s.weight && s.reps)).length;
  const progressPercentage = exercises.length > 0 ? (completedCount / exercises.length) * 100 : 0;

  const clearLocalData = async () => {
    const db = await openDB();
    await new Promise((res, rej) => {
      const t = db.transaction(["sessions", "routines"], "readwrite");
      t.objectStore("sessions").clear();
      t.objectStore("routines").clear();
      t.oncomplete = res;
      t.onerror = rej;
    });
  };

  const loadRoutinesFromServer = async () => {
    try {
      const res = await fetch(`${API_URL}/api/routines`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const db = await openDB();
      for (const routine of (data.routines || [])) {
        const r = { ...routine, exercises: routine.exercises || [], synced: true };
        await promisify(db.transaction("routines", "readwrite").objectStore("routines").put(r));
      }
      const updated = await getRoutines();
      setRoutines(updated);
    } catch (e) {
      console.error("Error cargando rutinas del servidor:", e);
    }
  };

  const finishWorkout = async () => {
    if (exercises.length === 0) return;
    setSaving(true);
    setSaveResult(null);
    try {
      const sessionData = {
        routineId: activeRoutineId ? String(activeRoutineId) : "free_workout",
        exercises: exercises
          .map(ex => ({
            exerciseId: ex.id || ex._id,
            sets: ex.sets
              .filter(s => s.weight !== "" && s.reps !== "")
              .map(s => ({ reps: Number(s.reps), weight: Number(s.weight) }))
          }))
          .filter(ex => ex.sets.length > 0)
      };

      if (sessionData.exercises.length === 0) {
        setSaveResult("error");
        setSaving(false);
        return;
      }

      await saveSession(sessionData);

      if (navigator.onLine) {
        syncAll().then(refreshPendingCount);
      } else {
        await refreshPendingCount();
      }

      setSaveResult("ok");
      setTimeout(() => {
        setExercises([]);
        setActiveRoutineId(null);
        setSaveResult(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setSaveResult("error");
    } finally {
      setSaving(false);
    }
  };

  const openNewRoutine = () => {
    setEditingRoutine(null);
    setRoutineName("");
    setRoutineExercises([]);
    setCreatingRoutine(true);
  };

  const openEditRoutine = (routine) => {
    setEditingRoutine(routine);
    setRoutineName(routine.name);
    setRoutineExercises(routine.exercises || []);
    setCreatingRoutine(true);
  };

  const handleSaveRoutine = async () => {
    if (!routineName.trim()) return;
    await saveRoutine({
      id: editingRoutine?.id || null,
      name: routineName,
      exercises: routineExercises,
      createdAt: editingRoutine?.createdAt || null,
    });
    const updated = await getRoutines();
    setRoutines(updated);
    await refreshPendingCount();
    if (isOnline) syncAll().then(refreshPendingCount);
    setCreatingRoutine(false);
    setEditingRoutine(null);
    setRoutineName("");
    setRoutineExercises([]);
  };

  const handleDeleteRoutine = async (routineId) => {
    await dbDeleteRoutine(routineId);
    const updated = await getRoutines();
    setRoutines(updated);
    await refreshPendingCount();
    if (isOnline) syncAll().then(refreshPendingCount);
  };

  const loadRoutineIntoWorkout = (routine) => {
    const newExercises = (routine.exercises || []).map((ex, i) => ({
      ...ex,
      sets: [{ id: `set_${Date.now()}_${i}`, weight: '', reps: '' }]
    }));
    setExercises(newExercises);
    setActiveRoutineId(routine.id);
    setShowRoutines(false);
    setCreatingRoutine(false);
  };

  const addExerciseToRoutine = (exercise) => {
    const exerciseId = exercise.id || exercise._id;
    if (routineExercises.find(ex => (ex.id || ex._id) === exerciseId)) {
      setShowRoutineCatalog(false);
      return;
    }
    const flatName = typeof exercise.name === 'object' ? exercise.name.es : exercise.name;
    setRoutineExercises(prev => [...prev, { ...exercise, name: flatName }]);
    setShowRoutineCatalog(false);
    setRoutineSearchTerm("");
  };

  const removeExerciseFromRoutine = (exerciseId) => {
    setRoutineExercises(prev => prev.filter(ex => (ex.id || ex._id) !== exerciseId));
  };

  const openHistory = async () => {
    setShowHistory(true);
    setHistoryLoading(true);
    try {
      const sessions = await getSessions();
      setHistory(sessions);
    } catch (e) {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (authPage === 'login') return <Login onSuccess={handleAuthSuccess} goToRegister={() => setAuthPage('register')} />;
  if (authPage === 'register') return <Register onSuccess={handleAuthSuccess} goToLogin={() => setAuthPage('login')} />;

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono uppercase animate-pulse">
      Cargando Sistema...
    </div>
  );

  return (
    <div className="flex-1 flex flex-col p-6 pb-52 max-w-[1126px] mx-auto min-h-screen">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold tracking-tighter text-white uppercase italic">SimpleGym</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={!isOnline || syncing}
            title={isOnline ? "Sincronizar" : "Sin conexión"}
            className="flex items-center gap-1.5 text-[9px] font-mono uppercase px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 disabled:cursor-default transition-colors"
          >
            {isOnline
              ? <Wifi size={10} className={syncing ? "text-yellow-500 animate-pulse" : "text-green-500"}/>
              : <WifiOff size={10} className="text-zinc-600"/>
            }
            <span className={isOnline ? (syncing ? "text-yellow-500" : "text-green-600") : "text-zinc-600"}>
              {syncing ? "Sync..." : isOnline ? "Online" : "Offline"}
            </span>
            {pendingCount > 0 && !syncing && (
              <span className="bg-yellow-500 text-black text-[8px] font-black px-1 rounded-full">{pendingCount}</span>
            )}
          </button>
          <div className="text-zinc-500 text-[10px] font-mono bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800 uppercase">
            {new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </div>
          <button
            onClick={handleLogout}
            className="text-zinc-600 hover:text-zinc-300 text-[10px] font-mono uppercase px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-10">
        <ActionButton icon={<Pencil size={16}/>} label="Rutina" onClick={() => setShowRoutines(true)} />
        <ActionButton icon={<Plus size={16}/>} label="Añadir" onClick={() => setShowCatalog(true)} />
        <ActionButton icon={<Clock size={16}/>} label="Historial" onClick={openHistory} />
      </div>

      <div className="space-y-6">
        {exercises.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-zinc-900 rounded-3xl">
            <p className="text-zinc-600 text-sm font-medium mb-4 italic uppercase">Sin ejercicios hoy</p>
            <button
              onClick={() => setShowCatalog(true)}
              className="text-white bg-zinc-900 px-6 py-2 rounded-full text-[10px] font-bold uppercase border border-zinc-800"
            >
              Abrir Catálogo
            </button>
          </div>
        ) : (
          exercises.map((ex) => (
            <div key={ex.id || ex._id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-zinc-200">{ex.name}</h3>
                <button onClick={() => removeExercise(ex.id || ex._id)} className="text-zinc-800 hover:text-red-900">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3 mb-4">
                {ex.sets.map((set, index) => (
                  <div key={set.id} className="flex gap-3 items-center">
                    <span className="text-zinc-600 font-mono text-[10px] w-4">{index + 1}</span>
                    <input
                      type="number" placeholder="Kg" value={set.weight} min="0"
                      onChange={(e) => updateSetValues(ex.id || ex._id, set.id, 'weight', e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-2 text-center text-white outline-none focus:border-zinc-500 text-sm"
                    />
                    <input
                      type="number" placeholder="Reps" value={set.reps} min="0"
                      onChange={(e) => updateSetValues(ex.id || ex._id, set.id, 'reps', e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg py-2 text-center text-white outline-none focus:border-zinc-500 text-sm"
                    />
                  </div>
                ))}
              </div>
              <button
                onClick={() => addSet(ex.id || ex._id)}
                className="w-full py-3 rounded-xl bg-zinc-950/50 border border-zinc-900 text-zinc-600 text-[10px] uppercase font-bold tracking-widest flex items-center justify-center gap-2 hover:text-zinc-400"
              >
                <Plus size={12} /> Serie
              </button>
            </div>
          ))
        )}
      </div>

      
      {showCatalog && (
        <div className="fixed inset-0 bg-black/98 z-[110] p-6 overflow-y-auto">
          <div className="max-w-[1126px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Catálogo</h2>
              <button onClick={() => { setShowCatalog(false); setSearchTerm(""); }} className="p-2 text-zinc-400 hover:text-white">
                <X size={24}/>
              </button>
            </div>
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text" placeholder="BUSCAR (NOMBRE O ALIAS)..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-zinc-500"
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {filteredCatalog.map(item => (
                <button
                  key={item.id || item._id}
                  onClick={() => addToWorkout(item)}
                  className="flex flex-col p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl hover:bg-zinc-800 hover:border-zinc-600 text-left transition-all group"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-zinc-200 text-sm font-medium">
                      {typeof item.name === 'object' ? item.name.es : item.name}
                    </span>
                    <Plus size={16} className="text-zinc-700 group-hover:text-white"/>
                  </div>
                  {item.aliases && item.aliases.length > 0 && (
                    <span className="text-[9px] text-zinc-600 mt-1 uppercase font-mono">
                      Alias: {item.aliases.join(", ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      
      {showRoutines && !creatingRoutine && (
        <div className="fixed inset-0 bg-black/98 z-[110] p-6 overflow-y-auto">
          <div className="max-w-[1126px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Rutinas</h2>
              <button onClick={() => setShowRoutines(false)} className="p-2 text-zinc-400 hover:text-white">
                <X size={24}/>
              </button>
            </div>
            <button
              onClick={openNewRoutine}
              className="w-full flex items-center justify-center gap-2 py-4 mb-8 rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-white hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest"
            >
              <Plus size={14}/> Nueva Rutina
            </button>
            {routines.length === 0 ? (
              <div className="py-16 text-center">
                <Dumbbell size={32} className="text-zinc-800 mx-auto mb-4"/>
                <p className="text-zinc-600 text-xs uppercase font-mono">Aún no tienes rutinas guardadas</p>
              </div>
            ) : (
              <div className="space-y-3">
                {routines.map(routine => (
                  <div key={routine.id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-semibold text-zinc-100">{routine.name}</h3>
                        <p className="text-[10px] text-zinc-600 font-mono mt-0.5 uppercase">
                          {routine.exercises?.length || 0} ejercicio{routine.exercises?.length !== 1 ? 's' : ''}
                          {!routine.synced && <span className="ml-2 text-yellow-600">· pendiente sync</span>}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEditRoutine(routine)} className="p-2 text-zinc-600 hover:text-zinc-300 transition-colors">
                          <Pencil size={14}/>
                        </button>
                        <button onClick={() => handleDeleteRoutine(routine.id)} className="p-2 text-zinc-800 hover:text-red-900 transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                    </div>
                    {routine.exercises && routine.exercises.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {routine.exercises.slice(0, 4).map(ex => (
                          <span key={ex.id || ex._id} className="text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full text-zinc-500 font-mono uppercase">
                            {ex.name}
                          </span>
                        ))}
                        {routine.exercises.length > 4 && (
                          <span className="text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full text-zinc-600 font-mono">
                            +{routine.exercises.length - 4} más
                          </span>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => loadRoutineIntoWorkout(routine)}
                      className="w-full py-2.5 rounded-xl bg-white text-black text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform flex items-center justify-center gap-2"
                    >
                      <ChevronRight size={12}/> Cargar Rutina
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showRoutines && creatingRoutine && (
        <div className="fixed inset-0 bg-black/98 z-[120] p-6 overflow-y-auto">
          <div className="max-w-[1126px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <button
                onClick={() => { setCreatingRoutine(false); setEditingRoutine(null); }}
                className="flex items-center gap-2 text-zinc-400 hover:text-white text-[11px] font-bold uppercase"
              >
                <ArrowLeft size={16}/> Volver
              </button>
              <h2 className="text-lg font-bold text-white uppercase italic tracking-tighter">
                {editingRoutine ? 'Editar Rutina' : 'Nueva Rutina'}
              </h2>
              <button
                onClick={handleSaveRoutine}
                disabled={!routineName.trim()}
                className="flex items-center gap-1.5 text-[11px] font-black uppercase text-black bg-white px-4 py-2 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 transition-all"
              >
                <Save size={12}/> Guardar
              </button>
            </div>
            <input
              type="text" placeholder="NOMBRE DE LA RUTINA..." value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 px-5 text-white text-sm font-bold uppercase tracking-widest outline-none focus:border-zinc-500 mb-6"
            />
            <div className="space-y-2 mb-6">
              {routineExercises.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
                  <p className="text-zinc-700 text-[10px] uppercase font-mono">Añade ejercicios a la rutina</p>
                </div>
              ) : (
                routineExercises.map((ex, index) => (
                  <div key={ex.id || ex._id} className="flex items-center justify-between p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-700 font-mono text-[10px] w-5">{index + 1}</span>
                      <span className="text-zinc-200 text-sm font-medium">{ex.name}</span>
                    </div>
                    <button onClick={() => removeExerciseFromRoutine(ex.id || ex._id)} className="text-zinc-800 hover:text-red-900 transition-colors">
                      <X size={14}/>
                    </button>
                  </div>
                ))
              )}
            </div>
            <button
              onClick={() => setShowRoutineCatalog(true)}
              className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-zinc-700 text-zinc-400 hover:border-white hover:text-white transition-all text-[11px] font-bold uppercase tracking-widest"
            >
              <Plus size={14}/> Añadir Ejercicio
            </button>
          </div>
        </div>
      )}

      {showRoutineCatalog && (
        <div className="fixed inset-0 bg-black/98 z-[130] p-6 overflow-y-auto">
          <div className="max-w-[1126px] mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Catálogo</h2>
              <button onClick={() => { setShowRoutineCatalog(false); setRoutineSearchTerm(""); }} className="p-2 text-zinc-400 hover:text-white">
                <X size={24}/>
              </button>
            </div>
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text" placeholder="BUSCAR (NOMBRE O ALIAS)..." value={routineSearchTerm}
                onChange={(e) => setRoutineSearchTerm(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl py-4 pl-12 pr-4 text-white text-xs font-bold uppercase tracking-widest outline-none focus:border-zinc-500"
              />
            </div>
            <div className="grid grid-cols-1 gap-3">
              {filteredRoutineCatalog.map(item => {
                const isAdded = routineExercises.some(ex => (ex.id || ex._id) === (item.id || item._id));
                return (
                  <button
                    key={item.id || item._id}
                    onClick={() => !isAdded && addExerciseToRoutine(item)}
                    className={`flex flex-col p-5 border rounded-2xl text-left transition-all group ${
                      isAdded ? 'bg-zinc-900/60 border-zinc-700 cursor-default' : 'bg-zinc-900/40 border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className={`text-sm font-medium ${isAdded ? 'text-zinc-500' : 'text-zinc-200'}`}>
                        {typeof item.name === 'object' ? item.name.es : item.name}
                      </span>
                      {isAdded ? <CheckCircle2 size={16} className="text-zinc-600"/> : <Plus size={16} className="text-zinc-700 group-hover:text-white"/>}
                    </div>
                    {item.aliases && item.aliases.length > 0 && (
                      <span className="text-[9px] text-zinc-600 mt-1 uppercase font-mono">
                        Alias: {item.aliases.join(", ")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="fixed inset-0 bg-black/98 z-[110] p-6 overflow-y-auto">
          <div className="max-w-[1126px] mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-white uppercase italic tracking-tighter">Historial</h2>
              <button onClick={() => setShowHistory(false)} className="p-2 text-zinc-400 hover:text-white">
                <X size={24}/>
              </button>
            </div>
            {historyLoading ? (
              <div className="py-20 text-center text-zinc-600 text-[10px] font-mono uppercase animate-pulse">Cargando historial...</div>
            ) : history.length === 0 ? (
              <div className="py-20 text-center">
                <Clock size={32} className="text-zinc-800 mx-auto mb-4"/>
                <p className="text-zinc-600 text-xs uppercase font-mono">No hay sesiones registradas</p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((session) => (
                  <div key={session.id} className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-mono text-zinc-500 uppercase mb-1">
                          {new Date(session.date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[9px] font-mono text-zinc-700 uppercase">
                          {session.routineId === 'free_workout' ? 'Entrenamiento libre' : `Rutina: ${session.routineId}`}
                          {!session.synced && <span className="ml-2 text-yellow-700">· pendiente sync</span>}
                        </p>
                      </div>
                      <span className="text-[9px] bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-full text-zinc-500 font-mono uppercase">
                        {session.exercises?.length || 0} ejerc.
                      </span>
                    </div>
                    <div className="space-y-3">
                      {(session.exercises || []).map((ex, i) => (
                        <div key={i} className="bg-zinc-950/60 rounded-xl p-3">
                          <p className="text-zinc-300 text-xs font-medium mb-2 uppercase tracking-wide">{ex.exerciseId}</p>
                          <div className="flex flex-wrap gap-2">
                            {(ex.sets || []).map((set, j) => (
                              <span key={j} className="text-[10px] font-mono bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-lg text-zinc-400">
                                {set.weight}kg × {set.reps}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-zinc-900 p-6 z-50">
        <div className="max-w-[1126px] mx-auto">
          <div className="h-1 bg-zinc-900 rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-white transition-all duration-700" style={{ width: `${progressPercentage}%` }}></div>
          </div>
          {saveResult === "ok" && (
            <p className="text-center text-[10px] font-bold uppercase text-green-400 mb-3 tracking-widest animate-pulse">✓ Sesión guardada</p>
          )}
          {saveResult === "error" && (
            <p className="text-center text-[10px] font-bold uppercase text-red-500 mb-3 tracking-widest">✗ Error al guardar</p>
          )}
          <button
            onClick={finishWorkout}
            disabled={exercises.length === 0 || saving}
            className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase text-sm active:scale-95 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? "Guardando..." : "Finalizar Entrenamiento"}
          </button>
        </div>
      </footer>
    </div>
  )
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-800 transition-all active:scale-95 group">
      <div className="text-zinc-500 group-hover:text-white">{icon}</div>
      <span className="text-[10px] font-bold text-zinc-600 group-hover:text-zinc-300 uppercase">{label}</span>
    </button>
  )
}

export default App;