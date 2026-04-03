import { useState } from 'react'
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import GymApp from "./pages/GymApp.jsx";
import Home from "./pages/Home.jsx";
import { getToken, setToken } from './db.js'

function App() {
  const [page, setPage] = useState(() => getToken() ? 'app' : 'home');

  const handleAuthSuccess = (token, _user) => {
    setToken(token);
    setPage('app');
  };

  if (page === 'home')     return <Home goToLogin={() => setPage('login')} goToRegister={() => setPage('register')} />;
  if (page === 'login')    return <Login onSuccess={handleAuthSuccess} goToRegister={() => setPage('register')} />;
  if (page === 'register') return <Register onSuccess={handleAuthSuccess} goToLogin={() => setPage('login')} />;

  return <GymApp onLogout={() => setPage('home')} />;
}

export default App;