# TicketFlow — Plataforma de Venta de Entradas en Línea

**Autor:** Stepan Andreev  
**Institución:** CIFP Francesc de Borja Moll  
**Fecha:** 01 de mayo de 2026

---

## Índice

1. Introducción y alcance
2. Análisis y diseño
3. Stack tecnológico
4. Pruebas de usuario
5. Conclusiones y mejoras futuras
6. Bibliografía / Recursos

---

## 1. Introducción y alcance

Este documento describe TicketFlow, una plataforma web para la compra de entradas a eventos en directo. El proyecto fue desarrollado como parte del programa de Desarrollo de Aplicaciones Web en el CIFP Francesc de Borja Moll.

### 1.1 Contexto

El sector de los eventos en directo —conciertos, representaciones teatrales, partidos deportivos y festivales culturales— depende en gran medida de la infraestructura digital de venta de entradas. Plataformas como Ticketmaster o Eventbrite han demostrado que la venta de entradas en línea centralizada es ya la expectativa estándar tanto para organizadores como para asistentes. Sin embargo, las grandes plataformas imponen altas comisiones de servicio y están orientadas principalmente a grandes recintos, dejando a los organizadores de eventos pequeños e independientes con opciones muy limitadas.

TicketFlow es una versión simplificada de dicha plataforma, diseñada para demostrar el ciclo de vida completo de una entrada: desde su publicación por parte de un organizador hasta la compra y entrega al usuario final. La aplicación se dirige a dos grupos de usuarios principales:

- **Asistentes a eventos** — personas que exploran eventos y compran entradas.
- **Organizadores de eventos** — personas o empresas que publican eventos y gestionan la disponibilidad.

### 1.2 Problemas que resuelve la aplicación

TicketFlow aborda varios problemas prácticos que surgen en la gestión tradicional o manual de entradas:

**Distribución de entradas fragmentada o manual**

Los organizadores pequeños suelen recurrir a la venta física de entradas, mensajes en redes sociales o transferencias por email —métodos lentos, propensos a errores y difíciles de rastrear—. TicketFlow centraliza toda la venta de entradas en un único lugar, haciendo el proceso consistente y auditable.

**Falta de información de disponibilidad en tiempo real**

Sin un sistema centralizado, los compradores no tienen forma fiable de saber cuántas entradas quedan. TicketFlow registra las entradas vendidas y disponibles en tiempo real, evitando la sobreventa y reduciendo la frustración del comprador.

**Ausencia de comprobante digital de compra**

Las entradas en papel o las confirmaciones informales son fáciles de perder o falsificar. TicketFlow emite cada compra como una entrada digital con un identificador único, que puede presentarse en el recinto para su verificación.

**Dificultad para descubrir eventos locales**

Actualmente los usuarios deben buscar en múltiples sitios web y canales de redes sociales para encontrar eventos cercanos. TicketFlow agrega los eventos en un único catálogo con búsqueda, filtrable por fecha, categoría y ubicación.

### 1.3 Alcance del proyecto

El alcance de este proyecto está limitado intencionalmente a un núcleo funcional. Se incluyen las siguientes funcionalidades:

- Registro e inicio de sesión de usuarios (asistentes y organizadores).
- Catálogo de eventos con búsqueda y filtros.
- Flujo de compra de entradas con selección de cantidad.
- Emisión de entradas digitales con identificadores únicos.
- Panel básico del organizador para crear y gestionar eventos.
- Historial de compras del usuario.

*Fuera del alcance: integración de pasarela de pago, aplicación móvil, mercado de reventa y funciones sociales. Estos aspectos se reconocen como posibles mejoras futuras.*

---

## 2. Análisis y diseño

### 2.1 Roles de usuario

La aplicación define dos roles de usuario diferenciados:

| Rol | Capacidades |
|-----|-------------|
| **Asistente** | Explorar eventos, comprar entradas, ver historial de compras |
| **Organizador** | Crear, editar y eliminar eventos; ver el panel de ventas de entradas |

### 2.2 Casos de uso

**Asistente:**
- Registrarse / iniciar sesión en una cuenta
- Explorar y filtrar el catálogo de eventos por palabra clave, categoría y ubicación
- Ver la página de detalle de un evento con disponibilidad y precio
- Comprar una o más entradas para un evento
- Recibir códigos únicos de entrada por cada entrada adquirida
- Ver todas las compras anteriores y sus códigos de entrada asociados

