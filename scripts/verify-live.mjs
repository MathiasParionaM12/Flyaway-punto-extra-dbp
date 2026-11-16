// Recorre la app contra el backend real (localhost:8080) y guarda capturas en screenshots/.
// Requiere backend y frontend (npm run dev) encendidos.
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const APP = 'http://127.0.0.1:5173';

const browser = await chromium.launch({ channel: 'msedge', headless: true });
const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

async function searchAndBook(code) {
  await page.getByLabel('Número de vuelo').fill(code);
  await page.getByRole('button', { name: 'Buscar vuelos', exact: true }).click();
  await page.getByRole('button', { name: 'Reservar vuelo ' + code }).click();
  await page.getByRole('button', { name: 'Confirmar reserva' }).click();
}

try {
  await mkdir('screenshots', { recursive: true });
  await page.goto(APP);
  await page.getByText('LA101', { exact: true }).waitFor();
  await page.screenshot({ path: 'screenshots/inicio-desktop.png', fullPage: true });

  // Registro
  await page.goto(APP + '/registro');
  await page.getByLabel('Nombre', { exact: true }).fill('Prueba');
  await page.getByLabel('Apellido').fill('Laboratorio');
  const email = 'frontend.' + Date.now() + '@example.com';
  await page.getByLabel('Correo electrónico').fill(email);
  await page.getByLabel('Contraseña', { exact: true }).fill('Password1');
  await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();
  await page.waitForURL('**/login');

  // Login
  await page.getByLabel('Contraseña', { exact: true }).fill('Password1');
  await page.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
  await page.getByText('Prueba Laboratorio', { exact: true }).waitFor();

  // Reserva correcta
  await searchAndBook('LA101');
  await page.getByRole('status').filter({ hasText: 'confirmada' }).waitFor();
  await page.screenshot({ path: 'screenshots/reserva-confirmada.png' });
  await page.getByRole('link', { name: /Ver detalle de la reserva #/ }).click();
  await page.getByText('Prueba Laboratorio', { exact: true }).nth(1).waitFor();
  await page.screenshot({ path: 'screenshots/reserva-detalle.png', fullPage: true });

  // Mis reservas persiste tras recargar
  await page.getByRole('link', { name: 'Mis reservas', exact: true }).click();
  await page.getByRole('cell', { name: 'LA101' }).waitFor();
  await page.reload();
  await page.getByRole('cell', { name: 'LA101' }).waitFor();
  await page.screenshot({ path: 'screenshots/mis-reservas.png', fullPage: true });

  // Errores de negocio del backend
  await page.getByRole('link', { name: 'Buscar vuelos', exact: true }).click();
  await searchAndBook('LA100');
  await page.getByRole('alert').filter({ hasText: 'Cannot book a past flight' }).waitFor();
  await page.screenshot({ path: 'screenshots/error-vuelo-pasado.png' });
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await searchAndBook('SK120');
  await page.getByRole('alert').filter({ hasText: 'Overlapping flight found' }).waitFor();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();

  // Logout y ruta protegida
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  await page.waitForURL('**/login');
  await page.goto(APP + '/reservas');
  await page.waitForURL('**/login');

  // Móvil
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(APP + '/registro');
  await page.screenshot({ path: 'screenshots/registro-mobile.png', fullPage: true });
  await page.goto(APP);
  await page.getByText('LA101', { exact: true }).waitFor();
  await page.screenshot({ path: 'screenshots/inicio-mobile.png', fullPage: true });
  assert.equal(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
    true,
    'La página móvil no debe desbordarse',
  );
  assert.deepEqual(errors, [], 'No debe haber errores de JavaScript');
  console.log(
    'API real OK: registro, login, búsqueda, reserva, detalle, Mis reservas, vuelo pasado, horario superpuesto, logout y rutas protegidas.',
  );
} finally {
  await browser.close();
}
