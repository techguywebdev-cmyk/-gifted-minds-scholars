// Gifted Minds Scholars — zero-dependency static site build.
// Usage: node build.mjs   →  outputs the finished site to ./dist
// Each page in src/pages is an HTML fragment with a JSON header between --- lines.

import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync, existsSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';

const ROOT = dirname(new URL(import.meta.url).pathname);
const SRC = join(ROOT, 'src');
const OUT = join(ROOT, 'dist');
const C = JSON.parse(readFileSync(join(ROOT, 'config.json'), 'utf8'));
const SITE = (process.env.SITE_URL || C.siteUrl).replace(/\/$/, '');
const TODAY = new Date().toISOString().slice(0, 10);
const ORG_ID = `${SITE}/#organization`;
const PERSON_ID = `${SITE}/about/#wendy-bonnick`;

// ---------- helpers ----------
const walk = (d) => readdirSync(d).flatMap((f) => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const write = (p, s) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, s); };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const fill = (s) => s
  .replace(/\{\{siteUrl\}\}/g, SITE)
  .replace(/\{\{email\}\}/g, C.email)
  .replace(/\{\{phone\}\}/g, C.phone)
  .replace(/\{\{phoneE164\}\}/g, C.phoneE164)
  .replace(/\{\{years\}\}/g, String(C.yearsExperience))
  .replace(/\{\{hoursTable\}\}/g, hoursTable())
  .replace(/\{\{formEndpoint\}\}/g, esc(C.formEndpoint || ''));

function hoursTable() {
  return `<table class="hours"><caption class="sr-only">Tutoring hours</caption><tbody>${
    C.hours.map((h) => `<tr><th scope="row">${h.day}</th><td>${h.label}</td></tr>`).join('')
  }</tbody></table>`;
}

// ---------- structured data ----------
const org = () => ({
  '@type': ['LocalBusiness', 'EducationalOrganization'],
  '@id': ORG_ID,
  name: C.name,
  alternateName: 'GMS Tutoring',
  slogan: C.tagline,
  description: `Gifted Minds Scholars is a Pre-K through 5th grade tutoring program in ${C.city}, ${C.regionName}, offering in-person and online tutoring in reading, math, writing and academic support, led by ${C.founder}, an educator with more than ${C.yearsExperience} years of experience.`,
  url: `${SITE}/`,
  logo: `${SITE}/assets/img/logo-mark.png`,
  image: `${SITE}/assets/img/og-image.png`,
  email: C.email,
  telephone: C.phoneE164,
  priceRange: '$$',
  address: { '@type': 'PostalAddress', addressLocality: C.city, addressRegion: C.region, addressCountry: C.country },
  geo: { '@type': 'GeoCoordinates', latitude: C.geo.lat, longitude: C.geo.lng },
  areaServed: [
    { '@type': 'City', name: `${C.city}, ${C.regionName}` },
    { '@type': 'State', name: C.regionName },
    { '@type': 'Country', name: 'United States', description: 'Online tutoring' },
  ],
  openingHoursSpecification: C.hours.map((h) => ({
    '@type': 'OpeningHoursSpecification', dayOfWeek: `https://schema.org/${h.day}`, opens: h.opens, closes: h.closes,
  })),
  founder: { '@id': PERSON_ID },
  employee: { '@id': PERSON_ID },
  parentOrganization: { '@type': 'Organization', name: C.parentOrg.name, url: C.parentOrg.url },
  knowsAbout: ['Reading tutoring', 'Phonics', 'Math tutoring', 'Writing instruction', 'Dyslexia support', 'ADHD learning support', 'Elementary education', 'Pre-K readiness'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Tutoring programs',
    itemListElement: PROGRAMS.map((p) => ({ '@type': 'Offer', itemOffered: { '@id': `${SITE}${p.path}#service` } })),
  },
});

const person = () => ({
  '@type': 'Person',
  '@id': PERSON_ID,
  name: C.founderName,
  honorificPrefix: 'Mrs.',
  jobTitle: 'Founder & Educational Instructor',
  description: `${C.founder} is the founder of Gifted Minds Scholars and has more than ${C.yearsExperience} years of experience in education.`,
  image: `${SITE}/assets/img/wendy-bonnick-square.jpg`,
  url: `${SITE}/about/`,
  worksFor: { '@id': ORG_ID },
  knowsAbout: ['Elementary education', 'Reading instruction', 'Mathematics instruction', 'Differentiated instruction', 'Supporting diverse learners'],
});

const PROGRAMS = [
  { path: '/programs/reading-tutoring/', name: 'Reading & Literacy Tutoring', serviceType: 'Reading tutoring' },
  { path: '/programs/math-tutoring/', name: 'Mathematics Tutoring', serviceType: 'Math tutoring' },
  { path: '/programs/writing-tutoring/', name: 'Writing & Language Arts Tutoring', serviceType: 'Writing tutoring' },
  { path: '/programs/academic-support/', name: 'Academic Support & Enrichment', serviceType: 'Learning support and enrichment' },
];

