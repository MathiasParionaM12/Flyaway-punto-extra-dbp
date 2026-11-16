# Fly Away · Frontend

Frontend web del laboratorio de la semana 14 (CS2031). Usa React 19, TypeScript, Vite, React Router y Axios.

## Cómo correrlo

Requisitos: Node.js 20.19+ (o 22.12+) y JDK 26 para el backend.

1. Clonar y levantar el [backend del curso](https://github.com/CS2031-DBP/cs2031-2026-2-week14-fly-away-backend) en otra carpeta:
   ```powershell
   git clone https://github.com/CS2031-DBP/cs2031-2026-2-week14-fly-away-backend.git
   cd cs2031-2026-2-week14-fly-away-backend
   # Si tu Java por defecto es 21, apunta al JDK 26:
   $env:JAVA_HOME = "$env:USERPROFILE\.jdks\openjdk-26.0.2"
   $env:Path = "$env:JAVA_HOME\bin;$env:Path"
   .\mvnw.cmd spring-boot:run
   ```
   La API queda en http://localhost:8080.
2. En otra terminal, desde este repositorio:
   ```powershell
   npm.cmd install
   npm.cmd run dev
   ```
3. Abrir http://127.0.0.1:5173.

Cuenta de prueba: `ana.garcia@utec.edu.pe` / `Password1`. En el login, el botón **Usar** la completa automáticamente.

Para apuntar a otra URL del backend, copia `.env.example` como `.env.local` y cambia `VITE_API_URL`.

## Qué incluye

| Requisito                                                                                                         | Archivo                                                                   |
| ----------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Registro con validación, errores del backend, mensaje de éxito y redirección al login                             | `pages/RegisterPage.tsx`, `utils/validation.ts`                           |
| Login: guarda el JWT en `localStorage`, muestra error si las credenciales son incorrectas, redirige a la búsqueda | `pages/LoginPage.tsx`, `context/AuthContext.tsx`                          |
| Nombre del usuario autenticado (`GET /users/current`)                                                             | `components/Navbar.tsx`                                                   |
| Búsqueda por número de vuelo, aerolínea y rango de fechas, tabla y mensaje si no hay resultados                   | `pages/SearchFlightsPage.tsx`, `hooks/useFlightSearch.ts`                 |
| Reservar (solo con sesión), ID de la reserva y errores del backend                                                | `components/BookingDialog.tsx`                                            |
| Detalle de la reserva (`GET /flights/book/{id}`)                                                                  | `pages/BookingDetailPage.tsx`, `hooks/useBookingDetail.ts`                |
| Mis reservas (IDs en `localStorage` por usuario)                                                                  | `pages/MyBookingsPage.tsx`, `hooks/useMyBookings.ts`                      |
| Logout, rutas protegidas y token inválido (403)                                                                   | `context/AuthContext.tsx`, `routes/ProtectedRoute.tsx`, `services/api.ts` |

Para probar los errores de reserva: **LA100** es un vuelo que ya salió. Para el horario superpuesto, reserva **LA101** y luego **SK120**.

## Estructura

```
src/
├── services/     # axios: instancia con interceptores + llamadas a cada endpoint
│   ├── api.ts            (baseURL, token en el header, manejo del 403)
│   ├── authService.ts    (register, login, usuario actual)
│   ├── flightService.ts  (búsqueda, reservar, detalle)
│   └── errors.ts         (mensajes del backend → español)
├── context/      # AuthContext: usuario, login y logout (Context API)
├── hooks/        # custom hooks: useAuth, useFlightSearch, useMyBookings, useBookingDetail
├── routes/       # ProtectedRoute
├── pages/        # una pantalla por archivo
├── components/   # Navbar, SearchForm, FlightTable, BookingDialog, FormField…
├── utils/        # formato de fechas, validaciones, reservas en localStorage
└── types/        # interfaces de la API
```

Los conceptos del curso se aplican así:

- `useState` en los formularios y la UI.
- `useEffect` para llamar a la API al montar, con cleanup para ignorar respuestas tardías o cancelar búsquedas.
- Context API para la sesión.
- Custom hooks para separar la lógica de cada página.

## Scripts

```powershell
npm.cmd run build       # compila TypeScript y genera dist/
npm.cmd test            # 12 pruebas de Playwright con respuestas simuladas (usa Edge)
npm.cmd run test:live   # flujo completo contra el backend real (deben estar los dos encendidos)
```

`test:live` guarda capturas en `screenshots/`.
