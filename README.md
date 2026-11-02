SimpleGym

Aplicación web para registrar entrenamientos de gimnasio, pensada para usarse incluso con internet inestable: guarda todo primero en el dispositivo y lo sincroniza con el servidor cuando hay conexión.

Demo en vivo: https://simplegym-app.vercel.app/ (crea una cuenta con cualquier correo y contraseña de prueba)

<!-- Agrega aquí 2 o 3 capturas: ![Entrenamiento activo](docs/screenshots/entrenamiento.png) -->
Qué puedes hacer
Registrarte e iniciar sesión.
Buscar ejercicios en un catálogo (por nombre en español o inglés, y alias) y crear los tuyos.
Crear, editar y borrar rutinas, y cargarlas en un entrenamiento.
Registrar series con peso y repeticiones, marcarlas como hechas y finalizar la sesión.
Consultar el historial de entrenamientos guardados en tu dispositivo.
Seguir usando la app sin conexión: rutinas y sesiones se guardan en IndexedDB y se envían al servidor al recuperar internet.
Tecnologías
Área	Tecnologías
Frontend	React 19, Vite, Tailwind CSS 4, lucide-react
Backend	Node.js (ESM), Express 5
Base de datos	SQLite (better-sqlite3) en el servidor, IndexedDB en el navegador
Autenticación	JWT (jsonwebtoken) y bcryptjs
Documentación de API	Swagger UI en /docs
Despliegue	Frontend en Vercel, API en Render
Cómo funciona
Las rutinas y sesiones se guardan primero en IndexedDB, así la app responde aunque no haya conexión.
Un contador muestra los cambios pendientes.
Al volver la conexión (o manualmente) el frontend los envía a la API con POST /api/routines y POST /api/sessions, usando el token JWT del usuario.

El backend sigue una arquitectura por capas: domain, use-cases, infrastructure y presentation.

Estructura
Simplegym/
├─ backend/
│  └─ src/
│     ├─ domain/           # entidades y contratos de repositorio
│     ├─ use-cases/        # registro, login, rutinas, sesiones
│     ├─ infrastructure/   # SQLite y repositorios
│     └─ presentation/     # Express, rutas y middleware de auth
├─ frontend/frontend/      # app React + Vite
│  └─ src/
│     ├─ pages/            # Home, Login, Register, GymApp
│     └─ db.js             # IndexedDB y sincronización
└─ docs/                   # arquitectura, requisitos y OpenAPI
Ejecutar en local

Requisitos: Node.js 20 o superior.

Backend
bash
cd backend
npm install

Crea un archivo backend/.env con estas variables:

Variable	Descripción
PORT	Puerto del servidor (opcional, por defecto 3000)
JWT_SECRET	Clave para firmar los tokens (obligatoria)
bash
npm run dev
API: http://localhost:3000
Swagger: http://localhost:3000/docs
Frontend
bash
cd frontend/frontend
npm install
npm run dev

La app queda en http://localhost:5173. Otros comandos: npm run build, npm run preview, npm run lint.

Nota: por ahora el frontend usa la API desplegada en Render para el login y el registro.

API
Método	Ruta	Descripción	Auth
POST	/auth/register	Crea una cuenta	No
POST	/auth/login	Devuelve un JWT	No
GET	/api/exercises	Catálogo de ejercicios	No
POST	/api/exercises	Crea un ejercicio	No
GET	/api/routines	Rutinas del usuario	Sí
POST	/api/routines	Crea o actualiza una rutina	Sí
GET	/api/sessions	Sesiones del usuario	Sí
POST	/api/sessions	Crea o actualiza una sesión	Sí

Las rutas con auth esperan el encabezado Authorization: Bearer <token>.

Próximos pasos
Pruebas automatizadas del backend y del frontend.
Restringir CORS, exigir autenticación al crear ejercicios y limitar los intentos de login.
Configurar la URL de la API con una variable de entorno.
Recuperar el historial desde el servidor en un dispositivo nuevo.
Convertirla en PWA instalable.
Autor

Felix Cordero · GitHub · LinkedIn