const service = (m) => ({
  '@type': 'Service',
  '@id': `${SITE}${m.path}#service`,
  name: m.serviceName,
  serviceType: m.serviceType,
  description: m.serviceDescription || m.description,
  provider: { '@id': ORG_ID },
  areaServed: [{ '@type': 'City', name: `${C.city}, ${C.regionName}` }, { '@type': 'Country', name: 'United States' }],
  audience: { '@type': 'EducationalAudience', educationalRole: 'student', audienceType: 'Children in Pre-K through 5th grade' },
  availableChannel: [
    { '@type': 'ServiceChannel', name: 'In-person tutoring', serviceLocation: { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: C.city, addressRegion: C.region, addressCountry: C.country } } },
    { '@type': 'ServiceChannel', name: 'Online tutoring', serviceUrl: `${SITE}/enroll/` },
  ],
  url: `${SITE}${m.path}`,
});

const faqPage = (html) => {
  const items = [...html.matchAll(/<details[^>]*class="faq-item"[^>]*>\s*<summary>([\s\S]*?)<\/summary>\s*<div class="faq-a">([\s\S]*?)<\/div>\s*<\/details>/g)];
  const strip = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
  return {
    '@type': 'FAQPage',
    mainEntity: items.map(([, q, a]) => ({ '@type': 'Question', name: strip(q), acceptedAnswer: { '@type': 'Answer', text: strip(a) } })),
  };
};

const breadcrumb = (trail) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [['Home', '/'], ...trail].map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
});

