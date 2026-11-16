import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const user = {
  id: 1,
  email: 'ana.garcia@utec.edu.pe',
  username: 'ana.garcia@utec.edu.pe',
  firstName: 'Ana',
  lastName: 'Garcia',
  role: 'USER',
};
const flight = {
  id: 1,
  flightNumber: 'LA101',
  airlineName: 'LATAM Airlines',
  estDepartureTime: '2027-05-20T15:00:00Z',
  estArrivalTime: '2027-05-20T18:00:00Z',
  availableSeats: 24,
};
const booking = {
  id: 7,
  bookingDate: '2027-05-01T10:00:00Z',
  flightId: 1,
  flightNumber: flight.flightNumber,
  airlineName: flight.airlineName,
  estDepartureTime: flight.estDepartureTime,
  estArrivalTime: flight.estArrivalTime,
  customerId: 1,
  customerFirstName: 'Ana',
  customerLastName: 'Garcia',
};

async function mock(page: Page) {
  await page.route('http://localhost:8080/**', async (route) => {
    const url = new URL(route.request().url());
    let json: unknown = {};
    if (url.pathname === '/auth/login') json = { token: 'sample-jwt' };
    else if (url.pathname === '/users/current') json = user;
    else if (url.pathname === '/flights/search') json = { items: [flight] };
    else if (url.pathname === '/users/register') json = { id: 6 };
    else if (url.pathname === '/flights/book') json = { id: 7 };
    else if (url.pathname === '/flights/book/7') json = booking;
    else return route.fulfill({ status: 500, body: '' });
    await route.fulfill({ json });
  });
}

async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill(user.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('Password1');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByText('Ana Garcia', { exact: true })).toBeVisible();
}

const reserveButton = (page: Page) => page.getByRole('button', { name: 'Reservar vuelo LA101' });

test.beforeEach(async ({ page }) => {
  await mock(page);
});

test('registro valida campos, muestra éxito y redirige al login', async ({ page }) => {
  let requests = 0;
  await page.route('**/users/register', async (route) => {
    requests++;
    await route.fulfill({ status: 201, json: { id: 6 } });
  });
  await page.goto('/registro');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Completa todos los campos');
  expect(requests).toBe(0);
  await page.getByLabel('Nombre', { exact: true }).fill('Ana');
  await page.getByLabel('Apellido').fill('Garcia');
  await page.getByLabel('Correo electrónico').fill('nueva@utec.edu.pe');
  await page.getByLabel('Contraseña', { exact: true }).fill('Password1');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Cuenta creada' })).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel('Correo electrónico')).toHaveValue('nueva@utec.edu.pe');
  expect(requests).toBe(1);
});

