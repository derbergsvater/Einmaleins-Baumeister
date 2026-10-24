// Browser-Rundgang auf 6 Bildschirmgrößen: Profil → Tierfamilie → 10er trainieren → Prüfung → Schlüpfen.
// Start: python3 -m http.server 8093 & node e2e/rundgang.mjs <screenshot-ordner>
// ponytail: nutzt die Playwright-Installation aus Fertigungstool/e2e statt eigener node_modules.
import { chromium } from '/mnt/c/Users/StefanBerg/Documents/GitHub/Fertigungstool/e2e/node_modules/playwright/index.mjs';
const S = process.argv[2] || ".", url = 'http://localhost:8093/';
const browser = await chromium.launch();
const fehler = [];
async function loese(page, n) {
  for (let i = 0; i < n; i++) {
    const t = await page.textContent('.term'); const [a, b] = t.match(/\d+/g).map(Number);
    for (const z of String(a * b)) await page.click(`.taste[data-ziffer="${z}"]`);
    await page.waitForTimeout(i === n - 1 ? 600 : 820);
  }
}
for (const [name, vp] of [['ipad-hoch', {width: 820, height: 1180}], ['ipad-quer', {width: 1180, height: 820}], ['ipad-alt', {width: 768, height: 950}], ['ipad-alt-quer', {width: 1024, height: 690}], ['handy', {width: 390, height: 844}], ['handy-klein', {width: 375, height: 667}]]) {
  const page = await browser.newPage({ viewport: vp, hasTouch: true });
  page.on('pageerror', e => fehler.push(`${name}: ${e.message}`));
  page.on('console', m => m.type() === 'error' && fehler.push(`${name} console: ${m.text()}`));
  await page.goto(url); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.fill('.name-eingabe', '<textarea>'); await page.click('button[type=submit]');
  await page.click('.projekt-karte >> nth=1'); // Tierfamilie
  const hubOk = await page.locator('.reihen-knopf').count();
  await page.click('.reihen-knopf >> nth=9');   // 10er
  await loese(page, 16);
  const ueber = async () => page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  const wUeber = await ueber();
  await page.screenshot({ path: `${S}/${name}-werkstatt.png` });
  // Glühbirne: nach 10 s ohne Eingabe leuchtet sie, Antippen öffnet den Tipp
  await page.waitForTimeout(10500);
  const birneAn = await page.locator('.birne.leuchtet').count();
  await page.click('.birne.leuchtet');
  await page.waitForTimeout(2500);
  const tUeber = await ueber();
  await page.screenshot({ path: `${S}/${name}-tipp1.png` });
  if (await page.locator('.tipp-mehr').count()) { await page.click('.tipp-mehr'); await page.waitForTimeout(4500); }
  await page.screenshot({ path: `${S}/${name}-tipp2.png` });
  await page.click('.tipp-zu');
  // Falsche Antwort → Rechenweg mit Lösung, weiter per Knopf
  const [fa, fb] = (await page.textContent('.term')).match(/\d+/g).map(Number);
  for (const z of String(fa * fb - 1 || 2)) await page.click(`.taste[data-ziffer="${z}"]`);
  await page.click('.taste.ok');
  await page.waitForTimeout(4500);
  const eUeber = await ueber();
  await page.screenshot({ path: `${S}/${name}-erklaerung.png` });
  await page.click('.tipp-weiter'); await page.waitForTimeout(300);
  await page.click('.pruefung-knopf');
  const pUeber = await ueber();
  await page.screenshot({ path: `${S}/${name}-pruefung.png` });
  await loese(page, 12);
  await page.screenshot({ path: `${S}/${name}-ergebnis.png` });
  const ergebnis = (await page.textContent('.ergebnis')).replace(/\s+/g, ' ').slice(0, 160);
  await page.click('.weiter'); await page.waitForTimeout(300);
  await page.click('.familie-zelle.schlupfbereit'); await page.waitForTimeout(2000);
  await page.screenshot({ path: `${S}/${name}-schluepfen.png` });
  console.log(name, { hubKnoepfe: hubOk, werkstattUeberlauf: wUeber, birneAn, tippUeberlauf: tUeber, erklaerungUeberlauf: eUeber, pruefungUeberlauf: pUeber, ergebnis });
  await page.close();
}
console.log('Fehler:', fehler.length ? fehler : 'keine');
await browser.close();
