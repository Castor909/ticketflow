# TicketFlow — Lista de Verificación de Pruebas Manuales

## Preparación

- [ ] Iniciar el backend: `cd backend && npm run dev` → debe mostrar `TicketFlow API running on http://localhost:3001`
- [ ] Iniciar el frontend: `cd frontend && npm run dev` → abrir http://localhost:5173
- [ ] Verificar que la página carga sin errores en la consola del navegador

---

## 1. Acceso público (sin autenticación)

- [ ] Abrir la página principal — se muestra el catálogo de eventos (o lista vacía si no hay eventos)
- [ ] La barra de navegación muestra: `Events`, `Log in`, `Sign up`
- [ ] Navegar manualmente a `/my-tickets` → debe redirigir a `/login`

---

## 2. Registro

### Organizador
- [ ] Hacer clic en **Sign up**
- [ ] Rellenar: nombre, email, contraseña (mín. 6 caracteres), seleccionar **Organiser**
- [ ] Hacer clic en **Create account** → redirección a `/organiser`
- [ ] La barra de navegación muestra el nombre del usuario y el botón **Log out**

### Errores de registro
- [ ] Intentar registrar el mismo email por segunda vez → error `Email already registered`
- [ ] Intentar usar una contraseña de 3 caracteres → error `Password must be at least 6 characters`

---

## 3. Inicio de sesión / Cierre de sesión

- [ ] Hacer clic en **Log out** → la barra de navegación vuelve al estado de invitado
- [ ] Hacer clic en **Log in**, introducir credenciales correctas → inicio de sesión exitoso
- [ ] Introducir una contraseña incorrecta → error `Invalid credentials`
- [ ] Cerrar sesión e iniciar sesión de nuevo

---

## 4. Creación de evento (Organizador)

- [ ] Iniciar sesión como organizador → abrir `/organiser`
- [ ] Hacer clic en **+ New Event**
- [ ] Rellenar el formulario:
  - Title: `Summer Jazz Festival`
  - Description: cualquier descripción
  - Category: `Music`
  - Location: `Palma de Mallorca`
  - Date: cualquier fecha futura
  - Price: `15.00`
  - Total tickets: `50`
- [ ] Hacer clic en **Create event** → redirección al dashboard
- [ ] El evento aparece en la tabla: `0 / 50` vendidos
- [ ] Crear un segundo evento: gratuito (`Price: 0`), categoría `Conference`, entradas: `10`

---

## 5. Catálogo de eventos

- [ ] Abrir la página principal — ambos eventos se muestran como tarjetas
- [ ] Las tarjetas muestran: nombre, categoría, fecha, ubicación, precio y entradas disponibles
- [ ] **Búsqueda:** escribir `Jazz` → muestra solo el primer evento
- [ ] **Filtro por categoría:** seleccionar `Conference` → muestra solo el segundo
- [ ] **Filtro por ubicación:** escribir `Palma` → muestra el primero
- [ ] Hacer clic en **Clear** → todos los filtros se eliminan, ambos eventos visibles

---

## 6. Página de evento

- [ ] Hacer clic en la tarjeta del primer evento → se abre `/events/:id`
- [ ] Se muestran: nombre, categoría, fecha, hora, ubicación, organizador y descripción
- [ ] A la derecha: precio `€15.00`, entradas disponibles, selector de cantidad, botón **Buy tickets**
- [ ] Hacer clic en **Buy tickets** sin estar autenticado → redirección a `/login`

---

## 7. Compra de entradas (Asistente)

- [ ] Abrir una ventana de incógnito / navegador diferente
- [ ] Registrarse como **Attendee** (con otro email)
- [ ] Volver a la página de `Summer Jazz Festival`
- [ ] Seleccionar cantidad: **2**, hacer clic en **Buy tickets**
- [ ] Aparece el bloque `Purchase confirmed!` con **2 códigos únicos** (12 caracteres, formato `A1B2C3D4E5F6`)
- [ ] El enlace **View all my tickets →** lleva a `/my-tickets`

---

## 8. Historial de compras

- [ ] Abrir `/my-tickets` (o desde la barra de navegación)
- [ ] Se muestra la tarjeta de compra: nombre del evento, fecha, ubicación
- [ ] En la parte inferior de la tarjeta: los códigos de las entradas compradas
- [ ] Comprar otro evento (gratuito) → en `/my-tickets` aparecen ahora 2 registros

---

## 9. Estadísticas del organizador

- [ ] Iniciar sesión de nuevo como organizador
- [ ] Abrir `/organiser`
- [ ] Las tarjetas de estadísticas muestran:
  - `Total events: 2`
  - `Tickets sold: 2`
  - `Revenue: €30.00`
- [ ] La tabla muestra para el primer evento: `2 / 50`

---

## 10. Edición y eliminación de eventos

- [ ] Hacer clic en **Edit** en el primer evento
- [ ] Cambiar el nombre → **Save changes** → el cambio se refleja en el dashboard y en el catálogo
- [ ] Hacer clic en **Delete** en el segundo evento → confirmar → el evento desaparece de la lista

---

## 11. Protección de rutas

- [ ] Iniciar sesión como **attendee**, intentar abrir `/organiser` → redirección a `/`
- [ ] Sin autenticación, abrir `/my-tickets` → redirección a `/login`

---

## 12. Casos límite

- [ ] Crear un evento con **1 entrada**, comprarla → la tarjeta muestra **SOLD OUT**
- [ ] Intentar comprar otra entrada del mismo evento agotado → error `Not enough tickets available`
- [ ] Intentar comprar más entradas de las disponibles (si quedan 3, seleccionar 5) → error

---

## Resumen

| Sección | Estado |
|---------|--------|
| Puesta en marcha | ⬜ |
| Registro / inicio de sesión | ⬜ |
| Creación de eventos | ⬜ |
| Catálogo y filtros | ⬜ |
| Página de evento | ⬜ |
| Compra de entradas | ⬜ |
| Historial de compras | ⬜ |
| Dashboard del organizador | ⬜ |
| Edición / eliminación | ⬜ |
| Protección de rutas | ⬜ |
| Casos límite | ⬜ |