**Organizador:**
- Registrarse / iniciar sesión en una cuenta de organizador
- Crear un nuevo evento (título, descripción, categoría, ubicación, fecha, precio, total de entradas, imagen opcional)
- Editar los detalles del evento (excepto el total de entradas tras su creación)
- Eliminar eventos
- Ver un panel resumen: total de eventos, entradas vendidas, ingresos

### 2.3 Diseño de la base de datos

La aplicación utiliza cuatro tablas:

**users**
```
id | name | email | password_hash | role | created_at
```

**events**
```
id | organiser_id (FK) | title | description | category | location
   | date | price | total_tickets | tickets_remaining | image_url | created_at
```

**purchases**
```
id | user_id (FK) | event_id (FK) | quantity | total_price | created_at
```

**tickets**
```
id | purchase_id (FK) | event_id (FK) | user_id (FK) | unique_code | created_at
```

Cada entrada recibe un código alfanumérico único de 12 caracteres (derivado de UUID) almacenado en el campo `unique_code`. El contador `tickets_remaining` de la tabla `events` se decrementa de forma atómica dentro de una transacción de base de datos en el momento de la compra, evitando la sobreventa.

### 2.4 Diseño de la API

La API REST se organiza en cuatro grupos de recursos:

| Endpoint | Descripción |
|----------|-------------|
| `POST /api/auth/register` | Crear una nueva cuenta de usuario |
| `POST /api/auth/login` | Autenticarse y recibir un JWT |
| `GET /api/events` | Listar eventos (admite ?q, ?category, ?location) |
| `GET /api/events/:id` | Detalle de un evento |
| `POST /api/events` | Crear evento (solo organizador) |
| `PUT /api/events/:id` | Actualizar evento (solo propietario) |
| `DELETE /api/events/:id` | Eliminar evento (solo propietario) |
| `POST /api/purchases` | Comprar entradas (asistente) |
| `GET /api/purchases/my` | Historial de compras con códigos de entrada |
| `GET /api/purchases/verify/:code` | Verificar un código de entrada |
| `GET /api/organiser/events` | Eventos del organizador con estadísticas de ventas |

Todos los endpoints protegidos requieren una cabecera `Bearer <token>`. Los tokens se emiten como JWT firmados con un secreto del servidor y caducan a los 7 días.

### 2.5 Arquitectura del frontend

El frontend es una aplicación de página única (SPA) con enrutamiento en el lado del cliente. Páginas y sus rutas:

| Ruta | Componente | Acceso |
|------|-----------|--------|
| `/` | Home (catálogo) | Público |
| `/events/:id` | EventDetail | Público |
| `/login` | Login | Solo invitados |
| `/register` | Register | Solo invitados |
| `/my-tickets` | MyTickets | Asistente |
| `/organiser` | OrgDashboard | Organizador |
| `/organiser/events/new` | EventForm | Organizador |
| `/organiser/events/:id/edit` | EventForm | Organizador |

El estado de autenticación se gestiona mediante un React Context (`AuthContext`) que lee y escribe el token JWT y el objeto de usuario serializado en `localStorage`. La instancia del cliente Axios adjunta automáticamente el token a cada petición mediante un interceptor de solicitudes.

---

## 3. Stack tecnológico

### 3.1 Backend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| Node.js | 20+ | Entorno de ejecución JavaScript |
| Express | 5.x | Servidor HTTP y enrutamiento |
| better-sqlite3 | 12.x | Driver síncrono de SQLite |
| bcryptjs | 3.x | Hash de contraseñas (bcrypt, 10 rondas) |
| jsonwebtoken | 9.x | Emisión y verificación de JWT |
| uuid | 14.x | Generación de códigos únicos de entrada |
| cors | 2.x | Control de acceso entre orígenes |

**¿Por qué SQLite?** El alcance del proyecto está limitado intencionalmente a un despliegue en un único servidor. SQLite elimina la necesidad de configurar un servidor de base de datos independiente, manteniendo al mismo tiempo la semántica SQL completa, las transacciones y las restricciones de clave foránea. Es adecuado para entornos de desarrollo, pruebas y tráfico bajo o medio.

### 3.2 Frontend

