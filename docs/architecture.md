# SimpleGym - Arquitectura

## 1. Enfoque General

SimpleGym sigue un enfoque **Offline-First**, donde la base de datos local es la fuente principal de verdad.

La aplicación funciona completamente sin conexión y sincroniza los datos con el servidor cuando hay conectividad disponible.

---

## 2. Arquitectura de Alto Nivel

El sistema está compuesto por:

- Frontend (PWA)
- Base de datos local (IndexedDB)
- Servicio de sincronización
- Backend API
- Base de datos remota

Flujo general:

UI → Casos de Uso → Base de Datos Local  
Base de Datos Local → Servicio de Sync → API → Base de Datos Remota

---

## 3. Principios Arquitectónicos

### 3.1 Offline-First

- Todas las operaciones se ejecutan primero en la base de datos local.
- La aplicación no depende del servidor para funcionar.
- El backend actúa como respaldo y capa de sincronización.

---

### 3.2 Clean Architecture

El sistema separa responsabilidades en capas:

- Dominio (Entidades y reglas de negocio)
- Casos de Uso (Lógica de aplicación)
- Infraestructura (Persistencia, API)
- Presentación (UI)

Esto permite:

- Bajo acoplamiento
- Alta mantenibilidad
- Escalabilidad futura

---

## 4. Estrategia de Persistencia

Cada entidad incluye:

- id (UUID)
- createdAt
- updatedAt
- deletedAt (eliminación lógica)

Se utiliza eliminación lógica para permitir sincronización correcta.

---

## 5. Estrategia de Sincronización

### 5.1 Modelo Incremental

La sincronización se basa en timestamps:

- El cliente envía cambios locales no sincronizados (POST /sync).
- El cliente solicita cambios remotos desde el último sync (GET /sync?lastSync=timestamp).

---

### 5.2 Resolución de Conflictos

Se utiliza la estrategia:

**Last Write Wins**

La entidad con el `updatedAt` más reciente prevalece.

No se implementa resolución avanzada de conflictos en esta versión MVP.

---

### 5.3 Detección de Conectividad

El sistema:

- Detecta reconexión mediante `navigator.onLine`.
- Ejecuta sincronización automática.
- Puede incluir un botón manual de sincronización.

---

## 6. Consideraciones de Escalabilidad

La arquitectura permite:

- Implementar autenticación en el futuro.
- Soporte multi-dispositivo.
- Migrar a sincronización más avanzada si es necesario.
- Agregar analíticas y métricas.

---

## 7. Decisiones Técnicas

- Arquitectura Offline-First para garantizar disponibilidad.
- Uso de OpenAPI para definir el contrato del backend.
- Sincronización incremental para eficiencia.
- Eliminación lógica para integridad de datos.

---

## 8. Limitaciones del MVP

- No hay colaboración en tiempo real.
- No hay resolución compleja de conflictos.
- No se maneja concurrencia multiusuario avanzada.