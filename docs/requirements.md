# SimpleGym - Requerimientos

## 1. Planteamiento del Problema

Los usuarios de gimnasio frecuentemente entrenan en entornos con conexión a internet inestable o inexistente.  
La mayoría de aplicaciones de seguimiento dependen de conexión constante, lo que afecta la experiencia durante el entrenamiento.

SimpleGym propone una solución offline-first que permita registrar entrenamientos sin conexión y sincronizar automáticamente cuando haya internet disponible.

---

## 2. Objetivo

Desarrollar un MVP de una aplicación web offline-first que permita:

- Crear y gestionar rutinas de entrenamiento
- Registrar sesiones de entrenamiento
- Registrar series (repeticiones y peso)
- Mantener historial de entrenamientos
- Sincronizar datos con un servidor remoto cuando haya conexión

---

## 3. Alcance (MVP)

### Incluye
- Gestión de rutinas
- Gestión de ejercicios
- Registro de sesiones de entrenamiento
- Registro de series (reps + peso)
- Persistencia local offline
- Sincronización automática al detectar conexión
- Sincronización incremental basada en timestamps

### No Incluye
- Funciones sociales
- Analíticas avanzadas
- Colaboración multiusuario
- Resolución de conflictos avanzada
- Edición simultánea en múltiples dispositivos en tiempo real

---

## 4. Requerimientos Funcionales (RF)

### Funcionalidad Principal

RF1: El usuario podrá crear, editar y eliminar rutinas.

RF2: El usuario podrá crear, editar y eliminar ejercicios.

RF3: El usuario podrá iniciar una sesión de entrenamiento asociada a una rutina.

RF4: El usuario podrá registrar series con repeticiones y peso.

RF5: El sistema almacenará historial de entrenamientos por fecha.

---

### Funcionalidad Offline

RF6: La aplicación deberá funcionar sin conexión a internet.

RF7: Todas las acciones del usuario deberán persistirse localmente.

RF8: El sistema deberá mantener un registro de cambios no sincronizados.

---

### Sincronización

RF9: El sistema deberá enviar los cambios locales al servidor cuando haya conexión disponible.

RF10: El sistema deberá recuperar los cambios remotos desde la última sincronización.

RF11: El sistema deberá resolver conflictos usando la estrategia "Last Write Wins" basada en timestamps.

RF12: El sistema deberá permitir eliminación lógica mediante el campo deletedAt.

---

## 5. Requerimientos No Funcionales (RNF)

RNF1: El sistema deberá seguir un enfoque de Clean Architecture.

RNF2: La API deberá estar definida mediante un contrato OpenAPI.

RNF3: La arquitectura deberá permitir escalabilidad futura.

RNF4: La sincronización deberá ser incremental y no reemplazar completamente los datos.

---

## 6. Supuestos

- La aplicación es de uso individual (single user).
- No existe edición colaborativa en tiempo real.
- El backend funciona como respaldo y capa de sincronización.