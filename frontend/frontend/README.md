SimpleGym Frontend
Este es el cliente de la aplicación SimpleGym, desarrollado con React y Vite. La interfaz está diseñada siguiendo un concepto de alta fidelidad para la gestión de entrenamientos en tiempo real.

Tecnologías Utilizadas
React.js (Hooks y Gestión de Estado)

Vite (Herramienta de construcción)

Tailwind CSS (Framework de estilos)

Lucide React (Librería de iconos)

Estructura de Archivos
src/App.jsx: Contiene la lógica principal del entrenamiento, gestión de series y comunicación con la API.

src/main.jsx: Punto de entrada de la aplicación.

tailwind.config.js: Configuración de los tokens de diseño (colores Zinc y tipografía).

Configuración de la API
La aplicación consume datos de un backend local. La URL base está configurada en la constante API_URL:
http://localhost:3000

Instalación y Ejecución
Asegurarse de tener Node.js instalado.

Acceder a la carpeta del proyecto:

Bash
cd frontend
Instalar las dependencias:

Bash
npm install
Iniciar el servidor de desarrollo:

Bash
npm run dev
Funcionalidades Implementadas
Selección de ejercicios desde el catálogo.

Filtrado de búsqueda inteligente por nombre y alias.

Carga de rutinas predefinidas.

Registro dinámico de peso y repeticiones.

Visualización del historial de sesiones.