test('registro muestra el error del backend (email en uso)', async ({ page }) => {
  await page.route('**/users/register', (route) =>
    route.fulfill({ status: 400, json: { detail: 'Username already exists' } }),
  );
  await page.goto('/registro');
  await page.getByLabel('Nombre', { exact: true }).fill('Ana');
  await page.getByLabel('Apellido').fill('Garcia');
  await page.getByLabel('Correo electrónico').fill(user.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('Password1');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Ya existe una cuenta con ese correo');
  await expect(page.getByRole('alert')).toContainText('Username already exists');
});

test('login con credenciales incorrectas muestra el error', async ({ page }) => {
  await page.route('**/auth/login', (route) =>
    route.fulfill({ status: 400, json: { detail: 'Username does not exist' } }),
  );
  await page.goto('/login');
  await page.getByLabel('Correo electrónico').fill(user.email);
  await page.getByLabel('Contraseña', { exact: true }).fill('mala');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Correo o contraseña incorrectos');
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

test('rutas protegidas, login, JWT y logout', async ({ page }) => {
  await page.goto('/reservas');
  await expect(page).toHaveURL(/\/login$/);
  await login(page);
  await expect(page).toHaveURL(/\/reservas$/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('token'))).toBe('sample-jwt');
  await page.reload();
  await expect(page.getByText('Ana Garcia', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
  await page.goto('/reservas/7');
  await expect(page).toHaveURL(/\/login$/);
});

test('filtros convierten las fechas a ISO y manejan resultados vacíos', async ({ page }) => {
  let search: URL | undefined;
  await page.goto('/');
  await expect(page.getByText('LA101', { exact: true })).toBeVisible();
  await page.route('**/flights/search**', async (route) => {
    search = new URL(route.request().url());
    await route.fulfill({ json: { items: [] } });
  });
  await page.getByLabel('Número de vuelo').fill('ZZ999');
  await page.getByLabel('Aerolínea', { exact: true }).fill('Prueba');
  await page.getByLabel('Salida desde').fill('2027-05-20T08:30');
  await page.getByLabel('Salida hasta').fill('2027-05-22T08:30');
  await page.getByRole('button', { name: 'Buscar vuelos', exact: true }).click();
  await expect(page.getByText('No encontramos vuelos con esos filtros')).toBeVisible();
  expect(search?.searchParams.get('flightNumber')).toBe('ZZ999');
  expect(search?.searchParams.get('airlineName')).toBe('Prueba');
  expect(search?.searchParams.get('estDepartureTimeFrom')).toMatch(/T.*Z$/);
  expect(search?.searchParams.get('estDepartureTimeTo')).toMatch(/T.*Z$/);
  await page.getByLabel('Salida hasta').fill('2027-05-19T08:30');
  await page.getByRole('button', { name: 'Buscar vuelos', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('debe ser anterior');
});

test('sin sesión no se puede reservar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('LA101', { exact: true })).toBeVisible();
  await expect(reserveButton(page)).toHaveCount(0);
  await expect(page.getByRole('status').filter({ hasText: 'Para reservar' })).toBeVisible();
});

test('reserva envía JWT y flightId, muestra el ID y persiste por usuario', async ({ page }) => {
  await login(page);
  let body: unknown;
  let auth: string | undefined;
  await page.route('**/flights/book', async (route) => {
    body = route.request().postDataJSON();
    auth = route.request().headers().authorization;
    await route.fulfill({ json: { id: 7 } });
  });
  await reserveButton(page).click();
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Reserva #7 confirmada' })).toBeVisible();
  expect(body).toEqual({ flightId: 1 });
  expect(auth).toBe('Bearer sample-jwt');
  const saved = await page.evaluate(
    (email) => JSON.parse(localStorage.getItem('bookings:' + email) || '[]'),
    user.email,
  );
  expect(saved).toEqual([7]);
  await page.getByRole('link', { name: 'Ver detalle de la reserva #7' }).click();
  await expect(page.getByRole('heading', { name: '#7' })).toBeVisible();
  await expect(page.getByText('Ana Garcia', { exact: true })).toHaveCount(2);
  await page.getByRole('link', { name: 'Mis reservas', exact: true }).click();
  await expect(page.getByRole('cell', { name: 'LA101' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('cell', { name: 'LA101' })).toBeVisible();
});

test('muestra errores de negocio del backend y permite reintentar', async ({ page }) => {
  await login(page);
  await page.route('**/flights/book', (route) =>
    route.fulfill({ status: 400, json: { detail: 'Overlapping flight found' } }),
  );
  await reserveButton(page).click();
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  const alert = page.getByRole('alert');
  await expect(alert).toContainText('horario que se cruza');
  await expect(alert).toContainText('Overlapping flight found');
  await expect(page.getByRole('button', { name: 'Reintentar' })).toBeEnabled();
});

test('un 403 invalida la sesión y vuelve al login', async ({ page }) => {
  await login(page);
  await page.route('**/flights/book', (route) => route.fulfill({ status: 403, body: '' }));
  await reserveButton(page).click();
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole('alert')).toContainText('sesión expiró');
  expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull();
});

test('Mis reservas oculta reservas ajenas y limpia IDs inexistentes', async ({ page }) => {
  await login(page);
  await page.evaluate((email) => localStorage.setItem('bookings:' + email, '[7, 99]'), user.email);
  await page.route('**/flights/book/7', (route) =>
    route.fulfill({ json: { ...booking, customerId: 2 } }),
  );
  await page.goto('/reservas');
  await expect(page.getByRole('status').filter({ hasText: 'Quitamos 2 reservas' })).toBeVisible();
  await expect(page.getByText('Todavía no tienes reservas')).toBeVisible();
  expect(
    await page.evaluate((email) => localStorage.getItem('bookings:' + email), user.email),
  ).toBe('[]');
  await page.goto('/reservas/7');
  await expect(page.getByRole('alert')).toContainText('no pertenece a tu cuenta');
});

test('muestra fallo de conexión y puede recuperarse', async ({ page }) => {
  await page.route('**/flights/search**', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('No se pudo conectar');
  await page.route('**/flights/search**', (route) => route.fulfill({ json: { items: [flight] } }));
  await page.getByRole('button', { name: 'Volver a intentar' }).click();
  await expect(page.getByText('LA101', { exact: true })).toBeVisible();
});

test('interfaz móvil sin desbordamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  for (const path of ['/', '/registro', '/login']) {
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
  }
});