| Tecnología | Versión | Uso |
|------------|---------|-----|
| React | 19.x | Biblioteca de componentes de interfaz |
| Vite | 8.x | Herramienta de compilación y servidor de desarrollo |
| React Router DOM | 7.x | Enrutamiento en el cliente |
| Axios | 1.x | Cliente HTTP |
| Tailwind CSS | 4.x | Estilos mediante clases utilitarias |

**¿Por qué Tailwind CSS?** Tailwind se eligió por su coherencia visual y velocidad de desarrollo: los componentes se pueden estilizar en línea sin mantener un archivo CSS separado, y el sistema de clases utilitarias garantiza uniformidad visual en todas las páginas.

### 3.3 Estructura del proyecto

```
ticketflow/
├── backend/
│   ├── config.js          # Secreto JWT, puerto
│   ├── server.js          # Punto de entrada de Express
│   ├── db/
│   │   ├── database.js    # Inicialización + singleton de la BD
│   │   └── schema.sql     # Definición de tablas
│   ├── middleware/
│   │   └── auth.js        # Middleware JWT
│   └── routes/
│       ├── auth.js        # /api/auth
│       ├── events.js      # /api/events
│       ├── purchases.js   # /api/purchases
│       └── organiser.js   # /api/organiser
└── frontend/
    ├── vite.config.js
    └── src/
        ├── App.jsx         # Router + layout
        ├── api/client.js   # Instancia de Axios
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   └── EventCard.jsx
        └── pages/
            ├── Home.jsx
            ├── EventDetail.jsx
            ├── Login.jsx
            ├── Register.jsx
            ├── MyTickets.jsx
            └── organiser/
                ├── Dashboard.jsx
                └── EventForm.jsx
```

### 3.4 Ejecución de la aplicación

**Requisito previo:** Node.js 20+

```bash
# Backend
cd backend
npm install
npm run dev       # se ejecuta en http://localhost:3001

# Frontend (terminal aparte)
cd frontend
npm install
npm run dev       # se ejecuta en http://localhost:5173
```

El servidor de desarrollo de Vite redirige todas las peticiones `/api` al backend, por lo que no es necesaria ninguna configuración manual de CORS en desarrollo.

---

## 4. Pruebas de usuario

### 4.1 Enfoque de las pruebas

Se realizaron pruebas manuales de extremo a extremo cubriendo los dos flujos principales de usuario: compra de entradas por parte del asistente y gestión de eventos por parte del organizador. Las pruebas se llevaron a cabo en un entorno de desarrollo local utilizando un navegador (Firefox 127).

### 4.2 Escenarios de prueba

#### Flujo del asistente

| # | Escenario | Resultado esperado | Resultado |
|---|-----------|-------------------|-----------|
| A1 | Registrarse como asistente con datos válidos | Cuenta creada, redirigido al inicio | Correcto |
| A2 | Registrarse con un email ya existente | Se muestra mensaje de error | Correcto |
| A3 | Iniciar sesión con credenciales correctas | JWT almacenado, nombre visible en la barra | Correcto |
| A4 | Iniciar sesión con contraseña incorrecta | Se muestra mensaje de error | Correcto |
| A5 | Explorar el catálogo de eventos (sin filtros) | Todos los eventos listados por fecha | Correcto |
| A6 | Buscar por palabra clave | Se devuelven los eventos coincidentes | Correcto |
| A7 | Filtrar por categoría | Solo se muestran los eventos de esa categoría | Correcto |
| A8 | Ver la página de detalle de un evento | Toda la información del evento y disponibilidad | Correcto |
| A9 | Comprar 2 entradas | Confirmación con 2 códigos únicos | Correcto |
| A10 | Comprar en un evento agotado | Error "Not enough tickets available" | Correcto |
| A11 | Ver Mis Entradas | Historial de compras con códigos mostrado | Correcto |
| A12 | Acceder a Mis Entradas sin sesión iniciada | Redirigido a la página de inicio de sesión | Correcto |

#### Flujo del organizador

| # | Escenario | Resultado esperado | Resultado |
|---|-----------|-------------------|-----------|
| O1 | Registrarse como organizador | Redirigido al panel del organizador | Correcto |
| O2 | Crear evento con todos los campos | El evento aparece en el panel y el catálogo | Correcto |
| O3 | Crear evento con campo obligatorio vacío | Se muestra error de validación | Correcto |
| O4 | Editar título y ubicación del evento | Los cambios se reflejan inmediatamente | Correcto |
| O5 | Eliminar un evento | El evento desaparece del catálogo | Correcto |
| O6 | El panel muestra conteos correctos de ventas | Los conteos coinciden con las compras realizadas | Correcto |
| O7 | Intentar editar el evento de otro organizador | Se devuelve 403 Forbidden | Correcto |