function schemaFor(m, html) {
  const graph = [org(), person()];
  graph.push({
    '@type': 'WebPage', '@id': `${SITE}${m.path}#webpage`, url: `${SITE}${m.path}`, name: m.title, description: m.description,
    isPartOf: { '@id': `${SITE}/#website` }, about: { '@id': ORG_ID }, inLanguage: 'en-US', dateModified: TODAY,
    speakable: { '@type': 'SpeakableSpecification', cssSelector: ['.answer-first', 'h1'] },
    ...(m.type === 'about' ? { '@type': ['WebPage', 'AboutPage'], mainEntity: { '@id': PERSON_ID } } : {}),
    ...(m.type === 'contact' ? { '@type': ['WebPage', 'ContactPage'] } : {}),
    ...(m.type === 'faq' ? { '@type': ['WebPage', 'FAQPage'], ...faqPage(html) } : {}),
  });
  if (m.path === '/') graph.push({ '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: C.name, publisher: { '@id': ORG_ID }, inLanguage: 'en-US' });
  else graph.push({ '@type': 'WebSite', '@id': `${SITE}/#website`, url: `${SITE}/`, name: C.name });
  if (m.serviceName) graph.push(service(m));
  if (m.breadcrumb) graph.push(breadcrumb(m.breadcrumb));

  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

// ---------- layout ----------
const NAV = [
  ['Programs', '/programs/'],
  ['About', '/about/'],
  ['Schedule', '/#schedule'],
  ['FAQ', '/faq/'],
  ['Contact', '/contact/'],
];

const sprite = readFileSync(join(SRC, 'partials', 'icons.svg'), 'utf8');
const logo = readFileSync(join(SRC, 'partials', 'logo.svg'), 'utf8');

function layout(m, body) {
  const url = `${SITE}${m.path}`;
  const ogImg = `${SITE}/assets/img/og-image.png`;
  const active = (p) => (m.path === p || (p !== '/' && !p.includes('#') && m.path.startsWith(p)) ? ' aria-current="page"' : '');
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="${m.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large, max-snippet:-1'}">
<meta name="theme-color" content="#14245c">
<meta name="author" content="${esc(C.founder)}">
<meta name="geo.region" content="US-${C.region}">
<meta name="geo.placename" content="${C.city}, ${C.regionName}">
<meta name="geo.position" content="${C.geo.lat};${C.geo.lng}">
<meta name="ICBM" content="${C.geo.lat}, ${C.geo.lng}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${esc(C.name)}">
<meta property="og:title" content="${esc(m.ogTitle || m.title)}">
<meta property="og:description" content="${esc(m.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Gifted Minds Scholars — Pre-K through 5th grade tutoring in Loganville, Georgia and online">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(m.ogTitle || m.title)}">
<meta name="twitter:description" content="${esc(m.description)}">
<meta name="twitter:image" content="${ogImg}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/fraunces.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/jakarta.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/styles.css?v=${BUILD_ID}">
${m.preload || ''}
<script type="application/ld+json">${schemaFor(m, body)}</script>
</head>
<body class="page-${m.type || 'page'}">
${sprite}
<a class="skip" href="#main">Skip to main content</a>
<header class="site-header" data-header>
  <div class="wrap header-inner">
    <a class="brand" href="/" aria-label="Gifted Minds Scholars — home">
      ${logo}
      <span class="brand-text"><span class="brand-name">Gifted Minds Scholars</span><span class="brand-sub">Pre-K – 5th Grade Tutoring</span></span>
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" data-nav-toggle>
      <span class="sr-only">Menu</span><span class="bars" aria-hidden="true"></span>
    </button>
    <nav class="site-nav" id="site-nav" aria-label="Main" data-nav>
      <ul>
        ${NAV.map(([t, p]) => `<li><a href="${p}"${active(p)}>${t}</a></li>`).join('\n        ')}
      </ul>
      <div class="nav-cta">
        <a class="nav-phone" href="tel:${C.phoneE164}"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>${C.phone}</a>
        <a class="btn btn-gold btn-sm" href="/enroll/"${active('/enroll/')}>Enroll Now</a>
      </div>
    </nav>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <a class="brand brand-light" href="/">${logo}<span class="brand-text"><span class="brand-name">Gifted Minds Scholars</span><span class="brand-sub">An Educational Tutoring Program of BACB21Co</span></span></a>
      <p class="footer-tag">Building confident learners for a brighter tomorrow.</p>
      <p class="footer-verse">“I can do all things through Christ who strengthens me.” <cite>Philippians 4:13</cite></p>
    </div>
    <div>
      <h2 class="footer-h">Programs</h2>
      <ul class="footer-links">
        <li><a href="/programs/reading-tutoring/">Reading &amp; Literacy</a></li>
        <li><a href="/programs/math-tutoring/">Mathematics</a></li>
        <li><a href="/programs/writing-tutoring/">Writing &amp; Language Arts</a></li>
        <li><a href="/programs/academic-support/">Academic Support &amp; Enrichment</a></li>
      </ul>
    </div>
    <div>
      <h2 class="footer-h">Visit &amp; Contact</h2>
      <address class="footer-contact">
        <span><svg class="i" aria-hidden="true"><use href="#i-pin"/></svg>${C.city}, ${C.regionName} &amp; online</span>
        <a href="tel:${C.phoneE164}"><svg class="i" aria-hidden="true"><use href="#i-phone"/></svg>${C.phone}</a>
        <a href="mailto:${C.email}"><svg class="i" aria-hidden="true"><use href="#i-mail"/></svg>${C.email}</a>
      </address>
    </div>
    <div>
      <h2 class="footer-h">Tutoring Hours</h2>
      ${hoursTable()}
      <p class="footer-note">By appointment, subject to availability.</p>
    </div>
  </div>
  <div class="wrap footer-base">
    <p>© <span data-year>${new Date().getFullYear()}</span> Gifted Minds Scholars · An educational tutoring program of <a href="${C.parentOrg.url}" rel="noopener">BACB21Co</a></p>
    <ul class="footer-mini"><li><a href="/about/">About</a></li><li><a href="/faq/">FAQ</a></li><li><a href="/enroll/">Enroll</a></li><li><a href="/contact/">Contact</a></li></ul>
  </div>
</footer>
<script src="/assets/js/config.js?v=${BUILD_ID}" defer></script>
<script src="/assets/js/main.js?v=${BUILD_ID}" defer></script>
</body>
</html>
`;
}

// ---------- build ----------
const BUILD_ID = Date.now().toString(36);
rmSync(OUT, { recursive: true, force: true });

const pages = [];
for (const file of walk(join(SRC, 'pages')).filter((f) => f.endsWith('.html'))) {
  const raw = readFileSync(file, 'utf8');
  const m = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!m) throw new Error(`Missing header in ${file}`);
  const meta = JSON.parse(m[1]);
  const body = fill(m[2]);
  const rel = relative(join(SRC, 'pages'), file);
  const outPath = rel === '404.html' ? '404.html' : rel.replace(/index\.html$/, '').replace(/\.html$/, '/') + 'index.html';
  write(join(OUT, outPath), layout(meta, body));
  pages.push(meta);
}

// assets + root files
for (const f of walk(join(SRC, 'assets'))) {
  const dest = join(OUT, 'assets', relative(join(SRC, 'assets'), f));
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(f, dest);
}
if (existsSync(join(SRC, 'public'))) {
  for (const f of walk(join(SRC, 'public'))) {
    const rel = relative(join(SRC, 'public'), f);
    const isText = /\.(txt|xml|webmanifest|svg|json)$/.test(f);
    if (isText) write(join(OUT, rel), fill(readFileSync(f, 'utf8')));
    else { mkdirSync(dirname(join(OUT, rel)), { recursive: true }); copyFileSync(f, join(OUT, rel)); }
  }
}

// form config for the browser
write(join(OUT, 'assets/js/config.js'), `window.GMS=${JSON.stringify({ email: C.email, endpoint: C.formEndpoint || '' })};`);

// sitemap
const indexable = pages.filter((p) => !p.noindex).sort((a, b) => (b.priority || 0.5) - (a.priority || 0.5));
write(join(OUT, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${SITE}${p.path}</loc><lastmod>${TODAY}</lastmod><priority>${(p.priority || 0.5).toFixed(1)}</priority></url>`).join('\n')}
</urlset>
`);

console.log(`Built ${pages.length} pages → dist/  (site URL: ${SITE})`);
