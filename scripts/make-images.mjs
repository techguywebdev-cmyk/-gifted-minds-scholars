// Regenerates the social share image and PNG icons with Playwright (run once; outputs are committed).
// Usage: node scripts/make-images.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { readFileSync } from 'node:fs';
const root = new URL('..', import.meta.url).pathname;
const logo = readFileSync(root + 'src/public/favicon.svg', 'utf8');
const photo = 'data:image/jpeg;base64,' + readFileSync(root + 'src/assets/img/wendy-bonnick-880.jpg').toString('base64');
const f = (n) => 'data:font/woff2;base64,' + readFileSync(root + 'src/assets/fonts/' + n).toString('base64');
const fonts = `<style>@font-face{font-family:'Playfair Display';font-weight:400 900;src:url(${f('playfair.woff2')})}@font-face{font-family:'Playfair Display';font-style:italic;font-weight:400 900;src:url(${f('playfair-italic.woff2')})}@font-face{font-family:'Plus Jakarta Sans';font-weight:200 800;src:url(${f('jakarta.woff2')})}@font-face{font-family:Caveat;font-weight:700;src:url(${f('caveat.woff2')})}</style>`;
const og = `<!doctype html><html><head>${fonts}<style>
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;background:#fbf7ee;font-family:'Plus Jakarta Sans',sans-serif;position:relative;overflow:hidden}
.glow{position:absolute;width:800px;height:800px;right:-260px;top:-330px;background:radial-gradient(circle,rgba(241,212,140,.65),transparent 65%)}
.l{position:absolute;left:72px;top:70px;width:640px}
.brand{display:flex;align-items:center;gap:16px;color:#14245c;font-family:'Playfair Display',serif;font-weight:600;font-size:30px}.brand svg{width:64px;height:64px}
h1{font-family:'Playfair Display',serif;font-weight:600;font-size:64px;line-height:1.05;color:#14245c;margin:46px 0 22px;letter-spacing:-1.5px}h1 em{color:#8a6210;font-weight:600}
p{font-size:25px;color:#545a76;line-height:1.4}
.tags{position:absolute;left:72px;bottom:64px;display:flex;gap:12px}.tags span{background:#14245c;color:#fff;padding:12px 20px;border-radius:99px;font-weight:800;font-size:19px}.tags span.g{background:#d9a63a;color:#0d1940}
.ph{position:absolute;right:70px;top:60px;width:380px;height:510px;border-radius:190px 190px 24px 24px;overflow:hidden;border:8px solid #fff;box-shadow:0 30px 60px -25px rgba(13,25,64,.45)}.ph img{width:100%;height:100%;object-fit:cover;object-position:50% 30%}
.note{position:absolute;right:340px;bottom:48px;width:250px;background:linear-gradient(140deg,#fbe7ad,#f1d48c);padding:16px 18px;border-radius:6px 16px 8px 18px;transform:rotate(-4deg);font-family:Caveat,cursive;font-size:25px;line-height:1.1;color:#0d1940;box-shadow:0 16px 28px -16px rgba(120,80,10,.6)}
</style></head><body><div class="glow"></div><div class="l"><div class="brand">${logo}Gifted Minds Scholars</div>
<h1>Nurturing young minds, <em>building bright futures.</em></h1><p>Personalized tutoring in reading, math &amp; writing with Mrs. Wendy Bonnick — 34+ years in education.</p></div>
<div class="tags"><span class="g">Pre-K – 5th Grade</span><span>Loganville, GA</span><span>Online</span></div>
<div class="ph"><img src="${photo}"></div></body></html>`;

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1200, height: 630 } });
await p.setContent(og, { waitUntil: 'networkidle' }).catch(() => {});
await p.waitForTimeout(800);
await p.screenshot({ path: root + 'src/assets/img/og-image.png' });
for (const [size, out] of [[32, 'src/public/favicon-32.png'], [180, 'src/public/apple-touch-icon.png'], [192, 'src/public/icon-192.png'], [512, 'src/public/icon-512.png'], [512, 'src/assets/img/logo-mark.png']]) {
  const pg = await b.newPage({ viewport: { width: size, height: size } });
  const bg = out.includes('apple') || out.includes('icon-') ? '#14245c' : 'transparent';
  await pg.setContent(`<html><body style="margin:0;background:${bg}">${logo.replace('width="44" height="44"', `width="${size}" height="${size}"`)}</body></html>`);
  await pg.screenshot({ path: root + out, omitBackground: bg === 'transparent' });
}
await b.close();
console.log('images done');