### 4.3 Observaciones

- Los códigos de entrada tras la compra se muestran de forma clara e inmediata sin necesidad de recargar la página.
- La superposición de "SOLD OUT" en las tarjetas de eventos proporciona una señal visual clara sobre la disponibilidad.
- El selector de cantidad está limitado a 10 por compra para evitar la monopolización por parte de un único usuario.

---

## 5. Conclusiones y mejoras futuras

### 5.1 Conclusiones

TicketFlow implementa con éxito el ciclo de vida completo de una transacción de venta de entradas en línea: desde la publicación del evento por parte del organizador, pasando por la exploración y el descubrimiento por parte de los asistentes, hasta la compra y la emisión de la entrada digital. Las seis funcionalidades definidas en el alcance del proyecto fueron implementadas y probadas:

1. **Registro e inicio de sesión de usuarios** — con acceso basado en roles para asistentes y organizadores.
2. **Catálogo de eventos con búsqueda y filtros** — por palabra clave, categoría y ubicación.
3. **Flujo de compra de entradas** — con selección de cantidad y seguimiento de disponibilidad en tiempo real.
4. **Emisión de entradas digitales** — cada compra genera un código único por entrada.
5. **Panel del organizador** — crear, editar y eliminar eventos; ver estadísticas de ventas.
6. **Historial de compras** — los asistentes pueden ver todas sus compras anteriores y sus códigos de entrada.

Las decisiones tecnológicas (Node.js + Express + SQLite para el backend; React + Vite + Tailwind para el frontend) resultaron adecuadas para el alcance del proyecto. El driver síncrono de SQLite simplificó el manejo de transacciones para la operación crítica de "compra de entradas", y Tailwind CSS aceleró significativamente el desarrollo de la interfaz.

### 5.2 Limitaciones

- **Sin pasarela de pago.** Las compras se registran sin una pasarela de pago real. Esto estaba explícitamente fuera del alcance.
- **Sin notificaciones por email.** Los códigos de entrada solo son visibles en la interfaz; no se envían correos de confirmación.
- **Sin selección de asiento.** Las entradas son de acceso general.
- **Arquitectura de servidor único.** La base de datos SQLite no es adecuada para despliegues con múltiples instancias.

### 5.3 Mejoras futuras

| Prioridad | Mejora | Notas |
|-----------|--------|-------|
| Alta | Integración de pasarela de pago | Stripe o PayPal; habilita transacciones reales |
| Alta | Confirmación por email con código QR | Enviar códigos de entrada como QR por email |
| Media | Lectura de QR para control de acceso | Página de verificación adaptada a móvil |
| Media | Analítica del organizador (gráficas) | Ingresos a lo largo del tiempo, categorías populares |
| Media | Subida de imagen del evento | Sustituir la entrada de URL por subida de archivo al servidor |
| Baja | Funciones sociales | Compartir enlaces de eventos, seguir organizadores |
| Baja | Aplicación móvil | App React Native utilizando la API existente |
| Baja | Soporte multiidioma | Español / Inglés / Catalán |

---

## 6. Bibliografía / Recursos

1. **Documentación de Node.js** — https://nodejs.org/en/docs
2. **Documentación de Express.js** — https://expressjs.com
3. **better-sqlite3** — https://github.com/WiseLibs/better-sqlite3
4. **JSON Web Tokens (JWT)** — RFC 7519; https://jwt.io
5. **Documentación de React** — https://react.dev
6. **Documentación de Vite** — https://vite.dev
7. **Documentación de React Router** — https://reactrouter.com
8. **Documentación de Tailwind CSS** — https://tailwindcss.com
9. **Documentación de Axios** — https://axios-http.com
10. **Documentación de SQLite** — https://www.sqlite.org/docs.html
11. Duckett, J. (2011). *HTML and CSS: Design and Build Websites*. Wiley.
12. Haverbeke, M. (2018). *Eloquent JavaScript* (3ª ed.). No Starch Press.
