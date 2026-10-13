// Builds index.html from src/index.html by inlining the section partials:
//   <!-- @include sections/01-hero.html -->
// Run: npm run build   (npm start runs it automatically)
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// Phones get smaller copies of the big pictures (assets/img/m/, made by scripts/mobile-images.py): every stylesheet
// gets a phone twin in css/m/ whose pictures point at the small copies, and each <img> with a small copy gets a srcset
// that phones pick from. Laptops and desktops load exactly the original files.
const IMG_M = path.join(ROOT, 'assets', 'img', 'm');
const PHONE = '(max-width: 767px)', NOT_PHONE = 'not all and (max-width: 767px)';
function mobileManifest() {
  const f = path.join(IMG_M, 'manifest.json');
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {};
}
function buildMobileCss(man) {
  const dir = path.join(ROOT, 'css', 'm');
  fs.mkdirSync(dir, { recursive: true });
  for (const f of fs.readdirSync(dir)) fs.unlinkSync(path.join(dir, f));
  for (const f of fs.readdirSync(path.join(ROOT, 'css'))) {
    if (!f.endsWith('.css')) continue;
    const css = fs.readFileSync(path.join(ROOT, 'css', f), 'utf8').replace(/\r\n/g, '\n')
      .replace(/url\((["']?)\.\.\/assets\/img\/([\w.-]+)\1\)/g, (m, q, name) =>
        man[name] ? `url(${q}../../assets/img/m/${name}${q})` : `url(${q}../../assets/img/${name}${q})`)
      .replace(/url\((["']?)\.\.\/(?!\.\.\/)/g, 'url($1../../');
    fs.writeFileSync(path.join(dir, f), `/* phone copy of css/${f}, made by scripts/build.js - do not edit */\n` + css);
  }
}

function build() {
  const man = mobileManifest();
  buildMobileCss(man);
  const template = fs.readFileSync(path.join(SRC, 'index.html'), 'utf8');
  let html = template.replace(/<!-- @include ([\w./-]+) -->/g, (_, file) => {
    const full = path.join(SRC, file);
    if (!fs.existsSync(full)) throw new Error(`Missing section: src/${file}`);
    return fs.readFileSync(full, 'utf8').trimEnd();
  });
  // stylesheets: the original for laptops / desktops, its phone twin for phones (mobile.css is phones-only already)
  html = html.replace(/<link rel="stylesheet" href="css\/([\w.-]+\.css)"( media="[^"]*")?>/g, (m, f, media) => {
    if (media) return `<link rel="stylesheet" href="css/m/${f}"${media}>`;
    return `<link rel="stylesheet" href="css/${f}" media="${NOT_PHONE}">\n  <link rel="stylesheet" href="css/m/${f}" media="${PHONE}">`;
  });
  // pictures with a phone copy: phones (up to ~3.5x screen density) choose the copy, laptops / desktops the original
  html = html.replace(/<img ([^>]*?)src="assets\/img\/([\w.-]+)"([^>]*)>/g, (m, pre, name, post) => {
    const e = man[name];
    if (!e || /srcset=/.test(m)) return m;
    const [mw, ow] = e;
    return `<img ${pre}src="assets/img/${name}" srcset="assets/img/m/${name} ${mw}w, assets/img/${name} ${ow}w" sizes="${PHONE} ${Math.floor(mw / 3.5)}px, 10000px"${post}>`;
  });
  // cache-busting: css/js links get ?v=<content hash>, so browsers fetch a file again only when it changed
  html = html.replace(/(href|src)="((?:css|js)\/(?:m\/)?[\w.-]+\.(?:css|js))"/g, (m, attr, file) => {
    const full = path.join(ROOT, file);
    if (!fs.existsSync(full)) return m;
    // hash the text with plain line endings, so Windows and Linux checkouts give the same links
    const v = crypto.createHash('md5').update(fs.readFileSync(full, 'utf8').replace(/\r\n/g, '\n')).digest('hex').slice(0, 8);
    return `${attr}="${file}?v=${v}"`;
  });
  fs.writeFileSync(path.join(ROOT, 'index.html'), html);
  return html.length;
}

if (require.main === module) {
  const size = build();
  console.log(`Built index.html (${(size / 1024).toFixed(1)} KB)`);
}

module.exports = build;
