const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.join(__dirname, 'out');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.setViewport({ width: 1280, height: 800 });

  const url = process.env.DEMO_URL || 'http://localhost:3000';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForTimeout(800);

  // Overview
  await page.screenshot({ path: path.join(outDir, 'shot01.png') });
  console.log('Saved shot01');

  // Properties tab
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.nav-item')).find(n => n.textContent.trim().toLowerCase().includes('biens'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'shot02.png') });
  console.log('Saved shot02');

  // Click create listing form (side)
  await page.evaluate(() => {
    const el = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.toLowerCase().includes('publier'));
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(outDir, 'shot03.png') });
  console.log('Saved shot03');

  // Contracts
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.nav-item')).find(n => n.textContent.trim().toLowerCase().includes('contrats'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'shot04.png') });
  console.log('Saved shot04');

  // Payments
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.nav-item')).find(n => n.textContent.trim().toLowerCase().includes('paiements'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(outDir, 'shot05.png') });
  console.log('Saved shot05');

  // Switch role to Locataire
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('.role-btn')).find(b => b.textContent && b.textContent.trim().toLowerCase().includes('locataire'));
    if (btn) btn.click();
  });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(outDir, 'shot06.png') });
  console.log('Saved shot06');

  await browser.close();
  console.log('Done. Screenshots are in', outDir);
})();
