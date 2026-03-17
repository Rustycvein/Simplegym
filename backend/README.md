SimpleGym Backend
Servidor API REST desarrollado en Node.js para la gestión y persistencia de datos de la aplicación SimpleGym. La arquitectura está diseñada para manejar el catálogo de ejercicios, rutinas personalizadas e historial de sesiones.

Tecnologías Utilizadas
Node.js (Entorno de ejecución)

Express.js (Framework de servidor)

CORS (Middleware de seguridad para acceso cruzado)

File System (fs) / Path (Persistencia de datos basada en JSON)

Estructura del Proyecto
src/infrastructure/data/: Almacena los archivos JSON que actúan como base de datos (ejercicios, rutinas y sesiones).

src/presentation/routes/: Define los endpoints de la API y la lógica de lectura/escritura de archivos.

index.js: Punto de entrada del servidor y configuración de middlewares.

Endpoints Principales
GET /api/exercises: Recupera el catálogo completo de ejercicios (soporta multilenguaje y alias).

GET /api/routines: Obtiene las rutinas predefinidas creadas por el usuario.

POST /api/routines: Guarda una nueva configuración de ejercicios como rutina.

GET /api/sessions: Devuelve el historial de entrenamientos completados.

POST /api/sessions: Registra una nueva sesión de entrenamiento finalizada.

Instalación y Ejecución
Asegurarse de tener Node.js instalado.

Acceder a la carpeta del proyecto:

Bash
cd backend
Instalar las dependencias:

Bash
npm install
Iniciar el servidor:

Bash
npm run dev