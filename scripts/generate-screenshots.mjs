// Erzeugt die Screenshots für die MkDocs-Dokumentation (docs/assets/screenshots).
//
// Voraussetzung: die Anwendung läuft bereits und ist unter BASE_URL erreichbar,
// z. B. über den Docker-Container (`docker compose up`, Standard-Port 8080)
// oder den Angular-Dev-Server mit Proxy zum Backend.
//
// Nutzung:
//   npm install
//   BASE_URL=http://localhost:8080 npm run screenshots

import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL ?? 'http://localhost:8080';
const OUTPUT_DIR = path.resolve(__dirname, '..', 'docs', 'assets', 'screenshots');

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  console.log(`Navigiere zu ${BASE_URL} ...`);
  await page.goto(BASE_URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('table', { timeout: 15000 });

  // 1) Übersicht der Inventarliste
  await page.screenshot({ path: path.join(OUTPUT_DIR, '01-inventory-list.png'), fullPage: true });
  console.log('01-inventory-list.png gespeichert.');

  // 2) Suche
  const searchInput = 'input[placeholder="Name, Kategorie, Größe, Hersteller oder Lagerort"]';
  await page.fill(searchInput, 'Monitor');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '02-search.png'), fullPage: true });
  console.log('02-search.png gespeichert.');
  await page.fill(searchInput, '');
  await page.waitForTimeout(500);

  // 3) Kategorie-Filter geöffnet
  await page.click('mat-select');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '03-category-filter.png'), fullPage: true });
  console.log('03-category-filter.png gespeichert.');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);

  // 4) Neuer-Artikel-Dialog, ausgefüllt
  await page.click('button:has-text("Neuer Artikel")');
  await page.waitForSelector('mat-dialog-container', { timeout: 5000 });
  await page.waitForTimeout(300);
  await page.fill('input[formcontrolname="name"]', 'Laptop-Tasche');
  await page.fill('input[formcontrolname="category"]', 'Zubehör');
  await page.fill('input[formcontrolname="quantity"]', '15');
  await page.fill('input[formcontrolname="minQuantity"]', '5');
  await page.fill('input[formcontrolname="unit"]', 'Stück');
  await page.fill('input[formcontrolname="price"]', '24.90');
  await page.fill('input[formcontrolname="location"]', 'Lager C3');
  await page.locator('button:has-text("Anlegen")').focus();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '04-create-dialog.png'), fullPage: true });
  console.log('04-create-dialog.png gespeichert.');
  await page.click('button:has-text("Abbrechen")');
  await page.waitForTimeout(500);

  // 5) Bearbeiten-Dialog (erste Zeile)
  await page.locator('tbody tr').first().locator('button[aria-label="Artikel bearbeiten"]').click();
  await page.waitForSelector('mat-dialog-container', { timeout: 5000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '05-edit-dialog.png'), fullPage: true });
  console.log('05-edit-dialog.png gespeichert.');
  await page.click('button:has-text("Abbrechen")');
  await page.waitForTimeout(500);

  // 6) Löschen-Bestätigungsdialog (erste Zeile)
  await page.locator('tbody tr').first().locator('button[aria-label="Artikel löschen"]').click();
  await page.waitForSelector('mat-dialog-container', { timeout: 5000 });
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '06-delete-confirm.png'), fullPage: true });
  console.log('06-delete-confirm.png gespeichert.');
  await page.click('button:has-text("Abbrechen")');
  await page.waitForTimeout(500);

  // 7) Mobile/responsive Ansicht
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '07-mobile-view.png'), fullPage: true });
  console.log('07-mobile-view.png gespeichert.');
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(300);

  // 8) Artikel mit Varianten aufgeklappt
  const variantRow = page.locator('tr', { hasText: 'Arbeitshandschuhe' });
  await variantRow.locator('.expand-button').click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '08-variants-expanded.png'), fullPage: true });
  console.log('08-variants-expanded.png gespeichert.');
  await variantRow.locator('.expand-button').click();
  await page.waitForTimeout(300);

  // 9) Varianten-Formular (Neuer Artikel mit Varianten-Toggle)
  await page.click('button:has-text("Neuer Artikel")');
  await page.waitForSelector('mat-dialog-container', { timeout: 5000 });
  await page.waitForTimeout(300);
  await page.fill('input[formcontrolname="name"]', 'Sicherheitshelm');
  await page.fill('input[formcontrolname="category"]', 'Sicherheit');
  await page.click('mat-slide-toggle');
  await page.waitForTimeout(300);
  const variantRowForm = page.locator('.variant-row').first();
  await variantRowForm.locator('input[formcontrolname="size"]').fill('M');
  await variantRowForm.locator('input[formcontrolname="manufacturer"]').fill('SafeHead');
  await variantRowForm.locator('input[formcontrolname="unit"]').fill('Stück');
  await variantRowForm.locator('input[formcontrolname="quantity"]').fill('12');
  await variantRowForm.locator('input[formcontrolname="minQuantity"]').fill('5');
  await variantRowForm.locator('input[formcontrolname="price"]').fill('19.90');
  await page.locator('button:has-text("Variante hinzufügen")').focus();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUTPUT_DIR, '09-variants-form.png'), fullPage: true });
  console.log('09-variants-form.png gespeichert.');
  await page.click('button:has-text("Abbrechen")');
  await page.waitForTimeout(500);

  await browser.close();
  console.log(`Fertig. Screenshots liegen in ${OUTPUT_DIR}`);
}

main().catch((err) => {
  console.error('Screenshot-Skript fehlgeschlagen:', err);
  process.exit(1);
});
